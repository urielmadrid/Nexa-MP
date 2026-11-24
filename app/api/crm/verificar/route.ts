import { COOKIE_2FA, cabecalhoLimparCookieDesafio, doisFatoresLigado, lerCookieDesafio, limparCodigoDigitado } from "@/src/lib/crm/doisFatores";
import { cabecalhoCookieSessao, crmConfigurado } from "@/src/lib/crm/sessao";
import { bancoConfigurado, obterBanco } from "@/src/lib/crm/servidor/banco";
import { conferirCodigo } from "@/src/lib/crm/servidor/desafio";

/** Terceira etapa do login: confere o código digitado e, se estiver certo, abre a sessão do CRM. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (corpo: Record<string, unknown>, status: number, extra: Record<string, string> = {}) =>
  Response.json(corpo, { status, headers: { "Cache-Control": "no-store", ...extra } });

function cookieDa(request: Request, nome: string): string | undefined {
  for (const parte of (request.headers.get("cookie") ?? "").split(";")) {
    const i = parte.indexOf("=");
    if (i > 0 && parte.slice(0, i).trim() === nome) return parte.slice(i + 1).trim();
  }
  return undefined;
}

export async function POST(request: Request) {
  if (!crmConfigurado()) return json({ erro: "nao_configurado" }, 503);
  if (!doisFatoresLigado() || !bancoConfigurado()) return json({ erro: "doisfatores_nao_configurado" }, 503);

  const id = lerCookieDesafio(cookieDa(request, COOKIE_2FA));
  if (!id) return json({ erro: "sessao" }, 401);

  let codigo: string | null = null;
  try {
    const dado: unknown = JSON.parse((await request.text()).slice(0, 500));
    codigo = limparCodigoDigitado(typeof dado === "object" && dado !== null ? (dado as { codigo?: unknown }).codigo : undefined);
  } catch {
    /* corpo inválido: tratado abaixo */
  }
  if (!codigo) return json({ erro: "formato" }, 400);

  let resultado;
  try {
    resultado = await conferirCodigo(obterBanco(), id, codigo);
  } catch (erro) {
    console.error("[crm-2fa] Falha ao conferir o código:", erro instanceof Error ? erro.message : erro);
    return json({ erro: "banco" }, 500);
  }

  if (resultado.ok) {
    const cookie = cabecalhoCookieSessao();
    if (!cookie) return json({ erro: "nao_configurado" }, 503);
    // Dois cookies na mesma resposta: abre a sessão e apaga o cookie da etapa do código.
    const cabecalhos = new Headers({ "Cache-Control": "no-store", "Content-Type": "application/json" });
    cabecalhos.append("Set-Cookie", cookie);
    cabecalhos.append("Set-Cookie", cabecalhoLimparCookieDesafio());
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cabecalhos });
  }

  // Pequena espera para desestimular tentativas em massa.
  await new Promise((r) => setTimeout(r, 600));
  if (resultado.motivo === "codigo") return json({ erro: "codigo", restantes: resultado.restantes }, 401);
  if (resultado.motivo === "expirado") return json({ erro: "expirado" }, 410);
  if (resultado.motivo === "sem_codigo") return json({ erro: "sem_codigo" }, 409);
  return json({ erro: "limite" }, 429);
}