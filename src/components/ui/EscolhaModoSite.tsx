"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  aparelhoParecePouco,
  EVENTO_ESCOLHER_MODO,
  modoAtual,
  salvarModo,
  useModoSite,
  type ModoSite,
} from "@/src/lib/modoSite";

/**
 * Janelinha "Como você prefere ver o site?", aberta sozinha na primeira visita e pelo link "Modo do site" do rodapé.
 * - Escolheu: a escolha fica salva neste navegador e vale nas próximas visitas.
 * - Fechou sem escolher (Esc ou botão "Decidir depois"): nada é salvo; o site roda como no modo leve e a pergunta volta na próxima visita.
 * - Páginas legais (privacidade e termos) não abrem a janelinha sozinha, para não atrapalhar a leitura.
 */

const PAGINAS_SEM_PERGUNTA = ["/politica-de-privacidade", "/termos"];

const ESTILO = `
.em{position:fixed;inset:0;margin:auto;height:fit-content;max-height:calc(100dvh - 24px);overflow:auto;width:calc(100% - 32px);max-width:540px;padding:0;border:1px solid rgba(255,255,255,.12);border-radius:22px;background:#101010;color:#f7f7f5;font-family:inherit}
.em:focus{outline:none}
.em::backdrop{background:rgba(0,0,0,.8)}
.em *{box-sizing:border-box}
.em-corpo{padding:26px 22px 22px}
.em-rotulo{font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase;color:#ff9a4d}
.em-titulo{margin:12px 0 0;font-size:22px;line-height:1.2;font-weight:800;letter-spacing:-.01em}
.em-texto{margin:10px 0 0;font-size:14px;line-height:1.6;color:rgba(255,255,255,.62)}
.em-dica{margin:14px 0 0;padding:10px 12px;border:1px solid rgba(255,106,0,.35);border-radius:12px;background:rgba(255,106,0,.08);font-size:13px;line-height:1.5;color:rgba(255,255,255,.8)}
.em-opcoes{display:grid;gap:12px;margin:20px 0 0}
.em-opcao{display:block;width:100%;padding:16px 16px 15px;border:1px solid rgba(255,255,255,.14);border-radius:16px;background:#161616;color:inherit;font-family:inherit;text-align:left;cursor:pointer}
.em-opcao:hover{border-color:rgba(255,106,0,.7);background:#1b1b1b}
.em-opcao:focus-visible{outline:2px solid #ff6a00;outline-offset:3px}
.em-opcao[aria-pressed="true"]{border-color:#ff6a00;background:rgba(255,106,0,.1)}
.em-nome{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:16px;font-weight:800}
.em-atual{padding:3px 8px;border-radius:999px;background:#ff6a00;color:#fff;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.em-desc{display:block;margin-top:6px;font-size:13px;line-height:1.55;color:rgba(255,255,255,.6);font-weight:400}
.em-rodape{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin:18px 0 0;font-size:12px;line-height:1.5;color:rgba(255,255,255,.42)}
.em-fechar{padding:8px 4px;border:0;background:none;color:rgba(255,255,255,.72);font:inherit;font-size:12px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.em-fechar:hover{color:#fff}
.em-fechar:focus-visible{outline:2px solid #ff6a00;outline-offset:2px}
`;

export default function EscolhaModoSite() {
  const ref = useRef<HTMLDialogElement>(null);
  const caminho = usePathname();
  const modo = useModoSite();
  const [sugerirLeve, setSugerirLeve] = useState(false);
  const jaPerguntou = useRef(false);

  const abrir = useCallback(() => {
    const el = ref.current;
    if (!el || el.open) return;
    setSugerirLeve(aparelhoParecePouco());
    try {
      el.showModal();
    } catch {
      /* navegador sem <dialog> modal: o site segue no modo leve, sem a janelinha */
    }
  }, []);

  // Abre sozinha na primeira visita (modo ainda "pendente"), exceto nas páginas legais.
  useEffect(() => {
    if (jaPerguntou.current) return;
    if (modoAtual() !== "pendente") return;
    if (PAGINAS_SEM_PERGUNTA.some((p) => caminho === p || caminho.startsWith(`${p}/`))) return;
    jaPerguntou.current = true;
    abrir();
  }, [caminho, abrir]);

  // Abre quando a pessoa clica em "Modo do site", no rodapé.
  useEffect(() => {
    window.addEventListener(EVENTO_ESCOLHER_MODO, abrir);
    return () => window.removeEventListener(EVENTO_ESCOLHER_MODO, abrir);
  }, [abrir]);

  function escolher(novo: ModoSite) {
    salvarModo(novo);
    ref.current?.close();
  }

  return (
    <dialog ref={ref} className="em" aria-labelledby="em-titulo" aria-describedby="em-texto">
      <style dangerouslySetInnerHTML={{ __html: ESTILO }} />
      <div className="em-corpo">
        <p className="em-rotulo">modo do site</p>
        <h2 id="em-titulo" className="em-titulo">
          Como você prefere ver o site?
        </h2>
        <p id="em-texto" className="em-texto">
          Escolha a versão que funciona melhor no seu aparelho. Você pode trocar quando quiser, no rodapé do site.
        </p>

        {sugerirLeve && (
          <p className="em-dica">
            Seu aparelho ou sua conexão parece mais simples. Nesse caso, o modo leve tende a rodar com menos esforço.
          </p>
        )}

        <div className="em-opcoes">
          <button type="button" className="em-opcao" aria-pressed={modo === "completo"} onClick={() => escolher("completo")}>
            <span className="em-nome">
              Modo completo {modo === "completo" && <span className="em-atual">em uso</span>}
            </span>
            <span className="em-desc">Todas as animações e efeitos visuais do site. Indicado para computadores e celulares mais recentes.</span>
          </button>
          <button type="button" className="em-opcao" aria-pressed={modo === "leve"} onClick={() => escolher("leve")}>
            <span className="em-nome">
              Modo leve {modo === "leve" && <span className="em-atual">em uso</span>}
            </span>
            <span className="em-desc">Menos animações e efeitos, para o site rodar com menos esforço em celulares mais antigos ou conexões lentas.</span>
          </button>
        </div>

        <div className="em-rodape">
          <span>Sua escolha fica salva só neste navegador.</span>
          <button type="button" className="em-fechar" onClick={() => ref.current?.close()}>
            {modo === "pendente" ? "Decidir depois" : "Fechar"}
          </button>
        </div>
      </div>
    </dialog>
  );
}