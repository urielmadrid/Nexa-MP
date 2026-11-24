"use client";

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

/**
 * Palco do Diagnóstico: uma cena SVG que começa como "planta" tracejada e vai sendo montada
 * peça por peça, conforme o visitante seleciona os problemas. No centro, o selo NexaMP acende
 * a cada peça ligada e, com as 6, fecha o conjunto.
 */

type Props = {
  /** solved[i] = a peça i já foi montada */
  solved: boolean[];
  /** peça em destaque (hover/foco no problema correspondente) */
  active: number;
  rotulos: readonly string[];
};

const CORE = { x: 260, y: 210, r: 62 };
const BOX = { w: 140, h: 100 };

// Posição de cada peça (canto superior esquerdo), ordem = índice do problema.
const SLOTS = [
  { x: 16, y: 20, side: "left" },   // 0 Conteúdo
  { x: 364, y: 20, side: "right" }, // 1 Site
  { x: 364, y: 160, side: "right" }, // 2 Tráfego
  { x: 16, y: 160, side: "left" },  // 3 Público
  { x: 16, y: 300, side: "left" },  // 4 Canais
  { x: 364, y: 300, side: "right" }, // 5 Confiança
] as const;

// De onde cada peça "chega" ao ser montada.
const entrada = (fx: string, fy: string, fr: string) =>
  ({ "--fx": fx, "--fy": fy, "--fr": fr }) as CSSProperties;
const ENTRADAS: CSSProperties[] = [
  entrada("-46px", "-34px", "-10deg"),
  entrada("46px", "-34px", "9deg"),
  entrada("50px", "12px", "-8deg"),
  entrada("-50px", "12px", "8deg"),
  entrada("-46px", "40px", "11deg"),
  entrada("46px", "40px", "-11deg"),
];

