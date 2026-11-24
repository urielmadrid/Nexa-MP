"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { CONTATO, linkWhatsApp } from "@/src/lib/data/contato";

/**
 * Atalho de WhatsApp para telas grandes (no celular, quem aparece é o botão "Falar com a Nexa MP").
 * Só aparece depois do topo da página e some quando o Contato ou o rodapé já estão na tela,
 * pois lá o WhatsApp já está à vista.
 */
export default function WhatsAppFlutuante() {
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
    const candidatos: Array<Element | null> = [document.getElementById("contato"), document.querySelector("footer")];
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
      href={linkWhatsApp()}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={mostrar ? 0 : -1}
      aria-hidden={!mostrar}
      title={`WhatsApp ${CONTATO.whatsappExibicao}`}
      className={`cta-press group fixed bottom-6 right-6 z-40 hidden items-center gap-2.5 rounded-full border border-brand-orange/50 bg-[#0c0c0c]/90 py-3 pl-3 pr-5 text-sm font-bold text-white shadow-[0_10px_40px_rgba(255,106,0,.28)] outline-none backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange hover:bg-brand-orange focus-visible:ring-2 focus-visible:ring-white md:flex ${
        mostrar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-orange text-white transition-colors group-hover:bg-white group-hover:text-brand-orange">
        <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      Chamar no WhatsApp
      <span className="sr-only">(abre em uma nova aba)</span>
    </a>
  );
}
