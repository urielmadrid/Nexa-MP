"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Code2, Layers3, MousePointer2, Sparkles, Zap, Globe2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FRAGMENTS = [
  { x: 8, y: 20, w: 92, h: 12, d: 0 }, { x: 78, y: 12, w: 56, h: 56, d: 90 },
  { x: 18, y: 72, w: 44, h: 44, d: 150 }, { x: 68, y: 72, w: 82, h: 10, d: 220 },
  { x: 42, y: 8, w: 12, h: 84, d: 300 }, { x: 4, y: 46, w: 62, h: 8, d: 360 },
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
  const [pointer, setPointer] = useState({ x: 30, y: 70, active: false });
  const [logoOpen, setLogoOpen] = useState(false);
  const [logoNervousness, setLogoNervousness] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setPointer({ x, y, active: true });
      const logo = logoRef.current?.getBoundingClientRect();
      if (logo) {
        const dx = event.clientX - (logo.left + logo.width / 2);
        const dy = event.clientY - (logo.top + logo.height / 2);
        const distance = Math.hypot(dx, dy);
        setLogoNervousness(Math.max(0, Math.min(1, 1 - distance / 300)));
      }
    };
    const onLeave = () => { setPointer((p) => ({ ...p, active: false })); setLogoNervousness(0); };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => { el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); };
  }, []);

  const mx = (pointer.x - 50) / 5;
  const my = (pointer.y - 50) / 5;
  const jitter = logoNervousness;

  return (
    <section ref={ref} className="nexa-section min-h-[780px] bg-[#040404] pt-32 text-white md:min-h-[900px] md:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--hx)_var(--hy),rgba(255,106,0,.2),transparent_24%),linear-gradient(115deg,#040404_10%,#080808_52%,#040404_100%)]" style={{ "--hx": `${pointer.x}%`, "--hy": `${pointer.y}%` } as React.CSSProperties} />
      <div className="nexa-grid absolute inset-0 opacity-45" /><div className="nexa-noise absolute inset-0 opacity-[.06]" />
      <div className="hero-cursor-glow" style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }} />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-16 md:grid-cols-[1fr_.9fr] md:items-center md:px-8 md:pb-24">
        <div className="relative z-10">
          <div className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.3em] text-white/40"><span className="h-px w-12 bg-brand-orange" /> construção digital / 2026</div>
          <h1 className="nexa-display max-w-5xl text-[clamp(4rem,12vw,9.5rem)] font-black leading-[.77]"><span className="block">NEXA</span><span className="block text-brand-orange">MP<span className="text-white/15">.</span></span></h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/58 md:text-xl">Criamos sites e experiências digitais que transformam a primeira impressão da sua empresa em parte da estratégia.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="#contato" className="group inline-flex items-center gap-3 rounded-full bg-brand-orange px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_50px_rgba(255,106,0,.2)] transition-all hover:-translate-y-1 hover:bg-white hover:text-black">Criar meu site <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link><Link href="#servicos" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.03] px-5 py-3.5 text-sm font-semibold text-white/65 transition-all hover:border-white/25 hover:text-white"><ArrowDownRight className="h-4 w-4 text-brand-orange" /> Explorar</Link></div>
        </div>

        <div className="relative mx-auto h-[450px] w-full max-w-[560px] md:h-[570px]" aria-label="Identidade NexaMP interativa">
          <div className="absolute inset-8 rounded-[2.5rem] border border-white/[.07] transition-transform duration-700" style={{ transform: `perspective(900px) rotateX(${-my}deg) rotateY(${mx}deg)` }} />
          <div className="absolute inset-16 rounded-full border border-brand-orange/15" /><div className="absolute inset-[24%] rounded-full border border-dashed border-white/10 transition-transform duration-700" style={{ transform: `rotate(${pointer.x * .7}deg)` }} />

          <button ref={logoRef} type="button" onClick={() => setLogoOpen(v => !v)} aria-expanded={logoOpen} aria-label="Explorar identidade NexaMP" className={`hero-logo absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 ${logoOpen ? "is-open" : ""}`} style={{ "--nervousness": jitter, "--nervous-duration": `${1.1 - jitter * .55}s` } as React.CSSProperties}>
            <span className="hero-logo-word">Nexa<span>MP</span></span>
            <span className="hero-logo-hint">{logoOpen ? "sistema expandido" : "toque para explorar"}</span>
          </button>

          {logoOpen && <div className="hero-reveal hero-reveal-a"><Zap className="h-4 w-4 text-brand-orange" /><span>movimento / ideia → interface</span></div>}
          {logoOpen && <div className="hero-reveal hero-reveal-b"><Globe2 className="h-4 w-4 text-brand-orange" /><span>presença digital construída</span></div>}

          {FRAGMENTS.map((f, i) => <span key={i} className="hero-fragment" style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.w, height: f.h, animationDelay: `${f.d}ms`, transform: `translate(${mx * (i % 2 ? -.6 : .6)}px,${my * (i % 2 ? -.6 : .6)}px)` }} />)}
          <div className="hero-float-card absolute left-0 top-6 w-52 rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-xl"><div className="flex items-center justify-between"><Code2 className="h-5 w-5 text-brand-orange" /><span className="nexa-label">01 / web</span></div><p className="mt-8 text-sm font-semibold">Interface feita para a marca, não para preencher template.</p></div>
          <div className="hero-float-card absolute right-0 top-28 w-48 rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-xl" style={{ animationDelay: ".7s", "--r": "4deg" } as React.CSSProperties}><div className="flex items-center justify-between"><Sparkles className="h-5 w-5 text-brand-orange" /><span className="nexa-label">02 / feel</span></div><p className="mt-8 text-sm font-semibold">Detalhes que fazem a visita parecer uma experiência.</p></div>
          <div className="hero-float-card absolute bottom-5 left-8 w-56 rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-xl" style={{ animationDelay: "1.2s", "--r": "-2deg" } as React.CSSProperties}><div className="flex items-center justify-between"><Layers3 className="h-5 w-5 text-brand-orange" /><span className="nexa-label">03 / system</span></div><p className="mt-8 text-sm font-semibold">Design, conteúdo e tecnologia conversando no mesmo sistema.</p></div>
          <div className="absolute bottom-2 right-0 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/30"><MousePointer2 className="h-3.5 w-3.5 text-brand-orange" /> aproxime / explore</div>
        </div>
      </div>
      <div className="relative border-y border-white/5 bg-black/30 py-3"><div className="nexa-marquee flex w-max gap-12 whitespace-nowrap text-[10px] font-bold uppercase tracking-[.28em] text-white/25"><span>retire suas ideias do papel</span><span>•</span><span>construa sua marca no digital</span><span>•</span><span>com a NexaMP</span><span>•</span><span>retire suas ideias do papel</span><span>•</span><span>construa sua marca no digital</span><span>•</span><span>com a NexaMP</span></div></div>
    </section>
  );
}
