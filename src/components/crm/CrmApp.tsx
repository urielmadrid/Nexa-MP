"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ESTILO_CRM } from "@/src/components/crm/estiloCrm";
import { Icone } from "@/src/components/crm/ui";
import { baixarArquivo, normalizarBusca } from "@/src/components/crm/uteis";
import Painel from "@/src/components/crm/Painel";
import Funil from "@/src/components/crm/Funil";
import ListaLeads from "@/src/components/crm/ListaLeads";
import DetalheLead from "@/src/components/crm/DetalheLead";
import { ModalImportar, ModalNovoLead, ModalPasta, type ResultadoImportacao } from "@/src/components/crm/Modais";
import { fonteDeDados, fonteLocal } from "@/src/lib/crm/armazenamento";
import { carregarDoBanco, chaveDosDados, criarTabelasNoBanco, fonteBanco } from "@/src/lib/crm/fonteApi";
import { backupEmJson, listaEmCsv } from "@/src/lib/crm/exportar";
import { gerarExemplos } from "@/src/lib/crm/exemplo";
import { LISTAS_INTELIGENTES, listaPorId } from "@/src/lib/crm/listas";
import { criarId, hojeIso, mesclarLeads, moverParaPasta, mudarStatus } from "@/src/lib/crm/operacoes";
import { recomendar, type Recomendacao } from "@/src/lib/crm/recomendar";
import type { DadosCrm, LeadCrm, PastaCrm, StatusLead } from "@/src/lib/crm/tipos";

type Vista = "painel" | "funil" | "lista";
/** "banco": MySQL ligado (DATABASE_URL). "local": sem banco, os dados ficam só no navegador. */
type ModoDados = "carregando" | "banco" | "local";
type Falha = { tipo: "sem_tabelas" | "erro"; detalhe?: string } | null;
const CHAVE_MIGRADO = "nexa-crm-migrado";
type Selecao = { tipo: "lista" | "pasta" | "tag"; id: string };
type Modal = null | { tipo: "novo" } | { tipo: "importar" } | { tipo: "pasta"; pasta: PastaCrm | null };

const ABAS: Array<{ id: Vista; rotulo: string; icone: string; dica: string }> = [
  { id: "painel", rotulo: "Painel", icone: "painel", dica: "Visão geral: números, gráficos e por quem começar" },
  { id: "funil", rotulo: "Funil", icone: "funil", dica: "Os leads separados por etapa de venda" },
  { id: "lista", rotulo: "Lista", icone: "lista", dica: "Todos os leads em tabela, com filtros e ações em lote" },
];

