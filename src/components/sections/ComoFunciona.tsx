"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  Search,
  ClipboardList,
  Hammer,
  Rocket,
  LineChart,
  X,
} from "lucide-react";
import { PROCESSO } from "@/src/lib/data/processo";

const ICONES = [Search, ClipboardList, Hammer, Rocket, LineChart];

const OFFSET_CLASSES = [
  "md:-translate-y-6",
  "md:translate-y-6",
  "md:-translate-y-6",
  "md:translate-y-6",
  "md:-translate-y-6",
];

function Chama() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] bg-gradient-to-t from-[#1a0f06] via-brand-black to-black">
      <motion.div
        className="absolute inset-x-[-20%] bottom-[-35%] h-[150%] bg-gradient-to-t from-brand-orange/70 via-brand-orange-dark/20 to-transparent blur-2xl"
        style={{ transformOrigin: "bottom" }}
        animate={{ opacity: [0.7, 1, 0.8, 0.95, 0.7], scaleY: [1, 1.06, 0.96, 1.04, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-[5%] bottom-[-25%] h-[120%] bg-gradient-to-t from-brand-orange/45 via-transparent to-transparent blur-3xl"
        style={{ transformOrigin: "bottom" }}
        animate={{ opacity: [0.5, 0.8, 0.55, 0.7, 0.5], scaleY: [1, 1.1, 0.94, 1.08, 1] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </div>
  );
}

export default function ComoFunciona() {
  const reduceMotion = useReducedMotion();
  const [ativo, setAtivo] = useState<number | null>(null);
  const etapaAtiva = ativo !== null ? PROCESSO[ativo] : null;

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAtivo(null);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <LayoutGroup>
      <section id="como-funciona" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-brand-orange/10 px-4 py-1.5 text-sm font-semibold text-brand-orange">
              Como funciona
            </span>
            <h2 className="mt-6 text-3xl font-extrabold leading-tight text-brand-black md:text-4xl">
              Uma jornada com fases claras, não uma caixa-preta
            </h2>
            <p className="mt-4 text-brand-black/70">
              Clique em cada fase para ver o que acontece nela.
            </p>
          </div>

          <div className="relative mt-24 md:mt-32">
            <svg
              className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 10 8 L 30 32 L 50 8 L 70 32 L 90 8"
                fill="none"
                stroke="#F36304"
                strokeWidth="0.7"
                strokeDasharray="2 2"
                strokeLinecap="round"
                style={{ filter: "blur(3px)" }}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.3 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </svg>

            <div className="relative grid gap-x-4 gap-y-16 md:grid-cols-5 md:gap-y-24">
              {PROCESSO.map((etapa, index) => {
                const Icon = ICONES[index];
                const isUltima = index === PROCESSO.length - 1;
                const selecionado = ativo === index;

                return (
                  <motion.div
                    key={etapa.numero}
                    layoutId={`fase-card-${index}`}
                    onClick={() => setAtivo(index)}
                    className={`flex cursor-pointer flex-col items-center text-center ${OFFSET_CLASSES[index]}`}
                    style={{
                      opacity: selecionado ? 0 : 1,
                      pointerEvents: selecionado ? "none" : "auto",
                    }}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileInView={{ opacity: selecionado ? 0 : 1, scale: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 16,
                      delay: reduceMotion ? 0 : index * 0.25,
                    }}
                  >
                    <motion.div
                      className="relative flex h-16 w-16 items-center justify-center"
                      animate={
                        reduceMotion ? undefined : { rotate: [0, -6, 6, -6, 0] }
                      }
                      transition={
                        reduceMotion
                          ? undefined
                          : {
                              duration: 0.6,
                              repeat: Infinity,
                              repeatDelay: 3.5,
                              delay: index * 0.4 + 1,
                            }
                      }
                      whileHover={
                        reduceMotion
                          ? { scale: 1.1 }
                          : {
                              scale: [1, 1.15, 1],
                              transition: { duration: 0.7, repeat: Infinity },
                            }
                      }
                    >
                      {isUltima && !reduceMotion && (
                        <motion.span
                          className="absolute inset-0 rounded-2xl bg-brand-orange/40"
                          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brand-orange bg-gradient-to-br from-brand-orange to-brand-orange-dark text-brand-white shadow-lg shadow-brand-orange/30">
                        <Icon className="h-7 w-7" />
                      </div>
                    </motion.div>

                    <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-widest text-brand-orange/70">
                      Fase {etapa.numero}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-brand-black">
                      {etapa.titulo}
                    </h3>
                    <p className="mx-auto mt-2 max-w-[150px] text-sm text-brand-black/60">
                      {etapa.resumo}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {etapaAtiva && ativo !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setAtivo(null)}
          >
            <motion.div
              layoutId={`fase-card-${ativo}`}
              onClick={(e) => e.stopPropagation()}
              initial={{opacity: 0}}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 170, damping: 17, mass: 1 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl shadow-black/40"
            >
              <Chama />

              <motion.div
                className="relative p-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3, ease: "easeOut" }}
              >
                <button
                  type="button"
                  onClick={() => setAtivo(null)}
                  className="absolute right-6 top-6 z-10 text-brand-white/70 transition-colors hover:text-brand-white"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-white text-brand-orange shadow-lg">
                  {(() => {
                    const Icon = ICONES[ativo];
                    return <Icon className="h-6 w-6" />;
                  })()}
                </div>

                <p className="mt-5 font-mono text-xs font-bold uppercase tracking-widest text-brand-white/80">
                  Fase {etapaAtiva.numero}
                </p>
                <h3 className="mt-1 text-2xl font-extrabold text-brand-white">
                  {etapaAtiva.titulo}
                </h3>

                <ul className="mt-5 space-y-3">
                  {etapaAtiva.detalhes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-brand-white/85"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-white" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}