// vértices do hexágono (ponta para cima)
const HEX = Array.from({ length: 6 }, (_, k) => {
  const a = (Math.PI / 180) * (-90 + k * 60);
  return { x: CORE.x + CORE.r * Math.cos(a), y: CORE.y + CORE.r * Math.sin(a) };
});
const HEX_PATH = HEX.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
// aresta que "acende" para cada peça (0..5)
const HEX_EDGES = HEX.map((p, i) => {
  const n = HEX[(i + 1) % 6];
  return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} L${n.x.toFixed(1)} ${n.y.toFixed(1)}`;
});
// ponto do hexágono onde a linha de cada peça se liga
const LIGACAO = [HEX[5], HEX[1], HEX[2], { x: CORE.x - CORE.r * 0.866, y: CORE.y }, HEX[4], HEX[3]];

function linha(i: number) {
  const s = SLOTS[i];
  const x1 = s.side === "left" ? s.x + BOX.w : s.x;
  const y1 = s.y + BOX.h / 2;
  const alvo = LIGACAO[i];
  const mx = (x1 + alvo.x) / 2;
  return `M${x1} ${y1} C${mx} ${y1} ${mx} ${alvo.y.toFixed(1)} ${alvo.x.toFixed(1)} ${alvo.y.toFixed(1)}`;
}

function useReducido() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/* ---------- desenhos de cada peça (coordenadas 0..140 x 0..100) ---------- */
const DESENHOS: ReactNode[] = [
  // 0 · Conteúdo: perfil + grade de posts
  <g key="d0">
    <circle cx="16" cy="13" r="6" className="bp-fill" />
    <rect x="28" y="10" width="52" height="6" rx="3" className="bp-line-fill" />
    {[0, 1, 2].flatMap((c) =>
      [0, 1].map((r) => (
        <rect key={`${c}${r}`} x={10 + c * 44} y={28 + r * 36} width="38" height="30" rx="5" className={c === 0 && r === 0 ? "bp-solid" : (c + r) % 2 ? "bp-fill" : "bp-soft"} />
      )),
    )}
  </g>,
  // 1 · Site: janela com CTA
  <g key="d1">
    <path d="M0 18H140" className="bp-stroke" />
    {[10, 20, 30].map((x) => <circle key={x} cx={x} cy="9" r="2.5" className={x === 10 ? "bp-solid" : "bp-fill"} />)}
    <rect x="12" y="28" width="72" height="8" rx="4" className="bp-line-fill" />
    <rect x="12" y="43" width="96" height="4" rx="2" className="bp-soft" />
    <rect x="12" y="52" width="78" height="4" rx="2" className="bp-soft" />
    <rect x="12" y="68" width="48" height="18" rx="9" className="bp-solid" />
    <rect x="86" y="62" width="42" height="28" rx="5" className="bp-fill" />
  </g>,
  // 2 · Tráfego: gráfico subindo
  <g key="d2">
    <path d="M14 10V84H128" className="bp-stroke" />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={24 + i * 21} y={84 - (14 + i * 11)} width="12" height={14 + i * 11} rx="2" className="bp-soft" />)}
    <path d="M20 70L45 58L66 62L92 36L120 18" pathLength={1} className="bp-trace" />
    <circle cx="120" cy="18" r="4" className="bp-solid" />
  </g>,
  // 3 · Público: alvo com pessoas
  <g key="d3">
    <circle cx="70" cy="50" r="40" className="bp-stroke" />
    <circle cx="70" cy="50" r="26" className="bp-stroke" />
    <circle cx="70" cy="50" r="12" className="bp-fill" />
    <circle cx="70" cy="50" r="4" className="bp-solid" />
    {[[34, 28], [108, 34], [100, 80], [38, 76]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" className="bp-solid" />)}
  </g>,
  // 4 · Canais: rede de nós
  <g key="d4">
    {[[24, 22], [116, 20], [122, 78], [26, 80], [70, 90]].map(([x, y]) => <path key={`l${x}`} d={`M70 50L${x} ${y}`} className="bp-stroke" />)}
    {[[24, 22], [116, 20], [122, 78], [26, 80], [70, 90]].map(([x, y]) => <circle key={`n${x}`} cx={x} cy={y} r="6" className="bp-fill" />)}
    <circle cx="70" cy="50" r="11" className="bp-solid" />
  </g>,
  // 5 · Confiança: escudo com check
  <g key="d5">
    <path d="M70 8L112 22V52C112 76 94 90 70 96C46 90 28 76 28 52V22Z" className="bp-fill-strong" />
    <path d="M50 52L64 66L92 36" pathLength={1} className="bp-check" />
  </g>,
];

export default function ProblemaPalco({ solved, active, rotulos }: Props) {
  const reduzido = useReducido();
  const total = solved.filter(Boolean).length;
  const completo = total === solved.length;

  return (
    <svg viewBox="0 0 520 420" className="palco-svg block h-auto w-full" role="img" aria-label={`Presença digital em montagem: ${total} de ${solved.length} peças ligadas`}>
      <defs>
        <radialGradient id="palco-brilho" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff6a00" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ff6a00" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* brilho do núcleo cresce com as peças */}
      <circle cx={CORE.x} cy={CORE.y} r="150" fill="url(#palco-brilho)" style={{ opacity: 0.1 + (total / solved.length) * 0.9, transition: "opacity .8s ease" }} />

      {/* ligações */}
      {SLOTS.map((_, i) => (
        <g key={`lig${i}`}>
          <path d={linha(i)} className="palco-ghost-line" />
          <path d={linha(i)} pathLength={1} className={`palco-line ${solved[i] ? "is-built" : ""}`} />
          {solved[i] && !reduzido && (
            <circle r="2.6" className="palco-pulse">
              <animateMotion dur={`${2.2 + (i % 3) * 0.4}s`} repeatCount="indefinite" path={linha(i)} begin={`${0.9 + i * 0.15}s`} />
            </circle>
          )}
        </g>
      ))}

      {/* peças */}
      {SLOTS.map((s, i) => (
        <g key={`peca${i}`} transform={`translate(${s.x} ${s.y})`}>
          {/* planta (ainda não montada) */}
          <g className={`palco-ghost ${solved[i] ? "is-hidden" : ""} ${active === i && !solved[i] ? "is-active" : ""}`}>
            <rect width={BOX.w} height={BOX.h} rx="14" className="palco-ghost-frame" />
            <path d="M18 38L44 62M96 30L120 54M30 78H80" className="palco-ghost-noise" />
          </g>
          {/* peça montada */}
          <g className={`palco-piece ${solved[i] ? "is-built" : ""} ${active === i ? "is-active" : ""}`} style={ENTRADAS[i]}>
            <rect width={BOX.w} height={BOX.h} rx="14" className="palco-frame" />
            {DESENHOS[i]}
          </g>
          <text x="2" y="-8" className={`palco-label ${solved[i] ? "is-built" : ""}`}>{String(i + 1).padStart(2, "0")} / {rotulos[i]}</text>
        </g>
      ))}

      {/* núcleo NexaMP */}
      <g className={`palco-core ${completo ? "is-complete" : ""}`}>
        <path d={HEX_PATH} className="palco-core-bg" />
        <path d={HEX_PATH} className="palco-core-ghost" />
        {HEX_EDGES.map((d, i) => <path key={d} d={d} pathLength={1} className={`palco-edge ${solved[i] ? "is-built" : ""}`} />)}
        <g style={{ opacity: 0.28 + (total / solved.length) * 0.72, transition: "opacity .8s ease" }}>
          <text x={CORE.x} y={CORE.y - 2} textAnchor="middle" className="palco-core-nexa">Nexa</text>
          <text x={CORE.x} y={CORE.y + 26} textAnchor="middle" className="palco-core-mp">MP</text>
        </g>
        {completo && !reduzido && <circle cx={CORE.x} cy={CORE.y} r={CORE.r + 14} className="palco-orbit" />}
      </g>
    </svg>
  );
}
