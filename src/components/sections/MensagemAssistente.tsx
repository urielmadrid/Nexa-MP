"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Mail, MessageCircle, RotateCcw } from "lucide-react";
import { PLANOS } from "@/src/lib/data/planos";
import { CONTATO, linkEmail, linkWhatsApp } from "@/src/lib/data/contato";
import {
  MOMENTOS,
  NECESSIDADES,
  OPCOES_PLANO,
  RESPOSTAS_VAZIAS,
  RETORNOS,
  assuntoDaMensagem,
  campoContato,
  montarMensagem,
  problemaNoContato,
  type Opcao,
  type RespostasContato,
} from "@/src/lib/data/mensagemContato";

const ETAPAS = [
  { rotulo: "Necessidade", titulo: "O que você precisa?", apoio: "Pode marcar mais de uma opção." },
  { rotulo: "Momento", titulo: "Em que momento está o seu negócio?", apoio: "Escolha a opção que mais se parece com a sua situação." },
  { rotulo: "Plano", titulo: "Algum plano chamou a sua atenção?", apoio: "Sem compromisso. Se preferir, peça uma indicação." },
  { rotulo: "Seus dados", titulo: "Agora, os seus dados", apoio: "Só o nome é obrigatório. O resto ajuda a Nexa MP a responder melhor." },
  { rotulo: "Mensagem", titulo: "Sua mensagem está pronta", apoio: "Confira, edite se quiser e escolha como enviar." },
] as const;

const ULTIMA = ETAPAS.length - 1;
const LIMITE_DETALHES = 600;

const CAMPO =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange/40";

