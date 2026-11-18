/**
 * Campanha de Black Friday da Landing Page Avulsa.
 * Tudo que a campanha mostra no site vem deste arquivo: para ligar, desligar ou mudar o valor, altere só aqui.
 *
 * Para ENCERRAR a campanha: troque `ativa` para false e publique de novo (commit + deploy).
 * A tela de Black Friday some e o plano volta ao valor normal, que continua em src/lib/data/planos.ts.
 */
export const BLACK_FRIDAY = {
  /** true = campanha no ar. false = nada da campanha aparece no site. */
  ativa: true,

  /** Plano que entra na campanha (id em src/lib/data/planos.ts). */
  planoId: "landing-avulsa",

  /** Valor normal do plano, em reais. */
  precoDe: 500,

  /** Valor promocional da campanha, em reais. */
  precoPor: 350,

  /**
   * Período da campanha, em texto livre. Ex.: "Campanha válida de 20 a 30 de novembro".
   * Deixe vazio ("") enquanto não houver datas confirmadas: nada é inventado e nenhuma data aparece.
   */
  vigencia: "",
};

/** "R$ 350", "R$ 1.500". */
export function formatarReais(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR")}`;
}

/** A campanha só é válida se estiver ligada e o valor promocional for menor que o normal. */
export function campanhaValida(): boolean {
  return BLACK_FRIDAY.ativa && BLACK_FRIDAY.precoPor > 0 && BLACK_FRIDAY.precoPor < BLACK_FRIDAY.precoDe;
}

/** Desconto em porcentagem, calculado a partir dos dois valores (500 → 350 = 30). */
export function descontoPercentual(): number {
  return Math.round(((BLACK_FRIDAY.precoDe - BLACK_FRIDAY.precoPor) / BLACK_FRIDAY.precoDe) * 100);
}

/**
 * Valores da promoção para um plano, ou null se o plano não participa (ou a campanha está desligada).
 * Use nos cartões de plano e na mensagem de contato para mostrar o mesmo valor em todo o site.
 */
export function promocaoDoPlano(planoId: string): { de: string; por: string; desconto: number } | null {
  if (!campanhaValida() || planoId !== BLACK_FRIDAY.planoId) return null;
  return {
    de: formatarReais(BLACK_FRIDAY.precoDe),
    por: formatarReais(BLACK_FRIDAY.precoPor),
    desconto: descontoPercentual(),
  };
}