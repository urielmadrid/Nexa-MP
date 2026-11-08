/**
 * Conteúdo da página /sobre que só a Nexa MP pode informar.
 *
 * Regra: nada aqui é inventado. Cada bloco só aparece na página quando estiver preenchido.
 * Deixe vazio ("" ou []) o que ainda não for confirmado: a página simplesmente não mostra aquele bloco.
 * O restante da página (serviços, método, diferenciais, contatos) vem dos outros arquivos de dados do site.
 */

export type PessoaEquipe = {
  nome: string;
  /** Função na Nexa MP. Ex.: "Gestão de tráfego". */
  funcao: string;
  /** Texto curto e verdadeiro sobre a pessoa (opcional). */
  descricao?: string;
  /** Endereço de uma foto em /public (opcional). Ex.: "/images/equipe/nome.jpg". */
  foto?: string;
  /** Perfil profissional da pessoa (opcional). Ex.: LinkedIn. */
  perfilUrl?: string;
};

export const SOBRE = {
  /** Quando a Nexa MP começou. Ex.: "2025". Vazio = não aparece. */
  fundacao: "",

  /** Onde a Nexa MP atua ou atende. Ex.: "Atendimento online para todo o Brasil". Vazio = não aparece. */
  atendimento: "",

  /** Parágrafo opcional sobre a história ou o jeito de trabalhar, escrito pela Nexa MP. Vazio = não aparece. */
  historia: "",

  /** Quem está por trás da Nexa MP. Lista vazia = o bloco "Quem está por trás" não aparece. */
  equipe: [] as PessoaEquipe[],
};

/** Há algum fato institucional preenchido? (decide se o bloco de fatos aparece) */
export function fatosDaNexa(): { rotulo: string; valor: string }[] {
  return [
    { rotulo: "Desde", valor: SOBRE.fundacao.trim() },
    { rotulo: "Atendimento", valor: SOBRE.atendimento.trim() },
  ].filter((fato) => fato.valor !== "");
}