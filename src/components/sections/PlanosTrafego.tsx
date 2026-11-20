"use client";

import Link from "next/link";
import { aoClicarContratar } from "@/src/lib/contratarPlano";
import { useEffect, useRef } from "react";
import { PLANOS_TRAFEGO, TRAFEGO } from "@/src/lib/data/planos";
import { useModoLeve } from "@/src/lib/modoSite";

/**
 * Aba "Tráfego pago" dos Planos.
 * Plano de tráfego pago de R$ 500 por mês (gestão e verba de anúncios juntas).
 * Os valores e o que está incluso vêm de src/lib/data/planos.ts (PLANOS_TRAFEGO e TRAFEGO).
 * Visual no tema do site (fundo escuro, laranja da marca); sem JavaScript, ou com "reduzir movimento", já aparece pronto.
 */

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="pt-check" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12.5 10 17.5 19 7.5" />
    </svg>
  );
}

const ESTILO = `
.pt{position:relative;color:#f7f7f5}
.pt *{box-sizing:border-box}
.pt-topo{position:relative;max-width:680px}
.pt-rotulo{display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,106,0,.38);background:rgba(255,106,0,.1);color:#ff9a4d;font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase}
.pt-ponto{width:8px;height:8px;border-radius:50%;background:#ff6a00;animation:pt-pisca 1.6s ease-in-out infinite}
.pt-titulo{margin:20px 0 0;font-size:clamp(28px,4vw,44px);line-height:1.06;font-weight:800;letter-spacing:-.02em}
.pt-titulo span{color:#ff6a00}
.pt-lead{margin:16px 0 0;color:rgba(255,255,255,.62);font-size:16px;line-height:1.65}
.pt-cresce{position:absolute;right:0;top:0;width:260px;height:120px;pointer-events:none}
.pt-ponta{animation:pt-ponta 6s ease-in-out infinite}
.pt-linha{stroke-dasharray:300;stroke-dashoffset:0;animation:pt-desenha 6s ease-in-out infinite}

.pt-grade{display:grid;grid-template-columns:minmax(0,520px);justify-content:center;gap:20px;margin:40px 0 0;padding:0;list-style:none}
.pt-card{position:relative;display:flex;flex-direction:column;padding:28px;border:1px solid rgba(255,255,255,.1);border-radius:24px;background:#161616;transition:transform .35s ease,border-color .35s ease,box-shadow .35s ease}
.pt-card:hover{transform:translateY(-5px);border-color:rgba(255,106,0,.55);box-shadow:0 22px 60px rgba(0,0,0,.5),0 0 40px rgba(255,106,0,.12)}
.pt-card::before{content:"";position:absolute;left:28px;right:28px;top:0;height:2px;border-radius:0 0 2px 2px;background:linear-gradient(90deg,#ff6a00,transparent)}
.pt-card-topo{display:flex;align-items:center;justify-content:space-between}
.pt-mini{font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.4)}
.pt-valor{display:flex;align-items:baseline;gap:8px;margin:22px 0 0}
.pt-moeda{font-size:22px;font-weight:800;color:#ff6a00}
.pt-num{font-size:clamp(46px,5vw,60px);line-height:1;font-weight:800;color:#fff}
.pt-periodo{margin:10px 0 0;font-size:13px;color:rgba(255,255,255,.5)}
.pt-itens{display:grid;gap:12px;margin:24px 0 0;padding:24px 0 0;border-top:1px solid rgba(255,255,255,.1);list-style:none}
.pt-itens li{display:flex;align-items:flex-start;gap:12px;color:rgba(255,255,255,.82);font-size:14px;line-height:1.5}
.pt-check{flex:none;width:20px;height:20px;margin-top:1px;padding:4px;border-radius:50%;border:1px solid rgba(255,106,0,.5);background:rgba(255,106,0,.12);color:#ff6a00}
.pt-card .pt-botao{margin-top:auto}
.pt-card .pt-itens{margin-bottom:28px}

.pt-botao{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;border:0;border-radius:12px;font-family:inherit;font-weight:700;font-size:14px;line-height:1.2;text-decoration:none;cursor:pointer;transition:transform .3s ease,background-color .3s ease,color .3s ease,opacity .3s ease}
.pt-botao:hover{transform:translateY(-3px)}
.pt-botao:active{transform:translateY(0) scale(.97)}
.pt-botao:focus-visible{outline:2px solid #fff;outline-offset:3px}
.pt-botao-p{background:#ff6a00;color:#fff;box-shadow:0 0 35px rgba(255,106,0,.25)}
.pt-botao-p:hover{background:#fff;color:#000}
.pt-botao[disabled]{opacity:.4;cursor:not-allowed;box-shadow:none}
.pt-botao[disabled]:hover{transform:none;background:#ff6a00;color:#fff}


.pt-avisos{display:grid;gap:8px;margin:28px 0 0;padding:0;list-style:none;font-size:12px;line-height:1.6;color:rgba(255,255,255,.45)}
.pt-avisos a{color:rgba(255,255,255,.65);text-underline-offset:3px}
.pt-avisos a:hover{color:#fff}

.pt-antes .pt-card{opacity:0;transform:translateY(26px)}
.pt-rodando .pt-card{animation:pt-sobe .7s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i) * .13s)}

@keyframes pt-sobe{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes pt-cresce{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes pt-pisca{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes pt-ponta{0%,42%{opacity:0}50%,85%{opacity:.85}100%{opacity:0}}
@keyframes pt-desenha{0%{stroke-dashoffset:300;opacity:1}45%,85%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}

@media (max-width:900px){
  .pt-grade{grid-template-columns:1fr;max-width:520px}
  .pt-cresce{display:none}
}
@media (max-width:480px){
  .pt-card{padding:24px 20px}
  .pt-botao{width:100%}
}
@media (prefers-reduced-motion:reduce){
  .pt *,.pt *::before,.pt *::after{animation:none!important;transition:none!important}
  .pt-card{opacity:1!important;transform:none!important}
}
`;

