import type { EnvioNormalizado, Formulario } from "@/src/lib/formulario/tipos";

/** Início da linha com o envio em JSON. O CRM procura por ela ao importar e-mails (src/lib/crm/importar.ts). */
export const MARCA_CRM = "DADOS_CRM_V1:";

const CANAIS: Record<string, string> = { whatsapp: "WhatsApp", email: "E-mail", ambos: "WhatsApp e e-mail" };

/** Para cabeçalhos de e-mail: sem quebras de linha. */
export function umaLinha(valor: string): string {
  return valor.replace(/[\r\n]+/g, " ").trim();
}

/** Monta o assunto e o texto do e-mail que a Nexa MP recebe, com os rótulos das perguntas (não os códigos). */
export function montarEmailDoEnvio(formulario: Formulario, envio: EnvioNormalizado): { assunto: string; texto: string } {
  const { lead } = envio;
  const assunto = umaLinha(`Novo diagnóstico pelo site: ${lead.empresa || lead.nome}`).slice(0, 150);
  const quando = new Date(envio.criadoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const linhas: string[] = [];
  linhas.push(`DIAGNÓSTICO DE PRESENÇA DIGITAL — recebido em ${quando} (horário de Brasília)`);
  linhas.push("");
  linhas.push("CONTATO");
  linhas.push(`Nome: ${lead.nome}`);
  if (lead.empresa) linhas.push(`Empresa: ${lead.empresa}`);
  if (lead.whatsappE164) linhas.push(`WhatsApp: ${lead.whatsappE164}`);
  if (lead.email) linhas.push(`E-mail: ${lead.email}`);
  linhas.push(`Prefere ser contatado por: ${lead.canalPreferido ? (CANAIS[lead.canalPreferido] ?? lead.canalPreferido) : "não informado"}`);
  linhas.push("");
  linhas.push("RESPOSTAS");

  const perguntas = formulario.etapas.flatMap((etapa) => etapa.perguntas);
  for (const p of perguntas) {
    const r = envio.respostas.find((x) => x.perguntaCodigo === p.codigo);
    if (!r) continue;
    const rotulos = r.opcaoCodigos.map((codigo) => p.opcoes?.find((o) => o.codigo === codigo)?.rotulo ?? codigo);
    const resposta =
      rotulos.length > 0 ? (r.texto ? `${rotulos.join(", ")} — ${r.texto}` : rotulos.join(", ")) : (r.texto ?? "");
    linhas.push(`• ${p.rotulo}`);
    linhas.push(`  ${resposta}`);
  }

  linhas.push("");
  linhas.push("--");
  linhas.push(`Aceite da Política de Privacidade e dos Termos: sim (versão ${envio.consentimento.versaoPolitica}).`);
  linhas.push(`Formulário: ${envio.formularioSlug} (versão ${envio.formularioVersao}) · código do envio: ${envio.id}`);
  const o = envio.origem;
  const origem = [o.pagina && `página ${o.pagina}`, o.referrer && `veio de ${o.referrer}`, o.utmSource && `utm_source=${o.utmSource}`, o.utmMedium && `utm_medium=${o.utmMedium}`, o.utmCampaign && `utm_campaign=${o.utmCampaign}`]
    .filter(Boolean)
    .join(" · ");
  if (origem) linhas.push(`Origem: ${origem}`);

  // Linha para o CRM (página /crm): o próprio envio em JSON, numa linha só. Não apague ao encaminhar o e-mail.
  linhas.push("");
  linhas.push("DADOS PARA O CRM (não apague esta linha):");
  linhas.push(`${MARCA_CRM}${JSON.stringify(envio)}`);

  return { assunto, texto: linhas.join("\n") };
}