import { PLANOS_TRAFEGO, formatarValor, TRAFEGO } from "@/src/lib/data/planos";
import { SERVICOS } from "@/src/lib/data/servicos";
import BotaoContato from "@/src/components/ui/BotaoContato";

/**
 * Seção "Tráfego pago": explica, sem números inventados, como o anúncio leva a pessoa até a empresa
 * e leva ao plano de tráfego pago (aba em Planos). A animação é só CSS: o caminho se acende etapa por etapa,
 * em ciclo, e fica parado quando o aparelho pede "reduzir movimento".
 */

const ETAPAS = [
  {
    titulo: "Anúncio",
    texto: "Aparece para o público que a sua empresa quer alcançar.",
    icone: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      </>
    ),
  },
  {
    titulo: "Clique",
    texto: "A pessoa se interessa e toca no anúncio.",
    icone: <path d="M6 3l12 7-5 1.6L10.5 17 6 3z" />,
  },
  {
    titulo: "Landing page",
    texto: "Chega a uma página que apresenta a sua empresa com clareza.",
    icone: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      </>
    ),
  },
  {
    titulo: "Contato",
    texto: "Entra em contato com a sua empresa para conversar.",
    icone: <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />,
  },
];

const ESTILO = `
.tp{position:relative;isolation:isolate;overflow:hidden;background:#070707;color:#f7f7f5;padding:96px 24px}
.tp *{box-sizing:border-box}
.tp-grade{position:absolute;inset:0;z-index:-2;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse at 75% 45%,#000 10%,transparent 70%);mask-image:radial-gradient(ellipse at 75% 45%,#000 10%,transparent 70%)}
.tp-brilho{position:absolute;inset:0;z-index:-1;background:radial-gradient(circle at 78% 48%,rgba(255,106,0,.14),transparent 45%)}
.tp-miolo{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;max-width:1180px;margin:0 auto}
.tp-rotulo{display:inline-flex;align-items:center;gap:10px;font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.25em;text-transform:uppercase;color:#ff9a4d}
.tp-rotulo::before{content:"";width:48px;height:1px;background:#ff6a00}
.tp-titulo{margin:22px 0 0;font-size:clamp(32px,4.6vw,56px);line-height:1.02;font-weight:900;letter-spacing:-.025em}
.tp-titulo span{color:#ff6a00}
.tp-lead{margin:20px 0 0;max-width:500px;color:rgba(255,255,255,.62);font-size:17px;line-height:1.7}
.tp-pontos{display:grid;gap:14px;margin:28px 0 0;padding:0;list-style:none}
.tp-pontos li{display:flex;gap:14px;align-items:flex-start;font-size:14px;line-height:1.6;color:rgba(255,255,255,.62)}
.tp-pontos strong{display:block;color:#fff;font-size:15px}
.tp-pontos li::before{content:"";flex:none;width:8px;height:8px;margin-top:7px;border-radius:2px;background:#ff6a00;transform:rotate(45deg)}
.tp-acoes{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.tp-botao{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;transition:transform .3s ease,background-color .3s ease,color .3s ease,border-color .3s ease}
.tp-botao:hover{transform:translateY(-3px)}
.tp-botao:active{transform:translateY(0) scale(.97)}
.tp-botao:focus-visible{outline:2px solid #fff;outline-offset:3px}
.tp-botao-p{background:#ff6a00;color:#fff;box-shadow:0 0 35px rgba(255,106,0,.28)}
.tp-botao-p:hover{background:#fff;color:#000}
.tp-botao-o{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.03);color:#fff}
.tp-botao-o:hover{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.1)}
.tp-precos{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:22px;font-size:12px;color:rgba(255,255,255,.45)}
.tp-preco{padding:6px 12px;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:rgba(255,255,255,.8);font-weight:700;text-decoration:none;transition:border-color .3s ease,color .3s ease}
.tp-preco:hover{border-color:#ff6a00;color:#fff}
.tp-preco:focus-visible{outline:2px solid #ff6a00;outline-offset:2px}

.tp-trilha{position:relative;display:grid;gap:16px;margin:0;padding:0 0 0 44px;list-style:none}
.tp-trilha::before{content:"";position:absolute;left:14px;top:30px;bottom:30px;width:2px;background:linear-gradient(to bottom,rgba(255,106,0,.55),rgba(255,255,255,.08))}
.tp-feixe{position:absolute;left:9px;top:12.5%;width:12px;height:12px;margin-top:-6px;border-radius:50%;background:#ff6a00;box-shadow:0 0 18px 5px rgba(255,106,0,.65);animation:tp-desce 8s ease-in-out infinite;z-index:2}
.tp-etapa{position:relative;display:flex;align-items:center;gap:18px;padding:18px 22px;border:1px solid rgba(255,255,255,.1);border-radius:20px;background:#121212;animation:tp-acende 8s linear infinite;animation-delay:calc(var(--i) * 2s)}
.tp-etapa::before{content:"";position:absolute;left:-36px;top:50%;width:12px;height:12px;margin-top:-6px;border-radius:50%;background:#070707;border:2px solid rgba(255,106,0,.6)}
.tp-etapa::after{content:"";position:absolute;left:-24px;top:50%;width:24px;height:1px;background:rgba(255,106,0,.35)}
.tp-icone{flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,106,0,.3);background:rgba(255,106,0,.08);color:#ff6a00}
.tp-icone svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.tp-etapa h3{margin:0;font-size:17px;font-weight:800;color:#fff}
.tp-etapa p{margin:4px 0 0;font-size:13.5px;line-height:1.55;color:rgba(255,255,255,.55)}
.tp-num{margin-left:auto;font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;color:rgba(255,255,255,.25)}

@keyframes tp-acende{0%,20%{border-color:rgba(255,106,0,.8);background:#1a120c;box-shadow:0 0 40px rgba(255,106,0,.16)}28%,100%{border-color:rgba(255,255,255,.1);background:#121212;box-shadow:none}}
@keyframes tp-desce{0%{top:12.5%;opacity:0}3%,20%{top:12.5%;opacity:1}27%,45%{top:37.5%;opacity:1}52%,70%{top:62.5%;opacity:1}77%,94%{top:87.5%;opacity:1}100%{top:87.5%;opacity:0}}

@media (max-width:900px){
  .tp{padding:72px 20px}
  .tp-miolo{grid-template-columns:1fr;gap:44px}
}
@media (max-width:520px){
  .tp-acoes .tp-botao{width:100%}
  .tp-etapa{gap:14px;padding:16px 16px}
  .tp-trilha{padding-left:34px}
  .tp-trilha::before{left:9px}
  .tp-feixe{left:4px}
  .tp-etapa::before{left:-30px}
  .tp-etapa::after{left:-18px;width:18px}
}
@media (prefers-reduced-motion:reduce){
  .tp *,.tp *::before,.tp *::after{animation:none!important;transition:none!important}
  .tp-feixe{display:none}
}
`;

