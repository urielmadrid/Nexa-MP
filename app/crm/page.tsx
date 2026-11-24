import type { Metadata } from "next";
import { cookies } from "next/headers";
import CrmApp from "@/src/components/crm/CrmApp";
import CrmAcesso from "@/src/components/crm/CrmAcesso";
import { COOKIE_CRM, crmConfigurado, sessaoValida } from "@/src/lib/crm/sessao";

/**
 * CRM interno da Nexa MP (uso exclusivo dos diretores).
 * - Não tem link em nenhuma página do site, não está no sitemap e pede para não ser indexado.
 * - Sem login válido, mostra só a tela de acesso. Sem CRM_SENHA e CRM_SEGREDO configurados, fica trancado.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acesso restrito",
  alternates: {},
  robots: { index: false, follow: false, nocache: true },
};

export default async function CrmPage() {
  if (!crmConfigurado()) return <CrmAcesso estado="nao_configurado" />;
  const jar = await cookies();
  if (!sessaoValida(jar.get(COOKIE_CRM)?.value)) return <CrmAcesso estado="login" />;
  return <CrmApp />;
}