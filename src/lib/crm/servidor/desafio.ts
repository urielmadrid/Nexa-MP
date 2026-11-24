import { deDatetime, paraDatetime, type Banco, type Linha } from "@/src/lib/crm/servidor/banco";
import { ESPERA_REENVIO_S, MAX_ENVIOS, MAX_TENTATIVAS, VALIDADE_DESAFIO_S, codigoConfere, hashDoCodigo, type Canal } from "@/src/lib/crm/doisFatores";

/**
 * Controle da verificação em duas etapas no banco: um "desafio" por login, com o código (só a impressão dele),
 * quantos envios e tentativas já houve e se já foi usado. Cada passo é um UPDATE condicional, então dois pedidos
 * ao mesmo tempo não conseguem passar do limite.
 *
 * A tabela é criada sozinha no primeiro uso (CREATE TABLE IF NOT EXISTS), sem precisar do botão "Criar tabelas".
 */

export const TABELA_DESAFIO = `CREATE TABLE IF NOT EXISTS crm_desafio (
  id CHAR(32) NOT NULL,
  criado_em DATETIME(3) NOT NULL,
  expira_em DATETIME(3) NOT NULL,
  canal VARCHAR(10) NULL,
  codigo_hash CHAR(64) NULL,
  enviado_em DATETIME(3) NULL,
  envios SMALLINT NOT NULL DEFAULT 0,
  tentativas SMALLINT NOT NULL DEFAULT 0,
  usado TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY crm_desafio_expira_idx (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const dt = (ms: number) => paraDatetime(new Date(ms).toISOString());

let tabelaGarantida = false;
async function garantirTabela(banco: Banco): Promise<void> {
  if (tabelaGarantida) return;
  await banco.query(TABELA_DESAFIO);
  tabelaGarantida = true;
}

/** Só para testes: esquece que a tabela já foi criada. */
export function esquecerTabelaGarantida(): void {
  tabelaGarantida = false;
}

function afetadas(resultado: [unknown, unknown]): number {
  const cabecalho = resultado[0] as { affectedRows?: unknown } | null;
  return typeof cabecalho?.affectedRows === "number" ? cabecalho.affectedRows : 0;
}

async function ler(banco: Banco, id: string): Promise<Linha | null> {
  const [linhas] = await banco.query("SELECT expira_em, codigo_hash, enviado_em, envios, tentativas, usado FROM crm_desafio WHERE id = ?", [id]);
  return (linhas as Linha[])[0] ?? null;
}

export async function criarDesafio(banco: Banco, id: string, agora: number = Date.now()): Promise<void> {
  await garantirTabela(banco);
  await banco.query("DELETE FROM crm_desafio WHERE expira_em < ?", [dt(agora - 24 * 60 * 60 * 1000)]);
  await banco.query("INSERT INTO crm_desafio (id, criado_em, expira_em) VALUES (?, ?, ?)", [id, dt(agora), dt(agora + VALIDADE_DESAFIO_S * 1000)]);
}

export type ResultadoEnvio = { ok: true } | { ok: false; motivo: "expirado" | "limite_envios" | "aguarde"; segundos?: number };

/** Reserva um envio: grava o código novo e conta o envio, respeitando o limite de envios e a espera entre eles. */
export async function reservarEnvio(banco: Banco, id: string, canal: Canal, codigo: string, agora: number = Date.now()): Promise<ResultadoEnvio> {
  await garantirTabela(banco);
  const r = await banco.query(
    `UPDATE crm_desafio SET canal = ?, codigo_hash = ?, enviado_em = ?, envios = envios + 1, tentativas = 0
     WHERE id = ? AND usado = 0 AND expira_em > ? AND envios < ? AND (enviado_em IS NULL OR enviado_em <= ?)`,
    [canal, hashDoCodigo(id, codigo), dt(agora), id, dt(agora), MAX_ENVIOS, dt(agora - ESPERA_REENVIO_S * 1000)],
  );
  if (afetadas(r) === 1) return { ok: true };

  const linha = await ler(banco, id);
  if (!linha || Number(linha.usado) === 1 || new Date(deDatetime(linha.expira_em)).getTime() <= agora) return { ok: false, motivo: "expirado" };
  if (Number(linha.envios) >= MAX_ENVIOS) return { ok: false, motivo: "limite_envios" };
  const enviado = linha.enviado_em ? new Date(deDatetime(linha.enviado_em)).getTime() : 0;
  return { ok: false, motivo: "aguarde", segundos: Math.max(1, Math.ceil((enviado + ESPERA_REENVIO_S * 1000 - agora) / 1000)) };
}

/** Se o serviço de envio falhou, devolve o envio para a pessoa poder tentar de novo (o código nunca chegou). */
export async function desfazerEnvio(banco: Banco, id: string): Promise<void> {
  await banco.query("UPDATE crm_desafio SET envios = envios - 1, enviado_em = NULL, codigo_hash = NULL WHERE id = ? AND envios > 0", [id]);
}

export type ResultadoCodigo =
  | { ok: true }
  | { ok: false; motivo: "codigo"; restantes: number }
  | { ok: false; motivo: "expirado" | "limite" | "sem_codigo" };

/** Confere o código digitado. Conta a tentativa antes de comparar e só aceita uma vez. */
export async function conferirCodigo(banco: Banco, id: string, codigo: string, agora: number = Date.now()): Promise<ResultadoCodigo> {
  await garantirTabela(banco);
  const conta = await banco.query(
    "UPDATE crm_desafio SET tentativas = tentativas + 1 WHERE id = ? AND usado = 0 AND expira_em > ? AND codigo_hash IS NOT NULL AND tentativas < ?",
    [id, dt(agora), MAX_TENTATIVAS],
  );
  if (afetadas(conta) !== 1) {
    const linha = await ler(banco, id);
    if (!linha || Number(linha.usado) === 1 || new Date(deDatetime(linha.expira_em)).getTime() <= agora) return { ok: false, motivo: "expirado" };
    if (!linha.codigo_hash) return { ok: false, motivo: "sem_codigo" };
    return { ok: false, motivo: "limite" };
  }

  const linha = await ler(banco, id);
  if (!linha || typeof linha.codigo_hash !== "string") return { ok: false, motivo: "sem_codigo" };
  if (!codigoConfere(id, codigo, linha.codigo_hash)) return { ok: false, motivo: "codigo", restantes: Math.max(0, MAX_TENTATIVAS - Number(linha.tentativas)) };

  const usar = await banco.query("UPDATE crm_desafio SET usado = 1 WHERE id = ? AND usado = 0", [id]);
  return afetadas(usar) === 1 ? { ok: true } : { ok: false, motivo: "expirado" };
}