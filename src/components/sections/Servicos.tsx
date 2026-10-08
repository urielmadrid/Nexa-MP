"use client";
import type { LucideIcon } from "lucide-react";
import { Palette, PenTool, Heart, Camera, Target, TrendingUp, MousePointerClick, Bot, MessageCircle, Code2 } from "lucide-react";
import { SERVICOS, type Servico } from "@/src/lib/data/servicos";
import { useState } from "react";

const ICONES: Record<string, LucideIcon[]> = { "design-estrategico":[Palette,PenTool], "redes-sociais":[Heart,Camera], "trafego-pago":[Target,TrendingUp,MousePointerClick], "web-landing-pages":[Code2], "bots-conversacao":[Bot,MessageCircle] };
const VISUALS = ["design", "social", "growth", "web", "automation"];

function Card({servico,index}:{servico:Servico;index:number}) {
  const [hovered,setHovered]=useState(false); const icons=ICONES[servico.id]??[];
  return <article onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} className={`nexa-card group rounded-[2rem] p-7 md:p-9 ${index===0?"md:col-span-2 md:min-h-[390px]":"min-h-[310px]"}`}>
    <div className={`service-visual service-${VISUALS[index]} ${hovered?"is-active":""}`} aria-hidden="true"><span/><span/><span/><span/></div>
    <div className="relative z-10 flex h-full flex-col justify-between"><div><div className="flex items-center justify-between"><div className="flex gap-2">{icons.map((Icon,i)=><span key={i} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-brand-orange transition-all group-hover:border-brand-orange/25 group-hover:bg-brand-orange/10"><Icon className="h-4.5 w-4.5"/></span>)}</div><span className="nexa-label">0{index+1}</span></div><h3 className="nexa-display mt-12 max-w-lg text-2xl font-black md:text-3xl">{servico.titulo}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">{servico.resumo}</p></div><div className="mt-10 flex items-end justify-between gap-6"><p className="max-w-xl text-sm leading-6 text-white/38">{servico.descricao}</p><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-white/30 transition-all group-hover:border-brand-orange/40 group-hover:text-brand-orange"><span className="text-lg">↗</span></span></div></div>
  </article>;
}
export default function Servicos(){ return <section id="servicos" className="nexa-section bg-[#070707] py-24 text-white md:py-32"><div className="relative mx-auto max-w-7xl px-5 md:px-8"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="nexa-label">03 / capacidades</p><h2 className="nexa-display mt-5 text-4xl font-black leading-[.95] md:text-6xl">Cada peça tem uma função.<br/><span className="text-white/22">O conjunto cria presença.</span></h2></div><p className="max-w-sm text-sm leading-6 text-white/45">Explore cada frente e veja como pequenas decisões visuais podem mudar a percepção de uma marca.</p></div><div className="mt-16 grid gap-4 md:grid-cols-2">{SERVICOS.map((s,i)=><Card key={s.id} servico={s} index={i}/>)}</div></div></section> }
