/**
 * Fundos animados dos cards de "Capacidades". Cada um ilustra o tema do serviço:
 *  design → mesa de design (caneta, tipografia, paleta, caixa de seleção)
 *  social → post com corações/comentários subindo
 *  growth → gráfico crescendo + clique no alvo
 *  web → página se montando bloco a bloco
 *  automation → conversa de chatbot (digitando… resposta)
 *
 * Sem estado: só SVG + CSS (animações em app/globals.css, classes "sv-*"). Funciona como Server Component.
 */

export type TipoFundo = "design" | "social" | "growth" | "web" | "automation";

const HEART = "M0 -3C-1 -9 -11 -9 -11 -2C-11 5 -4 8 0 12C4 8 11 5 11 -2C11 -9 1 -9 0 -3Z";

function Design() {
  return (
    <svg viewBox="0 0 560 340" preserveAspectRatio="xMaxYMid meet" className="sv-svg">
      <path d="M0 70H560M0 270H560M110 0V340M450 0V340" className="sv-guide" />
      <text x="262" y="222" className="sv-glyph">Aa</text>

      {/* curva da ferramenta caneta + alças */}
      <path d="M40 260C120 60 230 60 300 170S440 290 520 100" pathLength={1} className="sv-pen" />
      <g className="sv-anchors">
        <path d="M40 260L120 60M230 60L370 280M520 100L440 290" className="sv-handle" />
        {[[120, 60], [230, 60], [370, 280], [440, 290]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" className="sv-handle-dot" />)}
        {[[40, 260], [300, 170], [520, 100]].map(([x, y]) => <rect key={`${x}${y}`} x={x - 5} y={y - 5} width="10" height="10" className="sv-anchor-sq" />)}
      </g>

      {/* forma selecionada: quadrado que vira círculo */}
      <g transform="translate(446 66)">
        <rect x="-40" y="-40" width="80" height="80" className="sv-sel-frame" />
        {[[-40, -40], [40, -40], [-40, 40], [40, 40]].map(([x, y]) => <rect key={`${x}${y}`} x={x - 3.5} y={y - 3.5} width="7" height="7" className="sv-sel-h" />)}
        <rect x="-22" y="-22" width="44" height="44" rx="0" className="sv-shape" />
      </g>

      {/* paleta */}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={382 + i * 34} cy="314" r="11" className={`sv-swatch ${i === 0 ? "sv-sw-a" : i === 1 ? "sv-sw-b" : i === 2 ? "sv-sw-c" : "sv-sw-d"}`} style={{ animationDelay: `${i * 0.28}s` }} />
      ))}
    </svg>
  );
}

