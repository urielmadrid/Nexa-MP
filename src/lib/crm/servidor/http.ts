import { COOKIE_CRM, crmConfigurado, sessaoValida } from "@/src/lib/crm/sessao";
import { descreverErro, faltaTabela } from "@/src/lib/crm/servidor/banco";

/** Cabeçalho que a tela do CRM manda em toda gravação. Uma página de outro site não consegue enviá-lo. */
export const CABECALHO_CRM = "x-nexa-crm";

export function responder(corpo: Record<string, unknown>, status = 200): Response {
  return Response.json(corpo, { status, headers: { "Cache-Control": "no-store" } });
}

function cookieDa(request: Request, nome: string): string | undefined {
  for (const parte of (request.headers.get("cookie") ?? "").split(";")) {
    const i = parte.indexOf("=");
    if (i > 0 && parte.slice(0, i).trim() === nome) return parte.slice(i + 1).trim();
  }
  return undefined;
}

/** Devolve uma resposta de erro se o pedido não vem de um diretor logado; senão devolve null. */
export function barrar(request: Request, gravacao: boolean): Response | null {
  if (!crmConfigurado()) return responder({ erro: "nao_configurado" }, 503);
  if (!sessaoValida(cookieDa(request, COOKIE_CRM))) return responder({ erro: "sessao" }, 401);
  if (gravacao && request.headers.get(CABECALHO_CRM) !== "1") return responder({ erro: "origem" }, 403);
  return null;
}

/** Traduz um erro do banco em resposta para a tela (sem expor senha nem endereço do servidor). */
export function erroDoBanco(erro: unknown, onde: string): Response {
  const { codigo, detalhe } = descreverErro(erro);
  console.error(`[crm] ${onde}:`, codigo, detalhe);
  if (faltaTabela(erro)) return responder({ erro: "sem_tabelas" }, 409);
  return responder({ erro: "banco", codigo, detalhe }, 500);
}