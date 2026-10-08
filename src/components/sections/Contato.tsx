"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowUpRight, MessageCircle, Mail, Sparkles } from "lucide-react";import { PLANOS, type Plano } from "@/src/lib/data/planos";
import { recomendarPlanoLocal } from "@/src/lib/data/recomendarPlano";

const INSTAGRAM_URL = "https://instagram.com/nexamp_";

type Pergunta = {
  key: "nome" | "empresa" | "contato" | "mensagem";
  texto: (respostas: Record<string, string>) => string;
  placeholder?: string;
  tipo: "text" | "email" | "textarea";
  obrigatorio: boolean;
};

const PERGUNTAS: Pergunta[] = [
  {
    key: "nome",
    texto: () => "Oi! 👋 Antes de mais nada, qual é o seu nome?",
    placeholder: "Seu nome",
    tipo: "text",
    obrigatorio: true,
  },
  {
    key: "empresa",
    texto: (r) => `Prazer, ${r.nome || "tudo bem"}! E o nome da sua empresa?`,
    placeholder: "Nome da empresa (opcional)",
    tipo: "text",
    obrigatorio: false,
  },
  {
    key: "contato",
    texto: () => "Qual é a melhor forma de falar com você? Pode ser seu @ do Instagram ou outra forma de contato.",
    placeholder: "Ex.: @seuinstagram ou outra forma de contato",
    tipo: "text",
    obrigatorio: true,
  },
  {
    key: "mensagem",
    texto: () =>
      "Perfeito. Me conta rapidinho sobre o seu negócio e o que você espera do digital — quanto mais detalhe, melhor eu consigo te indicar o plano certo.",
    placeholder: "Escreva aqui...",
    tipo: "textarea",
    obrigatorio: true,
  },
];

type Mensagem = { de: "nexa" | "user"; texto: string };

