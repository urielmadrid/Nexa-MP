"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

/**
 * Botão fixo para telas pequenas: mantém o caminho até o contato sempre à mão,
 * mas só aparece depois do topo da página e some quando o contato/rodapé já está visível.
 */
export default function CtaFlutuante() {
  const [passouDoTopo, setPassouDoTopo] = useState(false);
  const [alvoVisivel, setAlvoVisivel] = useState(false);

  useEffect(() => {
    const onScroll = () => setPassouDoTopo(window.scrollY > 700);
    const frame = requestAnimationFrame(onScroll); // cobre páginas recarregadas no meio
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const candidatos: Array<Element | null> = [
      document.getElementById("contato"),
      document.querySelector("footer"),
    ];
    const alvos = candidatos.filter((el): el is Element => el !== null);
    if (alvos.length === 0) return;

    const visiveis = new Set<Element>();
    const observer = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) visiveis.add(entrada.target);
        else visiveis.delete(entrada.target);
      }
      setAlvoVisivel(visiveis.size > 0);
    });
    alvos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const mostrar = passouDoTopo && !alvoVisivel;

  return (
    <a
      href="#contato"
      tabIndex={mostrar ? 0 : -1}
      aria-hidden={!mostrar}
      className={`cta-press fixed inset-x-4 bottom-4 z-40 flex items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_40px_rgba(255,106,0,.35)] transition-all duration-300 md:hidden ${
        mostrar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      Falar com a Nexa MP <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
