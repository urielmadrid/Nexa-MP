"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cookie } from "lucide-react";
import { EVENTO_ABRIR, lerConsentimento, salvarConsentimento } from "@/src/lib/consentimento";

const GA_ATIVO = Boolean(process.env.NEXT_PUBLIC_GA_ID);

const BOTAO_PRINCIPAL =
  "cta-press rounded-full px-5 py-3 text-sm font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-brand-orange";

/**
 * Aviso de cookies. "Aceitar todos" e "Apenas necessários" têm o mesmo peso visual, de propósito:
 * recusar precisa ser tão fácil quanto aceitar. A escolha fica só neste navegador.
 */
export default function CookieBanner() {
  const reduzir = useReducedMotion();
  const [pronto, setPronto] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [painel, setPainel] = useState(false);
  const [estatisticas, setEstatisticas] = useState(false);
  const [pedirFoco, setPedirFoco] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const salvo = lerConsentimento();
    setEstatisticas(salvo?.analytics === true);
    setAberto(salvo === null);
    setPronto(true);

    const reabrir = () => {
      setEstatisticas(lerConsentimento()?.analytics === true);
      setPainel(true);
      setAberto(true);
      setPedirFoco(true);
    };
    window.addEventListener(EVENTO_ABRIR, reabrir);
    return () => window.removeEventListener(EVENTO_ABRIR, reabrir);
  }, []);

  // Quando reaberto pelo rodapé, o foco vai para o aviso (o aviso inicial não rouba o foco da página).
  useEffect(() => {
    if (aberto && pedirFoco) {
      tituloRef.current?.focus();
      setPedirFoco(false);
    }
  }, [aberto, pedirFoco]);

  function decidir(valor: boolean) {
    salvarConsentimento(valor);
    setEstatisticas(valor);
    setPainel(false);
    setAberto(false);
  }

  if (!pronto) return null;

  const movimento = reduzir
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 24 },
        transition: { duration: 0.28 },
      };

  return (
    <AnimatePresence>
      {aberto && (
        <motion.section
          key="aviso-cookies"
          {...movimento}
          role="region"
          aria-labelledby="cookies-titulo"
          className="fixed inset-x-3 bottom-3 z-[70] rounded-3xl border border-white/15 bg-[#0c0c0c]/95 p-5 text-white shadow-[0_20px_80px_rgba(0,0,0,.6)] backdrop-blur md:inset-x-auto md:bottom-6 md:left-6 md:w-[26rem]"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-orange/30 bg-brand-orange/10 text-brand-orange">
              <Cookie className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 id="cookies-titulo" ref={tituloRef} tabIndex={-1} className="text-sm font-bold outline-none">
              Cookies e privacidade
            </h2>
          </div>

          {!painel ? (
            <p className="mt-3 text-xs leading-5 text-white/55">
              Guardamos no seu navegador apenas a sua escolha sobre cookies.{" "}
              {GA_ATIVO
                ? "Os cookies de estatísticas (Google Analytics) só são ativados se você aceitar."
                : "Os cookies de estatísticas (Google Analytics) ainda não estão ativos neste site; quando forem, só serão ligados se você aceitar."}{" "}
              Você pode mudar isso quando quiser em &quot;Preferências de cookies&quot;, no rodapé. Veja a{" "}
              <a
                href="/politica-de-privacidade"
                className="font-semibold text-brand-orange underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-orange"
              >
                Política de Privacidade
              </a>
              .
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4">
                <div>
                  <p className="text-xs font-bold">Necessários</p>
                  <p className="mt-1 text-[11px] leading-5 text-white/45">Lembram a sua escolha de cookies. Ficam sempre ativos.</p>
                </div>
                <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.15em] text-white/40">
                  sempre
                </span>
              </div>

              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4">
                <span>
                  <span className="block text-xs font-bold">Estatísticas (Google Analytics)</span>
                  <span className="mt-1 block text-[11px] leading-5 text-white/45">
                    Mostram, de forma agregada, como o site é usado. {GA_ATIVO ? "" : "Ainda não ativo neste site; sua escolha fica registrada."}
                  </span>
                </span>
                <span className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={estatisticas}
                    onChange={(e) => setEstatisticas(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`block h-6 w-11 rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-orange ${
                      estatisticas ? "border-brand-orange bg-brand-orange" : "border-white/20 bg-white/10"
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${estatisticas ? "left-[22px]" : "left-0.5"}`}
                  />
                </span>
              </label>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!painel ? (
              <>
                <button type="button" onClick={() => decidir(true)} className={`${BOTAO_PRINCIPAL} flex-1 bg-white text-black hover:bg-brand-orange hover:text-white`}>
                  Aceitar todos
                </button>
                <button type="button" onClick={() => decidir(false)} className={`${BOTAO_PRINCIPAL} flex-1 border border-white/25 bg-transparent text-white hover:border-white/60`}>
                  Apenas necessários
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => decidir(estatisticas)} className={`${BOTAO_PRINCIPAL} flex-1 bg-white text-black hover:bg-brand-orange hover:text-white`}>
                  Salvar preferências
                </button>
                <button type="button" onClick={() => setPainel(false)} className={`${BOTAO_PRINCIPAL} flex-1 border border-white/25 bg-transparent text-white hover:border-white/60`}>
                  Voltar
                </button>
              </>
            )}
          </div>
          {!painel && (
            <button
              type="button"
              onClick={() => setPainel(true)}
              className="mt-3 w-full rounded-full text-center text-xs font-semibold text-white/50 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange"
            >
              Personalizar
            </button>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
