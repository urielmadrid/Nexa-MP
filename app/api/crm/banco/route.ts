import { bancoConfigurado, obterBanco } from "@/src/lib/crm/servidor/banco";
import { barrar, erroDoBanco, responder } from "@/src/lib/crm/servidor/http";
import { criarTabelas } from "@/src/lib/crm/servidor/leads";

/** Cria as tabelas do CRM no banco (só o que ainda não existe; pode ser chamado mais de uma vez). */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const barreira = barrar(request, true);
  if (barreira) return barreira;
  if (!bancoConfigurado()) return responder({ erro: "sem_banco" }, 503);
  try {
    await criarTabelas(obterBanco());
    return responder({ ok: true });
  } catch (erro) {
    return erroDoBanco(erro, "criar tabelas");
  }
}