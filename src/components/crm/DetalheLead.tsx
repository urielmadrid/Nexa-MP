"use client";

import { useEffect, useRef, useState } from "react";
import { DIAGNOSTICO } from "@/src/lib/formulario/diagnostico";
import { hojeIso, limparTag, novoEvento, comEvento, mudarStatus, moverParaPasta } from "@/src/lib/crm/operacoes";
import { ROTULO_SERVICO, respostaLegivel, type Recomendacao } from "@/src/lib/crm/recomendar";
import { linkWhatsapp, mostrarTelefone, normalizarWhatsapp } from "@/src/lib/crm/telefone";
import { STATUS_LEAD, type LeadCrm, type PastaCrm, type StatusLead } from "@/src/lib/crm/tipos";
import { Icone, SeloStatus, SeloTemperatura, formatarDataCurta, formatarDataHora } from "@/src/components/crm/ui";
import { somarDias } from "@/src/components/crm/uteis";

type Props = {
  lead: LeadCrm;
  rec: Recomendacao;
  pastas: PastaCrm[];
  agora: Date;
  aoAlterar: (lead: LeadCrm) => void;
  aoExcluir: (id: string) => void;
  aoFechar: () => void;
};

const PERGUNTAS_EXIBIDAS = DIAGNOSTICO.etapas.flatMap((e) => e.perguntas).filter((p) => p.campoLead === undefined);

function valorPlano(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR")}`;
}

