import { ESPERA_REENVIO_S, CANAIS, COOKIE_2FA, canaisDisponiveis, destinoMascarado, doisFatoresLigado, gerarCodigo, lerCookieDesafio, type Canal } from "@/src/lib/crm/doisFatores";
import { crmConfigurado } from "@/src/lib/crm/sessao";
import { bancoConfigurado, obterBanco } from "@/src/lib/crm/servidor/banco";
import { desfazerEnvio, reservarEnvio } from "@/src/lib/crm/servidor/desafio";
import { enviarCodigo } from "@/src/lib/crm/servidor/envioCodigo";

/** Segunda etapa do login: envia o código de 6 dígitos para o e-mail ou o WhatsApp da Nexa, no meio que a pessoa escolheu. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (corpo: Record<string, unknown>, status: number) => Response.json(corpo, { status, headers: { "Cache-Control": "no-store" } });

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

  let canal: Canal | null = null;
  try {
    const bruto = (await request.text()).slice(0, 500);
    const dado: unknown = JSON.parse(bruto);
    const pedido = typeof dado === "object" && dado !== null ? (dado as { canal?: unknown }).canal : undefined;
    if (typeof pedido === "string" && (CANAIS as readonly string[]).includes(pedido)) canal = pedido as Canal;
  } catch {
    /* corpo inválido: tratado abaixo */
  }
  if (!canal || !canaisDisponiveis().includes(canal)) return json({ erro: "canal" }, 400);

  const banco = obterBanco();
  const codigo = gerarCodigo();
  try {
    const reserva = await reservarEnvio(banco, id, canal, codigo);
    if (!reserva.ok) {
      if (reserva.motivo === "expirado") return json({ erro: "expirado" }, 410);
      if (reserva.motivo === "limite_envios") return json({ erro: "limite_envios" }, 429);
      return json({ erro: "aguarde", segundos: reserva.segundos ?? ESPERA_REENVIO_S }, 429);
    }
  } catch (erro) {
    console.error("[crm-2fa] Falha ao reservar o envio:", erro instanceof Error ? erro.message : erro);
    return json({ erro: "banco" }, 500);
  }

  try {
    await enviarCodigo(canal, codigo);
  } catch (erro) {
    console.error(`[crm-2fa] Falha ao enviar o código por ${canal}:`, erro instanceof Error ? erro.message : erro);
    try {
      await desfazerEnvio(banco, id);
    } catch {
      /* se não der para devolver o envio, a pessoa só gasta uma das tentativas de envio */
    }
    return json({ erro: "envio", canal }, 502);
  }

  return json({ ok: true, canal, destino: destinoMascarado(canal), reenviarEm: ESPERA_REENVIO_S }, 200);
}