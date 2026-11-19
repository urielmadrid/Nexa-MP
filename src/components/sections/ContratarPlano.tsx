"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { EVENTO_CONTRATAR, type DetalheContratar } from "@/src/lib/contratarPlano";
import { linkEmail, linkWhatsApp } from "@/src/lib/data/contato";
import { problemaNoContato } from "@/src/lib/data/mensagemContato";
import { mensagemDoPlano, resumoDoPlano } from "@/src/lib/data/mensagensPlanos";
import { TRAFEGO_PERSONALIZADO } from "@/src/lib/data/planos";

/**
 * Janelinha que abre quando a pessoa clica em "Quero o plano ...".
 *
 * Opção 1: enviar uma mensagem pronta para a Nexa MP. A pessoa escolhe somente WhatsApp, somente e-mail ou os dois.
 *          Se escolher e-mail (ou os dois), aparece a caixa para o melhor contato e o aceite da política de privacidade.
 * Opção 2: montar a própria mensagem no formulário do Contato (o plano já vai marcado).
 *
 * O texto da mensagem de cada plano fica em src/lib/data/mensagensPlanos.ts.
 */

type Canal = "whatsapp" | "email" | "ambos";
type Envio = "" | "enviando" | "enviado" | "falhou" | "limite";
type Zap = "" | "aberto" | "bloqueado";

const CANAIS: { id: Canal; rotulo: string }[] = [
  { id: "whatsapp", rotulo: "Somente WhatsApp" },
  { id: "email", rotulo: "Somente e-mail" },
  { id: "ambos", rotulo: "WhatsApp e e-mail" },
];

