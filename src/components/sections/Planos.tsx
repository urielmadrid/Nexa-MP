"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronsRight, Clock, PersonStanding, X } from "lucide-react";
import Button from "@/src/components/ui/Button";
import { PLANOS, recursosAusentes, type Plano } from "@/src/lib/data/planos";
import PlanosGuia from "@/src/components/sections/PlanosGuia";
import PlanosComparativo from "@/src/components/sections/PlanosComparativo";
import PlanosFaq from "@/src/components/sections/PlanosFaq";

const FLOOR_ORDER = [3, 2, 1, 0]; // do topo (cobertura) até o térreo — índices em PLANOS
const FLOOR_LABELS = ["Cobertura", "2º andar", "1º andar", "Térreo"];
const FLOOR_DISPLAY = ["C", "2", "1", "T"];
const FLOOR_HEIGHT = 116;
const CAR_HEIGHT = 42;
const CAR_WIDTH = 46;
const MOVE_DURATION = 0.55;

const panelVariants = {
  enter: (dir: number) => ({ opacity: 0, y: dir === 1 ? -28 : 28 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir === 1 ? 28 : -28 }),
};

function PainelPlano({ plano }: { plano: Plano }) {
  const ausentes = recursosAusentes(plano.id);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#161616] p-6 md:p-8">
      {plano.destaque && (
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            plano.destaque === "popular" ? "bg-brand-orange text-brand-white" : "bg-white text-brand-black"
          }`}
        >
          {plano.destaque === "popular" ? "Recomendado" : "Mais completo"}
        </span>
      )}

      <h3 className="mt-4 text-2xl font-extrabold text-white">{plano.nome}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{plano.descricao}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold text-white">{plano.preco}</span>
        <span className="text-sm text-white/50">{plano.periodo}</span>
      </div>

      <ul className="mt-7 space-y-3">
        {plano.itens.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" aria-hidden="true" />
            <span className="text-white/80">{item}</span>
          </li>
        ))}
      </ul>

      {ausentes.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-white/35">não inclui</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ausentes.map((rotulo) => (
              <li
                key={rotulo}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-white/40"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                {rotulo}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plano.notas && plano.notas.length > 0 && (
        <ul className="mt-6 space-y-2 border-t border-white/10 pt-5">
          {plano.notas.map((nota) => (
            <li key={nota} className="flex items-start gap-2.5 text-xs leading-5 text-white/55">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-orange/70" aria-hidden="true" />
              {nota}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-8">
        <Button href={`/?plano=${plano.id}#contato`} showArrow className="w-full justify-center">
          Quero o plano {plano.nome}
        </Button>
        <p className="mt-3 text-center text-xs text-white/40">Clicar aqui só inicia uma conversa — nenhuma cobrança.</p>
      </div>
    </div>
  );
}

/**
 * Painel animado. Os 4 painéis ficam empilhados e invisíveis só para medir a altura do maior:
 * assim a seção não "pula" quando se troca de plano.
 */
