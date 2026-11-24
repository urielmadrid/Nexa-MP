import { bancoConfigurado, obterBanco } from "@/src/lib/crm/servidor/banco";
import { barrar, erroDoBanco, responder } from "@/src/lib/crm/servidor/http";
import { sincronizar, type PedidoDeSincronizacao } from "@/src/lib/crm/servidor/leads";

/** Recebe da tela do CRM o que mudou (leads e pastas novos, alterados ou removidos) e grava no banco. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITE_CORPO = 3_000_000;

export async function POST(request: Request) {
  const barreira = barrar(request, true);
  if (barreira) return barreira;
  if (!bancoConfigurado()) return responder({ erro: "sem_banco" }, 503);

  const bruto = await request.text();
  if (bruto.length === 0 || bruto.length > LIMITE_CORPO) return responder({ erro: "dados" }, 400);
  let pedido: PedidoDeSincronizacao;
  try {
    const lido: unknown = JSON.parse(bruto);
    if (typeof lido !== "object" || lido === null || Array.isArray(lido)) return responder({ erro: "dados" }, 400);
    pedido = lido as PedidoDeSincronizacao;
  } catch {
    return responder({ erro: "dados" }, 400);
  }

  try {
    return responder({ ok: true, ...(await sincronizar(obterBanco(), pedido)) });
  } catch (erro) {
    return erroDoBanco(erro, "sincronizar");
  }
}