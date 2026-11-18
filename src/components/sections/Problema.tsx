"use client";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Check, RotateCcw } from "lucide-react";
import { PROBLEMAS, PECAS_DIAGNOSTICO } from "@/src/lib/data/problemas";
import ProblemaPalco from "@/src/components/sections/ProblemaPalco";

const SINAIS = PROBLEMAS.slice(0, PECAS_DIAGNOSTICO.length);
const ROTULOS = PECAS_DIAGNOSTICO.map((p) => p.rotulo);

export default function Problema() {
  const [active, setActive] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(() => SINAIS.map(() => false));

  const total = solved.filter(Boolean).length;
  const completo = total === SINAIS.length;
  const peca = PECAS_DIAGNOSTICO[active];
  const ativoResolvido = solved[active];

  function alternar(i: number) {
    setActive(i);
    setSolved((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return <section className="nexa-section bg-[#070707] py-24 text-white md:py-32">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,.035),transparent_30%)]" />
    <div className="relative mx-auto max-w-7xl px-5 md:px-8">
      <div className="grid gap-14 md:grid-cols-[.72fr_1.28fr] md:items-end"><div><p className="nexa-label">01 / diagnóstico</p><h2 className="nexa-display mt-5 text-4xl font-black leading-[.92] md:text-6xl">Antes da solução, existe o <span className="text-white/25">ruído.</span></h2></div><div className="max-w-xl md:justify-self-end"><p className="text-lg leading-8 text-white/55">Uma presença digital desalinhada faz o cliente enxergar pedaços da empresa, nunca o todo.</p><div className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-brand-orange"><ArrowDownRight className="h-4 w-4" /> marque os sinais que você reconhece</div></div></div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
        {/* Palco: começa como planta e vai se montando a cada sinal marcado */}
        <div className={`problem-stage relative overflow-hidden rounded-[2rem] border bg-[#050505] ${completo ? "is-solved border-brand-orange/35" : "border-white/10"}`}>
          <div className="absolute inset-0 bg-dot-grid opacity-25" />
          <div className="problem-noise absolute inset-0" />

          <div className="relative px-4 pb-2 pt-12 sm:px-6">
            <ProblemaPalco solved={solved} active={active} rotulos={ROTULOS} />
          </div>

          <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-white/40">
            {completo ? <><Check className="h-3 w-3 text-brand-orange" /> presença construída</> : total === 0 ? "sistema desconectado" : `${total} de ${SINAIS.length} peças ligadas`}
          </div>

          <div className="relative min-h-[112px] border-t border-white/10 bg-black/30 px-6 py-5">
            {ativoResolvido ? <>
              <p className="font-mono text-[9px] uppercase tracking-[.25em] text-brand-orange">peça instalada // 0{active + 1}</p>
              <p className="mt-2 text-base font-bold text-white">{peca.titulo}</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-white/55">{peca.descricao}</p>
            </> : <>
              <p className="font-mono text-[9px] uppercase tracking-[.25em] text-white/30">problema detectado // 0{active + 1}</p>
              <p className="mt-2 max-w-md text-base font-semibold text-white/75">{SINAIS[active].texto}</p>
              <p className="mt-1 text-xs text-white/35">Toque para montar a peça que resolve.</p>
            </>}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10">
          <div className="grid gap-px sm:grid-cols-2">
            {SINAIS.map((p, i) => <button type="button" key={p.texto} aria-pressed={solved[i]} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => alternar(i)} className={`group relative min-h-40 p-6 text-left transition-all ${active === i ? "bg-[#111]" : "bg-[#0b0b0b]"}`}>
              <span className="font-mono text-[10px] text-brand-orange/70">0{i + 1} / {ROTULOS[i]}</span>
              <p className={`mt-8 max-w-xs text-sm font-semibold leading-6 transition-colors ${solved[i] ? "text-white" : active === i ? "text-white/90" : "text-white/55"}`}>{p.texto}</p>
              <span className={`absolute bottom-5 right-5 grid h-6 w-6 place-items-center rounded-full border transition-all ${solved[i] ? "border-brand-orange bg-brand-orange text-white shadow-[0_0_18px_rgba(255,106,0,.4)]" : active === i ? "border-brand-orange/60 text-transparent" : "border-white/15 text-transparent"}`}><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>
            </button>)}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#0b0b0b] px-6 py-4">
            <span className="font-mono text-[9px] uppercase tracking-[.2em] text-white/30">clique = montar a peça</span>
            <div className="flex items-center gap-2">
              {total > 0 && <button type="button" onClick={() => setSolved(SINAIS.map(() => false))} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-[11px] font-semibold text-white/50 transition-colors hover:border-white/30 hover:text-white"><RotateCcw className="h-3 w-3" aria-hidden="true" /> Recomeçar</button>}
              {total > 0 ? <a href="#contato" className="cta-press group inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white hover:text-black">{completo ? "Resolver isso com a Nexa MP" : "Falar sobre estas peças"} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a> : <span className="text-[11px] text-white/35">Reconhece algum desses sinais? Toque nele.</span>}
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{total} de {SINAIS.length} peças montadas</p>
    </div>
  </section>;
}
