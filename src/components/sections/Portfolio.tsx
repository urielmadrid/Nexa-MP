"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { X } from "lucide-react";
import { PROJETOS, type Projeto } from "@/src/lib/data/projetos";

const CAMPOS = [
  { chave: "problema" as const, label: "Problema" },
  { chave: "solucao" as const, label: "Solução" },
  { chave: "resultado" as const, label: "Resultado" },
];

function CantosHUD() {
  const base = "absolute h-3 w-3 border-brand-orange/60";
  return (
    <>
      <span className={`${base} left-2 top-2 border-l-2 border-t-2`} />
      <span className={`${base} right-2 top-2 border-r-2 border-t-2`} />
      <span className={`${base} bottom-2 left-2 border-b-2 border-l-2`} />
      <span className={`${base} bottom-2 right-2 border-b-2 border-r-2`} />
    </>
  );
}

function Imagem({ projeto }: { projeto: Projeto }) {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-white/[0.03]">
      {projeto.imagem ? (
        <Image
          src={projeto.imagem}
          alt={projeto.nome}
          fill
          className="object-cover"
        />
      ) : (
        <span className="font-mono text-xs text-white/25">
          Imagem em breve
        </span>
      )}
    </div>
  );
}

export default function Portfolio() {
  const [aberto, setAberto] = useState<number | null>(null);
  const projeto = aberto !== null ? PROJETOS[aberto] : null;

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(null);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <LayoutGroup>
      <section id="projetos" className="relative overflow-hidden bg-brand-black py-24">
                <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="glow-blob pointer-events-none absolute -top-10 right-[10%] h-[22rem] w-[22rem] rounded-full bg-brand-orange/20 blur-3xl" style={{ animationDelay: "3s" }} aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-brand-orange">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-orange" />
              </span>
              Projetos
            </span>
            <h2 className="mt-6 text-3xl font-extrabold leading-tight text-white md:text-4xl">
              Cada projeto é um caso — do problema ao resultado
            </h2>
            <p className="mt-4 text-white/60">
              Toque em um caso pra abrir o dossiê completo.
            </p>
          </div>

          {PROJETOS.length > 0 ? (
            <div className="mt-14 flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {PROJETOS.map((p, index) => (
              <motion.button
                key={p.id}
                type="button"
                layoutId={`caso-${index}`}
                onClick={() => setAberto(index)}
                style={{ opacity: aberto === index ? 0 : 1 }}
                className="group relative w-72 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#141414] text-left"
              >
                <CantosHUD />
                <Imagem projeto={p} />
                <div className="p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-orange/70">
                    Caso_{String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 font-bold text-white/50">{p.nome}</h3>
                  <p className="text-xs text-white/35">{p.segmento}</p>
                </div>
              </motion.button>
              ))}
            </div>
          ) : (
            <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-orange/70">
                Portfólio em construção
              </p>
              <h3 className="mt-3 text-2xl font-bold text-white">
                Cases reais, publicados somente quando houver dados para mostrar.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                A Nexa MP não usa projetos fictícios, números estimados ou resultados inventados como prova social.
                Enquanto os primeiros cases públicos não estiverem disponíveis, prefira conhecer os serviços e conversar sobre o seu cenário.
              </p>
              <a href="#contato" className="mt-6 inline-flex items-center rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                Conversar sobre meu projeto
              </a>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {projeto && aberto !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setAberto(null)}
          >
            <motion.div
              layoutId={`caso-${aberto}`}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-brand-orange/30 bg-[#141414]"
            >
              <CantosHUD />

              <button
                type="button"
                onClick={() => setAberto(null)}
                className="absolute right-4 top-4 z-10 text-white/60 transition-colors hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>

              <Imagem projeto={projeto} />

              <div className="p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-orange/70">
                  Caso_{String(aberto + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-xl font-bold text-white/60">
                  {projeto.nome}
                </h3>
                <p className="text-sm text-white/35">{projeto.segmento}</p>

                <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
                  {CAMPOS.map((campo) => (
                    <div key={campo.chave}>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-orange">
                          {campo.label}
                        </p>
                      </div>
                      <p className="mt-1 pl-3.5 text-sm text-white/70">
                        {projeto[campo.chave]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}