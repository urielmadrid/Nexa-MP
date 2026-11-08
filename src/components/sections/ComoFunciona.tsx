"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Hammer,
  LineChart,
  Rocket,
  Search,
  X,
} from "lucide-react";
import { PROCESSO } from "@/src/lib/data/processo";
import { PLANOS } from "@/src/lib/data/planos";
import Button from "@/src/components/ui/Button";

const ICONES = [Search, ClipboardList, Hammer, Rocket, LineChart];
const TOTAL = PROCESSO.length;
const ULTIMA = TOTAL - 1;

/** Zigue-zague da versão desktop (cartões alternam ±24px). */
const OFFSET_CLASSES = [
  "md:-translate-y-6",
  "md:translate-y-6",
  "md:-translate-y-6",
  "md:translate-y-6",
  "md:-translate-y-6",
];

/** Nota sobre planos — vem de planos.ts, nada digitado à mão além da estrutura da frase. */
const TEM_MENSAL = PLANOS.some((p) => p.periodo === "por mês");
const AVULSA = PLANOS.find((p) => p.periodo === "pagamento único");
const NOTA_PLANOS = TEM_MENSAL
  ? `Nos planos mensais, esta fase se repete todo mês.${AVULSA ? ` A ${AVULSA.nome} é ${AVULSA.periodo}, sem mensalidade.` : ""}`
  : null;

