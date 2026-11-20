/**
 * Abre a janelinha "Quero este plano" de qualquer botão de plano do site.
 * A janelinha (src/components/sections/ContratarPlano.tsx) fica montada uma vez, na seção de Planos,
 * e escuta este evento. Os botões só dizem qual plano foi escolhido.
 */
export const EVENTO_CONTRATAR = "nexa:contratar";

export type DetalheContratar = {
  /** id do plano (planos.ts), ex.: "landing-avulsa", "trafego-1000" ou "trafego-personalizado". */
  planoId: string;
  /** Só no tráfego pago com outro valor: o valor mensal em reais. */
  valor?: number;
  /** A janelinha marca true quando abriu. Se ninguém marcar, o botão leva ao formulário do Contato. */
  tratado?: boolean;
};

export function abrirContratacao(planoId: string, valor = 0): void {
  if (typeof window === "undefined") return;
  const detail: DetalheContratar = { planoId, valor };
  window.dispatchEvent(new CustomEvent<DetalheContratar>(EVENTO_CONTRATAR, { detail }));
  // Se a janelinha não abriu (não está montada, ou o plano não existe), o botão não pode ficar mudo:
  // leva ao formulário do Contato, com o plano já marcado.
  if (!detail.tratado) window.location.assign(`/?plano=${planoId}${valor > 0 ? `&valor=${valor}` : ""}#contato`);
}

/**
 * Para links <a href="/?plano=...#contato">: com clique normal abre a janelinha; com Ctrl/Cmd/Shift ou botão do meio,
 * deixa o navegador abrir o link como sempre (o formulário do Contato).
 */
export function aoClicarContratar(
  evento: { preventDefault: () => void; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; button: number },
  planoId: string,
  valor = 0,
): void {
  if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;
  evento.preventDefault();
  abrirContratacao(planoId, valor);
}