import { descreverPlano } from "@/src/lib/data/mensagemContato";
import { PLANOS, PLANOS_TRAFEGO, formatarValor } from "@/src/lib/data/planos";

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

/**
 * Mensagem de quem quer um valor de tráfego pago maior que o do plano (campo "Quer outro valor, maior?" da janelinha).
 * {valor} vira o que a pessoa digitou (ex.: "R$ 1.500").
 */
export const MENSAGEM_TRAFEGO_OUTRO_VALOR =
  "Olá, Nexa MP! Vim pelo site e quero um plano de tráfego pago de {valor} por mês (gestão e verba de anúncios juntas).";

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
export function mensagemDoPlano(id: string, valorOutro = 0): string {
  if (valorOutro > 0 && PLANOS_TRAFEGO.some((p) => p.id === id)) {
    return MENSAGEM_TRAFEGO_OUTRO_VALOR.replaceAll("{valor}", formatarValor(valorOutro));
  }
  const modelo = (MENSAGENS_PLANOS[id] ?? "").trim();
  const descricao = descreverPlano(id);
  if (!modelo) return `Olá, Nexa MP! Vim pelo site e quero o plano: ${descricao}.`;
  return modelo.replaceAll("{plano}", descricao);
}

/** Assunto do e-mail do pedido. */
export function tituloDoPedido(id: string, valorOutro = 0): string {
  if (valorOutro > 0 && PLANOS_TRAFEGO.some((p) => p.id === id)) return `Quero tráfego pago de ${formatarValor(valorOutro)} por mês`;
  return `Quero o plano ${resumoDoPlano(id)?.nome ?? ""}`.trim();
}