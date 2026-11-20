/**
 * Abre a janelinha "Falar com a Nexa MP" de qualquer botão do site que antes só levava à seção de Contato.
 * A janelinha (src/components/sections/ContatoRapido.tsx) fica montada uma vez, em app/layout.tsx,
 * e escuta este evento. Os botões só dizem qual é o assunto (ids em src/lib/data/assuntosContato.ts).
 */
export const EVENTO_CONTATO = "nexa:contato";

export type DetalheContato = {
  /** id do assunto, ex.: "trafego-pago", "projeto" ou "servico:redes-sociais". */
  assunto: string;
  /** Complemento opcional para o texto da mensagem (hoje, só o diagnóstico). */
  detalhe?: string;
  /** A janelinha marca true quando abriu. Se ninguém marcar, o botão leva ao formulário do Contato. */
  tratado?: boolean;
};

export function abrirContato(assunto: string, detalhe = ""): void {
  if (typeof window === "undefined") return;
  const detail: DetalheContato = { assunto, detalhe };
  window.dispatchEvent(new CustomEvent<DetalheContato>(EVENTO_CONTATO, { detail }));
  // Se a janelinha não abriu (não está montada, ou o assunto não existe), leva ao formulário do Contato.
  if (!detail.tratado) window.location.assign("/#contato");
}

/**
 * Para links <a href="#contato">: com clique normal abre a janelinha; com Ctrl/Cmd/Shift ou botão do meio,
 * deixa o navegador abrir o link como sempre (a seção de Contato). Devolve true se abriu a janelinha.
 */
export function aoClicarContato(
  evento: { preventDefault: () => void; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; button: number },
  assunto: string,
  detalhe = "",
): boolean {
  if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || evento.button !== 0) return false;
  evento.preventDefault();
  abrirContato(assunto, detalhe);
  return true;
}