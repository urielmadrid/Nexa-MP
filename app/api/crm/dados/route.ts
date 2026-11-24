import { bancoConfigurado, obterBanco } from "@/src/lib/crm/servidor/banco";
import { barrar, erroDoBanco, responder } from "@/src/lib/crm/servidor/http";
import { lerTudo } from "@/src/lib/crm/servidor/leads";

/** Entrega à tela do CRM todos os leads e pastas guardados no banco. Só para diretores logados. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const barreira = barrar(request, false);
  if (barreira) return barreira;
  if (!bancoConfigurado()) return responder({ erro: "sem_banco" }, 503);
  try {
    return responder({ ok: true, dados: await lerTudo(obterBanco()) });
  } catch (erro) {
    return erroDoBanco(erro, "ler dados");
  }
}