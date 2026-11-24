"use client";

import type { ItemGrafico } from "@/src/lib/crm/metricas";

export function Barras({ itens, max = 6, vazio = "Sem dados ainda." }: { itens: ItemGrafico[]; max?: number; vazio?: string }) {
  if (itens.length === 0) return <p className="crm-vazio-card">{vazio}</p>;
  const lista = itens.slice(0, max);
  const maior = Math.max(...lista.map((i) => i.total), 1);
  return (
    <div className="crm-barras">
      {lista.map((i) => (
        <div key={i.rotulo} className="crm-barra-linha">
          <span className="crm-barra-rotulo" title={i.rotulo}>
            {i.rotulo}
          </span>
          <span className="crm-barra-trilho" role="presentation">
            <span className="crm-barra-preenche" style={{ width: `${(i.total / maior) * 100}%`, background: i.cor }} />
          </span>
          <span className="crm-barra-n">{i.total}</span>
        </div>
      ))}
    </div>
  );
}

/** Barras dos últimos 30 dias, desenhadas em SVG (sem biblioteca de gráficos). */
export function SerieDiaria({ dados }: { dados: Array<{ dia: string; total: number }> }) {
  const maior = Math.max(...dados.map((d) => d.total), 1);
  const largura = 300;
  const altura = 100;
  const passo = largura / dados.length;
  const soma = dados.reduce((a, d) => a + d.total, 0);
  const diaMes = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");
  return (
    <>
      <svg className="crm-serie" viewBox={`0 0 ${largura} ${altura}`} preserveAspectRatio="none" role="img" aria-label={`Leads por dia nos últimos 30 dias: ${soma} no total`}>
        <line x1="0" x2={largura} y1={altura - 0.5} y2={altura - 0.5} stroke="rgba(255,255,255,.12)" />
        {dados.map((d, i) => {
          const h = d.total === 0 ? 0 : Math.max(3, (d.total / maior) * (altura - 8));
          return (
            <g key={d.dia}>
              <title>{`${diaMes(d.dia)}: ${d.total} lead(s)`}</title>
              <rect x={i * passo + 1.5} y={altura - h} width={Math.max(1, passo - 3)} height={h} rx="1.5" fill={i === dados.length - 1 ? "#ff6a00" : "rgba(255,106,0,.6)"} />
            </g>
          );
        })}
      </svg>
      <div className="crm-serie-eixo" aria-hidden="true">
        <span>{diaMes(dados[0].dia)}</span>
        <span>hoje</span>
      </div>
    </>
  );
}

export function Rosca({ itens, centro, rotuloCentro }: { itens: ItemGrafico[]; centro: string | number; rotuloCentro: string }) {
  const total = itens.reduce((a, i) => a + i.total, 0);
  let acumulado = 0;
  const partes = itens
    .filter((i) => i.total > 0)
    .map((i) => {
      const ini = (acumulado / total) * 360;
      acumulado += i.total;
      return `${i.cor} ${ini}deg ${(acumulado / total) * 360}deg`;
    });
  return (
    <div className="crm-rosca-caixa">
      <div className="crm-rosca" style={{ background: total > 0 ? `conic-gradient(${partes.join(",")})` : "rgba(255,255,255,.08)" }} role="img" aria-label={itens.map((i) => `${i.rotulo}: ${i.total}`).join(", ")}>
        <div className="crm-rosca-centro">
          <span>
            {centro}
            <small>{rotuloCentro}</small>
          </span>
        </div>
      </div>
      <div className="crm-legenda">
        {itens.map((i) => (
          <div key={i.rotulo}>
            <span className="crm-bolinha" style={{ background: i.cor }} />
            {i.rotulo}
            <b>{i.total}</b>
          </div>
        ))}
      </div>
    </div>
  );
}