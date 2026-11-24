"use client";

import { useMemo, type ReactNode } from "react";
import { calcularMetricas, formatarHoras, formatarReais } from "@/src/lib/crm/metricas";
import { hojeIso } from "@/src/lib/crm/operacoes";
import type { LeadCrm, PastaCrm } from "@/src/lib/crm/tipos";
import { Barras, Rosca, SerieDiaria } from "@/src/components/crm/graficos";
import { Icone, SeloTemperatura, formatarDataCurta } from "@/src/components/crm/ui";
import { ordenarPorAtendimento, type MapaRecs } from "@/src/components/crm/uteis";

type Props = {
  leads: LeadCrm[];
  recs: MapaRecs;
  pastas: PastaCrm[];
  agora: Date;
  aoAbrir: (id: string) => void;
  /** Mostra, na Lista, os leads que formam um número do painel (id de uma lista em src/lib/crm/listas.ts). */
  aoVerLeads: (listaId: string) => void;
};

type Tom = "neutro" | "quente" | "atencao" | "laranja" | "ok";

function Kpi({ icone, rotulo, valor, nota, tom = "neutro", quantos, aoClicar }: { icone: string; rotulo: string; valor: ReactNode; nota?: string; tom?: Tom; quantos?: number; aoClicar?: () => void }) {
  const conteudo = (
    <>
      <div className="crm-kpi-rotulo">
        <span className="crm-kpi-icone">
          <Icone nome={icone} tamanho={14} />
        </span>
        {rotulo}
      </div>
      <div className="crm-kpi-valor">{valor}</div>
      {nota ? <div className="crm-kpi-nota">{nota}</div> : null}
      {aoClicar ? <span className="crm-kpi-ver">Ver {quantos === 1 ? "o lead" : "os leads"} →</span> : null}
    </>
  );
  const classe = `crm-kpi${tom !== "neutro" && tom !== "ok" && quantos !== 0 ? " crm-kpi-destaque" : ""}${aoClicar ? " crm-kpi-link" : ""}`;
  if (aoClicar) {
    return (
      <button type="button" className={classe} data-tom={tom} onClick={aoClicar} aria-label={`${rotulo}: ${quantos ?? ""}. Clique para ver os leads.`}>
        {conteudo}
      </button>
    );
  }
  return (
    <div className={classe} data-tom={tom}>
      {conteudo}
    </div>
  );
}