export default function Contato() {
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [valorAtual, setValorAtual] = useState("");
  const [digitando, setDigitando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [planoSugerido, setPlanoSugerido] = useState<Plano | null>(null);
  const [mostrarOutros, setMostrarOutros] = useState(false);
  const [resumoCopiado, setResumoCopiado] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const iniciouRef = useRef(false);

  const perguntas = PERGUNTAS;
  const searchParams = useSearchParams();
  const planoParam = searchParams.get("plano");
  const planoPreSelecionado = planoParam && PLANOS.some((p) => p.id === planoParam) ? planoParam : null;

  useEffect(() => {
    if (iniciouRef.current) return;
    iniciouRef.current = true;
    setMensagens([{ de: "nexa", texto: perguntas[0].texto({}) }]);
  }, [perguntas]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensagens, digitando]);

  async function copiarResumo() {
    const plano = planoSugerido?.nome ?? PLANOS.find((p) => p.id === planoPreSelecionado)?.nome ?? "não definido";
    const resumo = [
      "Olá, Nexa MP!",
      `Nome: ${respostas.nome || "não informado"}`,
      `Empresa: ${respostas.empresa || "não informado"}`,
      `Contato: ${respostas.contato || "não informado"}`,
      `Necessidade: ${respostas.mensagem || "não informado"}`,
      `Plano de referência: ${plano}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(resumo);
      setResumoCopiado(true);
      window.setTimeout(() => setResumoCopiado(false), 2500);
    } catch {
      setResumoCopiado(false);
    }
  }

  function finalizarConversa(respostasFinais: Record<string, string>) {
    if (planoPreSelecionado) {
      const plano = PLANOS.find((p) => p.id === planoPreSelecionado);
      setMensagens((prev) => [
        ...prev,
        {
          de: "nexa",
          texto: `Perfeito! Já registrei seu interesse no plano ${plano?.nome ?? ""}. O envio automático por aqui ainda não está disponível. Copie o resumo abaixo e abra o Instagram para continuar o atendimento por lá 🙂`,
        },
      ]);
      setFinalizado(true);
      return;
    }

    setDigitando(true);

    setTimeout(() => {
      const { plano, justificativa } = recomendarPlanoLocal(
        respostasFinais.mensagem ?? ""
      );
      setDigitando(false);
      setPlanoSugerido(plano);
      setMensagens((prev) => [
        ...prev,
        {
          de: "nexa",
          texto: `Pelo que você me contou, o plano que mais faz sentido é o ${plano.nome}. ${justificativa}`,
        },
      ]);
      setFinalizado(true);
    }, 900);
  }

  function enviarResposta(valor: string) {
    const perguntaAtual = perguntas[stepIndex];
    if (perguntaAtual.obrigatorio && !valor.trim()) return;

    const textoExibido = valor.trim() || "Prefiro não informar";
    const novasRespostas = { ...respostas, [perguntaAtual.key]: valor };

    setRespostas(novasRespostas);
    setMensagens((prev) => [...prev, { de: "user", texto: textoExibido }]);
    setValorAtual("");

    const proximoIndex = stepIndex + 1;
    setDigitando(true);

    setTimeout(() => {
      if (proximoIndex < perguntas.length) {
        setDigitando(false);
        setMensagens((prev) => [
          ...prev,
          { de: "nexa", texto: perguntas[proximoIndex].texto(novasRespostas) },
        ]);
        setStepIndex(proximoIndex);
      } else {
        setStepIndex(proximoIndex);
        finalizarConversa(novasRespostas);
      }
    }, 700);
  }

  const perguntaAtual = perguntas[stepIndex];

  return (
    <section id="contato" className="nexa-section bg-[#070707] py-24 text-white md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,106,0,.10),transparent_30%)]" />
      <div className="nexa-grid absolute inset-0 opacity-15" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_.65fr] lg:items-end">
          <div className="max-w-3xl">
            <span className="nexa-label">final / conexão</span>
            <h2 className="nexa-display mt-6 text-4xl font-black leading-[.92] md:text-7xl">Sua presença digital pode começar <span className="text-brand-orange">aqui.</span></h2>
          </div>
          <p className="max-w-md text-base leading-7 text-white/45 lg:justify-self-end">Conte o que sua empresa precisa. A conversa começa aqui e a experiência continua no projeto.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="contact-presence rounded-3xl border border-white/10 bg-white/[.025] p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-brand-orange/30 bg-brand-orange/10 text-brand-orange"><Sparkles className="h-5 w-5" /></div>
                <div><p className="text-sm font-semibold">Nexa MP</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[.2em] text-white/30">vamos construir</p></div>
              </div>
              <p className="mt-7 text-sm leading-6 text-white/40">Escolha um canal ou comece a conversa ao lado. Sem pressão, sem promessa inventada — só um primeiro diagnóstico.</p>
            </div>

            <a href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.02] p-4 text-white transition-all hover:-translate-y-1 hover:border-brand-orange/40 hover:bg-brand-orange/[.06]"
            >
              <div>
<p className="flex items-center gap-2 text-sm font-semibold">
  <ArrowUpRight className="h-4 w-4 text-brand-orange" /> Instagram
</p>                <p className="mt-1 text-sm text-white/40">@nexamp_</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-white/25 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-orange" />
            </a>

            <div className="contact-link flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.015] p-4 opacity-70">
              <div><p className="flex items-center gap-2 text-sm font-semibold"><MessageCircle className="h-4 w-4 text-brand-orange/70" /> WhatsApp</p><p className="mt-1 text-xs text-white/30">Em breve</p></div><span className="font-mono text-[8px] uppercase tracking-[.15em] text-white/20">soon</span>
            </div>

            <div className="contact-link flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.015] p-4 opacity-70">
              <div><p className="flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4 text-brand-orange/70" /> E-mail</p><p className="mt-1 text-xs text-white/30">Em breve</p></div><span className="font-mono text-[8px] uppercase tracking-[.15em] text-white/20">soon</span>
            </div>
          </div>

          <div className="contact-chat flex h-[520px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#f1eee9] text-brand-black shadow-[0_30px_100px_rgba(0,0,0,.35)]">
            <div ref={scrollRef} aria-live="polite" aria-label="Conversa com a Nexa MP" className="flex-1 space-y-3 overflow-y-auto p-6 md:p-7">
              {mensagens.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${m.de === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      m.de === "user"
                        ? "rounded-br-sm bg-brand-orange text-brand-white"
                        : "rounded-bl-sm bg-white text-brand-black shadow-sm"
                    }`}
                  >
                    {m.texto}
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {digitando && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-brand-black/30"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-black/10 bg-white p-4">
              {finalizado ? (
                <div className="space-y-3">
                  {planoSugerido && !mostrarOutros && (
                    <div className="rounded-xl border border-brand-orange/30 bg-brand-orange/5 p-3">
                      <p className="text-xs font-semibold text-brand-orange">Plano sugerido</p>
                      <p className="text-sm font-bold">
                        {planoSugerido.nome} — {planoSugerido.preco} ({planoSugerido.periodo})
                      </p>
                    </div>
                  )}

                  {planoSugerido && !mostrarOutros && (
                    <button
                      type="button"
                      onClick={() => setMostrarOutros(true)}
                      className="text-xs text-brand-black/50 underline"
                    >
                      Prefiro ver outros planos
                    </button>
                  )}

                  {mostrarOutros && (
                    <div className="flex flex-wrap gap-2">
                      {PLANOS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPlanoSugerido(p);
                            setMostrarOutros(false);
                          }}
                          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-brand-orange hover:text-brand-orange"
                        >
                          {p.nome}
                        </button>
                      ))}
                    </div>
                  )}

                  
                    <button
                    type="button"
                    onClick={copiarResumo}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition-colors hover:border-brand-orange hover:text-brand-orange"
                  >
                    {resumoCopiado ? "Resumo copiado" : "Copiar resumo da conversa"}
                  </button>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-orange-dark"
                  >
                    Abrir Instagram da Nexa MP
                  </a>
                </div>
              ) : perguntaAtual?.tipo === "textarea" ? (
                <div className="flex items-end gap-2">
                  <label htmlFor={`contato-${perguntaAtual.key}`} className="sr-only">
                    {perguntaAtual.texto(respostas)}
                  </label>
                  <textarea
                    id={`contato-${perguntaAtual.key}`}
                    value={valorAtual}
                    onChange={(e) => setValorAtual(e.target.value)}
                    placeholder={perguntaAtual.placeholder}
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-orange"
                  />
                  <button
                    type="button"
                    onClick={() => enviarResposta(valorAtual)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange text-brand-white transition-colors hover:bg-brand-orange-dark"
                    aria-label="Enviar"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <label htmlFor={`contato-${perguntaAtual?.key ?? "resposta"}`} className="sr-only">
                    {perguntaAtual?.texto({}) ?? "Sua resposta"}
                  </label>
                  <input
                    id={`contato-${perguntaAtual?.key ?? "resposta"}`}
                    type="text"
                    value={valorAtual}
                    onChange={(e) => setValorAtual(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") enviarResposta(valorAtual);
                    }}
                    placeholder={perguntaAtual?.placeholder}
                    className="flex-1 rounded-full border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-orange"
                  />
                  <button
                    type="button"
                    onClick={() => enviarResposta(valorAtual)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange text-brand-white transition-colors hover:bg-brand-orange-dark"
                    aria-label="Enviar"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}