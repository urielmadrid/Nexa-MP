import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Acesso ao CRM (só no servidor). Os diretores entram com uma senha única; o servidor guarda uma sessão num cookie
 * assinado (HttpOnly, SameSite=Strict, 12 horas). Variáveis de ambiente (configure no Vercel e no .env.local):
 *   CRM_SENHA   - a senha de acesso (use uma longa).
 *   CRM_SEGREDO - texto aleatório com 32+ caracteres, usado para assinar o cookie de sessão.
 * Sem as duas variáveis, o CRM fica TRANCADO (nunca aberto por falta de configuração).
 * Quando houver banco de dados, troque por contas individuais de cada diretor.
 */

export const COOKIE_CRM = "nexa_crm";
export const DURACAO_SESSAO_S = 12 * 60 * 60;

export function crmConfigurado(): boolean {
  const senha = process.env.CRM_SENHA;
  const segredo = process.env.CRM_SEGREDO;
  return Boolean(senha && senha.length >= 8 && segredo && segredo.length >= 32);
}

function assinatura(carga: string): string {
  return createHmac("sha256", process.env.CRM_SEGREDO ?? "").update(carga).digest("base64url");
}

/** Cria o valor do cookie: "validade.assinatura". Devolve null se o CRM não estiver configurado. */
export function criarSessao(agora: number = Date.now()): string | null {
  if (!crmConfigurado()) return null;
  const validade = String(Math.floor(agora / 1000) + DURACAO_SESSAO_S);
  return `${validade}.${assinatura(validade)}`;
}

export function sessaoValida(valor: string | undefined | null, agora: number = Date.now()): boolean {
  if (!valor || !crmConfigurado()) return false;
  const [validade, assinado, resto] = valor.split(".");
  if (!validade || !assinado || resto !== undefined || !/^\d{9,12}$/.test(validade)) return false;
  if (Number(validade) * 1000 < agora) return false;
  const esperado = Buffer.from(assinatura(validade));
  const recebido = Buffer.from(assinado);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

/** Linha "Set-Cookie" que abre a sessão (usada pelo login e pela verificação em duas etapas). Null se o CRM não estiver configurado. */
export function cabecalhoCookieSessao(): string | null {
  const sessao = criarSessao();
  if (!sessao) return null;
  const seguro = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_CRM}=${sessao}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${DURACAO_SESSAO_S}${seguro}`;
}

/** Compara a senha digitada sem revelar, pelo tempo de resposta, o quanto ela acertou. */
export function senhaCorreta(tentativa: string): boolean {
  const senha = process.env.CRM_SENHA;
  if (!senha || !crmConfigurado()) return false;
  const a = createHash("sha256").update(tentativa).digest();
  const b = createHash("sha256").update(senha).digest();
  return timingSafeEqual(a, b);
}