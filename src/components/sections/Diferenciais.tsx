"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DIFERENCIAIS } from "@/src/lib/data/diferenciais";

const TOTAL = DIFERENCIAIS.length;
const ESPACAMENTO = 190;
const ROTACOES_ESPALHADO = [-8, -4, 2, 6, -3];

export default function Diferenciais() {
  const reduceMotion = useReducedMotion();
  const [aberto, setAberto] = useState(false);
  const [peekIndex, setPeekIndex] = useState<number | null>(null);

  // ciclo de "espiadas" aleatórias enquanto o baralho está fechado
  useEffect(() => {
    if (aberto || reduceMotion) return;

    let cancelado = false;
    let ultimo = -1;
    let timeoutId: ReturnType<typeof setTimeout>;

    function proximaEspiada() {
      if (cancelado) return;
      let novo = Math.floor(Math.random() * TOTAL);
      if (TOTAL > 1) {
        while (novo === ultimo) {
          novo = Math.floor(Math.random() * TOTAL);
        }
      }
      ultimo = novo;
      setPeekIndex(novo);
      timeoutId = setTimeout(proximaEspiada, 1500);
    }

    timeoutId = setTimeout(proximaEspiada, 900);

    return () => {
      cancelado = true;
      clearTimeout(timeoutId);
    };
  }, [aberto, reduceMotion]);

  function alternarBaralho() {
    setPeekIndex(null);
    setAberto((v) => !v);
  }

  return (
    <section className="bg-brand-black py-24 text-brand-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-brand-white/10 px-4 py-1.5 text-sm font-semibold text-brand-orange">
            Por que a Nexa MP
          </span>
          <h2 className="mt-6 text-3xl font-extrabold leading-tight md:text-4xl">
            Cinco cartas na manga, nenhuma escondida
          </h2>
          <p className="mt-4 text-brand-white/60">
            {aberto
              ? "Toque em qualquer carta pra recolher o baralho."
              : "Toque no baralho pra espalhar as cartas na mesa."}
          </p>
        </div>

        <div className="relative mx-auto mt-20 hidden h-[360px] max-w-4xl md:block">
          {!aberto && !reduceMotion && (
            <motion.div
              className="absolute left-1/2 top-1/2 h-64 w-44 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-brand-orange/20 blur-xl"
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {DIFERENCIAIS.map((item, index) => {
            const centro = index - (TOTAL - 1) / 2;
            const spreadX = centro * ESPACAMENTO;
            const spreadRotate = reduceMotion
              ? 0
              : ROTACOES_ESPALHADO[index] ?? centro * 4;
            const stackRotate = reduceMotion ? 0 : centro * 1.5;
            const isPeeking = !aberto && peekIndex === index;
            const delayAbrir = index * 0.09;
            const delayFechar = (TOTAL - 1 - index) * 0.06;

            return (
              <div
                key={item.titulo}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                {aberto && !reduceMotion && (
                  <>
                    <motion.div
                      className="absolute left-1/2 top-1/2 h-6 w-36 -translate-x-1/2 rounded-full bg-black/60 blur-md"
                      style={{ x: spreadX }}
                      initial={{ opacity: 0, scaleX: 0.6 }}
                      animate={{ opacity: [0, 0.7, 0.45], scaleX: [0.6, 1.15, 1] }}
                      transition={{ duration: 0.5, delay: delayAbrir + 0.42 }}
                    />
                    <motion.span
                      className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-orange/70"
                      style={{ x: spreadX }}
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: [0, 0.8, 0], scale: [0.3, 2.4, 2.8] }}
                      transition={{ duration: 0.5, delay: delayAbrir + 0.42 }}
                    />
                  </>
                )}

                <motion.button
                  type="button"
                  onClick={alternarBaralho}
                  className="relative w-52 rounded-2xl border border-white/15 bg-[#161616] p-6 text-left shadow-2xl shadow-black/50"
                  style={{ zIndex: isPeeking ? 60 : aberto ? index : TOTAL - index }}
                  animate={
                    aberto
                      ? {
                          x: spreadX,
                          y: [0, -260, 24, -6, 0],
                          rotate: spreadRotate,
                          scale: 1,
                        }
                      : {
                          x: 0,
                          y: isPeeking ? -50 : 0,
                          rotate: stackRotate,
                          scale: isPeeking ? 1.03 : 1,
                        }
                  }
                  transition={
                    aberto
                      ? {
                          x: { type: "spring", stiffness: 210, damping: 22, delay: delayAbrir },
                          rotate: { type: "spring", stiffness: 210, damping: 20, delay: delayAbrir },
                          scale: { duration: 0.3, delay: delayAbrir },
                          y: {
                            duration: 0.65,
                            delay: delayAbrir,
                            times: [0, 0.4, 0.7, 0.88, 1],
                            ease: ["easeIn", "easeOut", "easeOut", "easeOut"],
                          },
                        }
                      : {
                          type: "spring",
                          stiffness: isPeeking ? 260 : 220,
                          damping: isPeeking ? 16 : 24,
                          delay: reduceMotion ? 0 : delayFechar,
                        }
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-orange">
                      0{index + 1}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-brand-orange" />
                  </div>
                  <h3 className="mt-4 text-base font-bold leading-snug">
                    {item.titulo}
                  </h3>
                  {aberto && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: delayAbrir + 0.55, duration: 0.3 }}
                      className="mt-3 text-xs leading-relaxed text-brand-white/60"
                    >
                      {item.descricao}
                    </motion.p>
                  )}
                </motion.button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 md:hidden">
          {!aberto ? (
            <button
              type="button"
              onClick={() => setAberto(true)}
              className="relative mx-auto flex h-40 w-full max-w-[220px] items-center justify-center rounded-2xl border border-white/15 bg-[#161616] text-sm font-semibold text-brand-orange shadow-xl shadow-black/40"
            >
              Toque para revelar
            </button>
          ) : (
            <div className="grid gap-4">
              {DIFERENCIAIS.map((item, index) => (
                <motion.button
                  key={item.titulo}
                  type="button"
                  onClick={() => setAberto(false)}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
                  className="rounded-2xl border border-white/10 bg-[#161616] p-6 text-left"
                >
                  <span className="font-mono text-xs font-bold text-brand-orange">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 font-bold">{item.titulo}</h3>
                  <p className="mt-2 text-sm text-brand-white/60">
                    {item.descricao}
                  </p>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        

          
      </div>
    </section>
  );
}