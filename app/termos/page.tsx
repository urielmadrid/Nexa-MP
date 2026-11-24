import type { Metadata } from "next";
import Link from "next/link";
import { DATA_TERMOS } from "@/src/lib/data/legal";
import { FAQ_PLANOS, type FaqPlano } from "@/src/lib/data/planos";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso do site da Nexa MP e condições comerciais dos planos.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/termos" },
};

/** As condições comerciais vêm do mesmo arquivo do FAQ dos planos (src/lib/data/planos.ts): uma fonte só. */
function itemFaq(id: FaqPlano["id"]): FaqPlano {
  const item = FAQ_PLANOS.find((f) => f.id === id);
  if (!item) throw new Error(`Item do FAQ não encontrado: ${id}`);
  return item;
}

const CONDICOES: FaqPlano["id"][] = ["taxas", "prazo", "pagamento-landing", "postagens", "formas-pagamento"];

const TITULO = "text-xl font-bold text-brand-black";

export default function TermosPage() {
  const atraso = itemFaq("atraso");

  return (
    <main className="min-h-screen bg-white px-6 py-20 text-brand-black">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-brand-orange">← Voltar para a Nexa MP</Link>
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight">Termos de Uso</h1>
        <p className="mt-4 text-sm text-brand-black/60">Última atualização: {DATA_TERMOS}</p>
        <div className="mt-10 space-y-8 text-base leading-7 text-brand-black/75">
          <section>
            <h2 className={TITULO}>1. Uso do site</h2>
            <p className="mt-3">O site tem finalidade institucional e comercial, apresentando informações sobre serviços e planos da Nexa MP.</p>
          </section>

          <section>
            <h2 className={TITULO}>2. Informações comerciais</h2>
            <p className="mt-3">Preços, escopos e condições exibidos no site correspondem às informações publicadas no momento da atualização e podem ser alterados pela empresa. Uma conversa pelo site não constitui, por si só, contrato ou aceite de proposta comercial.</p>
          </section>

          <section>
            <h2 className={TITULO}>3. Condições comerciais dos planos</h2>
            <p className="mt-3">As condições abaixo valem para os planos e são formalizadas no contrato aceito entre as partes.</p>
            <div className="mt-4 space-y-4">
              {CONDICOES.map((id) => {
                const item = itemFaq(id);
                return (
                  <div key={id}>
                    <h3 className="font-semibold text-brand-black">{item.pergunta}</h3>
                    {item.resposta.map((paragrafo) => (
                      <p key={paragrafo} className="mt-1">{paragrafo}</p>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className={TITULO}>4. Atraso no pagamento</h2>
            <div className="mt-3 space-y-3">
              {atraso.resposta.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
              {atraso.exemplo && (
                <div className="rounded-xl border border-brand-black/10 bg-brand-black/[.03] p-4 text-sm">
                  <p className="font-semibold text-brand-black">{atraso.exemplo.titulo}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {atraso.exemplo.linhas.map((linha) => (
                      <li key={linha}>{linha}</li>
                    ))}
                  </ul>
                </div>
              )}
              {atraso.complemento?.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className={TITULO}>5. Conteúdo e propriedade intelectual</h2>
            <p className="mt-3">Textos, identidade visual, código e demais elementos deste site não devem ser reproduzidos ou utilizados comercialmente sem autorização.</p>
          </section>

          <section>
            <h2 className={TITULO}>6. Privacidade e cookies</h2>
            <p className="mt-3">
              O tratamento de dados pessoais e o uso de cookies estão descritos na{" "}
              <Link href="/politica-de-privacidade" className="font-semibold text-brand-orange underline-offset-4 hover:underline">Política de Privacidade</Link>.
            </p>
          </section>

          <section>
            <h2 className={TITULO}>7. Links externos</h2>
            <p className="mt-3">O site pode direcionar para serviços de terceiros. O uso desses serviços está sujeito aos termos e políticas de cada plataforma.</p>
          </section>

          <section>
            <h2 className={TITULO}>8. Atualizações</h2>
            <p className="mt-3">Os termos podem ser atualizados quando houver mudança relevante no site ou nas formas de atendimento.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
