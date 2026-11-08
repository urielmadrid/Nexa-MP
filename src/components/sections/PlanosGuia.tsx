"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Info,
  MapPin,
  Megaphone,
  RotateCcw,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import { PLANOS, recursosAusentes } from "@/src/lib/data/planos";

/**
 * Guia de até 3 perguntas ("Em qual andar você está?"). Sem IA: é uma árvore simples
 * baseada no que cada plano inclui.
 *   1. precisa de redes sociais?            não → Landing Page Avulsa
 *   2. quer Google Meu Negócio e reels?     não → Essencial
 *   3. quer tráfego pago e bot de conversa? não → Presença Completa | sim → Crescimento Contínuo
 */

type Opcao = { titulo: string; detalhe: string };
type Pergunta = {
  curto: string;
  texto: string;
  ajuda: string;
  Icone: LucideIcon;
  sim: Opcao;
  nao: Opcao;
};

const plano = (id: string) => PLANOS.find((p) => p.id === id);
const essencial = plano("essencial");

const PERGUNTAS: Pergunta[] = [
  {
    curto: "Redes sociais",
    texto: "Você precisa de ajuda com as redes sociais?",
    ajuda: "Aqui falamos de planejar e publicar posts nas redes da sua empresa, de forma profissional e constante.",
    Icone: Smartphone,
    sim: {
      titulo: "Sim, quero conteúdo nas redes",
      detalhe: `Entram os planos mensais${essencial ? `, a partir de ${essencial.preco} ${essencial.periodo}` : ""}, com posts todo mês.`,
    },
    nao: {
      titulo: "Não, só preciso da landing page",
      detalhe: "Uma landing page profissional, com pagamento único e sem mensalidade.",
    },
  },
  {
    curto: "Google e reels",
    texto: "Quer também aparecer no Google e ter reels?",
    ajuda:
      "Google Meu Negócio é o perfil da sua empresa no Google: a gente analisa, configura e atualiza. Reels são os vídeos curtos das redes sociais.",
    Icone: MapPin,
    sim: {
      titulo: "Sim, quero os dois",
      detalhe: "Perfil no Google configurado e atualizado, mais posts e reels todo mês.",
    },
    nao: {
      titulo: "Não, só posts por enquanto",
      detalhe: "Posts estratégicos todo mês, sem reels e sem Google Meu Negócio.",
    },
  },
  {
    curto: "Anúncios e bot",
    texto: "Quer anúncios e um bot para atender seus clientes?",
    ajuda:
      "Tráfego pago são anúncios pensados para alcançar o público certo. O bot de conversa agiliza o primeiro contato e organiza o atendimento.",
    Icone: Megaphone,
    sim: {
      titulo: "Sim, quero anúncios e bot",
      detalhe: "Gestão completa das redes, tráfego pago gerenciado e bot de conversa configurado.",
    },
    nao: {
      titulo: "Não, por enquanto não",
      detalhe: "Mantém conteúdo, reels e Google Meu Negócio, sem anúncios nem bot.",
    },
  },
];

function resolver(respostas: boolean[]): string | null {
  if (respostas[0] === undefined) return null;
  if (respostas[0] === false) return "landing-avulsa";
  if (respostas[1] === undefined) return null;
  if (respostas[1] === false) return "essencial";
  if (respostas[2] === undefined) return null;
  return respostas[2] ? "crescimento-continuo" : "presenca-completa";
}

/** Planos que ainda combinam com as respostas dadas até agora. */
function possiveis(respostas: boolean[]): string[] {
  const todos = PLANOS.map((p) => p.id);
  if (respostas[0] === undefined) return todos;
  if (respostas[0] === false) return ["landing-avulsa"];
  if (respostas[1] === undefined) return todos.filter((id) => id !== "landing-avulsa");
  if (respostas[1] === false) return ["essencial"];
  if (respostas[2] === undefined) return ["presenca-completa", "crescimento-continuo"];
  return respostas[2] ? ["crescimento-continuo"] : ["presenca-completa"];
}