export default function PlanosTrafego() {
  const raiz = useRef<HTMLDivElement>(null);
  const leve = useModoLeve();

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    // Sem observador, com "reduzir movimento" ou no modo leve: fica no estado final, sem animar.
    if (leve) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.classList.add("pt-antes");
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        el.classList.remove("pt-antes");
        el.classList.add("pt-rodando");
        observador.disconnect();
      },
      { threshold: 0.15 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [leve]);

  return (
    <div ref={raiz} className="pt">
      <style dangerouslySetInnerHTML={{ __html: ESTILO }} />

      <svg className="pt-cresce" viewBox="0 0 260 120" fill="none" aria-hidden="true" focusable="false">
        <path className="pt-linha" d="M6 108 L62 82 L104 92 L160 48 L204 58 L250 14" stroke="#ff6a00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path className="pt-ponta" d="M232 12 L250 14 L246 32" stroke="#ff6a00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <header className="pt-topo">
        <span className="pt-rotulo">
          <span className="pt-ponto" aria-hidden="true" /> tráfego pago · novo
        </span>
        <h3 className="pt-titulo">
          Anúncios com <span>gestão e verba</span> no mesmo valor.
        </h3>
        <p className="pt-lead">
          Gestão das campanhas e verba de anúncios incluídas em um valor mensal único.
        </p>
      </header>

      <ul className="pt-grade">
        {PLANOS_TRAFEGO.map((plano, i) => (
          <li key={plano.id} className="pt-card" style={{ "--i": i } as React.CSSProperties}>
            <div className="pt-card-topo">
              <span className="pt-mini">plano mensal</span>
            </div>
            <p className="pt-valor">
              <span className="pt-moeda">R$</span>
              <span className="pt-num">{plano.valor.toLocaleString("pt-BR")}</span>
            </p>
            <p className="pt-periodo">{plano.periodo} · gestão e verba de anúncios</p>
            <ul className="pt-itens">
              {TRAFEGO.itens.map((item) => (
                <li key={item}>
                  <Check /> {item}
                </li>
              ))}
            </ul>
            <Link href={`/?plano=${plano.id}#contato`} onClick={(e) => aoClicarContratar(e, plano.id)} className="pt-botao pt-botao-p">
              Quero o plano de {plano.preco}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="pt-avisos">
        <li>
          O resultado de anúncios depende de vários fatores, como segmento, oferta, região e concorrência. A Nexa MP não promete número de clientes nem de vendas.
        </li>
        <li>
          Conversar não gera cobrança. Formas e datas de pagamento estão nos <Link href="/termos">Termos de Uso</Link>.
        </li>
      </ul>
    </div>
  );
}