function Chama({ parado }: { parado: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] bg-gradient-to-t from-[#1a0f06] via-brand-black to-black"
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-x-[-20%] bottom-[-35%] h-[150%] bg-gradient-to-t from-brand-orange/70 via-brand-orange-dark/20 to-transparent blur-2xl"
        style={{ transformOrigin: "bottom" }}
        animate={parado ? undefined : { opacity: [0.7, 1, 0.8, 0.95, 0.7], scaleY: [1, 1.06, 0.96, 1.04, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-[5%] bottom-[-25%] h-[120%] bg-gradient-to-t from-brand-orange/45 via-transparent to-transparent blur-3xl"
        style={{ transformOrigin: "bottom" }}
        animate={parado ? undefined : { opacity: [0.5, 0.8, 0.55, 0.7, 0.5], scaleY: [1, 1.1, 0.94, 1.08, 1] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </div>
  );
}

export default function ComoFunciona() {
  const reduceMotion = useReducedMotion();
  const parado = !!reduceMotion;

  const [ativo, setAtivo] = useState<number | null>(null);
  const [litCount, setLitCount] = useState(1);

  const trilhaRef = useRef<HTMLDivElement>(null);
  const botoesRef = useRef<Array<HTMLButtonElement | null>>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const ultimoAberto = useRef(0);

  // ---------- progresso da linha conforme o scroll ----------
  const { scrollYProgress } = useScroll({
    target: trilhaRef,
    offset: ["start 75%", "end 60%"],
  });
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  // x do zigue-zague vai de 10 (fase 01) a 90 (fase 05)
  const larguraClip = useTransform(progresso, [0, 1], [10, 90]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const n = Math.min(TOTAL, Math.max(1, Math.floor(v * ULTIMA + 0.001) + 1));
    setLitCount((atual) => (atual === n ? atual : n));
  });

  const acesas = parado ? TOTAL : litCount;

  // ---------- diálogo ----------
  const abrir = useCallback((i: number) => {
    ultimoAberto.current = i;
    setAtivo(i);
  }, []);

  const fechar = useCallback((devolverFoco = true) => {
    setAtivo(null);
    if (devolverFoco) {
      requestAnimationFrame(() => botoesRef.current[ultimoAberto.current]?.focus());
    }
  }, []);

  const ir = useCallback((i: number) => {
    const alvo = Math.min(ULTIMA, Math.max(0, i));
    ultimoAberto.current = alvo;
    setAtivo(alvo);
  }, []);

  const aberto = ativo !== null;

  // trava o scroll do fundo e foca o botão de fechar ao abrir
  useEffect(() => {
    if (!aberto) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => fecharRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberto]);

  // Esc, setas e "prisão" de foco (Tab) enquanto o diálogo está aberto
  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        fechar();
        return;
      }
      if (e.key === "ArrowRight") {
        setAtivo((a) => {
          if (a === null) return a;
          const n = Math.min(ULTIMA, a + 1);
          ultimoAberto.current = n;
          return n;
        });
        return;
      }
      if (e.key === "ArrowLeft") {
        setAtivo((a) => {
          if (a === null) return a;
          const n = Math.max(0, a - 1);
          ultimoAberto.current = n;
          return n;
        });
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focaveis: HTMLElement[] = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]"),
        );
        if (focaveis.length === 0) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        const atual = document.activeElement;
        if (e.shiftKey && (atual === primeiro || !dialogRef.current.contains(atual))) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && (atual === ultimo || !dialogRef.current.contains(atual))) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, fechar]);

  const etapa = ativo !== null ? PROCESSO[ativo] : null;
  const IconeAtivo = ativo !== null ? ICONES[ativo] : null;

  return (
    <>
      <section id="como-funciona" className="nexa-section bg-[#0a0a0a] py-24 text-white md:py-32">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true" />
        <div
          className="glow-blob pointer-events-none absolute -left-24 top-1/3 h-[24rem] w-[24rem] rounded-full bg-brand-orange/15 blur-3xl"
          style={{ animationDelay: "1s" }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="nexa-label">04 / método</p>
              <h2 className="nexa-display mt-5 text-4xl font-black leading-[.95] md:text-6xl">
                Uma jornada com fases claras,
                <br />
                <span className="text-white/25">não uma caixa-preta.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/45">
              Você sabe o que acontece em cada fase antes de ela começar. Toque em uma fase para ver os detalhes e a sua parte
              no processo.
            </p>
          </div>

          <div ref={trilhaRef} className="relative mt-20 md:mt-32">
            {/* Linha desktop: base tracejada + trecho aceso que acompanha o scroll.
                Dois SVGs empilhados: o brilho (drop-shadow) fica no SVG aceso, em pixels de tela,
                para não ser esticado pelo viewBox. */}
            <svg
              className="pointer-events-none absolute left-0 top-0 hidden h-16 w-full md:block"
              viewBox="0 0 100 64"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M10 8L30 56L50 8L70 56L90 8"
                fill="none"
                stroke="rgba(255,255,255,.14)"
                strokeWidth="1.5"
                strokeDasharray="3 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <svg
              className="pointer-events-none absolute left-0 top-0 hidden h-16 w-full drop-shadow-[0_0_6px_rgba(243,99,4,.55)] md:block"
              viewBox="0 0 100 64"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <clipPath id="como-funciona-clip">
                  {parado ? (
                    <rect x="0" y="-10" width="100" height="90" />
                  ) : (
                    <motion.rect x="0" y="-10" height="90" style={{ width: larguraClip }} />
                  )}
                </clipPath>
              </defs>
              <path
                d="M10 8L30 56L50 8L70 56L90 8"
                fill="none"
                stroke="#F36304"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                clipPath="url(#como-funciona-clip)"
              />
            </svg>

            {/* Linha mobile: trilho vertical que acende */}
            <div className="pointer-events-none absolute bottom-8 left-8 top-8 w-px -translate-x-1/2 bg-white/10 md:hidden" aria-hidden="true">
              <motion.div
                className="h-full w-full origin-top bg-brand-orange shadow-[0_0_10px_rgba(243,99,4,.6)]"
                style={{ scaleY: parado ? 1 : progresso }}
              />
            </div>

            <ol className="relative grid gap-10 md:grid-cols-5 md:gap-x-4 md:gap-y-0">
              {PROCESSO.map((fase, index) => {
                const Icon = ICONES[index];
                const acesa = index < acesas;
                const pulsa = index === ULTIMA && acesa && !parado;

                return (
                  <motion.li
                    key={fase.numero}
                    className={OFFSET_CLASSES[index]}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: parado ? 0 : index * 0.12 }}
                  >
                    <button
                      type="button"
                      ref={(el) => {
                        botoesRef.current[index] = el;
                      }}
                      onClick={() => abrir(index)}
                      aria-haspopup="dialog"
                      className="group flex w-full items-start gap-5 rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0a] md:flex-col md:items-center md:gap-0 md:text-center"
                    >
                      <span className="relative flex h-16 w-16 shrink-0 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                        {pulsa && (
                          <motion.span
                            className="absolute inset-0 rounded-2xl bg-brand-orange/40"
                            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border backdrop-blur-md transition-all duration-500 ${
                            acesa
                              ? "border-brand-orange/50 bg-brand-orange/15 text-brand-orange shadow-[0_0_32px_rgba(243,99,4,.25)] group-hover:bg-brand-orange group-hover:text-white"
                              : "border-white/15 bg-white/[.04] text-white/40 group-hover:border-brand-orange/40 group-hover:text-brand-orange"
                          }`}
                        >
                          <Icon className="h-7 w-7" aria-hidden="true" />
                        </span>
                      </span>

                      <span className="block min-w-0 md:mt-5">
                        <span className="nexa-label block opacity-80">Fase {fase.numero}</span>
                        <span className="mt-2 block text-lg font-bold text-white">{fase.titulo}</span>
                        <span className="mt-2 block text-sm leading-6 text-white/55 md:mx-auto md:max-w-[170px]">
                          {fase.resumo}
                        </span>
                        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-white/40 transition-colors group-hover:text-brand-orange">
                          Ver detalhes <ChevronRight className="h-3 w-3" aria-hidden="true" />
                        </span>
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ol>
          </div>

          <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:mt-28">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <p className="max-w-xl text-sm leading-6 text-white/70">
                Tudo começa na fase 01: uma conversa para entender o seu negócio, sem compromisso.
              </p>
              <Button href="#contato" showArrow className="shrink-0">
                Começar pela fase 01
              </Button>
            </div>
            {NOTA_PLANOS && (
              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/40">{NOTA_PLANOS}</p>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {etapa && ativo !== null && IconeAtivo && (
          <motion.div
            key="overlay-fase"
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => fechar()}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="fase-titulo"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40"
            >
              <Chama parado={parado} />

              <div className="relative p-6 sm:p-8">
                <button
                  ref={fecharRef}
                  type="button"
                  onClick={() => fechar()}
                  className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-brand-white/70 outline-none transition-colors hover:bg-white/10 hover:text-brand-white focus-visible:ring-2 focus-visible:ring-brand-orange sm:right-6 sm:top-6"
                  aria-label="Fechar detalhes da fase"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={ativo}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-white text-brand-orange shadow-lg">
                      <IconeAtivo className="h-6 w-6" aria-hidden="true" />
                    </div>

                    <p className="nexa-label mt-5 text-brand-white/80" aria-live="polite">
                      Fase {etapa.numero} de {String(TOTAL).padStart(2, "0")}
                    </p>
                    <h3 id="fase-titulo" className="mt-2 text-2xl font-extrabold text-brand-white">
                      {etapa.titulo}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-brand-white/65">{etapa.resumo}</p>

                    <p className="nexa-label mt-6 text-brand-white/60">O que fazemos</p>
                    <ul className="mt-3 space-y-3">
                      {etapa.detalhes.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm leading-6 text-brand-white/85">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-white" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 rounded-2xl border border-white/15 bg-black/30 p-4">
                      <p className="nexa-label text-brand-white/70">Sua parte nesta fase</p>
                      <ul className="mt-3 space-y-2">
                        {etapa.voce.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-brand-white/80">
                            <ArrowRight className="mt-1.5 h-3.5 w-3.5 shrink-0 text-brand-orange" aria-hidden="true" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {ativo === ULTIMA && NOTA_PLANOS && (
                      <p className="mt-4 text-xs leading-5 text-brand-white/55">{NOTA_PLANOS}</p>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => ir(ativo - 1)}
                    disabled={ativo === 0}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-semibold text-brand-white/80 outline-none transition-colors hover:border-white/40 hover:text-brand-white focus-visible:ring-2 focus-visible:ring-brand-orange disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Anterior
                  </button>

                  <div className="flex items-center gap-1.5" role="group" aria-label="Fases do processo">
                    {PROCESSO.map((f, i) => (
                      <button
                        key={f.numero}
                        type="button"
                        onClick={() => ir(i)}
                        aria-label={`Ir para a fase ${f.numero}: ${f.titulo}`}
                        aria-current={i === ativo ? "step" : undefined}
                        className="grid h-6 w-6 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                      >
                        <span
                          className={`block h-2 rounded-full transition-all ${
                            i === ativo ? "w-5 bg-brand-orange" : "w-2 bg-white/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {ativo < ULTIMA ? (
                    <button
                      type="button"
                      onClick={() => ir(ativo + 1)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-white px-3.5 py-2 text-xs font-bold text-black outline-none transition-colors hover:bg-brand-orange hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      Próxima <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <a
                      href="#contato"
                      onClick={() => fechar(false)}
                      className="cta-press inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3.5 py-2 text-xs font-bold text-white outline-none transition-colors hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white"
                    >
                      Falar com a Nexa MP <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
