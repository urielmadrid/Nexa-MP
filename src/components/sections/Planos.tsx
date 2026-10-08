"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PersonStanding, ChevronsRight } from "lucide-react";
import Button from "@/src/components/ui/Button";
import { PLANOS } from "@/src/lib/data/planos";

const FLOOR_ORDER = [3, 2, 1, 0]; // do topo (cobertura) até o subsolo — índices em PLANOS
const FLOOR_LABELS = ["Cobertura", "1º andar", "Térreo", "Subsolo"];
const FLOOR_DISPLAY = ["3", "2", "1", "S1"];
const FLOOR_HEIGHT = 116;
const CAR_HEIGHT = 42;
const CAR_WIDTH = 46;
const MOVE_DURATION = 0.55;

const panelVariants = {
  enter: (dir: number) => ({ opacity: 0, y: dir === 1 ? -28 : 28 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir === 1 ? 28 : -28 }),
};

function PainelPlano({ plano }: { plano: (typeof PLANOS)[number] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#161616] p-8">
      {plano.destaque && (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            plano.destaque === "popular"
              ? "bg-brand-orange text-brand-white"
              : "bg-white text-brand-black"
          }`}
        >
          {plano.destaque === "popular" ? "Mais escolhido" : "Mais completo"}
        </span>
      )}

      <h3 className="mt-4 text-2xl font-extrabold text-white">{plano.nome}</h3>
      <p className="mt-2 text-sm text-white/60">{plano.descricao}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold text-white">{plano.preco}</span>
        <span className="text-sm text-white/50">{plano.periodo}</span>
      </div>

      <ul className="mt-8 space-y-3">
        {plano.itens.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
            <span className="text-white/80">{item}</span>
          </li>
        ))}
      </ul>

      <Button
        href={`/?plano=${plano.id}#contato`}
        className="mt-8 w-full justify-center"
      >
        Quero este plano
      </Button>
    </div>
  );
}

export default function Planos() {
  const [selecionado, setSelecionado] = useState(2); // começa na "Presença Completa"
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

  return (
        <section id="planos" className="relative overflow-hidden bg-brand-black py-24 text-brand-white">
      <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
      <div className="bg-radial-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-brand-orange">
            Planos
          </span>
          <h2 className="mt-6 text-3xl font-extrabold leading-tight md:text-4xl">
            Escolha o andar que o seu negócio está pronto pra subir
          </h2>
          <p className="mt-4 text-white/60">
            Sem taxa escondida. Suba de andar quando fizer sentido pra você.
          </p>
        </div>

        {/* Desktop: prédio + painel */}
        <div className="mt-16 hidden gap-12 md:grid md:grid-cols-[240px_1fr] md:items-center">
          <div className="mx-auto flex" style={{ height: FLOOR_HEIGHT * 4 }}>
            <div className="relative w-16 shrink-0">
              <div className="absolute left-3 top-0 h-full w-px bg-white/10" />
              <div className="absolute right-3 top-0 h-full w-px bg-white/10" />

              <motion.div
                className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-brand-orange/40"
                animate={{ height: carTop + CAR_HEIGHT / 2 }}
                transition={{ duration: MOVE_DURATION, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-lg border-2 border-brand-orange bg-[#161616] shadow-lg shadow-black/60"
                style={{ width: CAR_WIDTH, height: CAR_HEIGHT }}
                animate={{ top: carTop }}
                transition={{ duration: MOVE_DURATION, ease: "easeInOut" }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded border border-brand-orange/60 bg-black px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-orange">
                  {numeroAndar}
                </div>

                <div className="absolute inset-0 bg-[#0d0d0d]" />

                <motion.span
                  key={`flash-${selecionado}`}
                  className="absolute inset-0 bg-brand-orange"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                />

                <motion.div
                  key={`person-${selecionado}`}
                  className="absolute inset-0 z-10 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.5, x: -2 }}
                  animate={{ opacity: [0, 0, 1, 1], scale: [0.5, 0.5, 1, 1], x: [-2, -2, 0, 0] }}
                  transition={{ duration: 1.1, times: [0, 0.3, 0.55, 1], ease: "easeOut" }}
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 8, -6, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.4, delay: 1.1, ease: "easeInOut" }}
                  >
                    <PersonStanding className="h-4 w-4 text-brand-orange" />
                  </motion.div>
                  <motion.div
                    className="absolute -right-1 flex text-brand-orange"
                    animate={{ x: [0, 4, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: 1.2, ease: "easeInOut" }}
                  >
                    <ChevronsRight className="h-3 w-3" />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="absolute inset-y-0 left-0 z-20 w-1/2 border-r border-black/50 bg-gradient-to-r from-[#3a3a3a] to-[#242424]"
                  animate={{ x: ["0%", "0%", "-100%"] }}
                  transition={{ duration: 0.65, times: [0, 0.55, 1], ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-y-0 right-0 z-20 w-1/2 border-l border-black/50 bg-gradient-to-l from-[#3a3a3a] to-[#242424]"
                  animate={{ x: ["0%", "0%", "100%"] }}
                  transition={{ duration: 0.65, times: [0, 0.55, 1], ease: "easeInOut" }}
                />
              </motion.div>
            </div>

            <div className="flex flex-1 flex-col border-l border-white/10 pl-5">
              {FLOOR_ORDER.map((planoIndex, v) => {
                const isAtivo = selecionado === planoIndex;
                const planoDoAndar = PLANOS[planoIndex];

                return (
                  <button
                    key={planoDoAndar.id}
                    type="button"
                    onClick={() => handleSelect(planoIndex)}
                    style={{ height: FLOOR_HEIGHT }}
                    className="flex flex-col justify-center text-left"
                  >
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                          isAtivo ? "text-brand-orange" : "text-white/40"
                        }`}
                      >
                        {FLOOR_LABELS[v]}
                      </p>
                      {planoDoAndar.destaque === "popular" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                      )}
                    </div>
                    <p
                      className={`text-sm font-semibold transition-colors ${
                        isAtivo ? "text-white" : "text-white/50"
                      }`}
                    >
                      {planoDoAndar.nome}
                    </p>

                    <div className="mt-2 flex gap-1.5">
                      {[0, 1].map((janela) => (
                        <span
                          key={janela}
                          className={`h-3 w-4 rounded-sm transition-all duration-300 ${
                            isAtivo
                              ? "bg-brand-orange shadow-[0_0_10px_2px_rgba(243,99,4,0.6)]"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={plano.id}
                custom={direction}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <PainelPlano plano={plano} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile: abas simples + painel */}
        <div className="mt-12 md:hidden">
          <div className="flex gap-2">
            {PLANOS.map((p, index) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(index)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-bold ${
                  selecionado === index
                    ? "bg-brand-orange text-brand-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {p.nome}
              </button>
            ))}
          </div>

          <div className="relative mt-6 overflow-hidden">
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={plano.id}
                custom={direction}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <PainelPlano plano={plano} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}