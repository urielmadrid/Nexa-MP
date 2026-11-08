"use client";

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Dumbbell,
  Link2,
  PawPrint,
  Scissors,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import { MODELOS } from "@/src/lib/data/modelos";

const ICONES: Record<string, LucideIcon> = {
  academia: Dumbbell,
  pet: PawPrint,
  restaurante: UtensilsCrossed,
  clinica: Stethoscope,
};

const O_QUE_TEM = [
  "Apresentação do negócio logo no topo",
  "Serviços explicados de forma simples",
  "Simulador de agendamento",
  "Galeria, perguntas frequentes e contato",
];

/** Mini-site em CSS que rola sozinho dentro da "janela do navegador". */
function MiniSite() {
  return (
    <div className="mod-scroll" aria-hidden="true">
      <div className="bg-[#fbf5f0] p-5">
        <div className="flex items-center justify-between">
          <span className="font-serif text-sm font-bold text-[#2a1f1c]">Seu Salão</span>
          <span className="flex gap-2">
            <i className="h-1.5 w-8 rounded-full bg-[#2a1f1c]/20" />
            <i className="h-1.5 w-8 rounded-full bg-[#2a1f1c]/20" />
            <i className="h-1.5 w-8 rounded-full bg-[#2a1f1c]/20" />
          </span>
        </div>
        <div className="mt-8 grid grid-cols-[1.2fr_1fr] items-center gap-4">
          <div>
            <p className="font-serif text-2xl font-bold leading-[1.05] text-[#2a1f1c]">
              Seu cabelo, do jeito que você imaginou.
            </p>
            <i className="mt-3 block h-1.5 w-full rounded-full bg-[#2a1f1c]/15" />
            <i className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-[#2a1f1c]/15" />
            <span className="mt-4 inline-block rounded-full bg-[#b8586b] px-4 py-1.5 text-[10px] font-bold text-white">
              Agendar horário
            </span>
          </div>
          <div className="aspect-[3/4] rounded-t-full bg-gradient-to-b from-[#e9b7b0] to-[#b8586b]" />
        </div>
      </div>

      <div className="bg-white p-5">
        <p className="font-serif text-base font-bold text-[#2a1f1c]">Nossos serviços</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["Corte", "Coloração", "Escova"].map((s) => (
            <div key={s} className="rounded-xl border border-[#2a1f1c]/10 bg-[#fbf5f0] p-3">
              <i className="block h-5 w-5 rounded-full bg-[#b8586b]/80" />
              <p className="mt-2 text-[10px] font-bold text-[#2a1f1c]">{s}</p>
              <i className="mt-1 block h-1 w-full rounded-full bg-[#2a1f1c]/10" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#2a1f1c] p-5 text-white">
        <p className="font-serif text-base font-bold">Agende em poucos passos</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {["1", "2", "3"].map((n) => (
            <div key={n} className="rounded-xl bg-white/10 py-3">
              <span className="font-serif text-lg font-bold text-[#e9b7b0]">{n}</span>
              <i className="mx-auto mt-1 block h-1 w-8 rounded-full bg-white/25" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#fbf5f0] p-5">
        <p className="font-serif text-base font-bold text-[#2a1f1c]">Galeria</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["from-[#e9b7b0]", "from-[#f3d9d4]", "from-[#c9a36b]", "from-[#f3d9d4]", "from-[#b8586b]", "from-[#e9b7b0]"].map(
            (c, i) => (
              <div key={i} className={`aspect-square rounded-lg bg-gradient-to-br ${c} to-white/60`} />
            ),
          )}
        </div>
      </div>

      <div className="bg-[#b8586b] p-6 text-center text-white">
        <p className="font-serif text-lg font-bold">Pronta para o seu novo visual?</p>
        <span className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-[11px] font-bold text-[#b8586b]">
          Agendar agora
        </span>
      </div>
    </div>
  );
}

export default function Modelos() {
  const destaque = MODELOS.find((m) => m.disponivel);
  const emBreve = MODELOS.filter((m) => !m.disponivel);
  const [copiado, setCopiado] = useState(false);

  async function copiarLink() {
    if (!destaque) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/m/${destaque.slug}`);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2200);
    } catch {
      /* sem permissão para copiar: o link continua visível e clicável */
    }
  }

  return (
    <section id="modelos" className="nexa-section bg-[#070707] py-24 text-white md:py-32">
      <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
      <div
        className="glow-blob pointer-events-none absolute -top-10 right-[8%] h-[24rem] w-[24rem] rounded-full bg-brand-orange/15 blur-3xl"
        style={{ animationDelay: "3s" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="nexa-label">05 / modelos</p>
            <h2 className="nexa-display mt-5 text-4xl font-black leading-[.95] md:text-6xl">
              Veja como a sua landing page
              <br />
              <span className="text-white/25">pode ficar.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/45">
            Abra um modelo completo, como se fosse o site de um cliente. Role a página, teste os botões e imagine o seu
            negócio ali.
          </p>
        </div>

        {destaque && (
          <div className="mt-14 grid gap-8 overflow-hidden rounded-[2rem] border border-brand-orange/30 bg-gradient-to-br from-brand-orange/10 via-white/[.02] to-transparent p-6 md:grid-cols-[1fr_1.05fr] md:items-center md:gap-12 md:p-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  Modelo disponível
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white/55">
                  Landing page completa
                </span>
              </div>

              <h3 className="nexa-display mt-5 flex items-center gap-3 text-3xl font-black leading-tight md:text-5xl">
                <Scissors className="h-8 w-8 shrink-0 text-brand-orange md:h-10 md:w-10" aria-hidden="true" />
                {destaque.segmento}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/60">{destaque.descricao}</p>

              <ul className="mt-6 space-y-2.5">
                {O_QUE_TEM.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/75">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-orange/20 text-brand-orange">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={`/m/${destaque.slug}`}
                  target="_blank"
                  rel="noopener"
                  className="cta-press group inline-flex items-center gap-2.5 rounded-xl bg-brand-orange px-6 py-4 text-sm font-bold text-white shadow-[0_0_50px_rgba(255,106,0,.25)] outline-none transition-all hover:-translate-y-1 hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white"
                >
                  Abrir o modelo completo
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                  <span className="sr-only">(abre em uma nova aba)</span>
                </Link>
              </div>

              {/* Link curto para mandar ao cliente */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/45">
                <Link2 className="h-3.5 w-3.5 text-brand-orange" aria-hidden="true" />
                <span>Link curto do modelo:</span>
                <code className="rounded-md bg-white/10 px-2 py-1 font-mono text-[11px] text-white/80">/m/{destaque.slug}</code>
                <button
                  type="button"
                  onClick={copiarLink}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 font-semibold text-white/70 outline-none transition-colors hover:border-brand-orange/60 hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange"
                >
                  {copiado ? (
                    <>
                      <Check className="h-3 w-3" aria-hidden="true" /> Link copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" aria-hidden="true" /> Copiar link
                    </>
                  )}
                </button>
                <span className="sr-only" aria-live="polite">
                  {copiado ? "Link copiado" : ""}
                </span>
              </div>
            </div>

            {/* Janela de navegador com o mini-site rolando */}
            <Link
              href={`/m/${destaque.slug}`}
              target="_blank"
              rel="noopener"
              aria-label={`Abrir o modelo completo: ${destaque.segmento} (nova aba)`}
              className="mod-browser group relative block rotate-0 outline-none md:rotate-1 md:transition-transform md:duration-500 md:hover:rotate-0 focus-visible:ring-2 focus-visible:ring-brand-orange"
            >
              <div
                className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-brand-orange/20 blur-2xl transition-opacity group-hover:opacity-80"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#161616] shadow-2xl shadow-black/60">
                <div className="flex items-center gap-2 border-b border-white/10 bg-[#1b1b1b] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-3 flex-1 truncate rounded-md bg-black/40 px-3 py-1 font-mono text-[10px] text-white/45">
                    /m/{destaque.slug}
                  </span>
                </div>
                <div className="relative h-[360px] overflow-hidden md:h-[430px]">
                  <MiniSite />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-16">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-black opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      Clique para abrir o modelo <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Outros segmentos */}
        <div className="mt-10">
          <p className="nexa-label">outros segmentos</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {emBreve.map((m) => {
              const Icone = ICONES[m.slug] ?? Scissors;
              return (
                <li
                  key={m.slug}
                  className="flex flex-col rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/40">
                      <Icone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-white/40">
                      em breve
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-white/70">{m.segmento}</h3>
                  <p className="mt-1 text-xs leading-5 text-white/35">{m.descricao}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-white">O seu segmento não está na lista?</p>
            <p className="mt-1 text-sm leading-6 text-white/55">
              A gente monta a sua landing page do zero, pensando no seu negócio. Os modelos acima são demonstrações com
              textos e imagens ilustrativos, não representam clientes reais.
            </p>
          </div>
          <Link
            href="#contato"
            className="cta-press group inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-5 py-3.5 text-sm font-semibold text-white outline-none transition-colors hover:border-brand-orange/60 hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            Quero uma landing page para o meu negócio
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
