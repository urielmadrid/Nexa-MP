"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BLACK_FRIDAY, campanhaValida, descontoPercentual, formatarReais } from "@/src/lib/data/blackFriday";
import { PLANOS } from "@/src/lib/data/planos";

/**
 * Tela da Black Friday, logo antes dos planos.
 * Mesmo tema do site: fundo escuro com grade, laranja da marca e o "elevador" dos planos:
 * o preço desce de andar enquanto o contador rola de R$ 500 para R$ 350.
 *
 * Valores e textos vêm de src/lib/data/blackFriday.ts e src/lib/data/planos.ts. Nada é inventado:
 * sem datas, sem contagem regressiva e sem "últimas vagas" (só entra período se você escrever em `vigencia`).
 * Sem JavaScript, ou com "reduzir movimento" ligado, a tela já aparece no estado final (R$ 350).
 */

/** Colunas do contador: cada dígito do preço "desce" do valor normal até o promocional, como num odômetro. */
function colunasDoContador(de: number, por: number): number[][] | null {
  const a = String(de).split("").map(Number);
  const b = String(por).split("").map(Number);
  if (a.length !== b.length) return null;
  return a.map((inicio, i) => {
    const passos = (inicio - b[i] + 10) % 10;
    return Array.from({ length: passos + 1 }, (_, k) => (inicio - k + 10) % 10);
  });
}

function Seta({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="bf-check" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12.5 10 17.5 19 7.5" />
    </svg>
  );
}

