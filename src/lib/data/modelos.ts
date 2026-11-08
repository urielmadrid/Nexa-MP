export type Modelo = {
  /** Vai na URL curta: /m/<slug> */
  slug: string;
  segmento: string;
  titulo: string;
  descricao: string;
  /** false = aparece como "Em breve" e a URL ainda não existe. */
  disponivel: boolean;
  /** Pontos fortes mostrados na seção Modelos do site (só para os modelos disponíveis). */
  destaques?: string[];
};

/**
 * Modelos de landing page. Eles são demonstrações: nomes, textos e imagens são ilustrativos
 * e não representam clientes reais. Para liberar um novo modelo:
 *  1) crie o componente em src/components/modelos/
 *  2) registre o slug em app/m/[slug]/page.tsx (objeto COMPONENTES)
 *  3) troque "disponivel" para true aqui.
 */
export const MODELOS: Modelo[] = [
  {
    slug: "salao",
    segmento: "Salão de beleza",
    titulo: "Landing page para salão de beleza",
    descricao:
      "Uma landing page completa: apresentação, serviços, como agendar, galeria, perguntas frequentes e contato. Role e teste os botões como se fosse o site de um cliente.",
    disponivel: true,
    destaques: [
      "Apresentação do negócio logo no topo",
      "Serviços explicados de forma simples",
      "Simulador de agendamento",
      "Galeria, perguntas frequentes e contato",
    ],
  },
  {
    slug: "barbearia",
    segmento: "Barbearias",
    titulo: "Landing page para barbearia",
    descricao:
      "Uma landing page completa com agenda interativa: o cliente escolhe o serviço e o dia e vê quais horários estão livres e quais já estão ocupados, por barbeiro.",
    disponivel: true,
    destaques: [
      "Agenda com horários livres e ocupados por barbeiro",
      "Serviços com duração e valor",
      "Equipe, estilos, perguntas frequentes e localização",
      "Confirmação do horário em poucos toques",
    ],
  },
  {
    slug: "academia",
    segmento: "Academias",
    titulo: "Landing page para academia",
    descricao: "Planos, modalidades e agendamento de aula experimental.",
    disponivel: false,
  },
  {
    slug: "pet",
    segmento: "Pet shops",
    titulo: "Landing page para pet shop",
    descricao: "Banho e tosa, produtos e agendamento pelo WhatsApp.",
    disponivel: false,
  },
  {
    slug: "restaurante",
    segmento: "Restaurantes e delivery",
    titulo: "Landing page para restaurante",
    descricao: "Cardápio, horários e pedidos.",
    disponivel: false,
  },
  {
    slug: "clinica",
    segmento: "Clínicas e consultórios",
    titulo: "Landing page para clínica",
    descricao: "Especialidades, equipe e marcação de consulta.",
    disponivel: false,
  },
];

export function modeloPorSlug(slug: string): Modelo | undefined {
  return MODELOS.find((m) => m.slug === slug);
}