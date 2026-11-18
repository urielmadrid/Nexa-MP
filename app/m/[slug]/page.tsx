import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MODELOS, modeloPorSlug } from "@/src/lib/data/modelos";
import ModeloSalao from "@/src/components/modelos/ModeloSalao";
import ModeloBarbearia from "@/src/components/modelos/ModeloBarbearia";

/**
 * Subsite dos modelos de landing page: /m/<slug> (ex.: /m/salao).
 * Para liberar um novo modelo, crie o componente e registre o slug aqui.
 */
const COMPONENTES: Record<string, () => React.JSX.Element> = {
  salao: ModeloSalao,
  barbearia: ModeloBarbearia,
};

type Props = { params: Promise<{ slug: string }> };

// Só existem as páginas dos modelos publicados; qualquer outro endereço vira 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return MODELOS.filter((m) => m.disponivel && COMPONENTES[m.slug]).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const modelo = modeloPorSlug(slug);

  if (!modelo || !modelo.disponivel) {
    return { title: "Modelo não encontrado", robots: { index: false, follow: false } };
  }

  return {
    title: `Modelo: ${modelo.titulo}`,
    description: `Demonstração da Nexa MP: ${modelo.titulo}. Nomes, textos e imagens são ilustrativos.`,
    // É uma demonstração para enviar a clientes, não uma página para aparecer no Google.
    robots: { index: false, follow: false },
  };
}

export default async function ModeloPage({ params }: Props) {
  const { slug } = await params;
  const modelo = modeloPorSlug(slug);
  const Modelo = COMPONENTES[slug];

  if (!modelo || !modelo.disponivel || !Modelo) notFound();

  return <Modelo />;
}