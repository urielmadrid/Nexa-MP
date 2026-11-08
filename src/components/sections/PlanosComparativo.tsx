"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Clapperboard,
  Columns3,
  LayoutTemplate,
  MapPin,
  Target,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { PLANOS, RECURSOS, type Plano } from "@/src/lib/data/planos";

const ICONES: Record<string, LucideIcon> = {
  "Landing page profissional": LayoutTemplate,
  "Posts e reels": Clapperboard,
  "Google Meu Negócio": MapPin,
  "Tráfego pago": Target,
  "Bot de conversa": Bot,
};

const TOTAL_RECURSOS = RECURSOS.length;

function incluidos(plano: Plano) {
  return RECURSOS.filter((r) => r.valores[plano.id]).length;
}

function maiuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** O que muda de um plano para o próximo — calculado a partir da matriz RECURSOS. */
function degraus() {
  return PLANOS.slice(0, -1).map((de, i) => {
    const para = PLANOS[i + 1];
    const novos: string[] = [];
    const evolui: string[] = [];
    for (const r of RECURSOS) {
      const a = r.valores[de.id];
      const b = r.valores[para.id];
      if (!a && b) novos.push(typeof b === "string" ? `${r.rotulo}: ${b}` : r.rotulo);
      else if (typeof a === "string" && typeof b === "string" && a !== b) evolui.push(`${r.rotulo}: ${a} → ${b}`);
    }
    return { de, para, novos, evolui, mudaPagamento: de.periodo !== para.periodo };
  });
}

const DEGRAUS = degraus();

