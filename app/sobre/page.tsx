import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { CONTATO, linkWhatsApp } from "@/src/lib/data/contato";
import { DIFERENCIAIS } from "@/src/lib/data/diferenciais";
import { PROCESSO } from "@/src/lib/data/processo";
import { SERVICOS } from "@/src/lib/data/servicos";
import { SOBRE, fatosDaNexa } from "@/src/lib/data/sobre";
import { DESCRICAO_SITE, NOME_SITE, SITE_URL } from "@/src/lib/site";

const TITULO_PAGINA = "Sobre a Nexa MP";
const DESCRICAO_PAGINA =
  "Conheça a Nexa MP: uma empresa de gestão digital que reúne sites, tráfego pago, redes sociais, Google Meu Negócio e chatbots em uma estratégia só.";

export const metadata: Metadata = {
  title: TITULO_PAGINA,
  description: DESCRICAO_PAGINA,
  robots: { index: true, follow: true },
  alternates: { canonical: "/sobre" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: NOME_SITE,
    title: `${TITULO_PAGINA} | ${NOME_SITE}`,
    description: DESCRICAO_PAGINA,
    url: `${SITE_URL}/sobre`,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/sobre#webpage`,
  name: `${TITULO_PAGINA} | ${NOME_SITE}`,
  description: DESCRICAO_PAGINA,
  url: `${SITE_URL}/sobre`,
  inLanguage: "pt-BR",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
};

const TITULO_SECAO = "text-2xl font-extrabold tracking-tight text-white md:text-3xl";

export default function SobrePage() {
  const fatos = fatosDaNexa();
  const historia = SOBRE.historia.trim();
  const equipe = SOBRE.equipe.filter((pessoa) => pessoa.nome.trim() !== "");

  return (
    <>
      <Header />
      <main id="conteudo" className="relative overflow-hidden bg-[#070707] text-white">
        <div className="nexa-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
          <p className="nexa-label">sobre</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Gestão digital com <span className="text-brand-orange">estratégia</span> antes da execução.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 md:text-lg">{DESCRICAO_SITE}</p>

          {fatos.length > 0 && (
            <dl className="mt-10 grid gap-3 sm:grid-cols-2">
              {fatos.map((fato) => (
                <div key={fato.rotulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <dt className="nexa-label">{fato.rotulo}</dt>
                  <dd className="mt-3 text-base font-semibold text-white">{fato.valor}</dd>
                </div>
              ))}
            </dl>
          )}

          {historia && (
            <section className="mt-16" aria-labelledby="sobre-historia">
              <h2 id="sobre-historia" className={TITULO_SECAO}>Nossa história</h2>
              <p className="mt-4 whitespace-pre-line text-base leading-7 text-white/65">{historia}</p>
            </section>
          )}

          <section className="mt-16" aria-labelledby="sobre-faz">
            <h2 id="sobre-faz" className={TITULO_SECAO}>O que a Nexa MP faz</h2>
            <p className="mt-4 text-base leading-7 text-white/65">
              Reunimos em uma estratégia só as frentes que costumam andar separadas na presença digital de um negócio.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {SERVICOS.map((servico) => (
                <li key={servico.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-base font-bold text-white">{servico.titulo}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{servico.resumo}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16" aria-labelledby="sobre-jeito">
            <h2 id="sobre-jeito" className={TITULO_SECAO}>Como trabalhamos</h2>
            <ol className="mt-6 space-y-3">
              {PROCESSO.map((fase) => (
                <li key={fase.numero} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <span className="nexa-label pt-1" aria-hidden="true">{fase.numero}</span>
                  <div>
                    <h3 className="text-base font-bold text-white">{fase.titulo}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/55">{fase.resumo}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-16" aria-labelledby="sobre-principios">
            <h2 id="sobre-principios" className={TITULO_SECAO}>No que acreditamos</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {DIFERENCIAIS.map((item) => (
                <li key={item.titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-base font-bold text-white">{item.titulo}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{item.descricao}</p>
                </li>
              ))}
            </ul>
          </section>

          {equipe.length > 0 && (
            <section className="mt-16" aria-labelledby="sobre-equipe">
              <h2 id="sobre-equipe" className={TITULO_SECAO}>Quem está por trás</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {equipe.map((pessoa) => (
                  <li key={pessoa.nome} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    {pessoa.foto && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pessoa.foto}
                        alt={`Foto de ${pessoa.nome}`}
                        width={96}
                        height={96}
                        loading="lazy"
                        className="mb-4 h-24 w-24 rounded-2xl object-cover"
                      />
                    )}
                    <h3 className="text-base font-bold text-white">{pessoa.nome}</h3>
                    <p className="mt-1 text-sm font-semibold text-brand-orange">{pessoa.funcao}</p>
                    {pessoa.descricao && <p className="mt-3 text-sm leading-6 text-white/55">{pessoa.descricao}</p>}
                    {pessoa.perfilUrl && (
                      <a
                        href={pessoa.perfilUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline"
                      >
                        Perfil profissional
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-20 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-10" aria-labelledby="sobre-contato">
            <h2 id="sobre-contato" className={TITULO_SECAO}>Vamos conversar?</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/60">
              Conte um pouco sobre o seu negócio. A conversa não tem compromisso: entendemos o momento da empresa antes de sugerir qualquer coisa.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#contato"
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black"
              >
                Começar um projeto <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={linkWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white"
              >
                WhatsApp {CONTATO.whatsappExibicao}
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </>
  );
}