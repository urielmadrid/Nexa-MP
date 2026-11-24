"use client";

import { salvarModo, useModoSite, type ModoSite } from "@/src/lib/modoSite";

const OPCOES: Array<{ modo: ModoSite; rotulo: string; dica: string }> = [
  { modo: "completo", rotulo: "Completo", dica: "Modo completo: todas as animações e efeitos" },
  { modo: "leve", rotulo: "Leve", dica: "Modo leve: menos animações e efeitos, para aparelhos mais antigos" },
];

/**
 * Chave "Completo | Leve" para a barra do topo e o menu do celular. Troca o modo na hora e guarda a escolha.
 * Enquanto a pessoa ainda não escolheu, nenhum dos dois aparece marcado.
 */
export default function SeletorModo({ className = "" }: { className?: string }) {
  const atual = useModoSite();
  return (
    <div role="group" aria-label="Modo do site" className={`inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-0.5 ${className}`}>
      {OPCOES.map(({ modo, rotulo, dica }) => {
        const marcado = atual === modo;
        return (
          <button
            key={modo}
            type="button"
            title={dica}
            aria-pressed={marcado}
            onClick={() => salvarModo(modo)}
            className={`flex-1 rounded-[10px] px-3 py-1.5 text-xs font-semibold ${
              marcado ? "bg-brand-orange text-white" : "text-white/60 hover:text-white"
            }`}
          >
            {rotulo}
          </button>
        );
      })}
    </div>
  );
}