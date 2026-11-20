"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { EVENTO_CONTRATAR, type DetalheContratar } from "@/src/lib/contratarPlano";
import { linkEmail, linkWhatsApp } from "@/src/lib/data/contato";
import { problemaNoContato } from "@/src/lib/data/mensagemContato";
import { mensagemDoPlano, resumoDoPlano } from "@/src/lib/data/mensagensPlanos";
import { ESTILO_JANELA_CONTATO } from "@/src/components/sections/estiloJanelaContato";

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

type ConteudoProps = {
  planoId: string;
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
  const { planoId, canal, contato, aceite, isca, envio, zap, aviso } = props;
  const resumo = resumoDoPlano(planoId);
  if (!resumo) return null;

  const mensagem = mensagemDoPlano(planoId);
  const precisaContato = canal !== "whatsapp";
  const enviando = envio === "enviando";
  const enviado = envio === "enviado";
  const rotuloBotao =
    enviando ? "Enviando..." : canal === "whatsapp" ? "Abrir o WhatsApp com a mensagem" : canal === "email" ? (enviado ? "Enviado" : "Enviar por e-mail") : enviado ? "Enviado" : "Enviar pelo WhatsApp e por e-mail";
  const planoParaFormulario = `/?plano=${planoId}#contato`;

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
      if (!detalhe || !resumoDoPlano(detalhe.planoId)) return;
      setPlanoId(detalhe.planoId);
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
      detalhe.tratado = true;
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
    const resumo = resumoDoPlano(planoId);
    if (!resumo || envio === "enviando") return;

    const precisaContato = canal !== "whatsapp";
    if (precisaContato) {
      const problema = problemaNoContato("qualquer", contato);
      if (problema) return setAviso(problema);
      if (!aceite) return setAviso("Marque que você leu e aceita a Política de Privacidade e os Termos de Uso para enviar por e-mail.");
    }
    setAviso("");

    const mensagem = mensagemDoPlano(planoId);

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
      <style dangerouslySetInnerHTML={{ __html: ESTILO_JANELA_CONTATO }} />
      {planoId && (
        <ConteudoContratar
          planoId={planoId}
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