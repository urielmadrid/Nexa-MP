"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { CONTATO, linkEmail, linkWhatsApp } from "@/src/lib/data/contato";
import { DIAGNOSTICO } from "@/src/lib/formulario/diagnostico";
import type { ErrosPorCampo, Pergunta, RespostasBrutas } from "@/src/lib/formulario/tipos";
import { RESPOSTAS_BRUTAS_VAZIAS, perguntaVisivel, validarPerguntas } from "@/src/lib/formulario/validar";
import { useMovimentoReduzido } from "@/src/lib/modoSite";

/**
 * Formulário em etapas da página /formulario.
 * Todas as perguntas vêm de src/lib/formulario/diagnostico.ts e a validação é a mesma do servidor
 * (src/lib/formulario/validar.ts). O envio vai para /api/formulario.
 */

const ETAPAS = DIAGNOSTICO.etapas;
const ULTIMA = ETAPAS.length - 1;

const CAMPO =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange/40";

type Estado = "parado" | "enviando" | "enviado" | "limite" | "falhou";

function lista(valor: string | string[] | undefined): string[] {
  return Array.isArray(valor) ? valor : valor ? [valor] : [];
}

/** Cópia dos erros sem o do campo informado. */
function semErro(erros: ErrosPorCampo, codigo: string): ErrosPorCampo {
  if (!(codigo in erros)) return erros;
  const resto = { ...erros };
  delete resto[codigo];
  return resto;
}

function atributosDoCampo(p: Pergunta): { type: string; inputMode?: "text" | "email" | "tel"; autoComplete: string } {
  if (p.campoLead === "email") return { type: "email", inputMode: "email", autoComplete: "email" };
  if (p.campoLead === "whatsapp") return { type: "tel", inputMode: "tel", autoComplete: "tel" };
  if (p.campoLead === "nome") return { type: "text", autoComplete: "name" };
  if (p.campoLead === "empresa") return { type: "text", autoComplete: "organization" };
  return { type: "text", autoComplete: "off" };
}

