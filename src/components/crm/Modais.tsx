"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PERGUNTAS_DIAGNOSTICO } from "@/src/lib/formulario/diagnostico";
import type { Pergunta, RespostaNormalizada } from "@/src/lib/formulario/tipos";
import { MARCA_CRM } from "@/src/lib/formulario/email";
import { leadDoEnvio, lerBackup, lerEnviosDoTexto } from "@/src/lib/crm/importar";
import { leadManual, type CamposLeadManual } from "@/src/lib/crm/operacoes";
import { normalizarWhatsapp } from "@/src/lib/crm/telefone";
import { CORES_PASTA, type DadosCrm, type LeadCrm, type PastaCrm } from "@/src/lib/crm/tipos";
import { Icone } from "@/src/components/crm/ui";

function Moldura({ titulo, sub, aoFechar, children }: { titulo: string; sub?: string; aoFechar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const primeiro = ref.current?.querySelector<HTMLElement>("input,select,textarea,button:not([data-fechar])");
    primeiro?.focus();
  }, []);
  return (
    <>
      <div className="crm-fundo" onClick={aoFechar} />
      <div ref={ref} className="crm-modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <h2>{titulo}</h2>
            {sub ? <p className="crm-sub">{sub}</p> : null}
          </div>
          <button type="button" data-fechar className="crm-icone-btn" onClick={aoFechar} aria-label="Fechar">
            <Icone nome="x" tamanho={18} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Novo lead                                                           */
/* ------------------------------------------------------------------ */

const CODIGOS_NO_CADASTRO = ["setor", "decisor", "dificuldade_principal", "ja_fez_trafego_pago", "presenca_atual", "investimento_mensal", "objetivo_6_meses", "maior_trava"];
const PERGUNTAS_CADASTRO: Pergunta[] = CODIGOS_NO_CADASTRO.flatMap((c) => PERGUNTAS_DIAGNOSTICO.filter((p) => p.codigo === c));

type EstadoResp = { escolhas: string[]; texto: string };

export function ModalNovoLead({ pastas, pastaInicial, aoCriar, aoFechar }: { pastas: PastaCrm[]; pastaInicial: string | null; aoCriar: (lead: LeadCrm) => void; aoFechar: () => void }) {
  const [c, setC] = useState({ nome: "", empresa: "", email: "", whatsapp: "", pastaId: pastaInicial ?? "" });
  const [resp, setResp] = useState<Record<string, EstadoResp>>({});
  const [erro, setErro] = useState("");

  const pegar = (codigo: string): EstadoResp => resp[codigo] ?? { escolhas: [], texto: "" };
  const atualizar = (codigo: string, parcial: Partial<EstadoResp>) => setResp((r) => ({ ...r, [codigo]: { ...pegar(codigo), ...r[codigo], ...parcial } }));

  function alternarMulti(p: Pergunta, codigoOpcao: string) {
    const atual = pegar(p.codigo).escolhas;
    const opcao = p.opcoes?.find((o) => o.codigo === codigoOpcao);
    let novo: string[];
    if (atual.includes(codigoOpcao)) novo = atual.filter((x) => x !== codigoOpcao);
    else if (opcao?.exclusiva) novo = [codigoOpcao];
    else novo = [...atual.filter((x) => !p.opcoes?.find((o) => o.codigo === x)?.exclusiva), codigoOpcao];
    atualizar(p.codigo, { escolhas: novo });
  }

  function criar() {
    const nome = c.nome.trim();
    if (!nome) return setErro("Informe o nome.");
    const email = c.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErro("O e-mail parece inválido.");
    let whats: string | null = null;
    if (c.whatsapp.trim()) {
      whats = normalizarWhatsapp(c.whatsapp);
      if (!whats) return setErro("O WhatsApp parece inválido. Use DDD + número, por exemplo (53) 99123-4567.");
    }
    const respostas: RespostaNormalizada[] = [];
    for (const p of PERGUNTAS_CADASTRO) {
      const r = pegar(p.codigo);
      const texto = r.texto.trim().slice(0, p.maxCaracteres ?? 300);
      if (p.tipo === "texto_curto" || p.tipo === "texto_longo") {
        if (texto) respostas.push({ perguntaCodigo: p.codigo, opcaoCodigos: [], texto });
      } else if (r.escolhas.length > 0) {
        const pedeTexto = r.escolhas.some((e) => p.opcoes?.find((o) => o.codigo === e)?.pedeTexto);
        respostas.push({ perguntaCodigo: p.codigo, opcaoCodigos: r.escolhas, texto: pedeTexto && texto ? texto : null });
      }
    }
    const campos: CamposLeadManual = { nome, empresa: c.empresa, email, whatsappE164: whats, respostas, pastaId: c.pastaId || null };
    aoCriar(leadManual(campos));
  }

  return (
    <Moldura titulo="Novo lead" sub="Para quem chegou por outro caminho (indicação, ligação, evento). As respostas são opcionais, mas ajudam o sistema a sugerir o que o cliente precisa." aoFechar={aoFechar}>
      <div className="crm-campos" style={{ marginTop: 14 }}>
        <label className="crm-campo">Nome *<input value={c.nome} maxLength={120} onChange={(e) => setC({ ...c, nome: e.target.value })} /></label>
        <label className="crm-campo">Empresa<input value={c.empresa} maxLength={120} onChange={(e) => setC({ ...c, empresa: e.target.value })} /></label>
        <label className="crm-campo">E-mail<input type="email" value={c.email} maxLength={254} onChange={(e) => setC({ ...c, email: e.target.value })} /></label>
        <label className="crm-campo">WhatsApp<input value={c.whatsapp} maxLength={30} placeholder="(53) 99123-4567" onChange={(e) => setC({ ...c, whatsapp: e.target.value })} /></label>
        <label className="crm-campo crm-campo-largo">
          Pasta
          <select value={c.pastaId} onChange={(e) => setC({ ...c, pastaId: e.target.value })}>
            <option value="">(Sem pasta)</option>
            {pastas.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </label>
      </div>

      <h4 style={{ margin: "18px 0 8px", color: "var(--fraco)", font: "700 10px/1 ui-monospace,Menlo,monospace", letterSpacing: ".16em", textTransform: "uppercase" }}>Respostas do diagnóstico (opcional)</h4>
      <div className="crm-campos">
        {PERGUNTAS_CADASTRO.map((p) => {
          const r = pegar(p.codigo);
          const pedeTexto = r.escolhas.some((e) => p.opcoes?.find((o) => o.codigo === e)?.pedeTexto);
          if (p.tipo === "escolha_multipla") {
            return (
              <fieldset key={p.codigo} className="crm-campo crm-campo-largo" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend style={{ padding: 0, marginBottom: 4 }}>{p.rotulo}</legend>
                <div className="crm-marcas">
                  {p.opcoes?.map((o) => (
                    <label key={o.codigo} className="crm-marca-op">
                      <input type="checkbox" className="crm-check" checked={r.escolhas.includes(o.codigo)} onChange={() => alternarMulti(p, o.codigo)} />
                      {o.rotulo}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          }
          if (p.tipo === "escolha_unica") {
            return (
              <div key={p.codigo} className="crm-campo">
                <label htmlFor={`nl-${p.codigo}`}>{p.rotulo}</label>
                <select id={`nl-${p.codigo}`} value={r.escolhas[0] ?? ""} onChange={(e) => atualizar(p.codigo, { escolhas: e.target.value ? [e.target.value] : [], texto: "" })}>
                  <option value="">—</option>
                  {p.opcoes?.map((o) => (
                    <option key={o.codigo} value={o.codigo}>{o.rotulo}</option>
                  ))}
                </select>
                {pedeTexto ? <input aria-label={`${p.rotulo} (especifique)`} value={r.texto} maxLength={p.maxCaracteres ?? 80} placeholder="Especifique" onChange={(e) => atualizar(p.codigo, { texto: e.target.value })} /> : null}
              </div>
            );
          }
          return (
            <div key={p.codigo} className="crm-campo crm-campo-largo">
              <label htmlFor={`nl-${p.codigo}`}>{p.rotulo}</label>
              <textarea id={`nl-${p.codigo}`} value={r.texto} maxLength={p.maxCaracteres ?? 500} onChange={(e) => atualizar(p.codigo, { texto: e.target.value })} />
            </div>
          );
        })}
      </div>

      <p className="crm-erro" role="alert">{erro}</p>
      <div className="crm-modal-rodape">
        <button type="button" className="crm-btn" onClick={aoFechar}>Cancelar</button>
        <button type="button" className="crm-btn crm-btn-p" onClick={criar}>Cadastrar lead</button>
      </div>
    </Moldura>
  );
}

/* ------------------------------------------------------------------ */
/* Importar                                                            */
/* ------------------------------------------------------------------ */

export type ResultadoImportacao = { leads: LeadCrm[]; pastas: PastaCrm[] };

export function ModalImportar({ dados, aoImportar, aoFechar }: { dados: DadosCrm; aoImportar: (r: ResultadoImportacao, resumo: string) => void; aoFechar: () => void }) {
  const [texto, setTexto] = useState("");
  const [erroArquivo, setErroArquivo] = useState("");

  const analise = useMemo(() => {
    const t = texto.trim();
    if (!t) return null;
    const idsExistentes = new Set(dados.leads.map((l) => l.id));
    if (t.includes(MARCA_CRM)) {
      const { envios, invalidos } = lerEnviosDoTexto(t);
      const leads = envios.map(leadDoEnvio);
      const novos = leads.filter((l) => !idsExistentes.has(l.id));
      return { tipo: "emails" as const, leads: novos, repetidos: leads.length - novos.length, invalidos, pastas: [] as PastaCrm[] };
    }
    const backup = lerBackup(t);
    if (backup) {
      const novos = backup.leads.filter((l) => !idsExistentes.has(l.id));
      const idsPastas = new Set(dados.pastas.map((p) => p.id));
      return { tipo: "backup" as const, leads: novos, repetidos: backup.leads.length - novos.length, invalidos: 0, pastas: backup.pastas.filter((p) => !idsPastas.has(p.id)) };
    }
    return { tipo: "nada" as const, leads: [] as LeadCrm[], repetidos: 0, invalidos: 0, pastas: [] as PastaCrm[] };
  }, [texto, dados]);

  function lerArquivo(arquivo: File | undefined) {
    setErroArquivo("");
    if (!arquivo) return;
    if (arquivo.size > 5_000_000) return setErroArquivo("O arquivo é grande demais (limite de 5 MB).");
    const leitor = new FileReader();
    leitor.onload = () => setTexto(typeof leitor.result === "string" ? leitor.result : "");
    leitor.onerror = () => setErroArquivo("Não consegui ler o arquivo.");
    leitor.readAsText(arquivo);
  }

  const podeImportar = analise !== null && (analise.leads.length > 0 || analise.pastas.length > 0);

  return (
    <Moldura titulo="Importar leads" sub="Cole aqui o texto dos e-mails de diagnóstico (pode colar vários de uma vez) ou escolha um arquivo de backup do CRM." aoFechar={aoFechar}>
      <label className="crm-campo" style={{ marginTop: 14 }}>
        Texto dos e-mails ou backup (JSON)
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} style={{ minHeight: 160, fontFamily: "ui-monospace,Menlo,monospace", fontSize: 12 }} placeholder={`Cole o e-mail inteiro. O CRM procura a linha que começa com ${MARCA_CRM}`} />
      </label>
      <div className="crm-acoes-linha" style={{ marginTop: 8 }}>
        <label className="crm-btn crm-btn-mini">
          <Icone nome="subir" tamanho={13} /> Escolher arquivo (.json, .txt, .eml)
          <input type="file" accept=".json,.txt,.eml,text/plain,application/json,message/rfc822" className="crm-sr" onChange={(e) => lerArquivo(e.target.files?.[0])} />
        </label>
      </div>
      <p className="crm-erro" role="alert">{erroArquivo}</p>

      {analise ? (
        <div className={`crm-aviso ${analise.tipo === "nada" || (analise.invalidos > 0 && analise.leads.length === 0) ? "crm-aviso-erro" : ""}`} role="status" style={{ marginTop: 8, marginBottom: 0 }}>
          {analise.tipo === "nada" ? (
            <span>Não encontrei dados do CRM neste texto. Só e-mails enviados depois da atualização do formulário trazem a linha {MARCA_CRM}. E-mails antigos podem ser cadastrados manualmente em “Novo lead”.</span>
          ) : (
            <span>
              Encontrei <b>{analise.leads.length}</b> lead(s) novo(s)
              {analise.pastas.length > 0 ? <> e <b>{analise.pastas.length}</b> pasta(s)</> : null}
              {analise.repetidos > 0 ? `, ${analise.repetidos} já estava(m) no CRM` : ""}
              {analise.invalidos > 0 ? `, ${analise.invalidos} linha(s) inválida(s) ignorada(s)` : ""}.
            </span>
          )}
        </div>
      ) : null}

      <div className="crm-modal-rodape">
        <button type="button" className="crm-btn" onClick={aoFechar}>Cancelar</button>
        <button
          type="button"
          className="crm-btn crm-btn-p"
          disabled={!podeImportar}
          onClick={() => {
            if (!analise) return;
            aoImportar({ leads: analise.leads, pastas: analise.pastas }, `${analise.leads.length} lead(s) importado(s)${analise.repetidos > 0 ? `, ${analise.repetidos} repetido(s) ignorado(s)` : ""}.`);
          }}
        >
          Importar
        </button>
      </div>
    </Moldura>
  );
}

/* ------------------------------------------------------------------ */
/* Pasta                                                               */
/* ------------------------------------------------------------------ */

export function ModalPasta({ pasta, aoSalvar, aoExcluir, aoFechar, totalLeads }: { pasta: PastaCrm | null; aoSalvar: (nome: string, cor: string) => void; aoExcluir?: () => void; aoFechar: () => void; totalLeads?: number }) {
  const [nome, setNome] = useState(pasta?.nome ?? "");
  const [cor, setCor] = useState(pasta?.cor ?? CORES_PASTA[0]);
  const [confirma, setConfirma] = useState(false);
  const [erro, setErro] = useState("");

  function salvar() {
    const n = nome.replace(/\s+/g, " ").trim();
    if (!n) return setErro("Dê um nome para a pasta.");
    aoSalvar(n.slice(0, 40), cor);
  }

  return (
    <Moldura titulo={pasta ? "Editar pasta" : "Nova pasta"} sub="Use pastas para separar empresas do jeito que fizer sentido: por campanha, por cidade, por prioridade…" aoFechar={aoFechar}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          salvar();
        }}
      >
        <label className="crm-campo" style={{ marginTop: 14 }}>
          Nome da pasta
          <input value={nome} maxLength={40} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Clientes de Rio Grande" />
        </label>
        <div className="crm-campo" style={{ marginTop: 12 }}>
          Cor
          <div className="crm-cores">
            {CORES_PASTA.map((c) => (
              <button key={c} type="button" className="crm-cor" style={{ background: c }} aria-pressed={cor === c} aria-label={`Cor ${c}`} onClick={() => setCor(c)} />
            ))}
          </div>
        </div>
        <p className="crm-erro" role="alert">{erro}</p>
        {confirma && pasta ? (
          <div className="crm-aviso crm-aviso-erro">
            <span>
              Excluir a pasta “{pasta.nome}”? {totalLeads ? `Os ${totalLeads} lead(s) dentro dela continuam no CRM, só ficam sem pasta.` : "Ela está vazia."}
            </span>
            <button type="button" className="crm-btn crm-btn-perigo crm-btn-mini" onClick={aoExcluir}>Sim, excluir</button>
          </div>
        ) : null}
        <div className="crm-modal-rodape">
          {pasta && aoExcluir ? (
            <button type="button" className="crm-btn crm-btn-perigo" style={{ marginRight: "auto" }} onClick={() => setConfirma(true)}>
              <Icone nome="lixeira" tamanho={14} /> Excluir pasta
            </button>
          ) : null}
          <button type="button" className="crm-btn" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="crm-btn crm-btn-p">{pasta ? "Salvar" : "Criar pasta"}</button>
        </div>
      </form>
    </Moldura>
  );
}