function PalcoPainel({ plano, direction, instante }: { plano: Plano; direction: number; instante: boolean }) {
  return (
    <div className="grid">
      {PLANOS.map((p) => (
        <div key={p.id} className="invisible col-start-1 row-start-1" aria-hidden="true" inert>
          <PainelPlano plano={p} />
        </div>
      ))}
      <div className="relative col-start-1 row-start-1 overflow-hidden">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={plano.id}
            custom={direction}
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: instante ? 0 : 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <PainelPlano plano={plano} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Planos() {
  const reduceMotion = useReducedMotion();
  const instante = !!reduceMotion;
  const mover = instante ? 0 : MOVE_DURATION;

  const [selecionado, setSelecionado] = useState(2); // começa na "Presença Completa" (recomendado)
  const [direction, setDirection] = useState(0);

  const plano = PLANOS[selecionado];
  const visualIndex = FLOOR_ORDER.indexOf(selecionado);
  const numeroAndar = FLOOR_DISPLAY[visualIndex];
  const carTop = visualIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 - CAR_HEIGHT / 2;

  function handleSelect(novoIndex: number) {
    if (novoIndex === selecionado) return;
    const oldVisual = FLOOR_ORDER.indexOf(selecionado);
    const newVisual = FLOOR_ORDER.indexOf(novoIndex);
    setDirection(newVisual > oldVisual ? 1 : -1);
    setSelecionado(novoIndex);
  }

  function escolherPorId(planoId: string) {
    const i = PLANOS.findIndex((p) => p.id === planoId);
    if (i >= 0) handleSelect(i);
  }

  return (
    <section id="planos" className="nexa-section bg-[#0a0a0a] py-24 text-white md:py-32">
      <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
      <div className="bg-radial-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="nexa-label">06 / planos</p>
            <h2 className="nexa-display mt-5 text-4xl font-black leading-[.95] md:text-6xl">
              Escolha o andar que o seu negócio
              <br />
              <span className="text-white/25">está pronto pra subir.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/45">
            Sem taxa escondida. Suba de andar quando fizer sentido pra você.
          </p>
        </div>

        {/* Avisa leitores de tela quando o plano muda */}
        <p className="sr-only" aria-live="polite">
          Plano selecionado: {plano.nome}, {plano.preco} {plano.periodo}.
        </p>

        <div id="planos-detalhe" className="scroll-mt-24">
          {/* Desktop: prédio + painel */}
          <div className="mt-16 hidden gap-12 md:grid md:grid-cols-[240px_1fr] md:items-center">
            <div className="mx-auto flex" style={{ height: FLOOR_HEIGHT * 4 }}>
              <div className="relative w-16 shrink-0" aria-hidden="true">
                <div className="absolute left-3 top-0 h-full w-px bg-white/10" />
                <div className="absolute right-3 top-0 h-full w-px bg-white/10" />

                <motion.div
                  className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-brand-orange/40"
                  animate={{ height: carTop + CAR_HEIGHT / 2 }}
                  transition={{ duration: mover, ease: "easeInOut" }}
                />

                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-lg border-2 border-brand-orange bg-[#161616] shadow-lg shadow-black/60"
                  style={{ width: CAR_WIDTH, height: CAR_HEIGHT }}
                  animate={{ top: carTop }}
                  transition={{ duration: mover, ease: "easeInOut" }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded border border-brand-orange/60 bg-black px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-orange">
                    {numeroAndar}
                  </div>

                  <div className="absolute inset-0 bg-[#0d0d0d]" />

                  {!instante && (
                    <motion.span
                      key={`flash-${selecionado}`}
                      className="absolute inset-0 bg-brand-orange"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.6, delay: 0.35 }}
                    />
                  )}

                  <motion.div
                    key={`person-${selecionado}`}
                    className="absolute inset-0 z-10 flex items-center justify-center"
                    initial={instante ? false : { opacity: 0, scale: 0.5, x: -2 }}
                    animate={
                      instante
                        ? { opacity: 1, scale: 1, x: 0 }
                        : { opacity: [0, 0, 1, 1], scale: [0.5, 0.5, 1, 1], x: [-2, -2, 0, 0] }
                    }
                    transition={{ duration: instante ? 0 : 1.1, times: [0, 0.3, 0.55, 1], ease: "easeOut" }}
                  >
                    <motion.div
                      animate={instante ? undefined : { rotate: [0, -10, 8, -6, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.4, delay: 1.1, ease: "easeInOut" }}
                    >
                      <PersonStanding className="h-4 w-4 text-brand-orange" />
                    </motion.div>
                    {!instante && (
                      <motion.div
                        className="absolute -right-1 flex text-brand-orange"
                        animate={{ x: [0, 4, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: 1.2, ease: "easeInOut" }}
                      >
                        <ChevronsRight className="h-3 w-3" />
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div
                    className="absolute inset-y-0 left-0 z-20 w-1/2 border-r border-black/50 bg-gradient-to-r from-[#3a3a3a] to-[#242424]"
                    initial={false}
                    animate={{ x: instante ? "-100%" : ["0%", "0%", "-100%"] }}
                    transition={{ duration: instante ? 0 : 0.65, times: [0, 0.55, 1], ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-y-0 right-0 z-20 w-1/2 border-l border-black/50 bg-gradient-to-l from-[#3a3a3a] to-[#242424]"
                    initial={false}
                    animate={{ x: instante ? "100%" : ["0%", "0%", "100%"] }}
                    transition={{ duration: instante ? 0 : 0.65, times: [0, 0.55, 1], ease: "easeInOut" }}
                  />
                </motion.div>
              </div>

              <div className="flex flex-1 flex-col border-l border-white/10 pl-5" role="group" aria-label="Escolher plano">
                {FLOOR_ORDER.map((planoIndex, v) => {
                  const isAtivo = selecionado === planoIndex;
                  const planoDoAndar = PLANOS[planoIndex];

                  return (
                    <button
                      key={planoDoAndar.id}
                      type="button"
                      onClick={() => handleSelect(planoIndex)}
                      aria-pressed={isAtivo}
                      aria-label={`${planoDoAndar.nome}, ${FLOOR_LABELS[v]}: ${planoDoAndar.preco} ${planoDoAndar.periodo}`}
                      style={{ height: FLOOR_HEIGHT }}
                      className="flex flex-col justify-center rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                    >
                      <p
                        className={`text-sm font-bold transition-colors ${isAtivo ? "text-white" : "text-white/55"}`}
                      >
                        {planoDoAndar.nome}
                        {planoDoAndar.destaque === "popular" && (
                          <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-brand-orange align-middle" aria-hidden="true" />
                        )}
                      </p>
                      <p
                        className={`mt-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                          isAtivo ? "text-brand-orange" : "text-white/35"
                        }`}
                      >
                        {FLOOR_LABELS[v]} · {planoDoAndar.preco}
                      </p>

                      <div className="mt-2 flex gap-1.5">
                        {[0, 1].map((janela) => (
                          <span
                            key={janela}
                            className={`h-3 w-4 rounded-sm transition-all duration-300 ${
                              isAtivo ? "bg-brand-orange shadow-[0_0_10px_2px_rgba(243,99,4,0.6)]" : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <PalcoPainel plano={plano} direction={direction} instante={instante} />
          </div>

          {/* Mobile: abas simples + painel */}
          <div className="mt-12 md:hidden">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Escolher plano">
              {PLANOS.map((p, index) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(index)}
                  aria-pressed={selecionado === index}
                  className={`rounded-full px-3 py-3 text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-orange ${
                    selecionado === index ? "bg-brand-orange text-brand-white" : "bg-white/10 text-white/60"
                  }`}
                >
                  {p.nome}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <PalcoPainel plano={plano} direction={direction} instante={instante} />
            </div>
          </div>
        </div>

        <PlanosComparativo />

        <PlanosGuia onResultado={escolherPorId} />

        <PlanosFaq />

        <div className="mx-auto mt-16 flex max-w-2xl flex-col items-center gap-3 text-center">
          <p className="text-sm text-white/60">Prefere conversar antes de decidir? O primeiro contato não gera cobrança.</p>
          <Button href="#contato" variant="outline" showArrow>
            Falar sobre os planos
          </Button>
        </div>
      </div>
    </section>
  );
}
