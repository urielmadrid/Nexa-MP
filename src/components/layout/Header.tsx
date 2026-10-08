"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Serviços", href: "#servicos" },
  { label: "Processo", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
  { label: "Projetos", href: "#projetos" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-black/65 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-5">
        <Link href="/" aria-label="Nexa MP — início" className="group flex items-center gap-2 text-white">
          <span className="text-lg font-black tracking-tight">Nexa<span className="text-brand-orange">MP</span></span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => <a key={link.href} href={link.href} className="text-[13px] font-medium text-white/55 transition-colors hover:text-white">{link.label}</a>)}
        </nav>

        <a href="#contato" className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-brand-orange hover:text-white md:inline-flex">
          Começar um projeto <ArrowUpRight className="h-3.5 w-3.5" />
        </a>

        <button type="button" onClick={() => setOpen(v => !v)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white md:hidden" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && <nav className="mx-auto mt-2 max-w-7xl rounded-2xl border border-white/10 bg-[#0b0b0b]/95 p-3 backdrop-blur-xl md:hidden" aria-label="Navegação móvel">
        {NAV_LINKS.map(link => <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white">{link.label}</a>)}
        <a href="#contato" onClick={() => setOpen(false)} className="mt-1 block rounded-xl bg-brand-orange px-4 py-3 text-center text-sm font-bold text-white">Começar um projeto</a>
      </nav>}
    </header>
  );
}