export default function Painel({ leads, recs, pastas, agora, aoAbrir, aoVerLeads }: Props) {
  const m = useMemo(() => calcularMetricas(leads, recs, pastas, agora), [leads, recs, pastas, agora]);
  const hoje = hojeIso(agora);
  const prioridades = useMemo(() => ordenarPorAtendimento(leads, recs, hoje).filter((l) => recs.get(l.id) && (l.proximoContato !== null && l.proximoContato <= hoje ? true : l.status === "novo" || recs.get(l.id)?.temperatura === "quente")).slice(0, 6), [leads, recs, hoje]);

  const funilMax = Math.max(...m.porStatus.map((s) => s.total), 1);

  return (
    <div>
      {leads.length > 0 && (m.retornosHoje > 0 || m.semResposta > 0 || m.quentes > 0) ? (
        <div className="crm-atencao" role="status">
          <b>Precisa de atenção:</b>
          {m.retornosHoje > 0 ? (
            <button type="button" className="crm-chip" onClick={() => aoVerLeads("retornar")}>
              <Icone nome="calendario" tamanho={13} /> {m.retornosHoje} retorno(s) para hoje
            </button>
          ) : null}
          {m.semResposta > 0 ? (
            <button type="button" className="crm-chip" onClick={() => aoVerLeads("ind-sem-resposta")}>
              <Icone nome="relogio" tamanho={13} /> {m.semResposta} sem resposta há 2+ dias
            </button>
          ) : null}
          {m.quentes > 0 ? (
            <button type="button" className="crm-chip" onClick={() => aoVerLeads("quentes")}>
              <Icone nome="fogo" tamanho={13} /> {m.quentes} lead(s) quente(s)
            </button>
          ) : null}
        </div>
      ) : leads.length > 0 ? (
        <div className="crm-atencao crm-atencao-ok" role="status">
          <Icone nome="ok" /> Tudo em dia: nenhum retorno vencido, nenhum lead esperando resposta e nenhum lead quente em aberto.
        </div>
      ) : null}

      <div className="crm-kpis">
        <Kpi icone="lista" rotulo="Leads em aberto" valor={m.abertos} quantos={m.abertos} nota={`${m.total} no total`} aoClicar={m.abertos > 0 ? () => aoVerLeads("ind-abertos") : undefined} />
        <Kpi icone="mais" rotulo="Chegaram em 7 dias" valor={m.novos7d} quantos={m.novos7d} nota={`${m.novos30d} nos últimos 30 dias`} aoClicar={m.novos7d > 0 ? () => aoVerLeads("ind-7dias") : undefined} />
        <Kpi icone="fogo" rotulo="Quentes agora" tom="quente" valor={m.quentes} quantos={m.quentes} nota="Em aberto, com maior chance de fechar" aoClicar={m.quentes > 0 ? () => aoVerLeads("quentes") : undefined} />
        <Kpi icone="calendario" rotulo="Retornar hoje" tom="atencao" valor={m.retornosHoje} quantos={m.retornosHoje} nota="Contato marcado para hoje ou atrasado" aoClicar={m.retornosHoje > 0 ? () => aoVerLeads("retornar") : undefined} />
        <Kpi icone="relogio" rotulo="Sem resposta há 2+ dias" tom="atencao" valor={m.semResposta} quantos={m.semResposta} nota="Chegaram e ninguém contatou ainda" aoClicar={m.semResposta > 0 ? () => aoVerLeads("ind-sem-resposta") : undefined} />
        <Kpi
          icone="alvo"
          rotulo="Taxa de conversão"
          tom="ok"
          valor={m.taxaConversao === null ? "—" : <>{Math.round(m.taxaConversao * 100)}<small>%</small></>}
          quantos={m.ganhos + m.perdidos}
          nota={m.taxaConversao === null ? "Aparece quando houver leads ganhos ou perdidos" : `${m.ganhos} ganho(s) e ${m.perdidos} perdido(s)`}
          aoClicar={m.ganhos + m.perdidos > 0 ? () => aoVerLeads("encerrados") : undefined}
        />
        <Kpi
          icone="moeda"
          rotulo="Investimento mensal declarado"
          valor={<>{formatarReais(m.potencialMinimo)}<small>/mês</small></>}
          quantos={m.comOrcamento}
          nota={`Soma dos valores mínimos das faixas informadas por ${m.comOrcamento} lead(s) em aberto. Não é previsão de receita.`}
          aoClicar={m.comOrcamento > 0 ? () => aoVerLeads("ind-com-orcamento") : undefined}
        />
        <Kpi icone="relogio" rotulo="Tempo até o 1º contato" valor={m.horasAtePrimeiroContato === null ? "—" : formatarHoras(m.horasAtePrimeiroContato)} nota={m.horasAtePrimeiroContato === null ? "Aparece após o primeiro lead ser contatado" : "Média entre a chegada e o primeiro andamento"} />
      </div>

      <div className="crm-grade">
        <section className="crm-card crm-card-12" aria-labelledby="crm-prio-t">
          <h3 id="crm-prio-t">Por quem começar hoje</h3>
          <p className="crm-card-dica">Retornos marcados, leads novos e leads quentes, nessa ordem de importância.</p>
          {prioridades.length === 0 ? (
            <p className="crm-vazio-card">Nada urgente por enquanto. Quando chegar um lead novo ou um retorno vencer, ele aparece aqui.</p>
          ) : (
            <div className="crm-prio">
              {prioridades.map((l) => {
                const r = recs.get(l.id);
                if (!r) return null;
                const atrasado = l.proximoContato !== null && l.proximoContato <= hoje;
                return (
                  <button key={l.id} type="button" className="crm-prio-linha" onClick={() => aoAbrir(l.id)}>
                    <span className="crm-prio-nome">
                      <strong>{l.nome}</strong>
                      <span>{l.empresa ?? "Sem empresa informada"}</span>
                    </span>
                    <span>
                      <span className="crm-tag-sistema">{r.tag}</span>
                      <span className="crm-prio-acao" style={{ display: "block", marginTop: 4 }}>
                        {atrasado && l.proximoContato ? `Retorno marcado para ${formatarDataCurta(l.proximoContato)}. ` : ""}
                        {r.proximoPasso}
                      </span>
                    </span>
                    <SeloTemperatura temperatura={r.temperatura} />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="crm-card crm-card-8">
          <h3>Leads por dia</h3>
          <p className="crm-card-dica">Últimos 30 dias, o de hoje em laranja forte.</p>
          <SerieDiaria dados={m.serie30d} />
        </section>

        <section className="crm-card crm-card-4">
          <h3>Temperatura dos leads em aberto</h3>
          <p className="crm-card-dica">Prioridade de atendimento pelas respostas.</p>
          <Rosca itens={m.porTemperatura} centro={m.abertos} rotuloCentro="em aberto" />
        </section>

        <section className="crm-card">
          <h3>Funil de vendas</h3>
          <p className="crm-card-dica">Quantos leads estão em cada etapa.</p>
          <div className="crm-funil">
            {m.porStatus.map((s) => (
              <div key={s.id} className="crm-funil-linha">
                <span style={{ color: "var(--suave)" }}>{s.rotulo}</span>
                <span style={{ display: "block" }}>
                  <span className="crm-funil-barra" style={{ width: `${s.total === 0 ? 0 : Math.max(8, (s.total / funilMax) * 100)}%`, padding: s.total === 0 ? 0 : undefined, background: s.cor }}>
                    {s.total > 0 ? s.total : ""}
                  </span>
                </span>
                <span className="crm-barra-n">{m.total > 0 ? `${Math.round((s.total / m.total) * 100)}%` : "0%"}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="crm-card">
          <h3>O que mais precisam</h3>
          <p className="crm-card-dica">Necessidade principal indicada pelo sistema, só leads em aberto.</p>
          <Barras itens={m.porServico} />
        </section>

        <section className="crm-card crm-card-4">
          <h3>Quanto querem investir</h3>
          <p className="crm-card-dica">Faixa mensal informada no formulário.</p>
          <Barras itens={m.porOrcamento} />
        </section>

        <section className="crm-card crm-card-4">
          <h3>Setores</h3>
          <p className="crm-card-dica">Todos os leads.</p>
          <Barras itens={m.porSetor} />
        </section>

        <section className="crm-card crm-card-4">
          <h3>De onde vieram</h3>
          <p className="crm-card-dica">Origem registrada pelo link (utm) ou página anterior. Clique numa barra para ver os leads.</p>
          <Barras itens={m.porOrigem} aoClicar={(i) => aoVerLeads(`origem:${i.rotulo}`)} />
        </section>

        <section className="crm-card">
          <h3>Campanhas</h3>
          <p className="crm-card-dica">Só leads que chegaram por um link com campanha (utm_campaign). Clique numa barra para ver os leads.</p>
          <Barras itens={m.porCampanha} max={8} vazio="Nenhum lead chegou por link com campanha ainda." aoClicar={(i) => aoVerLeads(`campanha:${i.rotulo}`)} />
        </section>

        <section className="crm-card">
          <h3>Por pasta</h3>
          <p className="crm-card-dica">Como os leads estão organizados.</p>
          <Barras itens={m.porPasta} />
        </section>

        <section className="crm-card">
          <h3>Como ler este painel</h3>
          <ul className="crm-lista-simples">
            <li>
              <b>Etiqueta laranja</b>: o que o sistema acha que o cliente mais precisa agora (faixa de investimento · serviço · como quer ser atendido). Vem das respostas do formulário.
            </li>
            <li>
              <b>Temperatura</b>: quente, morno ou frio é a prioridade de atendimento, somando sinais como orçamento, decisor e urgência. Abra um lead para ver os motivos.
            </li>
            <li>
              <b>Tudo é sugestão</b>: as regras são simples e explicáveis, e a equipe sempre decide.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}