const ESTILO = `
.bf{position:relative;isolation:isolate;overflow:hidden;background:#070707;color:#f7f7f5;padding:96px 24px}
.bf *{box-sizing:border-box}
.bf-grade{position:absolute;inset:0;z-index:-3;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse at 60% 40%,#000 15%,transparent 75%);mask-image:radial-gradient(ellipse at 60% 40%,#000 15%,transparent 75%)}
.bf-brilho{position:absolute;inset:0;z-index:-2;background:radial-gradient(circle at 72% 42%,rgba(255,106,0,.16),transparent 46%)}
.bf-varredura{position:absolute;left:0;right:0;top:-160px;height:160px;z-index:-1;background:linear-gradient(to bottom,transparent,rgba(255,106,0,.07),transparent);animation:bf-varre 8s linear infinite}
.bf-orbita{position:absolute;right:-180px;top:-180px;width:560px;height:560px;z-index:-1;border-radius:50%;border:1px dashed rgba(255,106,0,.22);animation:bf-gira 48s linear infinite}
.bf-orbita::after{content:"";position:absolute;left:50%;top:-5px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:#ff6a00;box-shadow:0 0 18px 4px rgba(255,106,0,.6)}
.bf-miolo{position:relative;max-width:1100px;margin:0 auto}
.bf-cartao{position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center;padding:56px;border:1px solid rgba(255,106,0,.38);border-radius:28px;background:linear-gradient(160deg,#121212,#0a0a0a);box-shadow:0 30px 80px rgba(0,0,0,.55);animation:bf-pulsa 4.5s ease-in-out infinite}
.bf-canto{position:absolute;width:18px;height:18px;border:2px solid #ff6a00;opacity:.85}
.bf-canto-a{left:14px;top:14px;border-right:0;border-bottom:0;border-top-left-radius:6px}
.bf-canto-b{right:14px;top:14px;border-left:0;border-bottom:0;border-top-right-radius:6px}
.bf-canto-c{left:14px;bottom:14px;border-right:0;border-top:0;border-bottom-left-radius:6px}
.bf-canto-d{right:14px;bottom:14px;border-left:0;border-top:0;border-bottom-right-radius:6px}

.bf-rotulo{display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,106,0,.38);background:rgba(255,106,0,.1);color:#ff9a4d;font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase}
.bf-ponto{width:8px;height:8px;border-radius:50%;background:#ff6a00;animation:bf-pisca 1.6s ease-in-out infinite}
.bf-titulo{margin:22px 0 0;font-size:clamp(30px,4.4vw,48px);line-height:1.06;font-weight:800;letter-spacing:-.02em}
.bf-titulo span{color:#ff6a00}
.bf-lead{margin:18px 0 0;max-width:520px;color:rgba(255,255,255,.64);font-size:17px;line-height:1.65}
.bf-lista{display:grid;gap:12px;margin:26px 0 0;padding:0;list-style:none}
.bf-lista li{display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.82);font-size:15px}
.bf-check{flex:none;width:22px;height:22px;padding:4px;border-radius:50%;border:1px solid rgba(255,106,0,.5);background:rgba(255,106,0,.12);color:#ff6a00}
.bf-acoes{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.bf-botao{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;transition:transform .3s ease,background-color .3s ease,color .3s ease,border-color .3s ease}
.bf-botao:hover{transform:translateY(-3px)}
.bf-botao:active{transform:translateY(0) scale(.97)}
.bf-botao:focus-visible{outline:2px solid #fff;outline-offset:3px}
.bf-botao-p{background:#ff6a00;color:#fff;box-shadow:0 0 35px rgba(255,106,0,.28)}
.bf-botao-p:hover{background:#fff;color:#000}
.bf-botao-o{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.03);color:#fff}
.bf-botao-o:hover{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.1)}
.bf-nota{margin:16px 0 0;font-size:12px;line-height:1.6;color:rgba(255,255,255,.42)}
.bf-nota a{color:rgba(255,255,255,.62);text-underline-offset:3px}
.bf-nota a:hover{color:#fff}

.bf-painel{position:relative;display:grid;grid-template-columns:92px 1fr;gap:10px;align-items:center}
.bf-poco{position:relative;height:290px;width:92px}
.bf-trilho{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.12)}
.bf-trilho-a{left:22px}
.bf-trilho-b{right:22px}
.bf-andar{position:absolute;left:22px;right:22px;height:1px;background:rgba(255,255,255,.08)}
.bf-cabo{position:absolute;left:50%;top:0;width:1px;height:251px;margin-left:-.5px;background:rgba(255,106,0,.5);transform-origin:top;transform:scaleY(1)}
.bf-carro{position:absolute;left:50%;top:8px;width:46px;height:42px;margin-left:-23px;display:grid;place-items:center;overflow:hidden;border:2px solid #ff6a00;border-radius:8px;background:#0d0d0d;color:#ff6a00;box-shadow:0 8px 24px rgba(0,0,0,.6),0 0 24px rgba(255,106,0,.25);transform:translateY(222px)}
.bf-carro svg{width:20px;height:20px}
.bf-carro::after{content:"";position:absolute;inset:0;background:#ff6a00;opacity:0}

.bf-preco{min-width:0}
.bf-de-linha{display:flex;align-items:center;gap:12px}
.bf-mini{font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,106,0,.9)}
.bf-de{position:relative;display:inline-block;font-size:24px;font-weight:700;color:rgba(255,255,255,.45)}
.bf-de::after{content:"";position:absolute;left:-4px;right:-4px;top:54%;height:2px;border-radius:2px;background:#ff6a00;transform-origin:left;transform:scaleX(1)}
.bf-por{display:flex;align-items:flex-end;gap:10px;margin-top:14px}
.bf-moeda{padding-bottom:.15em;font-size:clamp(26px,3.4vw,38px);font-weight:800;color:#ff6a00}
.bf-numero{display:flex;font-size:clamp(76px,11vw,116px);font-weight:800;line-height:1;color:#fff;filter:drop-shadow(0 0 22px rgba(255,106,0,.45))}
.bf-dig{display:block;width:.68em;height:1em;overflow:hidden;text-align:center}
.bf-fita{display:flex;flex-direction:column;transform:translateY(calc(var(--n) * -1em))}
.bf-fita span{display:block;height:1em;line-height:1}
.bf-setas{display:flex;flex-direction:column;align-self:center;margin-left:4px;color:#ff6a00}
.bf-setas svg{width:22px;height:22px;margin:-7px 0;opacity:.35;animation:bf-cai 1.8s ease-in-out infinite}
.bf-setas svg:nth-child(2){animation-delay:.25s}
.bf-setas svg:nth-child(3){animation-delay:.5s}
.bf-periodo{margin:10px 0 0;font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.5)}
.bf-desconto{display:inline-flex;align-items:center;gap:8px;margin-top:20px;padding:10px 16px;border-radius:999px;background:#ff6a00;color:#fff;font-size:14px;font-weight:800;box-shadow:0 0 30px rgba(255,106,0,.35)}
.bf-desconto svg{width:16px;height:16px}

/* Estado inicial (antes de a tela aparecer) e animação (quando ela entra na tela) */
.bf-antes .bf-fita{transform:translateY(0)}
.bf-antes .bf-carro{transform:translateY(0)}
.bf-antes .bf-cabo{transform:scaleY(.116)}
.bf-antes .bf-de::after{transform:scaleX(0)}
.bf-antes .bf-desconto{opacity:0;transform:scale(.6)}
.bf-rodando .bf-fita{animation:bf-rola 2s cubic-bezier(.22,.9,.25,1) both}
.bf-rodando .bf-dig:nth-child(2) .bf-fita{animation-delay:.12s}
.bf-rodando .bf-dig:nth-child(3) .bf-fita{animation-delay:.24s}
.bf-rodando .bf-carro{animation:bf-desce 1.9s cubic-bezier(.65,0,.35,1) both}
.bf-rodando .bf-carro::after{animation:bf-chega .7s ease-out 1.7s both}
.bf-rodando .bf-cabo{animation:bf-estica 1.9s cubic-bezier(.65,0,.35,1) both}
.bf-rodando .bf-de::after{animation:bf-risca .6s ease-out .5s both}
.bf-rodando .bf-desconto{animation:bf-surge .6s cubic-bezier(.2,1.4,.4,1) 1.7s both}

@keyframes bf-rola{from{transform:translateY(0)}to{transform:translateY(calc(var(--n) * -1em))}}
@keyframes bf-desce{from{transform:translateY(0)}to{transform:translateY(222px)}}
@keyframes bf-estica{from{transform:scaleY(.116)}to{transform:scaleY(1)}}
@keyframes bf-chega{from{opacity:.55}to{opacity:0}}
@keyframes bf-risca{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes bf-surge{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
@keyframes bf-cai{0%{opacity:0;transform:translateY(-8px)}50%{opacity:.9}100%{opacity:0;transform:translateY(8px)}}
@keyframes bf-pisca{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes bf-pulsa{0%,100%{box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 0 rgba(255,106,0,0)}50%{box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 60px rgba(255,106,0,.16)}}
@keyframes bf-varre{from{top:-160px}to{top:100%}}
@keyframes bf-gira{to{transform:rotate(360deg)}}

@media (max-width:900px){
  .bf{padding:72px 20px}
  .bf-cartao{grid-template-columns:1fr;gap:36px;padding:44px 26px}
  .bf-painel{grid-template-columns:92px 1fr;max-width:460px}
}
@media (max-width:520px){
  .bf-cartao{padding:40px 20px 32px}
  .bf-painel{grid-template-columns:1fr}
  .bf-poco{display:none}
  .bf-acoes .bf-botao{width:100%}
}
@media (prefers-reduced-motion:reduce){
  .bf *,.bf *::before,.bf *::after{animation:none!important;transition:none!important}
  .bf-fita{transform:translateY(calc(var(--n) * -1em))!important}
  .bf-carro{transform:translateY(222px)!important}
  .bf-cabo{transform:scaleY(1)!important}
  .bf-de::after{transform:scaleX(1)!important}
  .bf-desconto{opacity:1!important;transform:none!important}
}
`;

