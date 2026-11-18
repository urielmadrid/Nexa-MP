/**
 * Endereço oficial do site e textos usados por título, descrição e dados estruturados.
 * Para trocar o endereço (por exemplo, em outro domínio), defina NEXT_PUBLIC_SITE_URL na Vercel.
 */
const bruto = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexa-mp.com.br").trim();
const comProtocolo = /^https?:\/\//i.test(bruto) ? bruto : `https://${bruto}`;

/** Sem barra no final, sempre com https://. */
export const SITE_URL = comProtocolo.replace(/\/+$/, "");

export const NOME_SITE = "Nexa MP";
export const NOME_ALTERNATIVO = "NexaMP";

export const TITULO_SITE = "Nexa MP | Gestão digital: sites, tráfego pago e redes sociais";
export const DESCRICAO_SITE =
  "A Nexa MP é uma empresa de gestão digital: sites e landing pages, tráfego pago, redes sociais, Google Meu Negócio e chatbots.";