export default function PlanosGuia({ onResultado }: { onResultado: (planoId: string) => void }) {
  const reduceMotion = useReducedMotion();
  const instante = !!reduceMotion;
  const [respostas, setRespostas] = useState<boolean[]>([]);

  const resultadoId = resolver(respostas);
  const indicado = resultadoId ? plano(resultadoId) : null;
  const indice = indicado ? PLANOS.findIndex((p) => p.id === indicado.id) : -1;
  const proximo = indice >= 0 ? PLANOS[indice + 1] : undefined;
  const pergunta = PERGUNTAS[respostas.length];
  const restantes = possiveis(respostas);
  const passosPreenchidos = indicado ? PERGUNTAS.length : respostas.length;

  function responder(valor: boolean) {
    const proximas = [...respostas, valor];
    setRespostas(proximas);
    const id = resolver(proximas);
    if (id) onResultado(id);
  }

  const troca = {
    initial: instante ? false : ({ opacity: 0, y: 14 } as const),
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: instante ? 0 : 0.25 },
  };

  return (
    <div className="relative mx-auto mt-16 max-w-4xl md:mt-24">
      <div
        className="pointer-events-none absolute -inset-x-6 -top-10 h-40 rounded-full bg-brand-orange/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative rounded-[1.75rem] bg-gradient-to-br from-brand-orange/50 via-white/10 to-transparent p-px">
        <div className="rounded-[calc(1.75rem-1px)] bg-[#0d0d0d] p-6 md:p-10">
          {/* Cabeçalho */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="nexa-label flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> guia rápido
              </p>
              <h3 className="nexa-display mt-3 text-2xl font-black leading-tight md:text-4xl">
                Em qual andar você está?
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                Responda até 3 perguntas rápidas. É uma indicação inicial, baseada no que cada plano inclui, sem cadastro
                e sem custo.
              </p>
            </div>
          </div>

          {/* Progresso */}
          <div className="mt-7">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.2em] text-white/40">
              <span>{indicado ? "Resultado" : `Pergunta ${respostas.length + 1} de ${PERGUNTAS.length}`}</span>
              <span className="text-brand-orange">{indicado ? "pronto" : `${passosPreenchidos}/${PERGUNTAS.length}`}</span>
            </div>
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
              {PERGUNTAS.map((p, i) => (
                <span key={p.curto} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    className="block h-full rounded-full bg-brand-orange shadow-[0_0_10px_rgba(243,99,4,.6)]"
                    initial={false}
                    animate={{ width: i < passosPreenchidos ? "100%" : "0%" }}
                    transition={{ duration: instante ? 0 : 0.4 }}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Planos que ainda combinam */}
          <div className="mt-5">
            <p className="text-[11px] font-semibold text-white/40">
              {indicado ? "Plano indicado" : "Planos que ainda combinam com você"}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {PLANOS.map((p) => {
                const ativo = restantes.includes(p.id);
                const escolhido = indicado?.id === p.id;
                return (
                  <li
                    key={p.id}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                      escolhido
                        ? "border-brand-orange bg-brand-orange text-white shadow-[0_0_20px_rgba(243,99,4,.45)]"
                        : ativo
                          ? "border-brand-orange/50 text-white"
                          : "border-white/10 text-white/25"
                    }`}
                  >
                    {p.nome}
                    <span className="sr-only">{ativo ? " (ainda possível)" : " (descartado)"}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Conteúdo: pergunta ou resultado */}
          <div className="mt-8" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {!indicado && pergunta ? (
                <motion.div key={`pergunta-${respostas.length}`} {...troca}>
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-orange/15 text-brand-orange">
                      <pergunta.Icone className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h4 className="text-xl font-extrabold leading-snug text-white md:text-2xl">{pergunta.texto}</h4>
                  </div>

                  <p className="mt-4 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm leading-6 text-white/60">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
                    <span>
                      <strong className="font-semibold text-white/80">O que é isso? </strong>
                      {pergunta.ajuda}
                    </span>
                  </p>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {([true, false] as const).map((valor) => {
                      const opcao = valor ? pergunta.sim : pergunta.nao;
                      return (
                        <button
                          key={String(valor)}
                          type="button"
                          onClick={() => responder(valor)}
                          className="cta-press group flex h-full flex-col rounded-2xl border border-white/15 bg-white/[.04] p-5 text-left outline-none transition-all hover:-translate-y-0.5 hover:border-brand-orange/70 hover:bg-brand-orange/10 focus-visible:ring-2 focus-visible:ring-brand-orange"
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2.5 text-sm font-bold text-white">
                              <span
                                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                                  valor ? "bg-brand-orange text-white" : "border border-white/20 text-white/50"
                                }`}
                              >
                                {valor ? (
                                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                ) : (
                                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                              </span>
                              {opcao.titulo}
                            </span>
                            <ArrowRight
                              className="h-4 w-4 shrink-0 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-brand-orange"
                              aria-hidden="true"
                            />
                          </span>
                          <span className="mt-3 block text-xs leading-5 text-white/50">{opcao.detalhe}</span>
                        </button>
                      );
                    })}
                  </div>

                  {respostas.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setRespostas((r) => r.slice(0, -1))}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold text-white/45 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Voltar uma pergunta
                    </button>
                  )}
                </motion.div>
              ) : indicado ? (
                <motion.div key="resultado" {...troca}>
                  <div className="rounded-3xl border border-brand-orange/40 bg-gradient-to-br from-brand-orange/15 via-transparent to-transparent p-6 md:p-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                      Pelo que você respondeu, o plano indicado é
                    </p>
                    <h4 className="mt-3 text-3xl font-extrabold leading-tight text-white md:text-4xl">{indicado.nome}</h4>
                    <p className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-white">{indicado.preco}</span>
                      <span className="text-sm text-white/50">{indicado.periodo}</span>
                    </p>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">{indicado.descricao}</p>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-white/40">
                          suas respostas
                        </p>
                        <ul className="mt-3 space-y-2">
                          {respostas.map((r, i) => (
                            <li key={PERGUNTAS[i].curto} className="flex items-center gap-2.5 text-sm text-white/75">
                              <span
                                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                                  r ? "bg-brand-orange text-white" : "border border-white/20 text-white/40"
                                }`}
                              >
                                {r ? (
                                  <Check className="h-3 w-3" aria-hidden="true" />
                                ) : (
                                  <X className="h-3 w-3" aria-hidden="true" />
                                )}
                              </span>
                              {PERGUNTAS[i].curto}: <strong className="font-semibold text-white">{r ? "sim" : "não"}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-white/40">
                          o que está incluído
                        </p>
                        <ul className="mt-3 space-y-2">
                          {indicado.itens.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/80">
                              <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-orange" aria-hidden="true" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        {recursosAusentes(indicado.id).length > 0 && (
                          <p className="mt-3 text-xs leading-5 text-white/40">
                            Fica de fora: {recursosAusentes(indicado.id).join(", ")}.
                          </p>
                        )}
                      </div>
                    </div>

                    {proximo && (
                      <p className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-5 text-white/55">
                        <strong className="font-semibold text-white/75">Quer ir além depois?</strong> O próximo andar é o{" "}
                        {proximo.nome} ({proximo.preco} {proximo.periodo}). Dá para começar por este e subir quando fizer
                        sentido.
                      </p>
                    )}

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <Button href={`/?plano=${indicado.id}#contato`} showArrow>
                        Quero o plano {indicado.nome}
                      </Button>
                      <a
                        href="#planos-detalhe"
                        className="cta-press inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-5 py-3.5 text-sm font-semibold text-white outline-none transition-colors hover:border-brand-orange/60 hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange"
                      >
                        Ver no elevador
                      </a>
                      <button
                        type="button"
                        onClick={() => setRespostas([])}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white/45 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Refazer o guia
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