export default function BlackFriday() {
  const secao = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = secao.current;
    if (!el) return;
    // Sem observador ou com "reduzir movimento": fica no estado final, sem animar.
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.classList.add("bf-antes");
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        el.classList.remove("bf-antes");
        el.classList.add("bf-rodando");
        observador.disconnect();
      },
      { threshold: 0.35 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  if (!campanhaValida()) return null;
  const plano = PLANOS.find((p) => p.id === BLACK_FRIDAY.planoId);
  if (!plano) return null;

  const de = formatarReais(BLACK_FRIDAY.precoDe);
  const por = formatarReais(BLACK_FRIDAY.precoPor);
  const desconto = descontoPercentual();
  const colunas = colunasDoContador(BLACK_FRIDAY.precoDe, BLACK_FRIDAY.precoPor);
  const periodo = plano.periodo.charAt(0).toUpperCase() + plano.periodo.slice(1);
  const vigencia = BLACK_FRIDAY.vigencia.trim();

  return (
    <section ref={secao} id="black-friday" className="bf" aria-labelledby="bf-titulo">
      <style dangerouslySetInnerHTML={{ __html: ESTILO }} />
      <div className="bf-grade" aria-hidden="true" />
      <div className="bf-brilho" aria-hidden="true" />
      <div className="bf-varredura" aria-hidden="true" />
      <div className="bf-orbita" aria-hidden="true" />

      <div className="bf-miolo">
        <div className="bf-cartao">
          <span className="bf-canto bf-canto-a" aria-hidden="true" />
          <span className="bf-canto bf-canto-b" aria-hidden="true" />
          <span className="bf-canto bf-canto-c" aria-hidden="true" />
          <span className="bf-canto bf-canto-d" aria-hidden="true" />

          <div>
            <span className="bf-rotulo">
              <span className="bf-ponto" aria-hidden="true" /> black friday
            </span>
            <h2 id="bf-titulo" className="bf-titulo">
              Black Friday Nexa MP: o preço da sua landing page <span>desceu.</span>
            </h2>
            <p className="bf-lead">
              Na campanha, o plano {plano.nome} sai de {de} por {por}. É pagamento único, sem mensalidade.
            </p>

            <ul className="bf-lista">
              {plano.itens.map((item) => (
                <li key={item}>
                  <Check /> {item}
                </li>
              ))}
              <li>
                <Check /> {periodo}
              </li>
              {(plano.notas ?? []).map((nota) => (
                <li key={nota}>
                  <Check /> {nota}
                </li>
              ))}
            </ul>

            <div className="bf-acoes">
              <Link href={`/?plano=${plano.id}#contato`} className="bf-botao bf-botao-p">
                Quero a landing page por {por}
              </Link>
              <a href="#planos" className="bf-botao bf-botao-o">
                Ver todos os planos
              </a>
            </div>

            <p className="bf-nota">
              {vigencia ? `${vigencia}. ` : "Valor promocional durante a campanha. "}
              Condições de pagamento e prazo nos <Link href="/termos">Termos de Uso</Link>.
            </p>
          </div>

          <div className="bf-painel">
            <div className="bf-poco" aria-hidden="true">
              <span className="bf-trilho bf-trilho-a" />
              <span className="bf-trilho bf-trilho-b" />
              {[14, 38, 62, 86].map((topo) => (
                <span key={topo} className="bf-andar" style={{ top: `${topo}%` }} />
              ))}
              <span className="bf-cabo" />
              <span className="bf-carro">
                <Seta />
              </span>
            </div>

            <div className="bf-preco">
              <p className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
                De {de} por {por}, {desconto}% de desconto.
              </p>
              <div aria-hidden="true">
                <div className="bf-de-linha">
                  <span className="bf-mini">de</span>
                  <span className="bf-de">{de}</span>
                </div>
                <div className="bf-por">
                  <span className="bf-mini" style={{ alignSelf: "flex-start", marginTop: 6 }}>
                    por
                  </span>
                  <span className="bf-moeda">R$</span>
                  {colunas ? (
                    <span className="bf-numero">
                      {colunas.map((fita, i) => (
                        <span key={i} className="bf-dig">
                          <span className="bf-fita" style={{ "--n": fita.length - 1 } as React.CSSProperties}>
                            {fita.map((d, k) => (
                              <span key={k}>{d}</span>
                            ))}
                          </span>
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="bf-numero">{BLACK_FRIDAY.precoPor.toLocaleString("pt-BR")}</span>
                  )}
                  <span className="bf-setas">
                    <Seta />
                    <Seta />
                    <Seta />
                  </span>
                </div>
                <p className="bf-periodo">{plano.periodo}</p>
                <span className="bf-desconto">
                  <Seta /> {desconto}% de desconto
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}