export default function CrmApp() {
  const [dados, setDados] = useState<DadosCrm | null>(null);
  const [vista, setVista] = useState<Vista>("painel");
  const [selecao, setSelecao] = useState<Selecao>({ tipo: "lista", id: "todos" });
  const [busca, setBusca] = useState("");
  /** Filtro vindo de um cartão do painel (id de LISTAS_DOS_INDICADORES ou de uma lista da barra lateral). */
  const [indicador, setIndicador] = useState<string | null>(null);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [menuLateral, setMenuLateral] = useState(false);
  const [menuExportar, setMenuExportar] = useState(false);
  const [avisoLocalVisivel, setAvisoLocalVisivel] = useState(true);
  const [erroSalvar, setErroSalvar] = useState(false);
  const [toast, setToast] = useState("");
  const [agora, setAgora] = useState(() => new Date());
  const ultimoSalvo = useRef("");
  const timerToast = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* ---------- carregar e salvar ---------- */
  const [modoDados, setModoDados] = useState<ModoDados>("carregando");
  const [falha, setFalha] = useState<Falha>(null);
  const [criandoTabelas, setCriandoTabelas] = useState(false);
  /** Leads que estavam só neste navegador (de antes do banco) e ainda podem ser enviados para o banco. */
  const [localParaMigrar, setLocalParaMigrar] = useState<DadosCrm | null>(null);
  const dadosRef = useRef<DadosCrm | null>(null);
  /** Sobe a cada mudança feita pela equipe; serve para não sobrescrever uma edição com dados que chegaram atrasados. */
  const versaoLocal = useRef(0);

  useEffect(() => {
    dadosRef.current = dados;
  }, [dados]);

  const iniciar = useCallback(async () => {
    setFalha(null);
    const r = await carregarDoBanco();
    if (r.ok) {
      fonteBanco.definirBase(r.dados);
      setModoDados("banco");
      setDados(r.dados);
      // Havia leads guardados só neste navegador (antes do banco)? Oferece enviá-los.
      const local = await fonteLocal.carregar();
      let jaTratado = false;
      try {
        jaTratado = window.localStorage.getItem(CHAVE_MIGRADO) === "1";
      } catch {
        /* sem acesso ao armazenamento: segue sem oferecer */
      }
      if (!jaTratado) {
        const idsLeads = new Set(r.dados.leads.map((l) => l.id));
        const idsPastas = new Set(r.dados.pastas.map((p) => p.id));
        const leadsNovos = local.leads.filter((l) => l.fonte !== "exemplo" && !idsLeads.has(l.id));
        const pastasNovas = local.pastas.filter((p) => !p.id.startsWith("exemplo-pasta-") && !idsPastas.has(p.id));
        if (leadsNovos.length > 0) setLocalParaMigrar({ versao: 1, leads: leadsNovos, pastas: pastasNovas });
      }
      return;
    }
    if (r.motivo === "sem_banco") {
      const d = await fonteLocal.carregar();
      ultimoSalvo.current = JSON.stringify(d);
      setModoDados("local");
      setDados(d);
      return;
    }
    if (r.motivo === "sessao") {
      window.location.reload();
      return;
    }
    setFalha({ tipo: r.motivo, detalhe: r.detalhe });
  }, []);

  useEffect(() => {
    void iniciar();
  }, [iniciar]);

  useEffect(() => {
    if (!dados) return;
    if (modoDados === "banco") {
      fonteBanco.salvar(dados).then((ok) => setErroSalvar(!ok));
    } else if (modoDados === "local") {
      const texto = JSON.stringify(dados);
      if (texto === ultimoSalvo.current) return;
      ultimoSalvo.current = texto;
      fonteDeDados.salvar(dados).then((ok) => setErroSalvar(!ok));
    }
  }, [dados, modoDados]);

  // Sem banco: se o CRM foi alterado em outra aba, pega a versão mais nova ao voltar para esta.
  useEffect(() => {
    if (modoDados !== "local") return;
    const aoVoltar = () => {
      fonteDeDados.carregar().then((d) => {
        const texto = JSON.stringify(d);
        if (texto !== ultimoSalvo.current) {
          ultimoSalvo.current = texto;
          setDados(d);
        }
      });
    };
    window.addEventListener("focus", aoVoltar);
    return () => window.removeEventListener("focus", aoVoltar);
  }, [modoDados]);

  // Com banco: busca o que os outros diretores (ou o formulário do site) acrescentaram, ao voltar para a aba e a cada 45 s.
  const atualizar = useCallback(async () => {
    if (modoDados !== "banco") return;
    const versao = versaoLocal.current;
    await fonteBanco.esperarGravacoes();
    const r = await carregarDoBanco();
    if (!r.ok) {
      if (r.motivo === "sessao") window.location.reload();
      return;
    }
    const atual = dadosRef.current;
    // Se a equipe mexeu enquanto a resposta vinha, ou há algo ainda não gravado, deixa para a próxima rodada.
    if (versaoLocal.current !== versao || !atual || fonteBanco.temPendencias(atual)) return;
    if (chaveDosDados(atual) === chaveDosDados(r.dados)) return;
    fonteBanco.definirBase(r.dados);
    setDados(r.dados);
  }, [modoDados]);

  useEffect(() => {
    if (modoDados !== "banco") return;
    const rodada = () => {
      if (document.visibilityState === "visible") void atualizar();
    };
    const t = setInterval(rodada, 45_000);
    window.addEventListener("focus", rodada);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", rodada);
    };
  }, [modoDados, atualizar]);

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const avisar = useCallback((texto: string) => {
    setToast(texto);
    clearTimeout(timerToast.current);
    timerToast.current = setTimeout(() => setToast(""), 4500);
  }, []);

  useEffect(() => () => clearTimeout(timerToast.current), []);

  /* ---------- derivados ---------- */
  const leads = useMemo(() => dados?.leads ?? [], [dados]);
  const pastas = useMemo(() => dados?.pastas ?? [], [dados]);
  const hoje = hojeIso(agora);

  const recs = useMemo(() => {
    const mapa = new Map<string, Recomendacao>();
    for (const l of leads) mapa.set(l.id, recomendar(l, agora));
    return mapa;
  }, [leads, agora]);

  const contagens = useMemo(() => {
    const listas = new Map<string, number>();
    for (const lista of LISTAS_INTELIGENTES) {
      let n = 0;
      for (const l of leads) {
        const r = recs.get(l.id);
        if (r && lista.filtro(l, r, { hoje, agora })) n += 1;
      }
      listas.set(lista.id, n);
    }
    const porPasta = new Map<string, number>();
    const porTag = new Map<string, number>();
    for (const l of leads) {
      if (l.pastaId) porPasta.set(l.pastaId, (porPasta.get(l.pastaId) ?? 0) + 1);
      for (const t of l.tags) porTag.set(t, (porTag.get(t) ?? 0) + 1);
    }
    const tags = Array.from(porTag, ([tag, total]) => ({ tag, total })).sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag, "pt-BR"));
    return { listas, porPasta, tags };
  }, [leads, recs, hoje, agora]);

  const doEscopo = useMemo(() => {
    return leads.filter((l) => {
      const r = recs.get(l.id);
      if (!r) return false;
      if (selecao.tipo === "pasta") return l.pastaId === selecao.id;
      if (selecao.tipo === "tag") return l.tags.includes(selecao.id);
      const lista = listaPorId(selecao.id);
      return lista ? lista.filtro(l, r, { hoje, agora }) : true;
    }).filter((l) => {
      if (!indicador) return true;
      const r = recs.get(l.id);
      const filtro = listaPorId(indicador);
      return r && filtro ? filtro.filtro(l, r, { hoje, agora }) : true;
    });
  }, [leads, recs, selecao, indicador, hoje, agora]);

  const visiveis = useMemo(() => {
    const termos = normalizarBusca(busca).split(/\s+/).filter(Boolean);
    if (termos.length === 0) return doEscopo;
    return doEscopo.filter((l) => {
      const palheiro = normalizarBusca([l.nome, l.empresa, l.email, l.whatsappE164, l.tags.join(" "), recs.get(l.id)?.tag].filter(Boolean).join(" "));
      return termos.every((t) => palheiro.includes(t));
    });
  }, [doEscopo, busca, recs]);

  const leadAberto = abertoId ? leads.find((l) => l.id === abertoId) ?? null : null;
  const recAberta = leadAberto ? recs.get(leadAberto.id) ?? null : null;

  /* ---------- alterações ---------- */
  const alterar = useCallback((fn: (d: DadosCrm) => DadosCrm) => {
    versaoLocal.current += 1;
    setDados((d) => (d ? fn(d) : d));
  }, []);

  const atualizarLead = useCallback((lead: LeadCrm) => alterar((d) => ({ ...d, leads: d.leads.map((l) => (l.id === lead.id ? lead : l)) })), [alterar]);

  const mudarStatusPorId = useCallback(
    (id: string, status: StatusLead) => alterar((d) => ({ ...d, leads: d.leads.map((l) => (l.id === id ? mudarStatus(l, status) : l)) })),
    [alterar],
  );

  const mudarStatusEmLote = useCallback(
    (ids: string[], status: StatusLead) => {
      const conjunto = new Set(ids);
      alterar((d) => ({ ...d, leads: d.leads.map((l) => (conjunto.has(l.id) ? mudarStatus(l, status) : l)) }));
      avisar(`${ids.length} lead(s) movido(s) de etapa.`);
    },
    [alterar, avisar],
  );

  const moverEmLote = useCallback(
    (ids: string[], pastaId: string | null) => {
      const conjunto = new Set(ids);
      alterar((d) => {
        const pasta = d.pastas.find((p) => p.id === pastaId) ?? null;
        return { ...d, leads: d.leads.map((l) => (conjunto.has(l.id) ? moverParaPasta(l, pasta) : l)) };
      });
      avisar(`${ids.length} lead(s) ${pastaId ? "movido(s) para a pasta" : "tirado(s) da pasta"}.`);
    },
    [alterar, avisar],
  );

  function excluirLead(id: string) {
    alterar((d) => ({ ...d, leads: d.leads.filter((l) => l.id !== id) }));
    setAbertoId(null);
    avisar("Lead excluído.");
  }

  function criarLead(lead: LeadCrm) {
    alterar((d) => ({ ...d, leads: [lead, ...d.leads] }));
    setModal(null);
    setAbertoId(lead.id);
    avisar("Lead cadastrado.");
  }

  function importar(r: ResultadoImportacao, resumo: string) {
    alterar((d) => {
      const { leads: mesclados } = mesclarLeads(d.leads, r.leads);
      const ids = new Set(d.pastas.map((p) => p.id));
      return { ...d, leads: mesclados, pastas: [...d.pastas, ...r.pastas.filter((p) => !ids.has(p.id))] };
    });
    setModal(null);
    avisar(resumo);
  }

  function salvarPasta(existente: PastaCrm | null, nome: string, cor: string) {
    if (existente) alterar((d) => ({ ...d, pastas: d.pastas.map((p) => (p.id === existente.id ? { ...p, nome, cor } : p)) }));
    else {
      const nova: PastaCrm = { id: criarId(), nome, cor };
      alterar((d) => ({ ...d, pastas: [...d.pastas, nova] }));
      setSelecao({ tipo: "pasta", id: nova.id });
    }
    setModal(null);
  }

  function excluirPasta(pasta: PastaCrm) {
    alterar((d) => ({
      ...d,
      pastas: d.pastas.filter((p) => p.id !== pasta.id),
      leads: d.leads.map((l) => (l.pastaId === pasta.id ? moverParaPasta(l, null) : l)),
    }));
    if (selecao.tipo === "pasta" && selecao.id === pasta.id) setSelecao({ tipo: "lista", id: "todos" });
    setModal(null);
    avisar("Pasta excluída. Os leads continuam no CRM.");
  }

  function carregarExemplos() {
    const ex = gerarExemplos(new Date());
    alterar((d) => {
      const ids = new Set(d.pastas.map((p) => p.id));
      return { ...d, leads: mesclarLeads(d.leads, ex.leads).leads, pastas: [...d.pastas, ...ex.pastas.filter((p) => !ids.has(p.id))] };
    });
    avisar("Dados de exemplo carregados. Eles são fictícios e podem ser removidos a qualquer momento.");
  }

  async function enviarLocalParaBanco() {
    const atual = dadosRef.current;
    if (!localParaMigrar || !atual) return;
    const ids = new Set(atual.leads.map((l) => l.id));
    const idsPastas = new Set(atual.pastas.map((p) => p.id));
    const novos = localParaMigrar.leads.filter((l) => !ids.has(l.id));
    const juntos: DadosCrm = {
      versao: 1,
      leads: [...novos, ...atual.leads],
      pastas: [...atual.pastas, ...localParaMigrar.pastas.filter((p) => !idsPastas.has(p.id))],
    };
    versaoLocal.current += 1;
    setDados(juntos);
    const ok = await fonteBanco.salvar(juntos);
    if (ok) {
      try {
        window.localStorage.setItem(CHAVE_MIGRADO, "1");
      } catch {
        /* sem acesso ao armazenamento */
      }
      setLocalParaMigrar(null);
      avisar(`${novos.length} lead(s) enviado(s) para o banco de dados.`);
    } else {
      avisar("Não consegui enviar para o banco agora. Tente de novo em instantes.");
    }
  }

  function ignorarLocal() {
    try {
      window.localStorage.setItem(CHAVE_MIGRADO, "1");
    } catch {
      /* sem acesso ao armazenamento */
    }
    setLocalParaMigrar(null);
  }

  async function prepararBanco() {
    setCriandoTabelas(true);
    const r = await criarTabelasNoBanco();
    setCriandoTabelas(false);
    if (r.ok) void iniciar();
    else setFalha({ tipo: "sem_tabelas", detalhe: r.detalhe });
  }

  function limparExemplos() {
    alterar((d) => ({
      ...d,
      leads: d.leads.filter((l) => l.fonte !== "exemplo").map((l) => (l.pastaId?.startsWith("exemplo-pasta-") ? { ...l, pastaId: null } : l)),
      pastas: d.pastas.filter((p) => !p.id.startsWith("exemplo-pasta-")),
    }));
    if (selecao.tipo === "pasta" && selecao.id.startsWith("exemplo-pasta-")) setSelecao({ tipo: "lista", id: "todos" });
    if (leadAberto?.fonte === "exemplo") setAbertoId(null);
    avisar("Dados de exemplo removidos.");
  }

  /* ---------- exportar ---------- */
  function exportarCsv(lista: LeadCrm[], nome: string) {
    baixarArquivo(`nexa-crm-${nome}-${hoje}.csv`, listaEmCsv(lista, pastas, new Date()), "text/csv;charset=utf-8");
    setMenuExportar(false);
  }

  function exportarBackup() {
    if (!dados) return;
    baixarArquivo(`nexa-crm-backup-${hoje}.json`, backupEmJson(dados), "application/json;charset=utf-8");
    setMenuExportar(false);
  }

  async function sair() {
    try {
      await fetch("/api/crm/sair", { method: "POST" });
    } finally {
      window.location.reload();
    }
  }

  /* ---------- Esc ---------- */
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (modal) setModal(null);
      else if (menuExportar) setMenuExportar(false);
      else if (abertoId) setAbertoId(null);
      else if (menuLateral) setMenuLateral(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [modal, menuExportar, abertoId, menuLateral]);

  if (falha) {
    return (
      <div className="crm">
        <style dangerouslySetInnerHTML={{ __html: ESTILO_CRM }} />
        <main className="crm-acesso">
          <div className="crm-acesso-caixa" style={{ width: "min(520px,100%)" }}>
            <div className="crm-marca">
              <b>N</b>
              <span>CRM</span>
              <span className="crm-selo-interno">Interno</span>
            </div>
            {falha.tipo === "sem_tabelas" ? (
              <>
                <h1>Banco conectado. Falta criar as tabelas</h1>
                <p className="crm-sub">A conexão com o MySQL funcionou, mas as tabelas do CRM ainda não existem. Um clique cria tudo (só o que faltar; nada é apagado).</p>
                {falha.detalhe ? <p className="crm-erro" role="alert">{falha.detalhe}</p> : null}
                <div className="crm-acoes-linha" style={{ marginTop: 14 }}>
                  <button type="button" className="crm-btn crm-btn-p" onClick={prepararBanco} disabled={criandoTabelas}>
                    {criandoTabelas ? "Criando…" : "Criar tabelas agora"}
                  </button>
                  <button type="button" className="crm-btn" onClick={sair}>Sair</button>
                </div>
              </>
            ) : (
              <>
                <h1>Não consegui falar com o banco de dados</h1>
                <p className="crm-sub">Confira a variável DATABASE_URL na Vercel (usuário, senha, endereço, porta e nome do banco) e se o banco aceita conexões de fora.</p>
                {falha.detalhe ? <p className="crm-erro" role="alert">{falha.detalhe}</p> : null}
                <div className="crm-acoes-linha" style={{ marginTop: 14 }}>
                  <button type="button" className="crm-btn crm-btn-p" onClick={() => void iniciar()}>Tentar de novo</button>
                  <button type="button" className="crm-btn" onClick={sair}>Sair</button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="crm">
        <style dangerouslySetInnerHTML={{ __html: ESTILO_CRM }} />
        <p style={{ padding: 40, color: "var(--suave)" }}>Carregando o CRM…</p>
      </div>
    );
  }

  const temExemplos = leads.some((l) => l.fonte === "exemplo");
  const listaAtual = selecao.tipo === "lista" ? listaPorId(selecao.id) : undefined;
  const pastaAtual = selecao.tipo === "pasta" ? pastas.find((p) => p.id === selecao.id) : undefined;
  const titulo = selecao.tipo === "lista" ? listaAtual?.rotulo ?? "Todos os leads" : selecao.tipo === "pasta" ? pastaAtual?.nome ?? "Pasta" : `Etiqueta: ${selecao.id}`;
  const subtitulo = selecao.tipo === "lista" ? listaAtual?.dica : selecao.tipo === "pasta" ? "Pasta criada pela equipe." : "Leads com esta etiqueta da equipe.";

  const escolher = (s: Selecao) => {
    setSelecao(s);
    setIndicador(null);
    setMenuLateral(false);
  };

  const indicadorAtual = indicador ? listaPorId(indicador) : undefined;

  /** Clique num cartão do painel: abre a Lista só com os leads que formam aquele número. */
  const verLeads = (listaId: string) => {
    setIndicador(listaId);
    setVista("lista");
    setBusca("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const trocarVista = (v: Vista) => {
    setVista(v);
    // O painel sempre mostra os números completos do que está selecionado; o filtro vale para Funil e Lista.
    if (v === "painel") setIndicador(null);
  };

  return (
    <div className="crm">
      <style dangerouslySetInnerHTML={{ __html: ESTILO_CRM }} />

      <header className="crm-topo">
        <button type="button" className="crm-btn crm-menu-filtros" onClick={() => setMenuLateral((v) => !v)} aria-expanded={menuLateral} aria-controls="crm-lateral">
          <Icone nome="pasta" /> <span className="crm-texto-btn">Listas e pastas</span>
        </button>
        <div className="crm-marca">
          <b>N</b>
          <span>CRM</span>
          <span className="crm-selo-interno">Interno</span>
          {modoDados === "banco" ? (
            <span className="crm-selo-banco" title="Os dados ficam no banco de dados (MySQL) e aparecem para todos os diretores">
              <i /> Banco de dados
            </span>
          ) : null}
        </div>
        <div className="crm-busca">
          <Icone nome="busca" />
          <label className="crm-sr" htmlFor="crm-busca">Buscar leads</label>
          <input id="crm-busca" type="search" placeholder="Buscar por nome, empresa, e-mail, telefone ou etiqueta" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="crm-topo-acoes">
          <button type="button" className="crm-btn crm-btn-p" title="Cadastrar um lead que não veio pelo formulário" onClick={() => setModal({ tipo: "novo" })}>
            <Icone nome="mais" /> <span className="crm-texto-btn">Novo lead</span>
          </button>
          <button type="button" className="crm-btn" title="Trazer leads dos e-mails do diagnóstico ou de um backup" onClick={() => setModal({ tipo: "importar" })}>
            <Icone nome="subir" /> <span className="crm-texto-btn">Importar</span>
          </button>
          <div style={{ position: "relative" }}>
            <button type="button" className="crm-btn" title="Baixar a lista em planilha ou fazer backup" onClick={() => setMenuExportar((v) => !v)} aria-expanded={menuExportar} aria-haspopup="menu">
              <Icone nome="baixar" /> <span className="crm-texto-btn">Exportar</span>
            </button>
            {menuExportar ? (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 54 }} onClick={() => setMenuExportar(false)} />
                <div className="crm-menu-pop" role="menu">
                  <button type="button" role="menuitem" className="crm-menu-item" onClick={() => exportarCsv(visiveis, "lista-atual")}>
                    Lista atual (CSV)<small>{visiveis.length} lead(s) que estão aparecendo, para abrir no Excel.</small>
                  </button>
                  <button type="button" role="menuitem" className="crm-menu-item" onClick={() => exportarCsv(leads, "todos")}>
                    Todos os leads (CSV)<small>{leads.length} lead(s).</small>
                  </button>
                  <button type="button" role="menuitem" className="crm-menu-item" onClick={exportarBackup}>
                    Backup completo (JSON)<small>Guarda leads, notas e pastas. Dá para importar de volta.</small>
                  </button>
                </div>
              </>
            ) : null}
          </div>
          <button type="button" className="crm-btn" onClick={sair} aria-label="Sair do CRM">
            <Icone nome="sair" /> <span className="crm-texto-btn">Sair</span>
          </button>
        </div>
      </header>

      <div className="crm-fundo-menu" data-aberta={menuLateral} onClick={() => setMenuLateral(false)} />

      <div className="crm-corpo">
        <nav id="crm-lateral" className="crm-lateral" data-aberta={menuLateral} aria-label="Listas e pastas">
          <div className="crm-grupo-titulo">Listas inteligentes</div>
          {LISTAS_INTELIGENTES.map((l) => (
            <button key={l.id} type="button" className="crm-item" aria-current={selecao.tipo === "lista" && selecao.id === l.id} title={l.dica} onClick={() => escolher({ tipo: "lista", id: l.id })}>
              <Icone nome={l.id === "quentes" ? "fogo" : l.id === "retornar" ? "calendario" : "lista"} tamanho={14} />
              <span className="crm-item-nome">{l.rotulo}</span>
              <span className="crm-item-n" data-tom={(contagens.listas.get(l.id) ?? 0) > 0 ? (l.id === "quentes" ? "quente" : l.id === "retornar" ? "atencao" : undefined) : undefined}>{contagens.listas.get(l.id) ?? 0}</span>
            </button>
          ))}

          <div className="crm-grupo-titulo">
            <span>Pastas</span>
            <button type="button" className="crm-icone-btn" aria-label="Criar nova pasta" onClick={() => setModal({ tipo: "pasta", pasta: null })}>
              <Icone nome="mais" tamanho={14} />
            </button>
          </div>
          {pastas.length === 0 ? <p className="crm-sub" style={{ margin: "0 8px", fontSize: 12 }}>Nenhuma pasta ainda. Crie uma para separar as empresas do seu jeito.</p> : null}
          {pastas.map((p) => (
            <div key={p.id} className="crm-pasta-linha">
              <button type="button" className="crm-item" aria-current={selecao.tipo === "pasta" && selecao.id === p.id} onClick={() => escolher({ tipo: "pasta", id: p.id })}>
                <span className="crm-bolinha" style={{ background: p.cor }} />
                <span className="crm-item-nome">{p.nome}</span>
                <span className="crm-item-n">{contagens.porPasta.get(p.id) ?? 0}</span>
              </button>
              <span className="crm-pasta-acoes">
                <button type="button" className="crm-icone-btn" aria-label={`Editar pasta ${p.nome}`} onClick={() => setModal({ tipo: "pasta", pasta: p })}>
                  <Icone nome="lapis" tamanho={13} />
                </button>
              </span>
            </div>
          ))}

          {contagens.tags.length > 0 ? (
            <>
              <div className="crm-grupo-titulo">Etiquetas da equipe</div>
              {contagens.tags.slice(0, 15).map(({ tag, total }) => (
                <button key={tag} type="button" className="crm-item" aria-current={selecao.tipo === "tag" && selecao.id === tag} onClick={() => escolher({ tipo: "tag", id: tag })}>
                  <Icone nome="etiqueta" tamanho={14} />
                  <span className="crm-item-nome">{tag}</span>
                  <span className="crm-item-n">{total}</span>
                </button>
              ))}
            </>
          ) : null}

          <div className="crm-rodape-lateral">
            {temExemplos ? (
              <>
                <p>Há dados de exemplo (fictícios) no CRM.</p>
                <button type="button" className="crm-btn crm-btn-mini" onClick={limparExemplos}>Limpar exemplos</button>
              </>
            ) : (
              <>
                <p>Quer ver o painel funcionando antes de ter leads reais?</p>
                <button type="button" className="crm-btn crm-btn-mini" onClick={carregarExemplos}>Carregar dados de exemplo</button>
              </>
            )}
          </div>
        </nav>

        <main className="crm-principal">
          {erroSalvar ? (
            <div className="crm-aviso crm-aviso-erro" role="alert">
              {modoDados === "banco" ? "Não consegui gravar no banco de dados agora. A tela tenta de novo na próxima alteração; enquanto isso, exporte um backup para não perder nada." : "Não consegui salvar no navegador (armazenamento cheio ou bloqueado). Exporte um backup agora para não perder dados."}
              <button type="button" className="crm-btn crm-btn-mini" onClick={exportarBackup}>Exportar backup</button>
            </div>
          ) : null}
          {temExemplos ? (
            <div className="crm-aviso crm-aviso-laranja" role="status">
              Você está vendo dados de exemplo. Os nomes e números são fictícios e não representam clientes reais.
              <button type="button" className="crm-btn crm-btn-mini" onClick={limparExemplos}>Limpar exemplos</button>
            </div>
          ) : null}
          {localParaMigrar ? (
            <div className="crm-aviso crm-aviso-laranja" role="status">
              Encontrei {localParaMigrar.leads.length} lead(s) que estavam guardados só neste navegador. Quer enviá-los para o banco de dados, para todos os diretores verem?
              <span style={{ marginLeft: "auto", display: "inline-flex", gap: 8 }}>
                <button type="button" className="crm-btn crm-btn-p crm-btn-mini" onClick={enviarLocalParaBanco}>Enviar para o banco</button>
                <button type="button" className="crm-btn crm-btn-mini" onClick={ignorarLocal}>Não enviar</button>
              </span>
            </div>
          ) : null}
          {modoDados === "local" && avisoLocalVisivel ? (
            <div className="crm-aviso">
              O banco de dados ainda não está ligado: por enquanto, os dados ficam só neste navegador, neste aparelho. Outro diretor, em outro aparelho, não vê o que você vê. Para ligar o banco, defina DATABASE_URL (veja as instruções). Faça um backup de vez em quando (Exportar → Backup completo).
              <button type="button" className="crm-btn crm-btn-mini" onClick={() => setAvisoLocalVisivel(false)}>Entendi</button>
            </div>
          ) : null}

          <div className="crm-cabeca">
            <div>
              <h1 className="crm-titulo">{titulo}</h1>
              <p className="crm-sub">
                {subtitulo} {busca.trim() ? `Mostrando ${visiveis.length} de ${doEscopo.length} pela busca.` : `${doEscopo.length} lead(s).`}
              </p>
              {indicadorAtual ? (
                <div className="crm-filtro-ativo" role="status">
                  <span>
                    Filtro: <b>{indicadorAtual.rotulo}</b>
                  </span>
                  <button type="button" onClick={() => setIndicador(null)}>Limpar filtro ✕</button>
                </div>
              ) : null}
            </div>
            {leads.length > 0 ? (
              <div className="crm-abas" role="tablist" aria-label="Forma de ver os leads">
                {ABAS.map((a) => (
                  <button key={a.id} type="button" role="tab" id={`crm-aba-${a.id}`} aria-selected={vista === a.id} aria-controls="crm-painel-vista" className="crm-aba" title={a.dica} onClick={() => trocarVista(a.id)}>
                    <Icone nome={a.icone} tamanho={14} /> {a.rotulo}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {leads.length === 0 ? (
            <div className="crm-vazio">
              <h3>Ainda não há leads no CRM</h3>
              <p>Cada pessoa que responde o diagnóstico em /formulario as informações aparecem neste local.</p>
              <div className="crm-acoes-linha" style={{ justifyContent: "center", marginTop: 10 }}>
                <button type="button" className="crm-btn crm-btn-p" onClick={() => setModal({ tipo: "importar" })}>
                  <Icone nome="subir" /> Importar de um e-mail
                </button>
                <button type="button" className="crm-btn" onClick={() => setModal({ tipo: "novo" })}>
                  <Icone nome="mais" /> Cadastrar um lead
                </button>
                <button type="button" className="crm-btn" onClick={carregarExemplos}>Ver com dados de exemplo</button>
              </div>
            </div>
          ) : (
            <div id="crm-painel-vista" role="tabpanel" aria-labelledby={`crm-aba-${vista}`}>
              {vista === "painel" ? <Painel leads={visiveis} recs={recs} pastas={pastas} agora={agora} aoAbrir={setAbertoId} aoVerLeads={verLeads} /> : null}
              {vista === "funil" ? <Funil leads={visiveis} recs={recs} pastas={pastas} agora={agora} aoAbrir={setAbertoId} aoMudarStatus={mudarStatusPorId} /> : null}
              {vista === "lista" ? (
                <ListaLeads
                  leads={visiveis}
                  recs={recs}
                  pastas={pastas}
                  agora={agora}
                  aoAbrir={setAbertoId}
                  aoMudarStatusEmLote={mudarStatusEmLote}
                  aoMoverEmLote={moverEmLote}
                  aoExportarSelecao={(ids) => {
                    const conjunto = new Set(ids);
                    exportarCsv(leads.filter((l) => conjunto.has(l.id)), "selecao");
                  }}
                />
              ) : null}
            </div>
          )}
        </main>
      </div>

      {leadAberto && recAberta ? <DetalheLead key={leadAberto.id} lead={leadAberto} rec={recAberta} pastas={pastas} agora={agora} aoAlterar={atualizarLead} aoExcluir={excluirLead} aoFechar={() => setAbertoId(null)} /> : null}

      {modal?.tipo === "novo" ? <ModalNovoLead pastas={pastas} pastaInicial={selecao.tipo === "pasta" ? selecao.id : null} aoCriar={criarLead} aoFechar={() => setModal(null)} /> : null}
      {modal?.tipo === "importar" ? <ModalImportar dados={dados} aoImportar={importar} aoFechar={() => setModal(null)} /> : null}
      {modal?.tipo === "pasta" ? (
        <ModalPasta
          key={modal.pasta?.id ?? "nova"}
          pasta={modal.pasta}
          totalLeads={modal.pasta ? contagens.porPasta.get(modal.pasta.id) ?? 0 : 0}
          aoSalvar={(nome, cor) => salvarPasta(modal.pasta, nome, cor)}
          aoExcluir={modal.pasta ? () => excluirPasta(modal.pasta as PastaCrm) : undefined}
          aoFechar={() => setModal(null)}
        />
      ) : null}

      {toast ? (
        <div className="crm-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}