/** Grupo de opções com botões nativos (radio ou checkbox): o teclado e o leitor de tela funcionam sem código extra. */
function GrupoOpcoes({
  tipo,
  nome,
  rotuloId,
  opcoes,
  selecionados,
  onToggle,
  compacto = false,
}: {
  tipo: "radio" | "checkbox";
  nome: string;
  rotuloId: string;
  opcoes: Opcao[];
  selecionados: string[];
  onToggle: (id: string) => void;
  compacto?: boolean;
}) {
  return (
    <fieldset aria-labelledby={rotuloId} className="min-w-0 border-0 p-0">
      <div className={compacto ? "flex flex-wrap gap-2" : "grid gap-2.5 sm:grid-cols-2"}>
        {opcoes.map((o) => {
          const marcado = selecionados.includes(o.id);
          return (
            <label key={o.id} className="relative block cursor-pointer">
              <input
                type={tipo}
                name={nome}
                value={o.id}
                checked={marcado}
                onChange={() => onToggle(o.id)}
                className="peer sr-only"
              />
              <span
                className={`flex h-full gap-3 border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-brand-orange hover:-translate-y-0.5 ${
                  compacto ? "items-center rounded-full px-4 py-2.5" : "items-start rounded-2xl p-4"
                } ${
                  marcado
                    ? "border-brand-orange bg-brand-orange/10 shadow-[0_0_30px_rgba(255,106,0,.12)]"
                    : "border-white/10 bg-white/[.03] hover:border-white/25 hover:bg-white/[.05]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`${compacto ? "" : "mt-0.5"} grid h-5 w-5 shrink-0 place-items-center border transition-colors ${
                    tipo === "radio" ? "rounded-full" : "rounded-md"
                  } ${marcado ? "border-brand-orange bg-brand-orange text-white" : "border-white/25 text-transparent"} `}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${marcado ? "text-white" : "text-white/80"}`}>{o.rotulo}</span>
                  {!compacto && o.dica && <span className="mt-1 block text-xs leading-5 text-white/40">{o.dica}</span>}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Assistente de mensagem: a pessoa escolhe opções, informa seus dados e recebe um texto pronto
 * para enviar à Nexa MP pelo WhatsApp (abre o app da pessoa) ou pelo e-mail (envio direto pela rota /api/contato).
 * A mensagem é montada no navegador e só sai quando a pessoa toca em um botão de envio.
 */
export default function MensagemAssistente() {
  const reduzir = useReducedMotion();
  const searchParams = useSearchParams();
  const planoParam = searchParams.get("plano");

  const [etapa, setEtapa] = useState(0);
  const [direcao, setDirecao] = useState(1);
  const [r, setR] = useState<RespostasContato>(RESPOSTAS_VAZIAS);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState<"" | "ok" | "falhou">("");
  const [envio, setEnvio] = useState<"parado" | "enviando" | "enviado" | "falhou" | "limite">("parado");
  const [isca, setIsca] = useState("");

  const tituloRef = useRef<HTMLHeadingElement>(null);
  const montouRef = useRef(false);
  const timerCopiaRef = useRef<number | undefined>(undefined);

  // Vindo de um botão de plano (/?plano=essencial#contato), o plano já aparece marcado.
  useEffect(() => {
    if (planoParam && PLANOS.some((p) => p.id === planoParam)) {
      setR((atual) => ({ ...atual, plano: planoParam }));
    }
  }, [planoParam]);

  // Ao trocar de etapa, o foco vai para o título (leitor de tela anuncia; teclado continua de onde faz sentido).
  useEffect(() => {
    if (!montouRef.current) {
      montouRef.current = true;
      return;
    }
    tituloRef.current?.focus();
  }, [etapa]);

  useEffect(() => () => window.clearTimeout(timerCopiaRef.current), []);

  const atual = ETAPAS[etapa];

  function atualizar<K extends keyof RespostasContato>(campo: K, valor: RespostasContato[K]) {
    setR((anterior) => ({ ...anterior, [campo]: valor }));
    setErro("");
  }

  function alternarNecessidade(id: string) {
    setErro("");
    setR((anterior) => ({
      ...anterior,
      necessidades: anterior.necessidades.includes(id)
        ? anterior.necessidades.filter((n) => n !== id)
        : [...anterior.necessidades, id],
    }));
  }

  /** Devolve o texto do problema da etapa atual, ou "" se pode avançar. */
  function validar(): string {
    if (etapa === 0 && r.necessidades.length === 0) return "Marque pelo menos uma opção para continuar.";
    if (etapa === 1 && !r.momento) return "Escolha uma opção para continuar.";
    if (etapa === 3) {
      if (!r.nome.trim()) return "Informe o seu nome para continuar.";
      const problemaContato = problemaNoContato(r.retorno, r.contato);
      if (problemaContato) return problemaContato;
      if (!r.aceite) return "Para continuar, marque que leu e aceita a Política de Privacidade e os Termos de Uso.";
    }
    return "";
  }

  function irPara(destino: number) {
    setDirecao(destino > etapa ? 1 : -1);
    setErro("");
    setCopiado("");
    setEnvio("parado");
    if (destino === ULTIMA) setMensagem(montarMensagem(r));
    setEtapa(destino);
  }

  function avancar() {
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }
    irPara(Math.min(etapa + 1, ULTIMA));
  }

  function aoEnviarFormulario(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    avancar();
  }

  function recomecar() {
    setR({ ...RESPOSTAS_VAZIAS, plano: planoParam && PLANOS.some((p) => p.id === planoParam) ? planoParam : RESPOSTAS_VAZIAS.plano });
    setMensagem("");
    setDirecao(-1);
    setErro("");
    setCopiado("");
    setEnvio("parado");
    setEtapa(0);
  }

  /** Envia a mensagem para a Nexa MP pelo servidor do site (que usa o e-mail contato@ da Nexa MP). */
  async function enviarParaNexa() {
    if (envio === "enviando" || mensagemVazia) return;
    setEnvio("enviando");
    try {
      const resposta = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: r.nome,
          empresa: r.empresa,
          contato: r.contato,
          retorno: r.retorno,
          mensagem,
          aceite: r.aceite,
          website: isca,
        }),
      });
      if (resposta.ok) setEnvio("enviado");
      else setEnvio(resposta.status === 429 ? "limite" : "falhou");
    } catch {
      setEnvio("falhou");
    }
  }

  async function copiar() {
    window.clearTimeout(timerCopiaRef.current);
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado("ok");
    } catch {
      setCopiado("falhou");
    }
    timerCopiaRef.current = window.setTimeout(() => setCopiado(""), 3500);
  }

  const movimento = reduzir
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, x: 24 * direcao },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 * direcao },
        transition: { duration: 0.22 },
      };

  const mensagemVazia = mensagem.trim() === "";

  return (
    <div className="contact-chat flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0c0c] shadow-[0_30px_100px_rgba(0,0,0,.45)]">
      {/* progresso */}
      <div className="border-b border-white/10 bg-white/[.02] px-5 pb-4 pt-5 md:px-8">
        <ol className="flex gap-1.5" aria-label="Etapas">
          {ETAPAS.map((e, i) => {
            const feita = i < etapa;
            const ativa = i === etapa;
            return (
              <li key={e.rotulo} className="flex-1">
                {feita ? (
                  <button
                    type="button"
                    onClick={() => irPara(i)}
                    aria-label={`Voltar para a etapa ${i + 1}: ${e.rotulo}`}
                    className="block h-6 w-full rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                  >
                    <span className="mt-2.5 block h-1.5 rounded-full bg-brand-orange transition-colors hover:bg-brand-orange-glow" />
                  </button>
                ) : (
                  <span className="block h-6" aria-current={ativa ? "step" : undefined}>
                    <span className={`mt-2.5 block h-1.5 rounded-full ${ativa ? "bg-brand-orange/50" : "bg-white/10"}`} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[.2em] text-white/35">
          <span>
            Etapa {etapa + 1} de {ETAPAS.length}
          </span>
          <span className="text-white/55">{atual.rotulo}</span>
        </p>
      </div>

      <div className="min-h-[440px] flex-1 px-5 py-7 md:px-8 md:py-9">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={etapa} {...movimento}>
            <h3
              ref={tituloRef}
              id={`assistente-titulo-${etapa}`}
              tabIndex={-1}
              className="nexa-display text-2xl font-black leading-[1.02] text-white outline-none md:text-3xl"
            >
              {atual.titulo}
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/45">{atual.apoio}</p>

            <div className="mt-6">
              {etapa === 0 && (
                <GrupoOpcoes
                  tipo="checkbox"
                  nome="necessidades"
                  rotuloId="assistente-titulo-0"
                  opcoes={NECESSIDADES}
                  selecionados={r.necessidades}
                  onToggle={alternarNecessidade}
                />
              )}

              {etapa === 1 && (
                <GrupoOpcoes
                  tipo="radio"
                  nome="momento"
                  rotuloId="assistente-titulo-1"
                  opcoes={MOMENTOS}
                  selecionados={r.momento ? [r.momento] : []}
                  onToggle={(id) => atualizar("momento", id)}
                />
              )}

              {etapa === 2 && (
                <>
                  <GrupoOpcoes
                    tipo="radio"
                    nome="plano"
                    rotuloId="assistente-titulo-2"
                    opcoes={OPCOES_PLANO}
                    selecionados={[r.plano]}
                    onToggle={(id) => atualizar("plano", id)}
                  />
                  <p className="mt-4 text-xs leading-5 text-white/40">
                    Quer comparar antes de escolher?{" "}
                    <a
                      href="#planos"
                      className="font-semibold text-brand-orange underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-orange"
                    >
                      Veja os planos
                    </a>
                    . O que você marcar aqui fica guardado enquanto estiver nesta página.
                  </p>
                </>
              )}

              {etapa === 3 && (
                <form onSubmit={aoEnviarFormulario} noValidate id="assistente-dados">
                  {/* Sem botão de envio, o Enter não submete um formulário com vários campos. */}
                  <button type="submit" tabIndex={-1} aria-hidden="true" className="sr-only">
                    Continuar
                  </button>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-xs font-semibold text-white/70">
                      Seu nome <span className="text-brand-orange">*</span>
                      <input
                        type="text"
                        autoComplete="name"
                        value={r.nome}
                        maxLength={80}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => atualizar("nome", e.target.value)}
                        placeholder="Como podemos te chamar?"
                        aria-required="true"
                        aria-invalid={erro !== "" && !r.nome.trim()}
                        className={CAMPO}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-white/70">
                      Nome da empresa <span className="font-normal text-white/35">(opcional)</span>
                      <input
                        type="text"
                        autoComplete="organization"
                        value={r.empresa}
                        maxLength={80}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => atualizar("empresa", e.target.value)}
                        placeholder="Nome do negócio"
                        className={CAMPO}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-white/70 md:col-span-2">
                      Ramo de atuação <span className="font-normal text-white/35">(opcional)</span>
                      <input
                        type="text"
                        value={r.ramo}
                        maxLength={80}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => atualizar("ramo", e.target.value)}
                        placeholder="Ex.: salão de beleza, clínica, loja, serviços..."
                        className={CAMPO}
                      />
                    </label>
                  </div>

                  <div className="mt-6">
                    <p id="assistente-retorno" className="text-xs font-semibold text-white/70">
                      Como prefere receber o retorno?
                    </p>
                    <div className="mt-2">
                      <GrupoOpcoes
                        tipo="radio"
                        nome="retorno"
                        rotuloId="assistente-retorno"
                        opcoes={RETORNOS}
                        selecionados={[r.retorno]}
                        onToggle={(id) => atualizar("retorno", id)}
                        compacto
                      />
                    </div>
                    <label className="mt-4 block text-xs font-semibold text-white/70">
                      {campoContato(r.retorno).rotulo} <span className="text-brand-orange">*</span>
                      <input
                        type="text"
                        inputMode={r.retorno === "whatsapp" ? "tel" : r.retorno === "email" ? "email" : "text"}
                        autoComplete={r.retorno === "email" ? "email" : r.retorno === "whatsapp" ? "tel" : "off"}
                        value={r.contato}
                        maxLength={80}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => atualizar("contato", e.target.value)}
                        placeholder={campoContato(r.retorno).dica}
                        aria-required="true"
                        aria-invalid={erro !== "" && problemaNoContato(r.retorno, r.contato) !== ""}
                        className={CAMPO}
                      />
                    </label>
                  </div>

                  <label className="mt-6 block text-xs font-semibold text-white/70">
                    Quer contar mais alguma coisa? <span className="font-normal text-white/35">(opcional)</span>
                    <textarea
                      value={r.detalhes}
                      maxLength={LIMITE_DETALHES}
                      rows={4}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => atualizar("detalhes", e.target.value)}
                      placeholder="Conte rapidamente sobre o seu negócio e o que espera do digital."
                      className={`${CAMPO} resize-y leading-6`}
                    />
                    <span className="mt-1 block text-right font-mono text-[10px] text-white/30">
                      {r.detalhes.length}/{LIMITE_DETALHES}
                    </span>
                  </label>

                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-xs leading-5 text-white/65">
                    <input
                      type="checkbox"
                      checked={r.aceite}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => atualizar("aceite", e.target.checked)}
                      aria-required="true"
                      aria-invalid={erro !== "" && !r.aceite}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-orange ${
                        r.aceite ? "border-brand-orange bg-brand-orange text-white" : "border-white/25 text-transparent"
                      }`}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>
                      Li e aceito a{" "}
                      <a
                        href="/politica-de-privacidade"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-orange underline-offset-4 hover:underline"
                      >
                        Política de Privacidade
                      </a>{" "}
                      e os{" "}
                      <a
                        href="/termos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-orange underline-offset-4 hover:underline"
                      >
                        Termos de Uso
                      </a>
                      , e concordo que a Nexa MP use os dados informados aqui para responder ao meu contato.{" "}
                      <span className="text-brand-orange">*</span>
                      <span className="sr-only">(as páginas abrem em uma nova aba)</span>
                    </span>
                  </label>
                </form>
              )}

              {etapa === ULTIMA && (
                <div>
                  <label htmlFor="assistente-mensagem" className="text-xs font-semibold text-white/70">
                    Mensagem que será enviada
                  </label>
                  <textarea
                    id="assistente-mensagem"
                    value={mensagem}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMensagem(e.target.value)}
                    rows={13}
                    className={`${CAMPO} resize-y font-mono text-[13px] leading-6 text-white/85`}
                  />
                  <p className="mt-2 text-[11px] leading-5 text-white/35">
                    Você pode editar o texto acima antes de enviar. Se voltar e mudar alguma resposta, a mensagem é montada de novo.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <a
                      href={mensagemVazia ? undefined : linkWhatsApp(mensagem)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={mensagemVazia}
                      className="cta-press group flex items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-4 text-sm font-bold text-white shadow-[0_0_40px_rgba(255,106,0,.25)] outline-none transition-all hover:-translate-y-1 hover:bg-brand-orange-dark focus-visible:ring-2 focus-visible:ring-white aria-disabled:pointer-events-none aria-disabled:opacity-40"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Enviar pelo WhatsApp
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                      <span className="sr-only">(abre em uma nova aba)</span>
                    </a>
                    <button
                      type="button"
                      onClick={enviarParaNexa}
                      disabled={mensagemVazia || envio === "enviando" || envio === "enviado"}
                      className="cta-press group flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[.05] px-6 py-4 text-sm font-bold text-white outline-none transition-all hover:-translate-y-1 hover:border-brand-orange/60 focus-visible:ring-2 focus-visible:ring-brand-orange disabled:pointer-events-none disabled:opacity-50"
                    >
                      <Mail className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                      {envio === "enviando" ? "Enviando..." : envio === "enviado" ? "Enviado" : "Enviar por e-mail"}
                    </button>
                  </div>

                  {/* Campo-isca: pessoas não veem nem preenchem; robôs sim. */}
                  <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                    <label>
                      Não preencha este campo
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={isca} onChange={(e: ChangeEvent<HTMLInputElement>) => setIsca(e.target.value)} />
                    </label>
                  </div>

                  <div className="mt-3 min-h-[1.5rem] text-xs leading-5" role="status" aria-live="polite">
                    {envio === "enviado" && (
                      <p className="rounded-xl border border-brand-orange/40 bg-brand-orange/10 p-3 font-semibold text-white">
                        Mensagem enviada para a Nexa MP! A resposta chega no contato que você informou ({r.contato.trim()}).
                      </p>
                    )}
                    {(envio === "falhou" || envio === "limite") && (
                      <p className="rounded-xl border border-white/15 bg-white/[.04] p-3 text-white/75">
                        {envio === "limite"
                          ? "Você já enviou algumas mensagens em pouco tempo. Aguarde alguns minutos ou use o WhatsApp."
                          : "Não foi possível enviar agora. Nenhuma mensagem foi perdida: use o WhatsApp, "}
                        {envio === "falhou" && (
                          <>
                            <a
                              href={linkEmail(assuntoDaMensagem(r), mensagem)}
                              className="font-semibold text-brand-orange underline-offset-4 hover:underline"
                            >
                              abra no seu programa de e-mail
                            </a>{" "}
                            ou copie o texto.
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                    <button
                      type="button"
                      onClick={copiar}
                      disabled={mensagemVazia}
                      className="inline-flex items-center gap-2 rounded-full font-semibold text-white/60 outline-none transition-colors hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange disabled:opacity-40"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copiar mensagem
                    </button>
                    <a
                      href={CONTATO.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full font-semibold text-white/60 outline-none transition-colors hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange"
                    >
                      Prefere o Instagram? Cole no direct de {CONTATO.instagramUsuario}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">(abre em uma nova aba)</span>
                    </a>
                    <button
                      type="button"
                      onClick={recomecar}
                      className="inline-flex items-center gap-2 rounded-full font-semibold text-white/40 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Recomeçar
                    </button>
                  </div>
                  <p className="mt-3 min-h-[1.25rem] text-xs text-white/55" role="status" aria-live="polite">
                    {copiado === "ok" && "Mensagem copiada! É só colar na conversa."}
                    {copiado === "falhou" && "Não foi possível copiar automaticamente. Selecione o texto e copie manualmente."}
                  </p>

                  <p className="mt-2 rounded-xl border border-white/10 bg-white/[.03] p-4 text-[11px] leading-5 text-white/40">
                    A mensagem é montada no seu navegador e só é enviada quando você toca em um botão de envio. No WhatsApp, ela abre
                    já preenchida no seu aplicativo. Em "Enviar por e-mail", o texto vai direto para a caixa da Nexa MP pelo servidor do site,
                    que não guarda a mensagem em banco de dados.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* navegação */}
      <div className="border-t border-white/10 bg-white/[.02] px-5 py-4 md:px-8">
        <p className="min-h-[1.25rem] text-xs font-medium text-brand-orange" role="alert">
          {erro}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => irPara(etapa - 1)}
            disabled={etapa === 0}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 outline-none transition-all hover:border-white/30 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
          </button>
          {etapa < ULTIMA && (
            <button
              type="button"
              onClick={avancar}
              className="cta-press group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black outline-none transition-all hover:-translate-y-0.5 hover:bg-brand-orange hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange"
            >
              {etapa === ULTIMA - 1 ? "Montar minha mensagem" : "Continuar"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
