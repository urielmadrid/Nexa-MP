"use client";

import { abrirPreferenciasDeCookies } from "@/src/lib/consentimento";

/** Botão do rodapé para a pessoa rever a escolha de cookies quando quiser. */
export default function CookiePreferenciasLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={abrirPreferenciasDeCookies} className={className}>
      Preferências de cookies
    </button>
  );
}
