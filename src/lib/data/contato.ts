/**
 * Central de contatos da Nexa MP. Todo o site lê daqui: se um dado mudar, troque somente neste arquivo.
 */
export const CONTATO = {
  email: "contato@nexa-mp.com.br",
  /** Só dígitos, com código do país (55) e DDD: é o formato que o wa.me exige. */
  whatsappNumero: "555391456599",
  /** Como o número aparece escrito no site. */
  whatsappExibicao: "+55 53 9145-6599",
  instagramUsuario: "@nexamp_",
  instagramUrl: "https://instagram.com/nexamp_",
  /** Mensagem que já vem escrita quando a pessoa abre o WhatsApp pelo site. */
  mensagemWhatsApp: "Olá! Vim pelo site da Nexa MP e quero conversar sobre ",
  assuntoEmail: "Contato pelo site da Nexa MP",
} as const;

/** Link do WhatsApp com mensagem pré-preenchida. */
export function linkWhatsApp(texto: string = CONTATO.mensagemWhatsApp): string {
  return `https://wa.me/${CONTATO.whatsappNumero}?text=${encodeURIComponent(texto)}`;
}

/** Link de e-mail (abre o programa de e-mail da pessoa) com assunto e texto opcionais. */
export function linkEmail(assunto: string = CONTATO.assuntoEmail, corpo?: string): string {
  const params = [`subject=${encodeURIComponent(assunto)}`];
  if (corpo) params.push(`body=${encodeURIComponent(corpo)}`);
  return `mailto:${CONTATO.email}?${params.join("&")}`;
}