function CampoPergunta({
  pergunta,
  brutas,
  erro,
  onValor,
  onOutro,
}: {
  pergunta: Pergunta;
  brutas: RespostasBrutas;
  erro: string | undefined;
  onValor: (codigo: string, valor: string | string[]) => void;
  onOutro: (codigo: string, texto: string) => void;
}) {
  const id = `campo-${pergunta.codigo}`;
  const valor = brutas.valores[pergunta.codigo];
  const rotulo = (
    <>
      {pergunta.rotulo}
      {pergunta.obrigatoria ? (
        <span className="text-brand-orange"> *</span>
      ) : (
        <span className="font-normal text-white/35"> (opcional)</span>
      )}
    </>
  );
  const apoio = pergunta.apoio ? <p className="mt-1 text-xs leading-5 text-white/40">{pergunta.apoio}</p> : null;
  const mensagemErro = erro ? (
    <p id={`${id}-erro`} role="alert" className="mt-2 text-xs font-medium text-brand-orange">
      {erro}
    </p>
  ) : null;

  if (pergunta.tipo === "texto_curto" || pergunta.tipo === "texto_longo") {
    const texto = typeof valor === "string" ? valor : "";
    const comum = {
      id: `${id}-entrada`,
      value: texto,
      maxLength: pergunta.maxCaracteres,
      placeholder: pergunta.placeholder,
      "aria-required": pergunta.obrigatoria,
      "aria-invalid": erro !== undefined,
      "aria-describedby": erro ? `${id}-erro` : undefined,
    };
    return (
      <div id={id}>
        <label htmlFor={`${id}-entrada`} className="block text-sm font-semibold text-white/85">
          {rotulo}
        </label>
        {apoio}
        {pergunta.tipo === "texto_longo" ? (
          <>
            <textarea
              {...comum}
              rows={4}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onValor(pergunta.codigo, e.target.value)}
              className={`${CAMPO} resize-y leading-6`}
            />
            <span className="mt-1 block text-right font-mono text-[10px] text-white/30">
              {texto.length}/{pergunta.maxCaracteres}
            </span>
          </>
        ) : (
          <input
            {...comum}
            {...atributosDoCampo(pergunta)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onValor(pergunta.codigo, e.target.value)}
            className={CAMPO}
          />
        )}
        {mensagemErro}
      </div>
    );
  }

  const unica = pergunta.tipo === "escolha_unica";
  const marcadas = lista(valor);
  const opcoes = pergunta.opcoes ?? [];
  const pedeTexto = opcoes.find((o) => o.pedeTexto && marcadas.includes(o.codigo));

  function alternar(codigo: string) {
    if (unica) {
      onValor(pergunta.codigo, codigo);
      return;
    }
    const opcao = opcoes.find((o) => o.codigo === codigo);
    if (marcadas.includes(codigo)) {
      onValor(pergunta.codigo, marcadas.filter((c) => c !== codigo));
    } else if (opcao?.exclusiva) {
      onValor(pergunta.codigo, [codigo]);
    } else {
      onValor(pergunta.codigo, [...marcadas.filter((c) => !opcoes.find((o) => o.codigo === c)?.exclusiva), codigo]);
    }
  }

  return (
    <fieldset id={id} className="min-w-0 border-0 p-0" aria-describedby={erro ? `${id}-erro` : undefined}>
      <legend className="block p-0 text-sm font-semibold text-white/85">{rotulo}</legend>
      {apoio}
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {opcoes.map((o) => {
          const marcado = marcadas.includes(o.codigo);
          return (
            <label key={o.codigo} className="relative block cursor-pointer">
              <input
                type={unica ? "radio" : "checkbox"}
                name={pergunta.codigo}
                value={o.codigo}
                checked={marcado}
                onChange={() => alternar(o.codigo)}
                className="peer sr-only"
              />
              <span
                className={`flex h-full items-start gap-3 rounded-2xl border p-4 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-brand-orange hover:-translate-y-0.5 ${
                  marcado
                    ? "border-brand-orange bg-brand-orange/10 shadow-[0_0_30px_rgba(255,106,0,.12)]"
                    : "border-white/10 bg-white/[.03] hover:border-white/25 hover:bg-white/[.05]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border transition-colors ${unica ? "rounded-full" : "rounded-md"} ${
                    marcado ? "border-brand-orange bg-brand-orange text-white" : "border-white/25 text-transparent"
                  }`}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className={`block text-sm font-semibold ${marcado ? "text-white" : "text-white/80"}`}>{o.rotulo}</span>
              </span>
            </label>
          );
        })}
      </div>
      {pedeTexto && (
        <label className="mt-3 block text-xs font-semibold text-white/70">
          Conte qual
          <input
            type="text"
            value={brutas.outros[pergunta.codigo] ?? ""}
            maxLength={pergunta.maxCaracteres}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onOutro(pergunta.codigo, e.target.value)}
            className={CAMPO}
          />
        </label>
      )}
      {mensagemErro}
    </fieldset>
  );
}