const ESTILO = `
.cp{width:calc(100vw - 24px);max-width:560px;max-height:calc(100dvh - 24px);padding:0;border:0;background:transparent;color:#f7f7f5;overflow:visible}
.cp *{box-sizing:border-box}
.cp::backdrop{background:rgba(0,0,0,.74);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.cp[open]{animation:cp-fade .25s ease-out}
.cp[open]::backdrop{animation:cp-fade .25s ease-out}
.cp-caixa{position:relative;max-height:calc(100dvh - 24px);overflow-y:auto;padding:30px 28px 28px;border:1px solid rgba(255,106,0,.4);border-radius:26px;background:linear-gradient(160deg,#141414,#0b0b0b);box-shadow:0 40px 120px rgba(0,0,0,.7),0 0 60px rgba(255,106,0,.1);overscroll-behavior:contain}
.cp[open] .cp-caixa{animation:cp-entra .35s cubic-bezier(.2,.9,.3,1)}
.cp-fechar{position:absolute;right:14px;top:14px;display:grid;place-items:center;width:38px;height:38px;border:1px solid rgba(255,255,255,.14);border-radius:50%;background:rgba(255,255,255,.04);color:#fff;cursor:pointer;transition:background-color .25s ease,border-color .25s ease}
.cp-fechar:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.35)}
.cp-fechar:focus-visible{outline:2px solid #ff6a00;outline-offset:2px}
.cp-fechar svg{width:16px;height:16px}
.cp-mini{font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase;color:#ff9a4d}
.cp-titulo{margin:12px 44px 0 0;font-size:clamp(22px,4vw,28px);line-height:1.15;font-weight:800;letter-spacing:-.01em}
.cp-detalhe{margin:6px 0 0;font-size:14px;color:rgba(255,255,255,.55)}
.cp-pergunta{margin:22px 0 12px;font-size:15px;font-weight:700;color:rgba(255,255,255,.9)}

.cp-opcao{margin:0;padding:20px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(255,255,255,.03)}
.cp-opcao + .cp-opcao{margin-top:12px}
.cp-opcao-topo{display:flex;gap:14px;align-items:flex-start}
.cp-num{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,106,0,.55);background:rgba(255,106,0,.12);color:#ff6a00;font-size:13px;font-weight:800}
.cp-opcao h3{margin:0;font-size:16px;font-weight:800;color:#fff}
.cp-opcao-topo p{margin:4px 0 0;font-size:13px;line-height:1.55;color:rgba(255,255,255,.55)}

.cp-canais{margin:18px 0 0;padding:0;border:0;min-width:0}
.cp-canais legend{padding:0;margin:0 0 10px;font-size:13px;font-weight:700;color:rgba(255,255,255,.8)}
.cp-chips{display:flex;flex-wrap:wrap;gap:8px}
.cp-chip{position:relative;display:inline-block;cursor:pointer}
.cp-radio{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}
.cp-chip span{display:inline-block;padding:10px 14px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(255,255,255,.03);font-size:13px;font-weight:700;color:rgba(255,255,255,.75);transition:background-color .25s ease,border-color .25s ease,color .25s ease}
.cp-chip:hover span{border-color:rgba(255,106,0,.6);color:#fff}
.cp-radio:checked + span{background:#ff6a00;border-color:#ff6a00;color:#fff}
.cp-radio:focus-visible + span{outline:2px solid #fff;outline-offset:2px}

.cp-contato{margin-top:16px}
.cp-contato label.cp-rot{display:block;font-size:13px;font-weight:700;color:rgba(255,255,255,.8)}
.cp-campo{width:100%;margin-top:8px;padding:13px 14px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(255,255,255,.04);color:#fff;font-family:inherit;font-size:15px;outline:none;transition:border-color .25s ease}
.cp-campo::placeholder{color:rgba(255,255,255,.3)}
.cp-campo:focus-visible{border-color:#ff6a00;box-shadow:0 0 0 3px rgba(255,106,0,.25)}
.cp-dica{margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.42)}
.cp-aceite{display:flex;gap:10px;align-items:flex-start;margin-top:14px;font-size:12.5px;line-height:1.55;color:rgba(255,255,255,.65);cursor:pointer}
.cp-aceite input{flex:none;width:18px;height:18px;margin:1px 0 0;accent-color:#ff6a00}
.cp-aceite a{color:#ff9a4d;text-underline-offset:3px}

.cp-previa{margin-top:16px;padding:14px 16px;border-left:2px solid #ff6a00;border-radius:0 12px 12px 0;background:rgba(255,106,0,.06)}
.cp-previa p{margin:8px 0 0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.8);white-space:pre-line;overflow-wrap:anywhere}

.cp-botao{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:16px;padding:14px 20px;border:0;border-radius:12px;font-family:inherit;font-size:14px;font-weight:700;line-height:1.2;text-align:center;text-decoration:none;cursor:pointer;transition:transform .3s ease,background-color .3s ease,color .3s ease,opacity .3s ease}
.cp-botao:hover{transform:translateY(-2px)}
.cp-botao:active{transform:translateY(0) scale(.98)}
.cp-botao:focus-visible{outline:2px solid #fff;outline-offset:3px}
.cp-botao-p{background:#ff6a00;color:#fff;box-shadow:0 0 30px rgba(255,106,0,.22)}
.cp-botao-p:hover{background:#fff;color:#000}
.cp-botao-o{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.04);color:#fff}
.cp-botao-o:hover{border-color:rgba(255,255,255,.45);background:rgba(255,255,255,.1)}
.cp-botao[disabled]{opacity:.55;cursor:not-allowed}
.cp-botao[disabled]:hover{transform:none;background:#ff6a00;color:#fff}

.cp-status{min-height:1.4rem;margin-top:12px;font-size:12.5px;line-height:1.55}
.cp-aviso{margin:0;padding:11px 13px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.8)}
.cp-erro{border-color:rgba(255,106,0,.6);background:rgba(255,106,0,.1);color:#fff}
.cp-ok{border-color:rgba(255,106,0,.45);background:rgba(255,106,0,.1);color:#fff;font-weight:600}
.cp-status a{color:#ff9a4d;text-underline-offset:3px}
.cp-isca{position:absolute;left:-9999px;width:0;height:0;overflow:hidden}
.cp-nota{margin:12px 0 0;font-size:11.5px;line-height:1.55;color:rgba(255,255,255,.4)}

@keyframes cp-fade{from{opacity:0}to{opacity:1}}
@keyframes cp-entra{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
@media (max-width:480px){
  .cp-caixa{padding:26px 18px 20px;border-radius:22px}
  .cp-opcao{padding:16px}
  .cp-chip span{padding:9px 12px}
}
@media (prefers-reduced-motion:reduce){
  .cp,.cp::backdrop,.cp .cp-caixa{animation:none!important}
  .cp *{transition:none!important}
}
`;

