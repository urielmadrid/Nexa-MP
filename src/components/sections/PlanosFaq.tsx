import { Plus } from "lucide-react";
import { FAQ_PLANOS } from "@/src/lib/data/planos";

/** Dúvidas antes de contratar: usa <details> nativo (abre e fecha sem estado em React). */
export default function PlanosFaq() {
  return (
    <div className="mt-20 grid gap-10 md:mt-28 md:grid-cols-[.7fr_1.3fr] md:gap-16">
      <div>
        <p className="nexa-label">antes de decidir</p>
        <h3 className="nexa-display mt-4 text-3xl font-black leading-[.98] md:text-4xl">
          Prazos e pagamento, <span className="text-white/25">sem surpresa.</span>
        </h3>
        <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
          As condições abaixo valem para os planos. Qualquer outra dúvida, a gente responde na conversa inicial.
        </p>
      </div>

      <div className="divide-y divide-white/10 border-y border-white/10">
        {FAQ_PLANOS.map((item) => (
          <details key={item.pergunta} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 text-left text-sm font-semibold text-white outline-none transition-colors hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange [&::-webkit-details-marker]:hidden">
              {item.pergunta}
              <Plus
                className="h-4 w-4 shrink-0 text-brand-orange transition-transform duration-300 group-open:rotate-45"
                aria-hidden="true"
              />
            </summary>
            <div className="space-y-3 pr-8 text-sm leading-6 text-white/60">
              {item.resposta.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
            </div>
            {item.exemplo && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 pr-6">
                <p className="nexa-label">exemplo</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/75">{item.exemplo.titulo}</p>
                <ul className="mt-3 space-y-2">
                  {item.exemplo.linhas.map((linha) => (
                    <li key={linha} className="flex items-start gap-3 text-sm leading-6 text-white/65">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-brand-orange" aria-hidden="true" />
                      {linha}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.complemento && (
              <div className="mt-4 space-y-3 pr-8 text-sm leading-6 text-white/60">
                {item.complemento.map((paragrafo) => (
                  <p key={paragrafo}>{paragrafo}</p>
                ))}
              </div>
            )}
            <div className="pb-4" />
          </details>
        ))}
      </div>
    </div>
  );
}
