"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { EVENTO_CONTATO, type DetalheContato } from "@/src/lib/contatoRapido";
import { linkEmail, linkWhatsApp } from "@/src/lib/data/contato";
import { resolverAssunto, type AssuntoContato } from "@/src/lib/data/assuntosContato";
import { problemaNoContato } from "@/src/lib/data/mensagemContato";
import { ESTILO_JANELA_CONTATO } from "@/src/components/sections/estiloJanelaContato";

/**
 * Janelinha simples "Falar com a Nexa MP": abre nos botões do site que antes só levavam à seção de Contato.
 * Mostra a frase do botão (ex.: "Quero saber mais sobre tráfego pago"), pergunta por onde enviar
 * (WhatsApp, e-mail ou os dois) e, se for e-mail, pede o melhor contato. Os textos ficam em src/lib/data/assuntosContato.ts.
 * Usa o mesmo visual da janelinha dos planos (estiloJanelaContato.ts).
 */

type Canal = "whatsapp" | "email" | "ambos";
type Envio = "" | "enviando" | "enviado" | "falhou" | "limite";
type Zap = "" | "aberto" | "bloqueado";

const CANAIS: { id: Canal; rotulo: string }[] = [
  { id: "whatsapp", rotulo: "WhatsApp" },
  { id: "email", rotulo: "E-mail" },
  { id: "ambos", rotulo: "Os dois" },
];

const ESTILO_EXTRA = `
.cp-simples .cp-titulo{margin-bottom:0}
.cp-simples .cp-canais{margin-top:22px}
.cp-msg{margin:16px 0 0;padding:12px 14px;border-left:2px solid #ff6a00;border-radius:0 12px 12px 0;background:rgba(255,106,0,.06);font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.78);overflow-wrap:anywhere}
.cp-msg span{display:block;margin-bottom:4px;font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase;color:#ff9a4d}
.cp-outro{margin:16px 0 0;font-size:12.5px;line-height:1.6;color:rgba(255,255,255,.5);text-align:center}
.cp-outro a{color:#ff9a4d;text-underline-offset:3px}
`;

type ConteudoProps = {
  assunto: AssuntoContato;
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
export function ConteudoContatoRapido(props: ConteudoProps) {
  const { assunto, canal, contato, aceite, isca, envio, zap, aviso } = props;
  const precisaContato = canal !== "whatsapp";
  const enviando = envio === "enviando";
  const enviado = envio === "enviado";
  const rotuloBotao = enviando
    ? "Enviando..."
    : enviado && canal !== "whatsapp"
      ? "Enviado"
      : canal === "whatsapp"
        ? "Abrir o WhatsApp"
        : canal === "email"
          ? "Enviar por e-mail"
          : "Enviar pelos dois";

  return (
    <div className="cp-caixa cp-simples">
      <button type="button" className="cp-fechar" onClick={props.onFechar} aria-label="Fechar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" focusable="false">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <span className="cp-mini">falar com a nexa mp</span>
      <h2 id="cr-titulo" className="cp-titulo">
        {assunto.titulo}
      </h2>

      <form onSubmit={props.onEnviar} noValidate>
        <fieldset className="cp-canais">
          <legend>Por onde você prefere falar?</legend>
          <div className="cp-chips">
            {CANAIS.map((c) => (
              <label key={c.id} className="cp-chip">
                <input
                  type="radio"
                  name="cr-canal"
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
            <label htmlFor="cr-contato" className="cp-rot">
              Seu melhor contato
            </label>
            <input
              id="cr-contato"
              type="text"
              name="contato"
              autoComplete="email"
              placeholder="E-mail, telefone ou @instagram"
              aria-describedby="cr-contato-dica"
              value={contato}
              maxLength={120}
              onChange={(e: ChangeEvent<HTMLInputElement>) => props.onContato(e.target.value)}
              className="cp-campo"
            />
            <p id="cr-contato-dica" className="cp-dica">
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

        <p className="cp-msg">
          <span>mensagem</span>
          {assunto.mensagem}
        </p>

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
              O navegador bloqueou a nova aba.{" "}
              <a href={linkWhatsApp(assunto.mensagem)} target="_blank" rel="noopener noreferrer">
                Toque aqui para abrir o WhatsApp
              </a>
              .
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
                  Não foi possível enviar agora. Use o WhatsApp ou <a href={linkEmail(assunto.titulo, assunto.mensagem)}>abra no seu programa de e-mail</a>.
                </>
              )}
            </p>
          )}
        </div>
      </form>

      <p className="cp-outro">
        Prefere escrever com mais detalhes?{" "}
        <Link href="/#contato" onClick={props.onFechar}>
          Abrir o formulário completo
        </Link>
      </p>
    </div>
  );
}

export default function ContatoRapido() {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [aberto, setAberto] = useState(false);
  const [assunto, setAssunto] = useState<AssuntoContato | null>(null);
  const [canal, setCanal] = useState<Canal>("whatsapp");
  const [contato, setContato] = useState("");
  const [aceite, setAceite] = useState(false);
  const [isca, setIsca] = useState("");
  const [envio, setEnvio] = useState<Envio>("");
  const [zap, setZap] = useState<Zap>("");
  const [aviso, setAviso] = useState("");

  // Qualquer botão de contato chama abrirContato() (src/lib/contatoRapido.ts), que dispara este evento.
  useEffect(() => {
    function aoPedir(evento: Event) {
      const pedido = (evento as CustomEvent<DetalheContato>).detail;
      const encontrado = pedido ? resolverAssunto(pedido.assunto, pedido.detalhe ?? "") : null;
      if (!encontrado) return;
      setAssunto(encontrado);
      setCanal("whatsapp");
      setContato("");
      setAceite(false);
      setIsca("");
      setEnvio("");
      setZap("");
      setAviso("");
      const dlg = dialogo.current;
      try {
        if (dlg && !dlg.open) dlg.showModal();
      } catch {
        return;
      }
      if (!dlg) return;
      pedido.tratado = true;
      setAberto(true);
    }
    window.addEventListener(EVENTO_CONTATO, aoPedir);
    return () => window.removeEventListener(EVENTO_CONTATO, aoPedir);
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
    if (!assunto || envio === "enviando") return;

    if (canal !== "whatsapp") {
      const problema = problemaNoContato("qualquer", contato);
      if (problema) return setAviso(problema);
      if (!aceite) return setAviso("Marque que você leu e aceita a Política de Privacidade e os Termos de Uso para enviar por e-mail.");
    }
    setAviso("");

    // O WhatsApp abre primeiro, dentro do clique, para o navegador não bloquear a nova aba.
    if (canal === "whatsapp" || canal === "ambos") abrirWhatsapp(assunto.mensagem);
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
          mensagem: `${assunto.mensagem}\n\nMeu contato: ${contato.trim()}`,
          aceite,
          website: isca,
          assunto: assunto.titulo,
        }),
      });
      if (resposta.ok) setEnvio("enviado");
      else setEnvio(resposta.status === 429 ? "limite" : "falhou");
    } catch {
      setEnvio("falhou");
    }
  }

  return (
    <dialog ref={dialogo} className="cp" aria-labelledby="cr-titulo" onClose={() => setAberto(false)} onClick={aoClicarNoFundo}>
      <style dangerouslySetInnerHTML={{ __html: ESTILO_JANELA_CONTATO + ESTILO_EXTRA }} />
      {assunto && (
        <ConteudoContatoRapido
          assunto={assunto}
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