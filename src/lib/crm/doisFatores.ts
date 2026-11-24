import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

/**
 * Verificação em duas etapas do CRM (só no servidor).
 *
 * Como funciona: depois de acertar a senha, a pessoa escolhe receber um código de 6 dígitos por e-mail ou por WhatsApp
 * (os dois são da Nexa, definidos nas variáveis abaixo) e digita o código para entrar.
 *
 * Variáveis de ambiente (Vercel e .env.local):
 *   CRM_2FA            = ligado        (liga a verificação; sem isso o login continua só com a senha)
 *   CRM_2FA_EMAIL      = e-mail da Nexa que recebe o código                 (usa o mesmo ZOHO_SMTP_* do formulário para enviar)
 *   CRM_2FA_WHATSAPP   = número da Nexa que recebe o código, com DDD (ex.: 5553999999999)
 *   WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE   = envio pela API oficial da Meta (veja envioCodigo.ts)
 * Precisa de DATABASE_URL: o banco guarda os códigos e conta as tentativas.
 * Ligada a verificação e sem nenhum meio de envio configurado, o CRM fica TRANCADO (nunca aberto por falta de configuração).
 */

export const COOKIE_2FA = "nexa_crm_2fa";
export const VALIDADE_DESAFIO_S = 10 * 60;
export const MAX_ENVIOS = 3;
export const MAX_TENTATIVAS = 5;
export const ESPERA_REENVIO_S = 30;

export type Canal = "email" | "whatsapp";
export const CANAIS: readonly Canal[] = ["email", "whatsapp"];

export function doisFatoresLigado(): boolean {
  return ["ligado", "true", "1"].includes((process.env.CRM_2FA ?? "").trim().toLowerCase());
}

export function emailDestino(): string | null {
  const v = (process.env.CRM_2FA_EMAIL ?? "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
}

/** Só dígitos, com 55 na frente (aceita "(53) 99999-9999" ou "+55 53 99999-9999"). */
export function whatsappDestino(): string | null {
  let d = (process.env.CRM_2FA_WHATSAPP ?? "").replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  return d.length >= 12 && d.length <= 15 ? d : null;
}

function emailPronto(): boolean {
  return Boolean(process.env.ZOHO_SMTP_HOST && process.env.ZOHO_SMTP_USER && process.env.ZOHO_SMTP_PASS);
}

function whatsappPronto(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_TEMPLATE);
}

/** Meios que realmente dá para usar agora (destino definido e serviço de envio configurado). */
export function canaisDisponiveis(): Canal[] {
  const lista: Canal[] = [];
  if (emailDestino() && emailPronto()) lista.push("email");
  if (whatsappDestino() && whatsappPronto()) lista.push("whatsapp");
  return lista;
}

export function mascararEmail(email: string): string {
  const [local, dominio] = email.split("@");
  if (!local || !dominio) return "***";
  return `${local[0]}${"*".repeat(Math.min(5, Math.max(local.length - 1, 1)))}@${dominio}`;
}

export function mascararTelefone(digitos: string): string {
  const fim = digitos.slice(-4);
  if (digitos.startsWith("55") && (digitos.length === 12 || digitos.length === 13)) return `+55 ${digitos.slice(2, 4)} *****-${fim}`;
  return `+${"*".repeat(Math.max(digitos.length - 4, 3))}${fim}`;
}

export function destinoMascarado(canal: Canal): string {
  if (canal === "email") return mascararEmail(emailDestino() ?? "");
  return mascararTelefone(whatsappDestino() ?? "");
}

function segredo(): string {
  return process.env.CRM_SEGREDO ?? "";
}

function assinar(carga: string): string {
  return createHmac("sha256", segredo()).update(`2fa|${carga}`).digest("base64url");
}

export function novoIdDesafio(): string {
  return randomBytes(16).toString("hex");
}

/** Valor do cookie da etapa do código: "id.validade.assinatura". */
export function criarCookieDesafio(id: string, agora: number = Date.now()): string {
  const validade = String(Math.floor(agora / 1000) + VALIDADE_DESAFIO_S);
  return `${id}.${validade}.${assinar(`${id}.${validade}`)}`;
}

/** Devolve o id do desafio se o cookie é autêntico e não venceu; senão null. */
export function lerCookieDesafio(valor: string | undefined | null, agora: number = Date.now()): string | null {
  if (!valor) return null;
  const [id, validade, assinado, resto] = valor.split(".");
  if (!id || !validade || !assinado || resto !== undefined) return null;
  if (!/^[0-9a-f]{32}$/.test(id) || !/^\d{9,12}$/.test(validade)) return null;
  if (Number(validade) * 1000 < agora) return null;
  const esperado = Buffer.from(assinar(`${id}.${validade}`));
  const recebido = Buffer.from(assinado);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido) ? id : null;
}

export function gerarCodigo(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** O banco guarda só esta "impressão" do código, nunca o código em si. */
export function hashDoCodigo(id: string, codigo: string): string {
  return createHmac("sha256", segredo()).update(`2fa-codigo|${id}|${codigo}`).digest("hex");
}

export function codigoConfere(id: string, codigo: string, hashGuardado: string): boolean {
  const a = Buffer.from(hashDoCodigo(id, codigo));
  const b = Buffer.from(hashGuardado);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Aceita "123456", "123 456" ou "123-456". Devolve null se não tiver exatamente 6 dígitos. */
export function limparCodigoDigitado(texto: unknown): string | null {
  if (typeof texto !== "string") return null;
  const d = texto.replace(/[\s-]/g, "");
  return /^\d{6}$/.test(d) ? d : null;
}

export function cabecalhoCookieDesafio(valor: string): string {
  const seguro = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_2FA}=${valor}; Path=/api/crm; HttpOnly; SameSite=Strict; Max-Age=${VALIDADE_DESAFIO_S}${seguro}`;
}

export function cabecalhoLimparCookieDesafio(): string {
  const seguro = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_2FA}=; Path=/api/crm; HttpOnly; SameSite=Strict; Max-Age=0${seguro}`;
}