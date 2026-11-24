import type { Metadata } from "next";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import FormularioDiagnostico from "@/src/components/formulario/FormularioDiagnostico";
import Reveal from "@/src/components/modelos/Reveal";
import { DIAGNOSTICO } from "@/src/lib/formulario/diagnostico";
import { NOME_SITE, SITE_URL } from "@/src/lib/site";

const TITULO_PAGINA = "Diagnóstico de presença digital";

export const metadata: Metadata = {
  title: TITULO_PAGINA,
  description: DIAGNOSTICO.descricao,
  // Página de captação: fica fora do Google por enquanto. Para indexar, troque para index: true e inclua em app/sitemap.ts.
  robots: { index: false, follow: true },
  alternates: { canonical: "/formulario" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: NOME_SITE,
    title: `${TITULO_PAGINA} | ${NOME_SITE}`,
    description: DIAGNOSTICO.descricao,
    url: `${SITE_URL}/formulario`,
  },
};

export default function FormularioPage() {
  return (
    <>
      <Header />
      <main id="conteudo" className="relative overflow-hidden bg-[#070707] text-white">
        <div className="nexa-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="nexa-orb -right-32 top-24 h-[380px] w-[380px]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,106,0,.10),transparent_35%)]" aria-hidden="true" />

        <div className="relative mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
          <Reveal>
            <p className="nexa-label">diagnóstico</p>
            <h1 className="nexa-display mt-5 text-4xl font-black leading-[.95] md:text-6xl">
              Descubra o que está <span className="text-brand-orange">travando</span> o crescimento do seu negócio no digital
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/55">{DIAGNOSTICO.descricao}</p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <FormularioDiagnostico />
            <p className="mt-4 text-center text-xs leading-5 text-white/35">
              Responder não gera cobrança. Os dados informados são usados apenas para a Nexa MP retornar o seu contato, conforme a{" "}
              <a href="/politica-de-privacidade" className="underline underline-offset-4 hover:text-white">
                Política de Privacidade
              </a>
              .
            </p>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}