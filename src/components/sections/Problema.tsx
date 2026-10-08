"use client";
import { useState } from "react";
import { ArrowDownRight, Check, MoveDiagonal, TriangleAlert, Unplug, Sparkles } from "lucide-react";
import { PROBLEMAS } from "@/src/lib/data/problemas";

export default function Problema() {
  const [active, setActive] = useState(0);
  const [solved, setSolved] = useState(false);
  const problem = PROBLEMAS[active];

  return <section className="nexa-section bg-[#070707] py-24 text-white md:py-32">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,.035),transparent_30%)]" />
    <div className="relative mx-auto max-w-7xl px-5 md:px-8">
      <div className="grid gap-14 md:grid-cols-[.72fr_1.28fr] md:items-end"><div><p className="nexa-label">01 / diagnóstico</p><h2 className="nexa-display mt-5 text-4xl font-black leading-[.92] md:text-6xl">Antes da solução, existe o <span className="text-white/25">ruído.</span></h2></div><div className="max-w-xl md:justify-self-end"><p className="text-lg leading-8 text-white/55">Uma presença digital desalinhada faz o cliente enxergar pedaços da empresa, nunca o todo.</p><div className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-brand-orange"><ArrowDownRight className="h-4 w-4" /> clique em um sinal</div></div></div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
        <div className={`problem-stage relative min-h-[390px] overflow-hidden rounded-[2rem] border bg-[#050505] ${solved ? "is-solved border-brand-orange/35" : "border-white/10"}`}>
          <div className="absolute inset-0 bg-dot-grid opacity-25" />
          <div className="problem-noise absolute inset-0" />
          {!solved ? <>
            <div className="problem-fragment pf-a" /><div className="problem-fragment pf-b" /><div className="problem-fragment pf-c" />
            <Unplug className="absolute left-[16%] top-[22%] h-7 w-7 text-white/20" /><TriangleAlert className="absolute right-[17%] top-[28%] h-7 w-7 text-brand-orange/40" /><MoveDiagonal className="absolute bottom-[20%] left-[31%] h-7 w-7 text-white/15" />
            <div className="absolute inset-x-8 bottom-8"><p className="font-mono text-[9px] uppercase tracking-[.25em] text-white/25">problema detectado // 0{active + 1}</p><p className="mt-3 max-w-sm text-lg font-semibold text-white/75">{problem.texto}</p></div>
          </> : <div className="problem-solution-build absolute inset-0 grid place-items-center"><div className="solution-rings absolute inset-10" /><div className="relative text-center"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-brand-orange/50 bg-brand-orange/10 shadow-[0_0_70px_rgba(255,106,0,.18)]"><Sparkles className="h-8 w-8 text-brand-orange" /></div><p className="mt-6 font-mono text-[9px] uppercase tracking-[.25em] text-brand-orange">solução construída</p><p className="mt-2 text-3xl font-black">Nexa<span className="text-brand-orange">MP</span></p></div></div>}
          <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-white/35">{solved ? <><Check className="h-3 w-3 text-brand-orange" /> resolvido</> : "sistema desconectado"}</div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
          {PROBLEMAS.slice(0, 6).map((p, i) => <button type="button" key={p.texto} onMouseEnter={() => { setActive(i); setSolved(false); }} onFocus={() => { setActive(i); setSolved(false); }} onClick={() => { setActive(i); setSolved(false); window.setTimeout(() => setSolved(true), 420); }} className={`group relative min-h-40 bg-[#0b0b0b] p-6 text-left transition-all ${active === i && !solved ? "bg-[#111]" : ""}`}><span className="font-mono text-[10px] text-brand-orange/70">0{i + 1}</span><p className={`mt-8 max-w-xs text-sm font-semibold leading-6 transition-colors ${active === i ? "text-white" : "text-white/55"}`}>{p.texto}</p><span className={`absolute bottom-6 right-6 h-1.5 w-1.5 rounded-full transition-all ${active === i ? "bg-brand-orange shadow-[0_0_14px_5px_rgba(255,106,0,.28)]" : "bg-white/15"}`} /></button>)}
          <div className="col-span-full flex items-center justify-between border-t border-white/10 bg-black/20 px-6 py-4"><span className="font-mono text-[9px] uppercase tracking-[.2em] text-white/25">clique = transformar</span>{solved && <span className="text-xs font-semibold text-brand-orange">Problema → solução → NexaMP</span>}</div>
        </div>
      </div>
    </div>
  </section>;
}