type ConteudoProps = {
  planoId: string;
  valor: number;
  canal: Canal;
  contato: string;
  aceite: boolean;
  isca: string;
  envio: Envio;
  zap: Zap;
  aviso: string;
  onCanal: (canal: Canal) => void;
  onContato: (texto: string) => void;
  onAceite: (marcado: boolean) => void;
  onIsca: (texto: string) => void;
  onEnviar: (e: FormEvent<HTMLFormElement>) => void;
  onFechar: () => void;
};

/** O que aparece dentro da janelinha. Separado do <dialog> para o controle (abrir/fechar) e o visual ficarem claros. */
export function ConteudoContratar(props: ConteudoProps) {
  const { planoId, valor, canal, contato, aceite, isca, envio, zap, aviso } = props;
  const resumo = resumoDoPlano(planoId, valor);
  if (!resumo) return null;

  const mensagem = mensagemDoPlano(planoId, valor);
  const precisaContato = canal !== "whatsapp";
  const enviando = envio === "enviando";
  const enviado = envio === "enviado";
  const rotuloBotao =
    enviando ? "Enviando..." : canal === "whatsapp" ? "Abrir o WhatsApp com a mensagem" : canal === "email" ? (enviado ? "Enviado" : "Enviar por e-mail") : enviado ? "Enviado" : "Enviar pelo WhatsApp e por e-mail";
  const planoParaFormulario = `/?plano=${planoId}${planoId === TRAFEGO_PERSONALIZADO.id && valor > 0 ? `&valor=${valor}` : ""}#contato`;

  return (
    <div className="cp-caixa">
      <button type="button" className="cp-fechar" onClick={props.onFechar} aria-label="Fechar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" focusable="false">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <span className="cp-mini">quero este plano</span>
      <h2 id="cp-titulo" className="cp-titulo">
        {resumo.nome}
      </h2>
      <p className="cp-detalhe">{resumo.detalhe}</p>
      <p className="cp-pergunta">Como você prefere falar com a Nexa MP?</p>

      {/* Opção 1: mensagem pronta */}
      <form className="cp-opcao" onSubmit={props.onEnviar} noValidate>
        <div className="cp-opcao-topo">
          <span className="cp-num" aria-hidden="true">
            1
          </span>
          <div>
            <h3>Enviar uma mensagem pronta</h3>
            <p>A Nexa MP recebe um texto já escrito sobre este plano.</p>
          </div>
        </div>

        <fieldset className="cp-canais">
          <legend>Por onde enviar?</legend>
          <div className="cp-chips">
            {CANAIS.map((c) => (
              <label key={c.id} className="cp-chip">
                <input
                  type="radio"
                  name="cp-canal"
                  value={c.id}
                  className="cp-radio"
                  checked={canal === c.id}
                  onChange={() => props.onCanal(c.id)}
                />
                <span>{c.rotulo}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {precisaContato && (
          <div className="cp-contato">
            <label htmlFor="cp-contato" className="cp-rot">
              Seu melhor contato
            </label>
            <input
              id="cp-contato"
              type="text"
              name="contato"
              autoComplete="email"
              placeholder="E-mail, telefone ou @instagram"
              aria-describedby="cp-contato-dica"
              value={contato}
              maxLength={120}
              onChange={(e: ChangeEvent<HTMLInputElement>) => props.onContato(e.target.value)}
              className="cp-campo"
            />
            <p id="cp-contato-dica" className="cp-dica">
              É por aqui que a Nexa MP vai te responder.
            </p>
            <label className="cp-aceite">
              <input type="checkbox" checked={aceite} onChange={(e: ChangeEvent<HTMLInputElement>) => props.onAceite(e.target.checked)} />
              <span>
                Li e aceito a{" "}
                <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer">
                  Política de Privacidade
                </a>{" "}
                e os{" "}
                <a href="/termos" target="_blank" rel="noopener noreferrer">
                  Termos de Uso
                </a>
                .
              </span>
            </label>
          </div>
        )}

        <div className="cp-previa">
          <span className="cp-mini">mensagem que será enviada</span>
          <p>{mensagem}</p>
        </div>

        {/* Campo-isca: pessoas não veem nem preenchem; robôs sim. */}
        <div className="cp-isca" aria-hidden="true">
          <label>
            Não preencha este campo
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={isca} onChange={(e: ChangeEvent<HTMLInputElement>) => props.onIsca(e.target.value)} />
          </label>
        </div>

        <button type="submit" className="cp-botao cp-botao-p" disabled={enviando || (enviado && canal !== "whatsapp")}>
          {rotuloBotao}
        </button>

        <div className="cp-status" role="status" aria-live="polite">
          {aviso && <p className="cp-aviso cp-erro">{aviso}</p>}
          {!aviso && zap === "aberto" && <p className="cp-aviso cp-ok">WhatsApp aberto em outra aba. É só enviar a mensagem por lá.</p>}
          {!aviso && zap === "bloqueado" && (
            <p className="cp-aviso">
              O navegador bloqueou a nova aba. <a href={linkWhatsApp(mensagem)} target="_blank" rel="noopener noreferrer">Toque aqui para abrir o WhatsApp</a>.
            </p>
          )}
          {!aviso && enviado && (
            <p className="cp-aviso cp-ok" style={{ marginTop: zap ? 8 : 0 }}>
              Mensagem enviada para a Nexa MP! A resposta chega no contato que você informou ({contato.trim()}).
            </p>
          )}
          {!aviso && (envio === "falhou" || envio === "limite") && (
            <p className="cp-aviso">
              {envio === "limite" ? (
                "Você já enviou algumas mensagens em pouco tempo. Aguarde alguns minutos ou use o WhatsApp."
              ) : (
                <>
                  Não foi possível enviar agora. Use o WhatsApp ou{" "}
                  <a href={linkEmail(`Quero o plano ${resumo.nome}`, mensagem)}>abra no seu programa de e-mail</a>.
                </>
              )}
            </p>
          )}
        </div>
      </form>

      {/* Opção 2: montar a própria mensagem */}
      <div className="cp-opcao">
        <div className="cp-opcao-topo">
          <span className="cp-num" aria-hidden="true">
            2
          </span>
          <div>
            <h3>Montar a minha mensagem</h3>
            <p>Responda a algumas perguntas e o formulário monta o texto com os seus dados. O plano já vai marcado.</p>
          </div>
        </div>
        <Link href={planoParaFormulario} onClick={props.onFechar} className="cp-botao cp-botao-o">
          Abrir o formulário
        </Link>
      </div>

      <p className="cp-nota">Clicar aqui só inicia uma conversa: nenhuma cobrança.</p>
    </div>
  );
}

export default function ContratarPlano() {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [aberto, setAberto] = useState(false);
  const [planoId, setPlanoId] = useState("");
  const [valor, setValor] = useState(0);
  const [canal, setCanal] = useState<Canal>("whatsapp");
  const [contato, setContato] = useState("");
  const [aceite, setAceite] = useState(false);
  const [isca, setIsca] = useState("");
  const [envio, setEnvio] = useState<Envio>("");
  const [zap, setZap] = useState<Zap>("");
  const [aviso, setAviso] = useState("");

  // Qualquer botão de plano chama abrirContratacao() (src/lib/contratarPlano.ts), que dispara este evento.
  useEffect(() => {
    function aoPedir(evento: Event) {
      const detalhe = (evento as CustomEvent<DetalheContratar>).detail;
      const valorTrafego = detalhe?.valor ?? 0;
      if (!detalhe || !resumoDoPlano(detalhe.planoId, valorTrafego)) return;
      setPlanoId(detalhe.planoId);
      setValor(valorTrafego);
      setCanal("whatsapp");
      setContato("");
      setAceite(false);
      setIsca("");
      setEnvio("");
      setZap("");
      setAviso("");
      const dlg = dialogo.current;
      if (dlg && !dlg.open) dlg.showModal();
      setAberto(true);
    }
    window.addEventListener(EVENTO_CONTRATAR, aoPedir);
    return () => window.removeEventListener(EVENTO_CONTRATAR, aoPedir);
  }, []);

  // Com a janelinha aberta, a página de trás não rola.
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = anterior;
    };
  }, [aberto]);

  function fechar() {
    dialogo.current?.close();
  }

  /** Clique fora da caixa (no fundo escurecido) fecha. */
  function aoClicarNoFundo(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogo.current) fechar();
  }

  function trocarCanal(novo: Canal) {
    setCanal(novo);
    setAviso("");
    setEnvio("");
    setZap("");
  }

  function abrirWhatsapp(mensagem: string) {
    const nova = window.open(linkWhatsApp(mensagem), "_blank");
    if (nova) {
      nova.opener = null;
      setZap("aberto");
    } else {
      setZap("bloqueado");
    }
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const resumo = resumoDoPlano(planoId, valor);
    if (!resumo || envio === "enviando") return;

    const precisaContato = canal !== "whatsapp";
    if (precisaContato) {
      const problema = problemaNoContato("qualquer", contato);
      if (problema) return setAviso(problema);
      if (!aceite) return setAviso("Marque que você leu e aceita a Política de Privacidade e os Termos de Uso para enviar por e-mail.");
    }
    setAviso("");

    const mensagem = mensagemDoPlano(planoId, valor);

    // O WhatsApp abre primeiro, dentro do clique, para o navegador não bloquear a nova aba.
    if (canal === "whatsapp" || canal === "ambos") abrirWhatsapp(mensagem);
    if (canal === "whatsapp") return;

    setEnvio("enviando");
    try {
      const resposta = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: "",
          empresa: "",
          contato: contato.trim(),
          retorno: "qualquer",
          mensagem: `${mensagem}\n\nMeu contato: ${contato.trim()}`,
          aceite,
          website: isca,
          assunto: `Quero o plano ${resumo.nome}`,
        }),
      });
      if (resposta.ok) setEnvio("enviado");
      else setEnvio(resposta.status === 429 ? "limite" : "falhou");
    } catch {
      setEnvio("falhou");
    }
  }

  return (
    <dialog ref={dialogo} className="cp" aria-labelledby="cp-titulo" onClose={() => setAberto(false)} onClick={aoClicarNoFundo}>
      <style dangerouslySetInnerHTML={{ __html: ESTILO }} />
      {planoId && (
        <ConteudoContratar
          planoId={planoId}
          valor={valor}
          canal={canal}
          contato={contato}
          aceite={aceite}
          isca={isca}
          envio={envio}
          zap={zap}
          aviso={aviso}
          onCanal={trocarCanal}
          onContato={setContato}
          onAceite={setAceite}
          onIsca={setIsca}
          onEnviar={enviar}
          onFechar={fechar}
        />
      )}
    </dialog>
  );
}