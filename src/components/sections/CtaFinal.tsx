"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, MousePointer2, Sparkles } from "lucide-react";
import { CONTATO, linkEmail, linkWhatsApp } from "@/src/lib/data/contato";

const PASSOS = [
  { rotulo: "Entra no site", classe: "cf-s1" },
  { rotulo: "Entende a proposta", classe: "cf-s2" },
  { rotulo: "Sente confiança", classe: "cf-s3" },
  { rotulo: "Chama você", classe: "cf-s4" },
];

/**
 * Cena animada (só CSS, ciclo de 9s): um visitante chega em uma página, lê, vai até o botão e clica;
 * chega uma "nova conversa". É uma ilustração: não mostra dados, números ou clientes reais.
 */
function CenaVisitante() {
  return (
    <div className="relative mx-auto mt-14 max-w-3xl text-left md:mt-16">
      <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-brand-orange/15 blur-3xl" aria-hidden="true" />

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0c0c0c] shadow-2xl shadow-black/60" aria-hidden="true">
        {/* barra do navegador */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#161616] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 truncate rounded-md bg-black/40 px-3 py-1 font-mono text-[10px] text-white/40">
            seusite.com.br
          </span>
        </div>

        {/* a "página" */}
        <div className="relative grid min-h-[270px] gap-6 p-6 md:grid-cols-[1.25fr_.75fr] md:items-center md:p-9">
          <div>
            <i className="cf-line block h-1.5 w-14 rounded-full bg-brand-orange" />
            <div className="mt-5 space-y-2.5">
              <i className="cf-line block h-3.5 w-[92%] rounded-full bg-white/85" style={{ animationDelay: "-0.6s" }} />
              <i className="cf-line block h-3.5 w-[74%] rounded-full bg-white/85" style={{ animationDelay: "-0.3s" }} />
              <i className="cf-line block h-3.5 w-[48%] rounded-full bg-white/85" />
            </div>
            <div className="mt-5 space-y-2">
              <i className="cf-line block h-1.5 w-[80%] rounded-full bg-white/20" style={{ animationDelay: "-0.2s" }} />
              <i className="cf-line block h-1.5 w-[58%] rounded-full bg-white/20" />
            </div>

            {/* botão + cursor */}
            <div className="relative mt-7 inline-block">
              <span className="cf-ripple absolute inset-0 rounded-full border-2 border-brand-orange" />
              <span className="cf-pop inline-block">
                <span className="cf-press inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-xs font-bold text-white shadow-[0_0_30px_rgba(255,106,0,.35)]">
                  Falar com a empresa <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </span>
              <span className="cf-cursor absolute left-0 top-0 z-10 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.8)]">
                <MousePointer2 className="h-6 w-6 fill-white" />
              </span>
            </div>
          </div>

          {/* "imagem" da página */}
          <div className="cf-pop relative hidden aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-orange/70 via-brand-orange/20 to-[#141414] md:block">
            <div className="absolute inset-0 grid place-items-center">
              <Sparkles className="h-12 w-12 text-white/50" />
            </div>
            <i className="absolute inset-x-4 bottom-4 block h-2 rounded-full bg-white/25" />
            <i className="absolute inset-x-4 bottom-9 block h-2 w-2/3 rounded-full bg-white/15" />
          </div>

          {/* aviso de nova conversa */}
          <div className="cf-toast absolute right-4 top-4 flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-black shadow-2xl md:right-6 md:top-6">
            <span className="relative grid h-7 w-7 place-items-center rounded-full bg-brand-orange text-white">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#28c840]" />
            </span>
            Nova conversa iniciada
          </div>
        </div>
      </div>

      {/* trilha do visitante, acende em sincronia com a cena */}
      <ol className="relative mt-8 grid grid-cols-2 gap-y-5 md:grid-cols-4" aria-label="Caminho de um visitante até a conversa">
        <span className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[11px] hidden h-px bg-gradient-to-r from-white/5 via-brand-orange/40 to-white/5 md:block" aria-hidden="true" />
        {PASSOS.map((p, i) => (
          <li key={p.rotulo} className={`${p.classe} relative flex flex-col items-center text-center`}>
            <span className="relative grid h-[22px] w-[22px] place-items-center rounded-full border border-brand-orange bg-[#040404] font-mono text-[10px] font-bold text-brand-orange shadow-[0_0_14px_rgba(255,106,0,.5)]">
              {i + 1}
            </span>
            <span className="mt-2.5 text-xs font-semibold text-white/80">{p.rotulo}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-center text-[11px] leading-5 text-white/35">
        Ilustração do caminho de um visitante: um bom site faz esse trabalho por você, todos os dias.
      </p>
    </div>
  );
}

export default function CtaFinal() {
  const [p, setP] = useState({ x: 50, y: 50 });

  return (
    <section
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setP({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      className="nexa-section border-t border-white/10 bg-[#040404] py-28 text-white md:py-40"
    >
      <div className="cta-light" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
      <div className="nexa-grid absolute inset-0 opacity-20" />
      <div className="cta-orbit cta-orbit-a" />
      <div className="cta-orbit cta-orbit-b" />

      <div className="relative mx-auto max-w-5xl px-5 text-center md:px-8">
        <p className="nexa-label">último frame / próxima etapa</p>
        <h2 className="nexa-display mx-auto mt-6 max-w-4xl text-5xl font-black leading-[.88] md:text-8xl">
          Seu próximo site pode ser o <span className="text-brand-orange">argumento.</span>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-base leading-7 text-white/50 md:text-lg">
          A primeira impressão já acontece. Faça ela trabalhar a favor da sua empresa.
        </p>

        <CenaVisitante />

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#contato"
            className="cta-press group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-bold text-black transition-all hover:-translate-y-1 hover:bg-brand-orange hover:text-white"
          >
            Começar uma conversa
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
          <Link
            href="#planos"
            className="cta-press inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-6 py-4 text-sm font-semibold text-white/75 transition-all hover:border-white/30 hover:text-white"
          >
            Ver planos
          </Link>
        </div>
        <p className="mt-5 text-xs">
          <Link
            href="#modelos"
            className="font-semibold text-brand-orange underline-offset-4 outline-none transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            Ou veja um modelo de landing page pronto
          </Link>
        </p>

        <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs">
          <a
            href={linkWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full font-semibold text-white/70 outline-none transition-colors hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            <MessageCircle className="h-4 w-4 text-brand-orange" aria-hidden="true" /> WhatsApp {CONTATO.whatsappExibicao}
            <span className="sr-only">(abre em uma nova aba)</span>
          </a>
          <a
            href={linkEmail()}
            className="inline-flex items-center gap-2 rounded-full font-semibold text-white/70 outline-none transition-colors hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            <Mail className="h-4 w-4 text-brand-orange" aria-hidden="true" /> {CONTATO.email}
          </a>
        </div>
        <p className="mx-auto mt-5 max-w-md text-xs leading-5 text-white/40">
          Conversar não gera cobrança. Você também pode falar com a gente pelo Instagram {CONTATO.instagramUsuario}.
        </p>
      </div>
    </section>
  );
}