export default function FormularioDiagnostico() {
  const reduzir = useMovimentoReduzido();
  const [etapa, setEtapa] = useState(0);
  const [direcao, setDirecao] = useState(1);
  const [brutas, setBrutas] = useState<RespostasBrutas>(RESPOSTAS_BRUTAS_VAZIAS);
  const [erros, setErros] = useState<ErrosPorCampo>({});
  const [aceite, setAceite] = useState(false);
  const [erroAceite, setErroAceite] = useState(false);
  const [isca, setIsca] = useState("");
  const [estado, setEstado] = useState<Estado>("parado");
  const [codigoEnvio, setCodigoEnvio] = useState("");
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const primeiraEtapa = useRef(true);

  // Ao trocar de etapa, o foco vai para o título (leitores de tela anunciam a nova etapa).
  useEffect(() => {
    if (primeiraEtapa.current) {
      primeiraEtapa.current = false;
      return;
    }
    tituloRef.current?.focus();
  }, [etapa]);

  // Depois de enviar, o foco vai para o título da mensagem de confirmação.
  useEffect(() => {
    if (estado === "enviado") tituloRef.current?.focus();
  }, [estado]);

  const atual = ETAPAS[etapa];
  const nome = lista(brutas.valores.nome)[0] ?? "";
  const canal = lista(brutas.valores.canal_preferido)[0] ?? "";

  function definirValor(codigo: string, valor: string | string[]) {
    setBrutas((b) => {
      const proximo: RespostasBrutas = { valores: { ...b.valores, [codigo]: valor }, outros: { ...b.outros } };
      // Ao sair da opção "Outra", o complemento digitado deixa de valer.
      const pergunta = ETAPAS.flatMap((e) => e.perguntas).find((p) => p.codigo === codigo);
      const aindaPede = (pergunta?.opcoes ?? []).some((o) => o.pedeTexto && lista(valor).includes(o.codigo));
      if (!aindaPede) delete proximo.outros[codigo];
      return proximo;
    });
    setErros((e) => semErro(e, codigo));
  }

  function definirOutro(codigo: string, texto: string) {
    setBrutas((b) => ({ valores: b.valores, outros: { ...b.outros, [codigo]: texto } }));
    setErros((e) => semErro(e, codigo));
  }

  function focarPrimeiroErro(codigos: string[]) {
    window.setTimeout(() => {
      for (const codigo of codigos) {
        const alvo = document.getElementById(`campo-${codigo}`)?.querySelector<HTMLElement>("input, textarea");
        if (alvo) {
          alvo.focus();
          return;
        }
      }
    }, 0);
  }

  function irPara(destino: number) {
    setDirecao(destino > etapa ? 1 : -1);
    setEtapa(destino);
  }

  async function enviar() {
    setEstado("enviando");
    const params = new URLSearchParams(window.location.search);
    let referrer = "";
    try {
      if (document.referrer) {
        const url = new URL(document.referrer);
        referrer = url.origin + url.pathname;
      }
    } catch {
      /* sem referrer válido */
    }
    try {
      const resposta = await fetch("/api/formulario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valores: brutas.valores,
          outros: brutas.outros,
          aceite,
          website: isca,
          origem: {
            pagina: window.location.pathname,
            referrer,
            utmSource: params.get("utm_source") ?? "",
            utmMedium: params.get("utm_medium") ?? "",
            utmCampaign: params.get("utm_campaign") ?? "",
            utmTerm: params.get("utm_term") ?? "",
            utmContent: params.get("utm_content") ?? "",
          },
        }),
      });
      if (resposta.ok) {
        const dados: { id?: string } = await resposta.json().catch(() => ({}));
        setCodigoEnvio(typeof dados.id === "string" ? dados.id.slice(0, 8).toUpperCase() : "");
        setEstado("enviado");
        return;
      }
      if (resposta.status === 400) {
        const dados: { campos?: ErrosPorCampo } = await resposta.json().catch(() => ({}));
        if (dados.campos && Object.keys(dados.campos).length > 0) {
          const codigos = Object.keys(dados.campos);
          const alvo = ETAPAS.findIndex((e) => e.perguntas.some((p) => codigos.includes(p.codigo)));
          setErros(dados.campos);
          if (alvo >= 0) irPara(alvo);
          focarPrimeiroErro(codigos);
          setEstado("parado");
          return;
        }
      }
      setEstado(resposta.status === 429 ? "limite" : "falhou");
    } catch {
      setEstado("falhou");
    }
  }

  function avancar(evento?: FormEvent) {
    evento?.preventDefault();
    if (estado === "enviando") return;
    const novosErros = validarPerguntas(atual.perguntas, brutas);
    const aceiteFaltando = etapa === ULTIMA && !aceite;
    setErros(novosErros);
    setErroAceite(aceiteFaltando);
    if (Object.keys(novosErros).length > 0) {
      focarPrimeiroErro(atual.perguntas.map((p) => p.codigo).filter((c) => c in novosErros));
      return;
    }
    if (aceiteFaltando) return;
    if (etapa < ULTIMA) {
      irPara(etapa + 1);
      return;
    }
    void enviar();
  }

  const movimento = reduzir
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, x: 24 * direcao },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 * direcao },
        transition: { duration: 0.22 },
      };

  if (estado === "enviado") {
    const primeiroNome = nome.split(/\s+/)[0];
    const por = canal === "whatsapp" ? "pelo WhatsApp" : canal === "email" ? "por e-mail" : "pelo WhatsApp ou por e-mail";
    return (
      <div className="rounded-[2rem] border border-brand-orange/30 bg-[#0c0c0c] p-7 shadow-[0_30px_100px_rgba(0,0,0,.45)] md:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-brand-orange/40 bg-brand-orange/10 text-brand-orange">
          <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
        </span>
        <h2 ref={tituloRef} tabIndex={-1} className="nexa-display mt-6 text-3xl font-black leading-[1.02] text-white outline-none md:text-4xl">
          Recebemos as suas respostas{primeiroNome ? `, ${primeiroNome}` : ""}.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
          A Nexa MP vai analisar o que você respondeu e entrar em contato {por}. Se preferir adiantar a conversa, pode escrever agora também.
        </p>
        {codigoEnvio && (
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[.18em] text-white/35">código do envio: {codigoEnvio}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={linkWhatsApp("Olá! Acabei de responder o diagnóstico no site da Nexa MP.")}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-press group inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3.5 text-sm font-bold text-white outline-none transition-all hover:-translate-y-0.5 hover:bg-brand-orange-dark focus-visible:ring-2 focus-visible:ring-white"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Falar pelo WhatsApp
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">(abre em uma nova aba)</span>
          </a>
          <a
            href="/"
            className="cta-press inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white/80 outline-none transition-all hover:border-white/40 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            Voltar ao site
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={avancar}
      noValidate
      aria-label={DIAGNOSTICO.titulo}
      className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0c0c] shadow-[0_30px_100px_rgba(0,0,0,.45)]"
    >
      {/* progresso */}
      <div className="border-b border-white/10 bg-white/[.02] px-5 pb-4 pt-5 md:px-8">
        <ol className="flex gap-1.5" aria-label="Etapas">
          {ETAPAS.map((e, i) => {
            const feita = i < etapa;
            const ativa = i === etapa;
            return (
              <li key={e.codigo} className="flex-1">
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

      <div className="min-h-[420px] flex-1 px-5 py-7 md:px-8 md:py-9">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={etapa} {...movimento}>
            <h2 ref={tituloRef} tabIndex={-1} className="nexa-display text-2xl font-black leading-[1.02] text-white outline-none md:text-3xl">
              {atual.titulo}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/45">{atual.apoio}</p>

            <div className="mt-7 space-y-7">
              {atual.perguntas
                .filter((p) => perguntaVisivel(p, brutas))
                .map((p) => (
                  <CampoPergunta key={p.codigo} pergunta={p} brutas={brutas} erro={erros[p.codigo]} onValor={definirValor} onOutro={definirOutro} />
                ))}
            </div>

            {etapa === ULTIMA && (
              <>
                <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-xs leading-5 text-white/65">
                  <input
                    type="checkbox"
                    checked={aceite}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setAceite(e.target.checked);
                      if (e.target.checked) setErroAceite(false);
                    }}
                    aria-required="true"
                    aria-invalid={erroAceite}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-orange ${
                      aceite ? "border-brand-orange bg-brand-orange text-white" : "border-white/25 text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span>
                    Li e aceito a{" "}
                    <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-orange underline-offset-4 hover:underline">
                      Política de Privacidade
                    </a>{" "}
                    e os{" "}
                    <a href="/termos" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-orange underline-offset-4 hover:underline">
                      Termos de Uso
                    </a>
                    , e concordo que a Nexa MP use os dados informados aqui para responder ao meu contato. <span className="text-brand-orange">*</span>
                    <span className="sr-only">(as páginas abrem em uma nova aba)</span>
                  </span>
                </label>
                {erroAceite && (
                  <p role="alert" className="mt-2 text-xs font-medium text-brand-orange">
                    Para enviar, marque que leu e aceita a Política de Privacidade e os Termos de Uso.
                  </p>
                )}

                {/* Campo-isca: pessoas não veem nem preenchem; robôs sim. */}
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label>
                    Não preencha este campo
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={isca} onChange={(e: ChangeEvent<HTMLInputElement>) => setIsca(e.target.value)} />
                  </label>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* navegação */}
      <div className="border-t border-white/10 bg-white/[.02] px-5 py-4 md:px-8">
        <p className="min-h-[1.25rem] text-xs font-medium text-brand-orange" role="alert">
          {estado === "limite" && "Foram muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo."}
          {estado === "falhou" && (
            <>
              Não conseguimos enviar agora. Tente de novo em instantes ou fale pelo{" "}
              <a href={linkWhatsApp("Olá! Tentei enviar o diagnóstico pelo site, mas não consegui.")} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                WhatsApp
              </a>{" "}
              ou pelo e-mail{" "}
              <a href={linkEmail()} className="underline underline-offset-4">
                {CONTATO.email}
              </a>
              .
            </>
          )}
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
          <button
            type="submit"
            disabled={estado === "enviando"}
            className="cta-press group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black outline-none transition-all hover:-translate-y-0.5 hover:bg-brand-orange hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange disabled:opacity-60"
          >
            {estado === "enviando" ? "Enviando..." : etapa === ULTIMA ? "Enviar diagnóstico" : "Continuar"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}