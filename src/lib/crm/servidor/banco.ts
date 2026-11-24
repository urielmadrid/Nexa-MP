import mysql from "mysql2/promise";

/**
 * Conexão com o MySQL. Só roda no servidor (rotas em app/api e src/lib/crm/servidor).
 *
 * Variável de ambiente:
 *   DATABASE_URL = mysql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
 *   (se a senha tiver símbolos como @ : / # ? %, escreva-os codificados: @ vira %40, : vira %3A, / vira %2F ...)
 *   DATABASE_SSL = false  (opcional; só para um MySQL local sem criptografia. Nos bancos na internet, deixe como está)
 */

/** O mínimo que o CRM precisa do driver. Existe para facilitar testes e trocar de driver no futuro. */
export interface Executor {
  query(sql: string, valores?: unknown[]): Promise<[unknown, unknown]>;
}
export interface Conexao extends Executor {
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}
export interface Banco extends Executor {
  getConnection(): Promise<Conexao>;
}

export type Linha = Record<string, unknown>;

export function bancoConfigurado(): boolean {
  const url = process.env.DATABASE_URL;
  return typeof url === "string" && url.trim() !== "";
}

const globais = globalThis as unknown as { __nexaCrmPool?: Banco };

/** Um único conjunto de conexões por instância do servidor (evita abrir conexão nova a cada pedido). */
export function obterBanco(): Banco {
  if (globais.__nexaCrmPool) return globais.__nexaCrmPool;
  const texto = process.env.DATABASE_URL?.trim();
  if (!texto) throw new Error("DATABASE_URL não configurada.");

  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    throw new Error("DATABASE_URL inválida. O formato é mysql://usuario:senha@host:porta/banco");
  }
  if (url.protocol !== "mysql:") throw new Error("DATABASE_URL precisa começar com mysql://");

  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  const semSsl = process.env.DATABASE_SSL === "false" || (local && process.env.DATABASE_SSL !== "true");

  const pool = mysql.createPool({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    ssl: semSsl ? undefined : { minVersion: "TLSv1.2", rejectUnauthorized: true },
    charset: "utf8mb4",
    timezone: "Z",
    dateStrings: true,
    connectTimeout: 10_000,
    waitForConnections: true,
    connectionLimit: 3,
    maxIdle: 1,
    idleTimeout: 30_000,
    enableKeepAlive: true,
  });
  globais.__nexaCrmPool = pool as unknown as Banco;
  return globais.__nexaCrmPool;
}

/** "2026-11-23T03:20:00.123Z" → "2026-11-23 03:20:00.123" (UTC, como a coluna DATETIME(3) espera). */
export function paraDatetime(iso: string): string {
  const d = new Date(iso);
  const valido = Number.isNaN(d.getTime()) ? new Date() : d;
  return valido.toISOString().replace("T", " ").replace("Z", "");
}

/** "2026-11-23 03:20:00.123" (UTC) → "2026-11-23T03:20:00.123Z". */
export function deDatetime(valor: unknown): string {
  const t = String(valor ?? "").trim().replace(" ", "T");
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : `${t}Z`);
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

/** Resume um erro do banco para a tela (sem senha e sem o endereço do servidor). */
export function descreverErro(erro: unknown): { codigo: string; detalhe: string } {
  const e = erro as { code?: unknown; message?: unknown } | null;
  const codigo = typeof e?.code === "string" ? e.code : "ERRO";
  const msg = typeof e?.message === "string" ? e.message : String(erro);
  return { codigo, detalhe: msg.replace(/mysql:\/\/\S+/gi, "mysql://…").slice(0, 200) };
}

export function faltaTabela(erro: unknown): boolean {
  const e = erro as { code?: unknown; errno?: unknown } | null;
  return e?.code === "ER_NO_SUCH_TABLE" || e?.errno === 1146;
}