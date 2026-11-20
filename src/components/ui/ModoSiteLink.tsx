"use client";

import { abrirEscolhaModo, useModoSite } from "@/src/lib/modoSite";

/** Botão do rodapé para a pessoa trocar entre o modo completo e o modo leve quando quiser. */
export default function ModoSiteLink({ className = "" }: { className?: string }) {
  const modo = useModoSite();
  return (
    <button type="button" onClick={abrirEscolhaModo} className={className}>
      Modo do site{modo === "pendente" ? "" : `: ${modo}`}
    </button>
  );
}