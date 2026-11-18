"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Layers } from "lucide-react";
import { DIFERENCIAIS } from "@/src/lib/data/diferenciais";

const TOTAL = DIFERENCIAIS.length;
const ESPACAMENTO = 210;
const ROTACOES_ESPALHADO = [-8, -4, 2, 6, -3];
const GAP_MOBILE = 16;

export default function Diferenciais() {
  const reduceMotion = useReducedMotion();
  const instante = !!reduceMotion;

  const secaoRef = useRef<HTMLElement>(null);
  const cartasRef = useRef<Array<HTMLButtonElement | null>>([]);
  const trilhoRef = useRef<HTMLDivElement>(null);

  // O baralho se abre sozinho na primeira vez que a seção aparece na tela.
  // Depois disso, a escolha do visitante (recolher / espalhar) manda.
  const jaVisto = useInView(secaoRef, { once: true, amount: 0.4 });
  const visivelAgora = useInView(secaoRef, { amount: 0.2 });
  const [escolhaManual, setEscolhaManual] = useState<boolean | null>(null);
  const aberto = escolhaManual ?? jaVisto;

  const [selecionada, setSelecionada] = useState(0);
  const [peekIndex, setPeekIndex] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);

  // ciclo de "espiadas" aleatórias enquanto o baralho está fechado (e a seção está na tela)
  useEffect(() => {
    if (aberto || reduceMotion || !visivelAgora) return;

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
  }, [aberto, reduceMotion, visivelAgora]);

  function alternarBaralho() {
    setPeekIndex(null);
    setEscolhaManual(!aberto);
  }

  function clicarCarta(index: number) {
    if (!aberto) {
      alternarBaralho();
      return;
    }
    setSelecionada(index);
  }

  function teclasCarta(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!aberto) return;
    let alvo = -1;
    if (e.key === "ArrowRight") alvo = Math.min(TOTAL - 1, index + 1);
    else if (e.key === "ArrowLeft") alvo = Math.max(0, index - 1);
    else if (e.key === "Home") alvo = 0;
    else if (e.key === "End") alvo = TOTAL - 1;
    if (alvo < 0) return;
    e.preventDefault();
    setSelecionada(alvo);
    cartasRef.current[alvo]?.focus();
  }

  // ---- carrossel mobile ----
  function passoMobile() {
    const card = trilhoRef.current?.children[0] as HTMLElement | undefined;
    return card ? card.offsetWidth + GAP_MOBILE : 0;
  }

  function aoRolar() {
    const el = trilhoRef.current;
    const passo = passoMobile();
    if (!el || !passo) return;
    const i = Math.min(TOTAL - 1, Math.max(0, Math.round(el.scrollLeft / passo)));
    setSlide((atual) => (atual === i ? atual : i));
  }

  function irParaSlide(i: number) {
    trilhoRef.current?.scrollTo({ left: i * passoMobile(), behavior: instante ? "auto" : "smooth" });
  }

  const atual = DIFERENCIAIS[selecionada];

  return (
    <section ref={secaoRef} id="diferenciais" className="nexa-section bg-[#070707] py-24 text-white md:py-32">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="nexa-label">03 / diferenciais</p>
            <h2 className="nexa-display mt-5 text-4xl font-black leading-[.95] md:text-6xl">
              Como a gente trabalha,
              <br />
              <span className="text-white/25">sem letra miúda.</span>
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm leading-6 text-white/45">
              {TOTAL} princípios que guiam o trabalho. Cada um aponta para algo que você já pode ver aqui no site.
            </p>
            <button
              type="button"
              onClick={alternarBaralho}
              aria-expanded={aberto}
              aria-controls="diferenciais-leque"
              className="cta-press mt-5 hidden items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-4 py-2.5 text-xs font-semibold text-white/75 outline-none transition-colors hover:border-brand-orange/50 hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange md:inline-flex"
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              {aberto ? "Recolher o baralho" : "Espalhar as cartas"}
            </button>
          </div>
        </div>

        {/* ---------- Desktop: baralho / leque ---------- */}
        <div id="diferenciais-leque" className="relative mx-auto mt-16 hidden h-[340px] max-w-5xl md:block md:scale-[.7] lg:scale-[.95] xl:scale-100" role="group" aria-label="Diferenciais da Nexa MP">
          {!aberto && !reduceMotion && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-44 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-brand-orange/20 blur-xl"
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />
          )}

          {DIFERENCIAIS.map((item, index) => {
            const centro = index - (TOTAL - 1) / 2;
            const spreadX = centro * ESPACAMENTO;
            const spreadRotate = instante ? 0 : ROTACOES_ESPALHADO[index] ?? centro * 4;
            const stackRotate = instante ? 0 : centro * 1.5;
            const isPeeking = !aberto && peekIndex === index;
            const isSelecionada = aberto && selecionada === index;
            const delayAbrir = index * 0.09;
            const delayFechar = (TOTAL - 1 - index) * 0.06;

            return (
              <div key={item.titulo} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {aberto && !reduceMotion && (
                  <>
                    <motion.div
                      className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-36 -translate-x-1/2 rounded-full bg-black/60 blur-md"
                      style={{ x: spreadX }}
                      initial={{ opacity: 0, scaleX: 0.6 }}
                      animate={{ opacity: [0, 0.7, 0.45], scaleX: [0.6, 1.15, 1] }}
                      transition={{ duration: 0.5, delay: delayAbrir + 0.42 }}
                      aria-hidden="true"
                    />
                    <motion.span
                      className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-orange/70"
                      style={{ x: spreadX }}
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: [0, 0.8, 0], scale: [0.3, 2.4, 2.8] }}
                      transition={{ duration: 0.5, delay: delayAbrir + 0.42 }}
                      aria-hidden="true"
                    />
                  </>
                )}

                {/* Botão externo: só espalha / recolhe. O "levantar" da carta fica no elemento interno,
                    assim escolher outra carta não repete a animação de abertura. */}
                <motion.button
                  type="button"
                  ref={(el) => {
                    cartasRef.current[index] = el;
                  }}
                  onClick={() => clicarCarta(index)}
                  onKeyDown={(e) => teclasCarta(e, index)}
                  tabIndex={aberto ? 0 : -1}
                  aria-hidden={aberto ? undefined : true}
                  aria-pressed={aberto ? isSelecionada : undefined}
                  className="relative block w-52 rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-4 focus-visible:ring-offset-[#070707]"
                  style={{ zIndex: isPeeking ? 60 : isSelecionada ? 40 : aberto ? index : TOTAL - index }}
                  animate={
                    aberto
                      ? { x: spreadX, y: instante ? 0 : [0, -260, 24, -6, 0], rotate: spreadRotate }
                      : { x: 0, y: 0, rotate: stackRotate }
                  }
                  transition={
                    instante
                      ? { duration: 0 }
                      : aberto
                        ? {
                            x: { type: "spring", stiffness: 210, damping: 22, delay: delayAbrir },
                            rotate: { type: "spring", stiffness: 210, damping: 20, delay: delayAbrir },
                            y: {
                              duration: 0.65,
                              delay: delayAbrir,
                              times: [0, 0.4, 0.7, 0.88, 1],
                              ease: ["easeIn", "easeOut", "easeOut", "easeOut"],
                            },
                          }
                        : { type: "spring", stiffness: 220, damping: 24, delay: delayFechar }
                  }
                >
                  <motion.div
                    className={`rounded-2xl border bg-[#161616] p-6 shadow-2xl shadow-black/50 transition-colors duration-300 ${
                      isSelecionada ? "border-brand-orange/60" : "border-white/15"
                    }`}
                    animate={{
                      y: isSelecionada ? -14 : isPeeking ? -50 : 0,
                      scale: isSelecionada || isPeeking ? 1.04 : 1,
                    }}
                    transition={
                      instante
                        ? { duration: 0 }
                        : { type: "spring", stiffness: isPeeking ? 260 : 240, damping: isPeeking ? 16 : 22 }
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-orange">0{index + 1}</span>
                      <span
                        className={`h-2 w-2 rounded-full transition-colors ${
                          isSelecionada ? "bg-brand-orange" : "bg-brand-orange/50"
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mt-4 text-base font-bold leading-snug">{item.titulo}</h3>
                    {aberto && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: instante ? 0 : delayAbrir + 0.55, duration: instante ? 0 : 0.3 }}
                        className="mt-3 text-xs leading-relaxed text-white/60"
                      >
                        {item.descricao}
                      </motion.p>
                    )}
                  </motion.div>
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Painel "Na prática": mostra, para a carta escolhida, onde isso aparece no site */}
        <div className="mx-auto mt-6 hidden min-h-[128px] max-w-3xl md:block" aria-live="polite">
          {aberto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: instante ? 0 : 0.9, duration: instante ? 0 : 0.35 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selecionada}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: instante ? 0 : 0.18 }}
                  className="flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/[.03] p-6"
                >
                  <div>
                    <p className="nexa-label">na prática // 0{selecionada + 1}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{atual.titulo}</p>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-white/55">{atual.pratica.texto}</p>
                  </div>
                  <a
                    href={atual.pratica.href}
                    className="cta-press group inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/75 outline-none transition-colors hover:border-brand-orange/60 hover:bg-brand-orange/10 hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange"
                  >
                    {atual.pratica.rotulo}
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ---------- Mobile: carrossel com as cartas já visíveis ---------- */}
        <div className="mt-12 md:hidden">
          <div
            ref={trilhoRef}
            onScroll={aoRolar}
            className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="region"
            aria-label="Diferenciais da Nexa MP, deslize para o lado"
          >
            {DIFERENCIAIS.map((item, index) => (
              <article
                key={item.titulo}
                className="flex w-[82%] shrink-0 snap-start flex-col rounded-2xl border border-white/10 bg-[#111] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-orange">0{index + 1}</span>
                  <span className="h-2 w-2 rounded-full bg-brand-orange" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold leading-snug">{item.titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.descricao}</p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="nexa-label">na prática</p>
                  <p className="mt-2 text-sm leading-6 text-white/55">{item.pratica.texto}</p>
                  <a
                    href={item.pratica.href}
                    className="cta-press mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/75 outline-none transition-colors hover:border-brand-orange/60 hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange"
                  >
                    {item.pratica.rotulo}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-center gap-1" role="group" aria-label="Escolher diferencial">
            {DIFERENCIAIS.map((item, i) => (
              <button
                key={item.titulo}
                type="button"
                onClick={() => irParaSlide(i)}
                aria-label={`Ir para ${item.titulo}`}
                aria-current={i === slide ? "true" : undefined}
                className="grid h-7 w-7 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
              >
                <span
                  className={`block h-2 rounded-full transition-all ${i === slide ? "w-5 bg-brand-orange" : "w-2 bg-white/30"}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <a
            href="#planos"
            className="cta-press inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-brand-orange/50 hover:text-brand-orange"
          >
            Ver como isso vira plano
          </a>
        </div>
      </div>
    </section>
  );
}
