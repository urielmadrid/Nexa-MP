"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Compass, Home, Layers3, MessageCircle, Tag } from "lucide-react";
import { CONTATO, linkWhatsApp } from "@/src/lib/data/contato";

const ROTAS: { titulo: string; texto: string; href: string; Icone: LucideIcon }[] = [
  { titulo: "Início", texto: "Volte ao começo e comece de novo.", href: "/", Icone: Home },
  { titulo: "Serviços", texto: "Veja o que a Nexa MP faz pelo seu negócio.", href: "/#servicos", Icone: Layers3 },
  { titulo: "Planos", texto: "Compare os planos e escolha o seu andar.", href: "/#planos", Icone: Tag },
  { titulo: "Modelos", texto: "Abra um modelo de landing page completo.", href: "/#modelos", Icone: Compass },
];

/** Página 404 no mesmo estilo do site: fundo escuro, grid, órbitas e luz que segue o cursor. */
export default function NaoEncontrado() {
  const caminho = usePathname();
  const [p, setP] = useState({ x: 50, y: 40 });

  return (
    <section
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setP({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      className="nexa-section flex min-h-screen items-center bg-[#040404] pb-20 pt-36 text-white md:pt-40"
    >
      <div className="cta-light" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
      <div className="nexa-grid absolute inset-0 opacity-25" />
      <div className="nexa-noise absolute inset-0 opacity-[.06]" />
      <div className="cta-orbit cta-orbit-a" />
      <div className="cta-orbit cta-orbit-b" />

      <div className="relative mx-auto w-full max-w-5xl px-5 text-center md:px-8">
        <p className="nexa-label">erro 404 / rota não encontrada</p>

        {/* 4 [órbita] 4 */}
        <h1 className="mt-8 flex items-center justify-center gap-2 md:gap-5" aria-label="Erro 404">
          <span className="nexa-display nf-blink text-[clamp(6rem,24vw,15rem)] font-black leading-[.8]" aria-hidden="true">
            4
          </span>
          <span
            className="relative grid h-[clamp(5.2rem,20vw,12.5rem)] w-[clamp(5.2rem,20vw,12.5rem)] shrink-0 place-items-center rounded-full border-2 border-brand-orange shadow-[0_0_60px_rgba(255,106,0,.35),inset_0_0_40px_rgba(255,106,0,.18)]"
            aria-hidden="true"
          >
            <span className="nf-orbit absolute inset-0">
              <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-white shadow-[0_0_20px_6px_rgba(255,255,255,.55)]" />
            </span>
            <span className="absolute inset-[18%] rounded-full border border-dashed border-white/20" />
            <span className="text-brand-orange">
              <Compass className="h-[34%] w-[34%] min-h-8 min-w-8" />
            </span>
          </span>
          <span className="nexa-display text-[clamp(6rem,24vw,15rem)] font-black leading-[.8]" aria-hidden="true">
            4
          </span>
        </h1>

        <h2 className="nexa-display mx-auto mt-10 max-w-3xl text-3xl font-black leading-[.95] md:text-6xl">
          Essa página <span className="text-brand-orange">saiu do ar.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/50 md:text-lg">
          O endereço pode estar incorreto ou a página pode ter sido removida. Escolha para onde seguir ou fale com a gente.
        </p>

        {caminho && (
          <p className="mx-auto mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 font-mono text-[11px] text-white/45">
            <span className="shrink-0 uppercase tracking-[.2em] text-white/30">procurado</span>
            <span className="truncate text-white/70">{caminho}</span>
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="cta-press group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-bold text-black outline-none transition-all hover:-translate-y-1 hover:bg-brand-orange hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            Voltar para o início
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <a
            href={linkWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-press inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-6 py-4 text-sm font-semibold text-white/75 outline-none transition-all hover:border-brand-orange/60 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            <MessageCircle className="h-4 w-4 text-brand-orange" aria-hidden="true" />
            Falar pelo WhatsApp
            <span className="sr-only">(abre em uma nova aba)</span>
          </a>
        </div>

        <ul className="mx-auto mt-14 grid max-w-4xl gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
          {ROTAS.map(({ titulo, texto, href, Icone }) => (
            <li key={href}>
              <Link
                href={href}
                className="nexa-card group flex h-full flex-col rounded-2xl p-5 outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
              >
                <span className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-brand-orange transition-colors group-hover:border-brand-orange/30 group-hover:bg-brand-orange/10">
                    <Icone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-white/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-orange"
                    aria-hidden="true"
                  />
                </span>
                <span className="relative mt-5 block text-sm font-bold text-white">{titulo}</span>
                <span className="relative mt-1 block text-xs leading-5 text-white/45">{texto}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs text-white/35">
          Prefere e-mail? Escreva para{" "}
          <a
            href={`mailto:${CONTATO.email}`}
            className="font-semibold text-white/60 underline-offset-4 outline-none transition-colors hover:text-brand-orange hover:underline focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            {CONTATO.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
