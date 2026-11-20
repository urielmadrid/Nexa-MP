import { descreverPlano } from "@/src/lib/data/mensagemContato";
import { PLANOS, PLANOS_TRAFEGO } from "@/src/lib/data/planos";

/**
 * Mensagens prontas de cada plano: é o texto que a pessoa envia à Nexa MP pelo WhatsApp e/ou e-mail
 * quando clica em "Quero o plano ..." e escolhe "Enviar uma mensagem pronta".
 *
 * COMO PREENCHER: escreva o texto de cada plano entre as aspas. Pode usar:
 *   {plano}  -> nome do plano, com valor e período (ex.: "Landing Page Avulsa (R$ 500, pagamento único)")
 *
 * Enquanto um plano estiver com "" (vazio), o site usa uma frase simples: "Olá, Nexa MP! Vim pelo site e quero o plano ...".
 * Quando você preencher, essa frase deixa de ser usada para aquele plano.
 */
export const MENSAGENS_PLANOS: Record<string, string> = {
  "landing-avulsa": "",
  essencial: "",
  "presenca-completa": "",
  "crescimento-continuo": "",
  "trafego-500": "",
};

/** Nome e detalhe do plano para mostrar no topo da janelinha. Devolve null se o id não for de um plano. */
export function resumoDoPlano(id: string): { nome: string; detalhe: string } | null {
  const plano = PLANOS.find((p) => p.id === id);
  if (plano) {
    const preco = plano.precoOriginal ? `${plano.preco} (de ${plano.precoOriginal})` : plano.preco;
    return { nome: plano.nome, detalhe: `${preco}, ${plano.periodo}` };
  }
  const trafego = PLANOS_TRAFEGO.find((p) => p.id === id);
  if (trafego) return { nome: trafego.nome, detalhe: `${trafego.preco} ${trafego.periodo}, gestão e verba de anúncios juntas` };
  return null;
}

/** Texto final da mensagem do plano (o preenchido em MENSAGENS_PLANOS, ou a frase simples enquanto estiver vazio). */
export function mensagemDoPlano(id: string): string {
  const modelo = (MENSAGENS_PLANOS[id] ?? "").trim();
  const descricao = descreverPlano(id);
  if (!modelo) return `Olá, Nexa MP! Vim pelo site e quero o plano: ${descricao}.`;
  return modelo.replaceAll("{plano}", descricao);
}