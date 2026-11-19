import { SERVICOS } from "@/src/lib/data/servicos";

/**
 * Textos da janelinha "Falar com a Nexa MP", aberta pelos botões que falam de um serviço ou produto específico
 * (tráfego pago, landing page, cada serviço da lista). Botões genéricos ("Começar um projeto", etc.) levam ao formulário do Contato.
 *
 * Cada assunto tem:
 *   titulo   -> a frase que aparece no topo da janelinha e vira o assunto do e-mail (ex.: "Quero saber mais sobre tráfego pago")
 *   mensagem -> o texto que a pessoa envia pelo WhatsApp e/ou e-mail
 *
 * Para mudar um texto, é só trocar o que está entre aspas. O "id" (a palavra antes dos dois pontos) é o nome que os botões usam: não troque.
 * Os serviços têm assunto automático: "servico:<id do serviço>" gera "Quero saber mais sobre <nome do serviço>" a partir de servicos.ts.
 */
export type AssuntoContato = {
  titulo: string;
  mensagem: string;
  /** Opcional: usada quando o botão manda um complemento ({detalhe} vira o complemento). Hoje nenhum botão usa. */
  mensagemComDetalhe?: string;
};

export const ASSUNTOS_CONTATO: Record<string, AssuntoContato> = {
  "landing-page": {
    titulo: "Quero uma landing page para o meu negócio",
    mensagem: "Olá, Nexa MP! Vim pelo site e quero uma landing page para o meu negócio.",
  },
  "trafego-pago": {
    titulo: "Quero saber mais sobre tráfego pago",
    mensagem: "Olá, Nexa MP! Vim pelo site e quero saber mais sobre tráfego pago.",
  },
};

/** Texto final do assunto, ou null se o id não existir. */
export function resolverAssunto(id: string, detalhe = ""): AssuntoContato | null {
  if (id.startsWith("servico:")) {
    const servico = SERVICOS.find((s) => `servico:${s.id}` === id);
    if (!servico) return null;
    const nome = servico.titulo.toLowerCase().replace(" & ", " e ");
    return {
      titulo: `Quero saber mais sobre ${nome}`,
      mensagem: `Olá, Nexa MP! Vim pelo site e quero saber mais sobre ${nome}.`,
    };
  }
  const assunto = ASSUNTOS_CONTATO[id];
  if (!assunto) return null;
  const complemento = detalhe.trim();
  if (complemento && assunto.mensagemComDetalhe) {
    return { titulo: assunto.titulo, mensagem: assunto.mensagemComDetalhe.replaceAll("{detalhe}", complemento) };
  }
  return { titulo: assunto.titulo, mensagem: assunto.mensagem };
}