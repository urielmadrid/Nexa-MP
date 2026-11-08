"use client";

import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";

const SERVICOS = ["Corte", "Coloração", "Escova e penteados", "Hidratação e tratamentos", "Manicure e pedicure", "Maquiagem"];
const PERIODOS = ["Manhã", "Tarde", "Noite"];

/**
 * Simulador de agendamento: mostra como o cliente do salão montaria a mensagem.
 * Na landing real, o botão abre o WhatsApp do próprio negócio com este texto pronto.
 */
export default function AgendaDemo() {
  const [servico, setServico] = useState(SERVICOS[0]);
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const [enviado, setEnviado] = useState(false);

  const mensagem = `Olá! Quero agendar "${servico}" no período da ${periodo.toLowerCase()}. Quais horários vocês têm?`;

  return (
    <div className="rounded-3xl border border-[#2a1f1c]/10 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(42,31,28,.25)] md:p-8">
      <p className="font-serif text-xl font-bold text-[#2a1f1c]">Monte o seu pedido de horário</p>
      <p className="mt-1 text-sm text-[#2a1f1c]/60">Escolha o serviço e o período. A mensagem sai pronta, é só enviar.</p>

      <fieldset className="mt-6">
        <legend className="text-xs font-bold uppercase tracking-widest text-[#b8586b]">1. Serviço</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {SERVICOS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={servico === s}
              onClick={() => {
                setServico(s);
                setEnviado(false);
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#b8586b] ${
                servico === s
                  ? "border-[#b8586b] bg-[#b8586b] text-white shadow-md"
                  : "border-[#2a1f1c]/15 text-[#2a1f1c]/70 hover:border-[#b8586b]/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-xs font-bold uppercase tracking-widest text-[#b8586b]">2. Período</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {PERIODOS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={periodo === p}
              onClick={() => {
                setPeriodo(p);
                setEnviado(false);
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#b8586b] ${
                periodo === p
                  ? "border-[#2a1f1c] bg-[#2a1f1c] text-white"
                  : "border-[#2a1f1c]/15 text-[#2a1f1c]/70 hover:border-[#2a1f1c]/50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#b8586b]">3. Sua mensagem</p>
        <p className="mt-3 rounded-2xl rounded-tl-sm bg-[#e8f5e1] p-4 text-sm leading-6 text-[#2a1f1c]" aria-live="polite">
          {mensagem}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setEnviado(true)}
        className="cta-press mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2a1f1c] px-6 py-4 text-sm font-bold text-white outline-none transition-colors hover:bg-[#b8586b] focus-visible:ring-2 focus-visible:ring-[#b8586b] focus-visible:ring-offset-2"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Enviar pelo WhatsApp
      </button>

      <p className="mt-3 text-center text-xs leading-5 text-[#2a1f1c]/55" aria-live="polite">
        {enviado ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#b8586b]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Demonstração: na landing real, este botão abre o WhatsApp do seu negócio com a mensagem pronta.
          </span>
        ) : (
          "Modelo de demonstração: nenhuma mensagem é enviada."
        )}
      </p>
    </div>
  );
}