export default function PlanosComparativo() {
  const reduceMotion = useReducedMotion();
  const instante = !!reduceMotion;
  const [aberto, setAberto] = useState(false);
  const [colunaAtiva, setColunaAtiva] = useState<number | null>(null);

  const destaqueCol = (i: number, p: Plano) =>
    colunaAtiva === i ? "bg-white/[.06]" : p.destaque === "popular" ? "bg-brand-orange/[.07]" : "";

  const entrada = (i: number) => ({
    initial: instante ? false : ({ opacity: 0, y: 10 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: instante ? 0 : 0.35, delay: instante ? 0 : 0.25 + i * 0.07 },
  });

  return (
    <div className="mt-14 md:mt-20">
      {/* Chamada: um bloco grande, difícil de passar batido */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls="planos-comparativo"
        className="group relative flex w-full items-center gap-5 overflow-hidden rounded-3xl border border-brand-orange/40 bg-gradient-to-r from-brand-orange/15 via-brand-orange/[.06] to-transparent p-5 text-left outline-none transition-colors hover:border-brand-orange/70 focus-visible:ring-2 focus-visible:ring-brand-orange md:p-7"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-orange text-white shadow-[0_0_30px_rgba(243,99,4,.4)] md:h-14 md:w-14">
          <Columns3 className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="nexa-label block">compare lado a lado</span>
          <span className="mt-2 block text-lg font-extrabold leading-snug text-white md:text-2xl">
            {aberto ? "Esconder a comparação" : `Veja os ${PLANOS.length} planos lado a lado`}
          </span>
          <span className="mt-1 block text-sm leading-6 text-white/55">
            O que cada plano inclui, o que significa cada item e o que você ganha ao subir de andar.
          </span>
        </span>
        <ChevronDown
          className={`h-6 w-6 shrink-0 text-brand-orange transition-transform duration-300 ${aberto ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {aberto && (
          <motion.div
            id="planos-comparativo"
            key="comparativo"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: instante ? 0 : 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Como ler */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/55">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-white/35">como ler</span>
              <span className="inline-flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-orange text-white">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                incluído
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-white/15 text-white/30">
                  <X className="h-3 w-3" aria-hidden="true" />
                </span>
                não incluído
              </span>
              <span>o texto mostra como o item aparece naquele plano</span>
              <span className="md:hidden text-brand-orange">deslize a tabela para o lado →</span>
            </div>

            {/* Tabela */}
            <div className="mt-4 overflow-x-auto rounded-3xl border border-white/10 bg-[#0c0c0c] [scrollbar-width:thin]">
              <table
                className="w-full min-w-[860px] border-collapse text-left"
                onMouseLeave={() => setColunaAtiva(null)}
              >
                <caption className="sr-only">
                  Comparação do que cada plano inclui e do que significa cada item
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 w-64 bg-[#0c0c0c] p-5 align-bottom">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-white/35">
                        o que está incluído
                      </span>
                    </th>
                    {PLANOS.map((p, i) => {
                      const n = incluidos(p);
                      return (
                        <th
                          key={p.id}
                          scope="col"
                          onMouseEnter={() => setColunaAtiva(i)}
                          className={`relative p-5 align-bottom transition-colors ${destaqueCol(i, p)}`}
                        >
                          {p.destaque === "popular" && (
                            <span
                              className="absolute inset-x-0 top-0 h-1 bg-brand-orange shadow-[0_0_20px_rgba(243,99,4,.7)]"
                              aria-hidden="true"
                            />
                          )}
                          {p.destaque && (
                            <span
                              className={`mb-3 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                p.destaque === "popular" ? "bg-brand-orange text-white" : "bg-white text-black"
                              }`}
                            >
                              {p.destaque === "popular" ? "Recomendado" : "Mais completo"}
                            </span>
                          )}
                          <span className="block text-lg font-extrabold leading-tight text-white">{p.nome}</span>
                          <span className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-white">{p.preco}</span>
                            <span className="text-xs font-semibold text-white/50">{p.periodo}</span>
                          </span>
                          <span className="mt-4 block">
                            <span className="block text-[11px] font-semibold text-white/55">
                              {n} de {TOTAL_RECURSOS} frentes incluídas
                            </span>
                            <span className="mt-1.5 flex gap-1" aria-hidden="true">
                              {RECURSOS.map((r) => (
                                <span
                                  key={r.rotulo}
                                  className={`h-1.5 flex-1 rounded-full ${r.valores[p.id] ? "bg-brand-orange" : "bg-white/10"}`}
                                />
                              ))}
                            </span>
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {/* Para quem é */}
                  <tr className="border-t border-white/10">
                    <th scope="row" className="sticky left-0 z-10 bg-[#0c0c0c] p-5 align-top">
                      <span className="block text-sm font-bold text-white">Para quem é</span>
                      <span className="mt-1 block text-xs leading-5 text-white/45">
                        O momento do negócio em que cada plano faz mais sentido.
                      </span>
                    </th>
                    {PLANOS.map((p, i) => (
                      <td
                        key={p.id}
                        onMouseEnter={() => setColunaAtiva(i)}
                        className={`p-5 align-top text-xs leading-5 text-white/65 transition-colors ${destaqueCol(i, p)}`}
                      >
                        {p.descricao}
                      </td>
                    ))}
                  </tr>

                  {/* Como você paga */}
                  <tr className="border-t border-white/10">
                    <th scope="row" className="sticky left-0 z-10 bg-[#0c0c0c] p-5 align-top">
                      <span className="flex items-center gap-2 text-sm font-bold text-white">
                        <Wallet className="h-4 w-4 text-brand-orange" aria-hidden="true" /> Como você paga
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-white/45">
                        Pagamento único é feito uma vez. Os planos mensais são cobrados todo mês.
                      </span>
                    </th>
                    {PLANOS.map((p, i) => (
                      <td
                        key={p.id}
                        onMouseEnter={() => setColunaAtiva(i)}
                        className={`p-5 align-top transition-colors ${destaqueCol(i, p)}`}
                      >
                        <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/80">
                          {maiuscula(p.periodo)}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {RECURSOS.map((recurso, rIndex) => {
                    const Icone = ICONES[recurso.rotulo];
                    return (
                      <motion.tr key={recurso.rotulo} className="border-t border-white/10" {...entrada(rIndex)}>
                        <th scope="row" className="sticky left-0 z-10 bg-[#0c0c0c] p-5 align-top">
                          <span className="flex items-center gap-2 text-sm font-bold text-white">
                            {Icone && <Icone className="h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />}
                            {recurso.rotulo}
                          </span>
                          <span className="mt-1 block text-xs font-normal leading-5 text-white/45">
                            {recurso.explicacao}
                          </span>
                        </th>
                        {PLANOS.map((p, i) => {
                          const valor = recurso.valores[p.id];
                          return (
                            <td
                              key={p.id}
                              onMouseEnter={() => setColunaAtiva(i)}
                              className={`p-5 align-top transition-colors ${destaqueCol(i, p)}`}
                            >
                              {valor ? (
                                <span className="flex items-start gap-2.5">
                                  <motion.span
                                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-orange text-white shadow-[0_0_14px_rgba(243,99,4,.45)]"
                                    initial={instante ? false : { scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 360,
                                      damping: 16,
                                      delay: instante ? 0 : 0.4 + rIndex * 0.07 + i * 0.05,
                                    }}
                                  >
                                    <Check className="h-3 w-3" aria-hidden="true" />
                                  </motion.span>
                                  {typeof valor === "string" ? (
                                    <span className="text-xs font-semibold leading-5 text-white/85">{valor}</span>
                                  ) : (
                                    <span className="text-xs font-semibold leading-5 text-white/85">Incluída</span>
                                  )}
                                </span>
                              ) : (
                                <span className="flex items-center gap-2.5 text-white/30">
                                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/15">
                                    <X className="h-3 w-3" aria-hidden="true" />
                                  </span>
                                  <span className="text-xs">Não incluído</span>
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </motion.tr>
                    );
                  })}

                  <tr className="border-t border-white/10">
                    <th scope="row" className="sticky left-0 z-10 bg-[#0c0c0c] p-5" />
                    {PLANOS.map((p, i) => (
                      <td
                        key={p.id}
                        onMouseEnter={() => setColunaAtiva(i)}
                        className={`p-5 transition-colors ${destaqueCol(i, p)}`}
                      >
                        <a
                          href={`/?plano=${p.id}#contato`}
                          className={`cta-press inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-orange ${
                            p.destaque === "popular"
                              ? "bg-brand-orange text-white hover:bg-white hover:text-black"
                              : "border border-white/15 text-white/80 hover:border-brand-orange/60 hover:text-brand-orange"
                          }`}
                        >
                          Quero este plano
                          <span className="sr-only">: {p.nome}</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Degraus: o que muda ao subir de andar */}
            <div className="mt-12">
              <p className="nexa-label">subindo de andar</p>
              <h4 className="nexa-display mt-3 text-2xl font-black leading-tight md:text-3xl">
                O que você ganha a cada degrau.
              </h4>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                Em vez de decorar a tabela, veja só o que muda de um plano para o seguinte.
              </p>

              <ol className="mt-6 grid gap-4 md:grid-cols-3">
                {DEGRAUS.map(({ de, para, novos, evolui, mudaPagamento }, i) => (
                  <motion.li
                    key={para.id}
                    {...entrada(i + 1)}
                    className="relative flex flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-white/[.05] to-white/[.01] p-6"
                  >
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-orange/15 px-3 py-1 text-[11px] font-bold text-brand-orange">
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                      Degrau {i + 1}
                    </span>
                    <h5 className="mt-4 text-base font-extrabold leading-snug text-white">
                      {de.nome} <ArrowRight className="mx-1 inline h-4 w-4 text-brand-orange" aria-hidden="true" />{" "}
                      {para.nome}
                    </h5>

                    <ul className="mt-4 space-y-2.5 text-sm leading-6">
                      {novos.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-white/80">
                          <span className="mt-0.5 shrink-0 rounded bg-brand-orange px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                            novo
                          </span>
                          {item}
                        </li>
                      ))}
                      {evolui.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-white/80">
                          <span className="mt-0.5 shrink-0 rounded border border-brand-orange/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-orange">
                            evolui
                          </span>
                          {item}
                        </li>
                      ))}
                      {mudaPagamento && (
                        <li className="flex items-start gap-2.5 text-white/55">
                          <span className="mt-0.5 shrink-0 rounded border border-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/60">
                            muda
                          </span>
                          Forma de pagamento: de {de.periodo} para {para.periodo}.
                        </li>
                      )}
                    </ul>

                    <a
                      href={`/?plano=${para.id}#contato`}
                      className="cta-press mt-auto inline-flex w-fit items-center gap-2 pt-6 text-xs font-bold text-brand-orange outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange"
                    >
                      Quero o plano {para.nome} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </motion.li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