export default function TrafegoPago() {
  const servico = SERVICOS.find((s) => s.id === "trafego-pago");
  const primeira = PLANOS_TRAFEGO[0];

  return (
    <section id="trafego-pago" className="tp" aria-labelledby="tp-titulo">
      <style dangerouslySetInnerHTML={{ __html: ESTILO }} />
      <div className="tp-grade" aria-hidden="true" />
      <div className="tp-brilho" aria-hidden="true" />

      <div className="tp-miolo">
        <div>
          <p className="tp-rotulo">tráfego pago</p>
          <h2 id="tp-titulo" className="tp-titulo">
            Sua empresa na frente de quem pode <span>se tornar cliente.</span>
          </h2>
          <p className="tp-lead">
            {servico ? servico.descricao : "Campanhas de anúncios pensadas para colocar sua empresa na frente de quem realmente pode se tornar cliente."}
          </p>

          <ul className="tp-pontos">
            <li>
              <span>
                <strong>Anúncio e página trabalham juntos</strong>
                Por isso a Nexa MP também cria a landing page para onde o anúncio leva.
              </span>
            </li>
            <li>
              <span>
                <strong>Gestão e verba de anúncios no mesmo valor</strong>
                {TRAFEGO.itens[0]} e {TRAFEGO.itens[1].toLowerCase()}, por {primeira.preco} por mês.
              </span>
            </li>
            <li>
              <span>
                <strong>Sem promessa de número</strong>
                O resultado depende de segmento, oferta, região e concorrência. A Nexa MP não promete número de clientes nem de vendas.
              </span>
            </li>
          </ul>

          <div className="tp-acoes">
            <a href="#planos-trafego" className="tp-botao tp-botao-p">
              Ver o plano de tráfego pago
            </a>
            <BotaoContato assunto="trafego-pago" href="/#contato" className="tp-botao tp-botao-o">
              Conversar sobre anúncios
            </BotaoContato>
          </div>

          <div className="tp-precos">
            <span>Por mês:</span>
            {PLANOS_TRAFEGO.map((p) => (
              <a key={p.id} href="#planos-trafego" className="tp-preco">
                {formatarValor(p.valor)}
              </a>
            ))}
          </div>
        </div>

        <ol className="tp-trilha" aria-label="Como o tráfego pago leva uma pessoa até a sua empresa">
          <span className="tp-feixe" aria-hidden="true" />
          {ETAPAS.map((etapa, i) => (
            <li key={etapa.titulo} className="tp-etapa" style={{ "--i": i } as React.CSSProperties}>
              <span className="tp-icone" aria-hidden="true">
                <svg viewBox="0 0 24 24">{etapa.icone}</svg>
              </span>
              <div>
                <h3>{etapa.titulo}</h3>
                <p>{etapa.texto}</p>
              </div>
              <span className="tp-num" aria-hidden="true">
                0{i + 1}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}