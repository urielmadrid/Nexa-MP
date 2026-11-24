"use client";

import { useMemo, useState } from "react";
import { STATUS_LEAD, type LeadCrm, type PastaCrm, type StatusLead } from "@/src/lib/crm/tipos";
import type { Temperatura } from "@/src/lib/crm/recomendar";
import { hojeIso } from "@/src/lib/crm/operacoes";
import { Icone, SeloStatus, SeloTemperatura, formatarData, formatarDataCurta } from "@/src/components/crm/ui";
import type { MapaRecs } from "@/src/components/crm/uteis";

type Props = {
  leads: LeadCrm[];
  recs: MapaRecs;
  pastas: PastaCrm[];
  agora: Date;
  aoAbrir: (id: string) => void;
  aoMudarStatusEmLote: (ids: string[], status: StatusLead) => void;
  aoMoverEmLote: (ids: string[], pastaId: string | null) => void;
  aoExportarSelecao: (ids: string[]) => void;
};

type Ordem = "entrada" | "nome" | "prioridade" | "status" | "retorno";
const POR_PAGINA = 100;
const ORDEM_TEMP: Record<Temperatura, number> = { quente: 0, morno: 1, frio: 2 };

export default function ListaLeads({ leads, recs, pastas, agora, aoAbrir, aoMudarStatusEmLote, aoMoverEmLote, aoExportarSelecao }: Props) {
  const [ordem, setOrdem] = useState<Ordem>("entrada");
  const [asc, setAsc] = useState(false);
  const [fStatus, setFStatus] = useState<"" | StatusLead>("");
  const [fTemp, setFTemp] = useState<"" | Temperatura>("");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [limite, setLimite] = useState(POR_PAGINA);
  const hoje = hojeIso(agora);

  const filtrados = useMemo(() => {
    const lista = leads.filter((l) => (fStatus === "" || l.status === fStatus) && (fTemp === "" || recs.get(l.id)?.temperatura === fTemp));
    const dir = asc ? 1 : -1;
    const ordemStatus = (s: StatusLead) => STATUS_LEAD.findIndex((x) => x.id === s);
    lista.sort((a, b) => {
      let c = 0;
      if (ordem === "entrada") c = a.criadoEm.localeCompare(b.criadoEm);
      else if (ordem === "nome") c = a.nome.localeCompare(b.nome, "pt-BR");
      else if (ordem === "status") c = ordemStatus(a.status) - ordemStatus(b.status);
      else if (ordem === "retorno") c = (a.proximoContato ?? "9999").localeCompare(b.proximoContato ?? "9999");
      else c = (ORDEM_TEMP[recs.get(b.id)?.temperatura ?? "frio"] - ORDEM_TEMP[recs.get(a.id)?.temperatura ?? "frio"]) || (recs.get(a.id)?.pontos ?? 0) - (recs.get(b.id)?.pontos ?? 0);
      return c * dir || a.id.localeCompare(b.id);
    });
    return lista;
  }, [leads, recs, ordem, asc, fStatus, fTemp]);

  const visiveis = filtrados.slice(0, limite);
  const idsSelecionados = filtrados.filter((l) => selecionados.has(l.id)).map((l) => l.id);
  const todosMarcados = visiveis.length > 0 && visiveis.every((l) => selecionados.has(l.id));

  function ordenarPor(o: Ordem) {
    if (o === ordem) setAsc((a) => !a);
    else {
      setOrdem(o);
      setAsc(o === "nome" || o === "retorno" || o === "status");
    }
  }
  const seta = (o: Ordem) => (ordem === o ? (asc ? " ▲" : " ▼") : "");
  const ariaOrdem = (o: Ordem): "ascending" | "descending" | "none" => (ordem === o ? (asc ? "ascending" : "descending") : "none");

  function alternar(id: string) {
    setSelecionados((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function alternarTodos() {
    setSelecionados((s) => {
      const n = new Set(s);
      if (todosMarcados) visiveis.forEach((l) => n.delete(l.id));
      else visiveis.forEach((l) => n.add(l.id));
      return n;
    });
  }

  return (
    <div>
      <div className="crm-filtros">
        <label className="crm-sr" htmlFor="crm-f-status">Filtrar por etapa</label>
        <select id="crm-f-status" className="crm-select" value={fStatus} onChange={(e) => { setFStatus(e.target.value as "" | StatusLead); setLimite(POR_PAGINA); }}>
          <option value="">Todas as etapas</option>
          {STATUS_LEAD.map((s) => (
            <option key={s.id} value={s.id}>{s.rotulo}</option>
          ))}
        </select>
        <label className="crm-sr" htmlFor="crm-f-temp">Filtrar por temperatura</label>
        <select id="crm-f-temp" className="crm-select" value={fTemp} onChange={(e) => { setFTemp(e.target.value as "" | Temperatura); setLimite(POR_PAGINA); }}>
          <option value="">Todas as temperaturas</option>
          <option value="quente">Quentes</option>
          <option value="morno">Mornos</option>
          <option value="frio">Frios</option>
        </select>
        <span className="crm-sub" style={{ marginLeft: "auto" }}>
          {filtrados.length} lead(s)
        </span>
      </div>

      {idsSelecionados.length > 0 ? (
        <div className="crm-acoes-massa" role="region" aria-label="Ações para os leads marcados">
          <b>{idsSelecionados.length} marcado(s)</b>
          <label className="crm-sr" htmlFor="crm-massa-status">Mudar etapa dos marcados</label>
          <select id="crm-massa-status" className="crm-select" value="" onChange={(e) => { if (e.target.value) { aoMudarStatusEmLote(idsSelecionados, e.target.value as StatusLead); } }}>
            <option value="">Mudar etapa para…</option>
            {STATUS_LEAD.map((s) => (
              <option key={s.id} value={s.id}>{s.rotulo}</option>
            ))}
          </select>
          <label className="crm-sr" htmlFor="crm-massa-pasta">Mover os marcados para a pasta</label>
          <select id="crm-massa-pasta" className="crm-select" value="" onChange={(e) => { if (e.target.value) aoMoverEmLote(idsSelecionados, e.target.value === "__nenhuma" ? null : e.target.value); }}>
            <option value="">Mover para a pasta…</option>
            <option value="__nenhuma">(Sem pasta)</option>
            {pastas.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <button type="button" className="crm-btn crm-btn-mini" onClick={() => aoExportarSelecao(idsSelecionados)}>
            <Icone nome="baixar" tamanho={13} /> Exportar CSV
          </button>
          <button type="button" className="crm-btn crm-btn-mini" onClick={() => setSelecionados(new Set())}>
            Limpar seleção
          </button>
        </div>
      ) : null}

      {filtrados.length === 0 ? (
        <div className="crm-vazio">
          <h3>Nenhum lead encontrado</h3>
          <p>Tente limpar a busca ou os filtros, ou escolha outra lista ou pasta na barra lateral.</p>
        </div>
      ) : (
        <div className="crm-tabela-caixa">
          <table className="crm-tabela">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" className="crm-check" checked={todosMarcados} onChange={alternarTodos} aria-label="Marcar todos os leads visíveis" />
                </th>
                <th aria-sort={ariaOrdem("nome")}><button type="button" onClick={() => ordenarPor("nome")}>Lead{seta("nome")}</button></th>
                <th>O que precisa (sistema)</th>
                <th aria-sort={ariaOrdem("prioridade")}><button type="button" onClick={() => ordenarPor("prioridade")}>Temperatura{seta("prioridade")}</button></th>
                <th aria-sort={ariaOrdem("status")}><button type="button" onClick={() => ordenarPor("status")}>Etapa{seta("status")}</button></th>
                <th>Pasta</th>
                <th aria-sort={ariaOrdem("retorno")}><button type="button" onClick={() => ordenarPor("retorno")}>Retorno{seta("retorno")}</button></th>
                <th aria-sort={ariaOrdem("entrada")}><button type="button" onClick={() => ordenarPor("entrada")}>Entrada{seta("entrada")}</button></th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((l) => {
                const r = recs.get(l.id);
                const pasta = pastas.find((p) => p.id === l.pastaId);
                const atrasado = l.proximoContato !== null && l.proximoContato < hoje;
                return (
                  <tr key={l.id} onClick={() => aoAbrir(l.id)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="crm-check" checked={selecionados.has(l.id)} onChange={() => alternar(l.id)} aria-label={`Marcar ${l.nome}`} />
                    </td>
                    <td>
                      <button type="button" style={{ all: "unset", cursor: "pointer", display: "block" }} onClick={(e) => { e.stopPropagation(); aoAbrir(l.id); }}>
                        <strong>{l.nome}</strong>
                      </button>
                      <small>{l.empresa ?? "Sem empresa informada"}</small>
                    </td>
                    <td style={{ maxWidth: 300 }}>{r ? <span className="crm-tag-sistema">{r.tag}</span> : null}</td>
                    <td>{r ? <SeloTemperatura temperatura={r.temperatura} /> : null}</td>
                    <td><SeloStatus status={l.status} /></td>
                    <td>
                      {pasta ? (
                        <span className="crm-selo"><i style={{ background: pasta.cor }} />{pasta.nome}</span>
                      ) : (
                        <small>—</small>
                      )}
                    </td>
                    <td style={{ color: atrasado ? "#ff9a7a" : undefined, whiteSpace: "nowrap" }}>{l.proximoContato ? formatarDataCurta(l.proximoContato) : <small>—</small>}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatarData(l.criadoEm)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtrados.length > limite ? (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button type="button" className="crm-btn" onClick={() => setLimite((n) => n + POR_PAGINA)}>
            Mostrar mais ({filtrados.length - limite} restantes)
          </button>
        </div>
      ) : null}
    </div>
  );
}