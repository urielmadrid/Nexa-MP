import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PLANOS } from "@/src/lib/data/planos";

/**
 * Faixa fixa no topo das páginas de modelo: deixa claro que é uma demonstração da Nexa MP
 * e leva o visitante de volta ao site ou ao contato.
 */
export default function ModeloBarra() {
  const avulsa = PLANOS[0];

  return (
    <div className="sticky top-0 z-[60] border-b border-white/10 bg-[#0a0a0a] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 md:px-8">
        <Link
          href="/#modelos"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full text-xs font-semibold text-white/70 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Voltar ao site da</span> Nexa MP
        </Link>

        <p className="hidden min-w-0 flex-1 truncate text-center text-[11px] text-white/45 md:block">
          <span className="font-bold text-brand-orange">Modelo de demonstração.</span> Nomes, textos e imagens são ilustrativos.
        </p>

        <Link
          href={`/?plano=${avulsa.id}#contato`}
          className="cta-press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2 text-xs font-bold text-white outline-none transition-colors hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white"
        >
          Quero uma landing assim <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <p className="border-t border-white/5 px-4 py-1.5 text-center text-[10px] text-white/45 md:hidden">
        <span className="font-bold text-brand-orange">Modelo de demonstração.</span> Nomes, textos e imagens são ilustrativos.
      </p>
    </div>
  );
}