function Social() {
  const subindo = [
    { x: 92, y: 250, t: "h", d: 0 },
    { x: 360, y: 262, t: "c", d: 1.1 },
    { x: 122, y: 214, t: "c", d: 2.2 },
    { x: 384, y: 220, t: "h", d: 3.0 },
    { x: 330, y: 270, t: "h", d: 4.1 },
  ];
  return (
    <svg viewBox="0 0 420 300" preserveAspectRatio="xMaxYMid meet" className="sv-svg">
      <g className="sv-bob">
        <rect x="150" y="34" width="150" height="214" rx="20" className="sv-card" />
        <circle cx="174" cy="62" r="11" className="sv-card-img" />
        <rect x="193" y="53" width="64" height="7" rx="3.5" className="sv-card-line" />
        <rect x="193" y="66" width="42" height="5" rx="2.5" className="sv-card-line sv-dim" />
        <rect x="166" y="88" width="118" height="92" rx="12" className="sv-card-img" />
        <path d="M214 120L214 148L238 134Z" className="sv-play" />
        <circle cx="226" cy="134" r="22" className="sv-play-ring" />
        <rect x="166" y="194" width="86" height="6" rx="3" className="sv-card-line" />
        <rect x="166" y="208" width="62" height="6" rx="3" className="sv-card-line sv-dim" />
        <g transform="translate(272 224)"><path d={HEART} transform="scale(.9)" className="sv-heart-mini" /></g>
      </g>
      {subindo.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`}>
          {s.t === "h" ? (
            <path d={HEART} className="sv-rise" style={{ animationDelay: `${s.d}s` }} />
          ) : (
            <g className="sv-rise sv-rise-w" style={{ animationDelay: `${s.d}s` }}>
              <rect x="-12" y="-10" width="24" height="17" rx="7" />
              <path d="M-4 6L-9 13L2 7Z" />
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

function Growth() {
  const alturas = [50, 80, 68, 118, 150, 190];
  return (
    <svg viewBox="0 0 420 300" preserveAspectRatio="xMaxYMid meet" className="sv-svg">
      <path d="M40 250H390M40 250V36" className="sv-axis" />
      <path d="M40 200H390M40 150H390M40 100H390" className="sv-guide" />
      {alturas.map((h, i) => (
        <rect key={i} x={62 + i * 54} y={250 - h} width="30" height={h} rx="4" className="sv-bar" style={{ animationDelay: `${i * 0.16}s` }} />
      ))}
      <path d="M77 190L131 158L185 170L239 116L293 90L347 50" pathLength={1} className="sv-trend" />
      <g transform="translate(347 50)">
        <circle r="5" className="sv-target" />
        {[0, 0.8, 1.6].map((d) => <circle key={d} r="9" className="sv-ripple" style={{ animationDelay: `${d}s` }} />)}
      </g>
      <g transform="translate(347 50)">
        <path d="M0 0V22L6 17L10 26L14 24L10 15H18Z" className="sv-cursor" />
      </g>
    </svg>
  );
}

function Web() {
  return (
    <svg viewBox="0 0 420 300" preserveAspectRatio="xMaxYMid meet" className="sv-svg">
      <rect x="70" y="36" width="300" height="220" rx="14" className="sv-win" />
      <path d="M70 62H370" className="sv-win-bar" />
      {[90, 104, 118].map((x, i) => <circle key={x} cx={x} cy="49" r="3.5" className={i === 0 ? "sv-dot-o" : "sv-dot-w"} />)}
      <rect x="142" y="43" width="120" height="12" rx="6" className="sv-url" />

      <rect x="94" y="84" width="150" height="12" rx="6" className="sv-build" style={{ animationDelay: ".2s" }} />
      <rect x="94" y="108" width="190" height="6" rx="3" className="sv-build sv-dim" style={{ animationDelay: ".5s" }} />
      <rect x="94" y="122" width="160" height="6" rx="3" className="sv-build sv-dim" style={{ animationDelay: ".7s" }} />
      <rect x="94" y="146" width="72" height="24" rx="12" className="sv-build sv-build-o" style={{ animationDelay: "1s" }} />
      <rect x="262" y="84" width="84" height="86" rx="10" className="sv-pop-in sv-block" style={{ animationDelay: "1.25s" }} />
      {[94, 182, 270].map((x, i) => (
        <rect key={x} x={x} y="192" width="76" height="46" rx="9" className="sv-pop-in sv-block-w" style={{ animationDelay: `${1.55 + i * 0.22}s` }} />
      ))}

      <text x="22" y="122" className="sv-code sv-float">{"</>"}</text>
      <text x="378" y="82" className="sv-code sv-float" style={{ animationDelay: "1.4s" }}>{"{ }"}</text>
    </svg>
  );
}

function Automation() {
  return (
    <svg viewBox="0 0 420 300" preserveAspectRatio="xMaxYMid meet" className="sv-svg">
      {/* cliente 1 */}
      <g className="sv-chat sv-chat-u1">
        <rect x="66" y="40" width="148" height="38" rx="19" className="sv-bub" />
        <rect x="86" y="53" width="96" height="6" rx="3" className="sv-bub-line" />
        <rect x="86" y="64" width="62" height="5" rx="2.5" className="sv-bub-line sv-dim" />
      </g>
      {/* bot digitando 1 */}
      <g className="sv-chat sv-typing sv-chat-t1">
        <rect x="266" y="96" width="86" height="34" rx="17" className="sv-bub-bot" />
        {[0, 1, 2].map((i) => <circle key={i} cx={288 + i * 16} cy="113" r="3.5" className="sv-tdot" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </g>
      {/* bot responde 1 */}
      <g className="sv-chat sv-chat-b1">
        <rect x="170" y="96" width="182" height="50" rx="20" className="sv-bub-bot" />
        <rect x="190" y="110" width="124" height="6" rx="3" className="sv-bub-line-o" />
        <rect x="190" y="123" width="92" height="6" rx="3" className="sv-bub-line sv-dim" />
      </g>
      {/* cliente 2 */}
      <g className="sv-chat sv-chat-u2">
        <rect x="66" y="166" width="126" height="34" rx="17" className="sv-bub" />
        <rect x="86" y="180" width="80" height="6" rx="3" className="sv-bub-line" />
      </g>
      {/* bot digitando 2 */}
      <g className="sv-chat sv-typing sv-chat-t2">
        <rect x="266" y="216" width="86" height="34" rx="17" className="sv-bub-bot" />
        {[0, 1, 2].map((i) => <circle key={i} cx={288 + i * 16} cy="233" r="3.5" className="sv-tdot" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </g>
      {/* bot responde 2 */}
      <g className="sv-chat sv-chat-b2">
        <rect x="190" y="216" width="162" height="50" rx="20" className="sv-bub-bot" />
        <rect x="210" y="230" width="104" height="6" rx="3" className="sv-bub-line-o" />
        <rect x="210" y="243" width="74" height="6" rx="3" className="sv-bub-line sv-dim" />
      </g>
    </svg>
  );
}

const VISUAIS: Record<TipoFundo, () => React.JSX.Element> = {
  design: Design,
  social: Social,
  growth: Growth,
  web: Web,
  automation: Automation,
};

export default function ServicoFundo({ tipo }: { tipo: TipoFundo }) {
  const Visual = VISUAIS[tipo];
  return (
    <div className={`sv-bg sv-${tipo}`} aria-hidden="true">
      <Visual />
    </div>
  );
}
