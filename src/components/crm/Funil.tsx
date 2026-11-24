"use client";

import { useMemo, useState } from "react";
import { STATUS_LEAD, type LeadCrm, type PastaCrm, type StatusLead } from "@/src/lib/crm/tipos";
import { haQuantoTempo, SeloTemperatura } from "@/src/components/crm/ui";
import type { MapaRecs } from "@/src/components/crm/uteis";

type Props = {
  leads: LeadCrm[];
  recs: MapaRecs;
  pastas: PastaCrm[];
  agora: Date;
  aoAbrir: (id: string) => void;
  aoMudarStatus: (id: string, status: StatusLead) => void;
};

const TIPO_ARRASTE = "text/x-nexa-lead";
const COR_TEMP = { quente: "#ff5a3c", morno: "#ffb020", frio: "#5aa9ff" } as const;

export default function Funil({ leads, recs, pastas, agora, aoAbrir, aoMudarStatus }: Props) {
  const [alvo, setAlvo] = useState<StatusLead | null>(null);

  const colunas = useMemo(
    () =>
      STATUS_LEAD.map((s) => ({
        ...s,
        leads: leads
          .filter((l) => l.status === s.id)
          .sort((a, b) => (recs.get(b.id)?.pontos ?? 0) - (recs.get(a.id)?.pontos ?? 0) || b.criadoEm.localeCompare(a.criadoEm)),
      })),
    [leads, recs],
  );

  if (leads.length === 0) {
    return (
      <div className="crm-vazio">
        <h3>Nenhum lead aqui</h3>
        <p>Quando houver leads nesta seleção, eles aparecem organizados por etapa. Arraste um cartão para outra coluna para mudar a etapa.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="crm-sub" style={{ marginBottom: 8 }}>
        Arraste os cartões entre as colunas (ou use o seletor de cada cartão no celular). Dentro de cada coluna, os mais prioritários ficam no topo.
      </p>
      <div className="crm-legenda-temp" aria-label="Significado da faixa colorida dos cartões">
        <span>Faixa à esquerda do cartão:</span>
        <span><i style={{ background: "#ff5a3c" }} /> quente</span>
        <span><i style={{ background: "#ffb020" }} /> morno</span>
        <span><i style={{ background: "#5aa9ff" }} /> frio</span>
      </div>
      <div className="crm-kanban">
        {colunas.map((c) => (
          <section
            key={c.id}
            className="crm-coluna"
            data-alvo={alvo === c.id}
            aria-label={`${c.rotulo}: ${c.leads.length} lead(s)`}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes(TIPO_ARRASTE)) {
                e.preventDefault();
                setAlvo(c.id);
              }
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setAlvo((a) => (a === c.id ? null : a));
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData(TIPO_ARRASTE);
              setAlvo(null);
              if (id) aoMudarStatus(id, c.id);
            }}
          >
            <div className="crm-coluna-topo">
              <span className="crm-bolinha" style={{ background: c.cor }} />
              <span>{c.rotulo}</span>
              <span>{c.leads.length}</span>
            </div>
            {c.leads.map((l) => {
              const r = recs.get(l.id);
              const pasta = pastas.find((p) => p.id === l.pastaId);
              return (
                <article
                  key={l.id}
                  className="crm-cartao"
                  style={{ borderLeft: `3px solid ${r ? COR_TEMP[r.temperatura] : "transparent"}` }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(TIPO_ARRASTE, l.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setAlvo(null)}
                >
                  <button type="button" onClick={() => aoAbrir(l.id)} style={{ all: "unset", display: "block", width: "100%", cursor: "pointer" }} aria-label={`Abrir ${l.nome}`}>
                    <strong>{l.nome}</strong>
                    <span className="crm-sub" style={{ display: "block" }}>
                      {l.empresa ?? "Sem empresa informada"}
                    </span>
                    {r ? <span className="crm-tag-sistema">{r.tag}</span> : null}
                  </button>
                  <div className="crm-cartao-rodape">
                    {r ? <SeloTemperatura temperatura={r.temperatura} /> : null}
                    {pasta ? (
                      <span className="crm-selo" title={`Pasta: ${pasta.nome}`}>
                        <i style={{ background: pasta.cor }} />
                        {pasta.nome.length > 14 ? `${pasta.nome.slice(0, 13)}…` : pasta.nome}
                      </span>
                    ) : null}
                    <span style={{ marginLeft: "auto" }}>{haQuantoTempo(l.criadoEm, agora)}</span>
                  </div>
                  <label className="crm-sr" htmlFor={`mv-${l.id}`}>
                    Mover {l.nome} para
                  </label>
                  <select id={`mv-${l.id}`} className="crm-select" style={{ width: "100%", marginTop: 8, padding: "4px 8px", fontSize: 12 }} value={l.status} onChange={(e) => aoMudarStatus(l.id, e.target.value as StatusLead)}>
                    {STATUS_LEAD.map((s) => (
                      <option key={s.id} value={s.id}>
                        Etapa: {s.rotulo}
                      </option>
                    ))}
                  </select>
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}