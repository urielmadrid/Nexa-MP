"use client";
import { useState } from "react";
import { Code2, LayoutPanelTop, MousePointer2, Sparkles, Wand2 } from "lucide-react";

const BUILD = [
  { label: "estrutura", icon: LayoutPanelTop, text: "arquitetura que organiza a presença digital" },
  { label: "interface", icon: Code2, text: "design que transforma intenção em experiência" },
  { label: "interação", icon: MousePointer2, text: "movimento que guia sem distrair" },
];

export default function Solucao() {
  const [active, setActive] = useState(1);
  return <section className="nexa-section bg-[#090909] py-24 text-white md:py-36">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(255,106,0,.10),transparent_35%)]" /><div className="nexa-grid absolute inset-0 opacity-20" />
    <div className="relative mx-auto max-w-7xl px-5 md:px-8">
      <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end"><div><p className="nexa-label">02 / transformação</p><h2 className="nexa-display mt-5 text-4xl font-black leading-[.9] md:text-7xl">Uma empresa.<br/><span className="text-brand-orange">Uma experiência.</span></h2></div><p className="max-w-xl text-lg leading-8 text-white/50">A Nexa MP transforma estratégia, conteúdo e tecnologia em uma presença digital que parece pertencer à empresa desde o primeiro pixel.</p></div>

      <div className="solution-lab mt-16 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
        <div className="relative min-h-[520px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#050505] p-5 md:p-8">
          <div className="absolute inset-0 bg-dot-grid opacity-20" />
          <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-orange/10" />
          <div className="absolute left-1/2 top-1/2 h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10" />
          <div className="absolute left-[12%] top-[14%] font-mono text-[9px] uppercase tracking-[.25em] text-white/20">build / digital presence</div>
          <div className="absolute right-[10%] top-[22%] h-24 w-40 border border-white/10 bg-white/[.02] p-3 transition-all duration-700" style={{ transform: `translateY(${(active - 1) * -12}px) rotate(${(active - 1) * 2}deg)` }}><div className="h-1 w-12 bg-brand-orange/50"/><div className="mt-4 h-2 w-24 bg-white/10"/><div className="mt-2 h-2 w-16 bg-white/5"/></div>
          <div className="absolute bottom-[18%] left-[12%] h-32 w-52 border border-brand-orange/20 bg-brand-orange/[.025] p-4 transition-all duration-700" style={{ transform: `translateY(${(active - 1) * 10}px) rotate(${(active - 1) * -2}deg)` }}><div className="flex gap-2"><span className="h-2 w-2 rounded-full bg-brand-orange"/><span className="h-2 w-2 rounded-full bg-white/15"/><span className="h-2 w-2 rounded-full bg-white/15"/></div><div className="mt-7 h-2 w-32 bg-white/10"/><div className="mt-3 h-2 w-24 bg-white/5"/></div>
          <div className="absolute left-1/2 top-1/2 grid h-44 w-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem] border border-brand-orange/45 bg-black/80 shadow-[0_0_100px_rgba(255,106,0,.14)] backdrop-blur-xl transition-transform duration-700" style={{ transform: `translate(-50%,-50%) rotate(${(active - 1) * 3}deg) scale(${1 + active * .025})` }}><div className="text-center"><Wand2 className="mx-auto h-7 w-7 text-brand-orange"/><p className="mt-5 text-3xl font-black">Nexa<span className="text-brand-orange">MP</span></p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.25em] text-white/25">experiência construída</p></div></div>
          <div className="absolute bottom-5 right-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-white/25"><Sparkles className="h-3 w-3 text-brand-orange"/> sistema em construção</div>
        </div>
        <div className="flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/[.025] p-6 md:p-8">
          <div><p className="nexa-label">como ganha forma</p><div className="mt-7 space-y-2">{BUILD.map((item, i) => { const Icon = item.icon; return <button type="button" key={item.label} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} className={`solution-step ${active === i ? "is-active" : ""}`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10"><Icon className="h-4 w-4"/></span><span><span className="block font-mono text-[9px] uppercase tracking-[.2em] text-brand-orange/80">0{i+1} / {item.label}</span><span className="mt-1 block text-sm font-semibold text-white/75">{item.text}</span></span><span className="ml-auto text-white/20">↗</span></button> })}</div></div>
          <div className="mt-10 border-t border-white/10 pt-6"><p className="text-sm leading-7 text-white/40">Não é só colocar uma empresa na internet. É construir uma interface que faça a marca parecer tão boa digitalmente quanto ela é no mundo real.</p></div>
        </div>
      </div>
    </div>
  </section>;
}
