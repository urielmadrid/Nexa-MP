import { cabecalhoCookieSessao, crmConfigurado, senhaCorreta } from "@/src/lib/crm/sessao";
import { cabecalhoCookieDesafio, canaisDisponiveis, criarCookieDesafio, destinoMascarado, doisFatoresLigado, novoIdDesafio } from "@/src/lib/crm/doisFatores";
import { bancoConfigurado, obterBanco } from "@/src/lib/crm/servidor/banco";
import { criarDesafio } from "@/src/lib/crm/servidor/desafio";

/** Login do CRM. Veja src/lib/crm/sessao.ts para as variáveis CRM_SENHA e CRM_SEGREDO. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JANELA_MS = 15 * 60 * 1000;
const MAX_ERROS = 5;
const erros = new Map<string, number[]>();

function bloqueado(ip: string): boolean {
  const agora = Date.now();
  const recentes = (erros.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  erros.set(ip, recentes);
  return recentes.length >= MAX_ERROS;
}

function registrarErro(ip: string) {
  erros.set(ip, [...(erros.get(ip) ?? []), Date.now()]);
  if (erros.size > 500) {
    const agora = Date.now();
    for (const [chave, lista] of erros) if (lista.every((t) => agora - t >= JANELA_MS)) erros.delete(chave);
  }
}

const json = (corpo: Record<string, unknown>, status: number, extra: Record<string, string> = {}) =>
  Response.json(corpo, { status, headers: { "Cache-Control": "no-store", ...extra } });

export async function POST(request: Request) {
  if (!crmConfigurado()) return json({ erro: "nao_configurado" }, 503);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
  if (bloqueado(ip)) return json({ erro: "limite" }, 429);

  const bruto = await request.text();
  let senha = "";
  if (bruto.length > 0 && bruto.length <= 2000) {
    try {
      const dado: unknown = JSON.parse(bruto);
      if (typeof dado === "object" && dado !== null && typeof (dado as { senha?: unknown }).senha === "string") senha = (dado as { senha: string }).senha;
    } catch {
      /* corpo inválido: tratado como senha vazia */
    }
  }

  if (!senhaCorreta(senha)) {
    registrarErro(ip);
    // Pequena espera para desestimular tentativas em massa.
    await new Promise((r) => setTimeout(r, 600));
    return json({ erro: "senha" }, 401);
  }

  // Verificação em duas etapas: a senha sozinha não abre a sessão, só libera a escolha de onde receber o código.
  if (doisFatoresLigado()) {
    const canais = canaisDisponiveis();
    if (!bancoConfigurado() || canais.length === 0) {
      console.error("[crm-2fa] CRM_2FA está ligado, mas falta DATABASE_URL ou um meio de envio (e-mail ou WhatsApp). O acesso fica trancado.");
      return json({ erro: "doisfatores_nao_configurado" }, 503);
    }
    try {
      const id = novoIdDesafio();
      await criarDesafio(obterBanco(), id);
      return json(
        { ok: true, etapa: "codigo", canais: canais.map((c) => ({ id: c, destino: destinoMascarado(c) })) },
        200,
        { "Set-Cookie": cabecalhoCookieDesafio(criarCookieDesafio(id)) },
      );
    } catch (erro) {
      console.error("[crm-2fa] Falha ao iniciar a verificação:", erro instanceof Error ? erro.message : erro);
      return json({ erro: "banco" }, 500);
    }
  }

  const cookie = cabecalhoCookieSessao();
  if (!cookie) return json({ erro: "nao_configurado" }, 503);
  return json({ ok: true }, 200, { "Set-Cookie": cookie });
}