export default function DetalheLead({ lead, rec, pastas, agora, aoAlterar, aoExcluir, aoFechar }: Props) {
  const [nota, setNota] = useState("");
  const [novaTag, setNovaTag] = useState("");
  const [editando, setEditando] = useState(false);
  const [confirmaExcluir, setConfirmaExcluir] = useState(false);
  const [form, setForm] = useState({ nome: lead.nome, empresa: lead.empresa ?? "", email: lead.email ?? "", whatsapp: lead.whatsappE164 ?? "" });
  const [erroForm, setErroForm] = useState("");
  const fecharRef = useRef<HTMLButtonElement>(null);
  const hoje = hojeIso(agora);

  useEffect(() => {
    fecharRef.current?.focus();
  }, []);

  function addNota() {
    const t = nota.trim();
    if (!t) return;
    aoAlterar(comEvento(lead, novoEvento("nota", t.slice(0, 2000))));
    setNota("");
  }

  function addTag() {
    const t = limparTag(novaTag);
    setNovaTag("");
    if (!t || lead.tags.some((x) => x.toLowerCase() === t.toLowerCase()) || lead.tags.length >= 20) return;
    aoAlterar({ ...lead, tags: [...lead.tags, t], atualizadoEm: new Date().toISOString() });
  }

  function marcarContato() {
    let l = comEvento(lead, novoEvento("contato", "Contato feito com o lead"));
    if (l.status === "novo") l = mudarStatus(l, "em_contato");
    aoAlterar(l);
  }

  function definirRetorno(data: string | null) {
    const evento = novoEvento("sistema", data ? `Próximo contato marcado para ${formatarDataCurta(data)}` : "Próximo contato removido");
    aoAlterar({ ...comEvento(lead, evento), proximoContato: data });
  }

  function salvarContatos() {
    const nome = form.nome.trim();
    if (!nome) return setErroForm("O nome não pode ficar vazio.");
    const emailLimpo = form.email.trim().toLowerCase();
    if (emailLimpo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) return setErroForm("O e-mail parece inválido.");
    let whats: string | null = null;
    if (form.whatsapp.trim()) {
      whats = normalizarWhatsapp(form.whatsapp);
      if (!whats) return setErroForm("O WhatsApp parece inválido. Use DDD + número, por exemplo (53) 99123-4567.");
    }
    setErroForm("");
    aoAlterar({
      ...comEvento(lead, novoEvento("sistema", "Dados de contato editados")),
      nome: nome.slice(0, 120),
      empresa: form.empresa.trim().slice(0, 120) || null,
      email: emailLimpo || null,
      whatsappE164: whats,
    });
    setEditando(false);
  }

  const fonteRotulo = lead.fonte === "exemplo" ? "Exemplo (fictício)" : lead.fonte === "manual" ? "Cadastro manual" : "Formulário do site";

  return (
    <>
      <div className="crm-fundo" onClick={aoFechar} />
      <aside className="crm-gaveta" role="dialog" aria-modal="true" aria-label={`Detalhes de ${lead.nome}`}>
        <div className="crm-gaveta-topo">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{lead.nome}</h2>
            <p className="crm-sub">{lead.empresa ?? "Sem empresa informada"}</p>
            <div className="crm-acoes-linha" style={{ marginTop: 8 }}>
              <SeloStatus status={lead.status} />
              <SeloTemperatura temperatura={rec.temperatura} />
              <span className="crm-selo">{fonteRotulo}</span>
            </div>
          </div>
          <button ref={fecharRef} type="button" className="crm-icone-btn" onClick={aoFechar} aria-label="Fechar detalhes">
            <Icone nome="x" tamanho={18} />
          </button>
        </div>

        <div className="crm-acoes-linha" style={{ marginTop: 14 }}>
          {lead.whatsappE164 ? (
            <a className="crm-btn crm-btn-p" href={linkWhatsapp(lead.whatsappE164)} target="_blank" rel="noopener noreferrer">
              <Icone nome="whats" /> WhatsApp
            </a>
          ) : null}
          {lead.email ? (
            <a className="crm-btn" href={`mailto:${lead.email}`}>
              <Icone nome="email" /> E-mail
            </a>
          ) : null}
          <button type="button" className="crm-btn" onClick={marcarContato}>
            <Icone nome="ok" /> Registrar contato feito
          </button>
        </div>

        <section className="crm-bloco crm-sugestao" aria-label="Sugestão do sistema">
          <h4>O que o sistema acha que ele precisa</h4>
          <span className="crm-tag-sistema">{rec.tag}</span>
          {rec.plano ? (
            <p style={{ margin: "10px 0 0", fontSize: 13 }}>
              Plano que mais se encaixa: <b>{rec.plano.nome}</b> ({valorPlano(rec.plano.valor)}
              {rec.plano.recorrente ? "/mês" : ", pagamento único"})
            </p>
          ) : null}
          {rec.tambemPrecisa.length > 0 ? (
            <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "var(--suave)" }}>Também precisa de: {rec.tambemPrecisa.map((s) => ROTULO_SERVICO[s]).join(", ")}</p>
          ) : null}
          <p style={{ margin: "10px 0 0", fontSize: 13 }}>
            <b>Próximo passo:</b> {rec.proximoPasso}
          </p>
          {rec.alertas.length > 0 ? (
            <ul className="crm-lista-simples alerta">
              {rec.alertas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          ) : null}
          <details style={{ marginTop: 10 }}>
            <summary style={{ cursor: "pointer", color: "var(--suave)", fontSize: 12.5 }}>Por que o sistema chegou nisso</summary>
            <ul className="crm-lista-simples">
              {rec.motivos.map((m) => (
                <li key={m}>{m}</li>
              ))}
              {rec.motivosTemperatura.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <p style={{ margin: "8px 0 0", color: "var(--fraco)", fontSize: 11.5 }}>Sugestão automática por regras simples, a partir das respostas. A equipe decide.</p>
          </details>
        </section>

        <section className="crm-bloco" aria-label="Organização">
          <h4>Organização</h4>
          <div className="crm-campos">
            <label className="crm-campo">
              Etapa
              <select value={lead.status} onChange={(e) => aoAlterar(mudarStatus(lead, e.target.value as StatusLead))}>
                {STATUS_LEAD.map((s) => (
                  <option key={s.id} value={s.id}>{s.rotulo}</option>
                ))}
              </select>
            </label>
            <label className="crm-campo">
              Pasta
              <select value={lead.pastaId ?? ""} onChange={(e) => aoAlterar(moverParaPasta(lead, pastas.find((p) => p.id === e.target.value) ?? null))}>
                <option value="">(Sem pasta)</option>
                {pastas.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </label>
            <label className="crm-campo crm-campo-largo">
              Próximo contato
              <input type="date" value={lead.proximoContato ?? ""} min="2020-01-01" max="2100-12-31" onChange={(e) => definirRetorno(e.target.value || null)} />
            </label>
          </div>
          <div className="crm-acoes-linha" style={{ marginTop: 8 }}>
            <button type="button" className="crm-btn crm-btn-mini" onClick={() => definirRetorno(hoje)}>Hoje</button>
            <button type="button" className="crm-btn crm-btn-mini" onClick={() => definirRetorno(somarDias(hoje, 1))}>Amanhã</button>
            <button type="button" className="crm-btn crm-btn-mini" onClick={() => definirRetorno(somarDias(hoje, 3))}>Em 3 dias</button>
            <button type="button" className="crm-btn crm-btn-mini" onClick={() => definirRetorno(somarDias(hoje, 7))}>Em 7 dias</button>
            {lead.proximoContato ? (
              <button type="button" className="crm-btn crm-btn-mini" onClick={() => definirRetorno(null)}>Remover</button>
            ) : null}
          </div>

          <h4 style={{ marginTop: 16 }}>Etiquetas da equipe</h4>
          <div className="crm-marcas">
            {lead.tags.length === 0 ? <span className="crm-sub">Nenhuma ainda.</span> : null}
            {lead.tags.map((t) => (
              <span key={t} className="crm-tag">
                {t}
                <button type="button" aria-label={`Remover etiqueta ${t}`} onClick={() => aoAlterar({ ...lead, tags: lead.tags.filter((x) => x !== t), atualizadoEm: new Date().toISOString() })}>
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="crm-acoes-linha" style={{ marginTop: 8 }}>
            <label className="crm-sr" htmlFor="crm-nova-tag">Nova etiqueta</label>
            <input
              id="crm-nova-tag"
              className="crm-select"
              style={{ flex: 1, minWidth: 140 }}
              placeholder="Nova etiqueta (ex.: indicação)"
              value={novaTag}
              maxLength={30}
              onChange={(e) => setNovaTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button type="button" className="crm-btn crm-btn-mini" onClick={addTag}>Adicionar</button>
          </div>
        </section>

        <section className="crm-bloco" aria-label="Contato">
          <h4>Contato</h4>
          {editando ? (
            <>
              <div className="crm-campos">
                <label className="crm-campo">Nome<input value={form.nome} maxLength={120} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></label>
                <label className="crm-campo">Empresa<input value={form.empresa} maxLength={120} onChange={(e) => setForm({ ...form, empresa: e.target.value })} /></label>
                <label className="crm-campo">E-mail<input type="email" value={form.email} maxLength={254} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                <label className="crm-campo">WhatsApp<input value={form.whatsapp} maxLength={30} placeholder="(53) 99123-4567" onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></label>
              </div>
              <p className="crm-erro" role="alert">{erroForm}</p>
              <div className="crm-acoes-linha">
                <button type="button" className="crm-btn crm-btn-p crm-btn-mini" onClick={salvarContatos}>Salvar</button>
                <button type="button" className="crm-btn crm-btn-mini" onClick={() => { setEditando(false); setErroForm(""); }}>Cancelar</button>
              </div>
            </>
          ) : (
            <>
              <dl className="crm-resp">
                <dt>E-mail</dt><dd>{lead.email ?? "—"}</dd>
                <dt>WhatsApp</dt><dd>{lead.whatsappE164 ? mostrarTelefone(lead.whatsappE164) : "—"}</dd>
                <dt>Prefere ser contatado por</dt><dd>{lead.canalPreferido === "whatsapp" ? "WhatsApp" : lead.canalPreferido === "email" ? "E-mail" : lead.canalPreferido === "ambos" ? "Os dois" : "—"}</dd>
                <dt>Entrou em</dt><dd>{formatarDataHora(lead.criadoEm)}</dd>
              </dl>
              <button type="button" className="crm-btn crm-btn-mini" style={{ marginTop: 10 }} onClick={() => { setForm({ nome: lead.nome, empresa: lead.empresa ?? "", email: lead.email ?? "", whatsapp: lead.whatsappE164 ?? "" }); setEditando(true); }}>
                <Icone nome="lapis" tamanho={13} /> Editar contato
              </button>
            </>
          )}
        </section>

        <section className="crm-bloco" aria-label="Respostas do diagnóstico">
          <h4>Respostas do diagnóstico</h4>
          {lead.respostas.length === 0 ? (
            <p className="crm-sub">Este lead não tem respostas do formulário.</p>
          ) : (
            <dl className="crm-resp">
              {PERGUNTAS_EXIBIDAS.map((p) => {
                const v = respostaLegivel(lead, p.codigo);
                return v ? (
                  <FragmentoResposta key={p.codigo} pergunta={p.rotulo} resposta={v} />
                ) : null;
              })}
            </dl>
          )}
          {lead.origem ? (
            <p style={{ margin: "12px 0 0", color: "var(--fraco)", fontSize: 11.5 }}>
              Origem: {[lead.origem.pagina, lead.origem.utmSource && `utm_source=${lead.origem.utmSource}`, lead.origem.utmMedium && `utm_medium=${lead.origem.utmMedium}`, lead.origem.utmCampaign && `utm_campaign=${lead.origem.utmCampaign}`, lead.origem.referrer && `veio de ${lead.origem.referrer}`].filter(Boolean).join(" · ") || "sem informação"}
            </p>
          ) : null}
        </section>

        <section className="crm-bloco" aria-label="Notas e histórico">
          <h4>Notas e histórico</h4>
          <label className="crm-sr" htmlFor="crm-nota">Escrever uma nota</label>
          <textarea id="crm-nota" className="crm-select" style={{ width: "100%", minHeight: 70, resize: "vertical" }} placeholder="Escreva o que foi combinado, dúvidas do cliente, motivo de perda…" value={nota} maxLength={2000} onChange={(e) => setNota(e.target.value)} />
          <button type="button" className="crm-btn crm-btn-p crm-btn-mini" style={{ marginTop: 8 }} onClick={addNota} disabled={nota.trim() === ""}>
            Salvar nota
          </button>
          <ul className="crm-linha-tempo">
            {[...lead.historico].reverse().map((e) => (
              <li key={e.id} className={e.tipo === "nota" ? "nota" : undefined}>
                <time dateTime={e.em}>{formatarDataHora(e.em)}</time>
                {e.texto}
              </li>
            ))}
          </ul>
        </section>

        <section className="crm-bloco" aria-label="Excluir lead">
          {confirmaExcluir ? (
            <div className="crm-acoes-linha">
              <span style={{ flex: 1, minWidth: 180 }}>Excluir este lead de forma definitiva?</span>
              <button type="button" className="crm-btn crm-btn-perigo crm-btn-mini" onClick={() => aoExcluir(lead.id)}>Sim, excluir</button>
              <button type="button" className="crm-btn crm-btn-mini" onClick={() => setConfirmaExcluir(false)}>Cancelar</button>
            </div>
          ) : (
            <button type="button" className="crm-btn crm-btn-perigo crm-btn-mini" onClick={() => setConfirmaExcluir(true)}>
              <Icone nome="lixeira" tamanho={13} /> Excluir lead
            </button>
          )}
        </section>
      </aside>
    </>
  );
}

function FragmentoResposta({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  return (
    <>
      <dt>{pergunta}</dt>
      <dd>{resposta}</dd>
    </>
  );
}