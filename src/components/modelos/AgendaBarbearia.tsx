"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Check, Clock, X } from "lucide-react";
import {
  BARBEIROS,
  SERVICOS_BARBEARIA,
  TOTAL_SLOTS,
  contarLivres,
  dataParaISO,
  montarGrade,
  proximosDias,
  rotuloDoSlot,
  type DiaAgenda,
  type EstadoSlot,
  type Reserva,
} from "@/src/lib/data/agendaBarbearia";

/**
 * Agenda interativa do MODELO de barbearia. É uma simulação: os horários ocupados são fictícios e nada é
 * enviado ou guardado. Mostra, por barbeiro, quais horários estão livres e quais já têm cliente.
 */

const OURO = "#c8a24a";
const HACHURA = "bg-[repeating-linear-gradient(135deg,rgba(243,236,224,.07)_0_5px,transparent_5px_10px)]";

type Escolha = { barbeiro: string; slot: number };
type Confirmada = Reserva & { servico: string; nome: string; preco: string; dia: string };

function primeiroDiaComVaga(dias: DiaAgenda[], agora: Date, servicoIdx: number, reservas: Reserva[]): string {
  const hojeISO = dataParaISO(agora);
  for (const d of dias) {
    if (d.fechado) continue;
    const grade = montarGrade({
      dataISO: d.dataISO,
      agoraMin: d.dataISO === hojeISO ? agora.getHours() * 60 + agora.getMinutes() : null,
      servico: SERVICOS_BARBEARIA[servicoIdx],
      reservas,
    });
    if (contarLivres(grade).livres > 0) return d.dataISO;
  }
  return dias.find((d) => !d.fechado)?.dataISO ?? dias[0].dataISO;
}

function Legenda({ classe, texto }: { classe: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] text-[#f3ece0]/65">
      <span className={`h-3.5 w-6 rounded ${classe}`} aria-hidden="true" />
      {texto}
    </span>
  );
}

function Celula({
  estado,
  selecionado,
  inicio,
  rotulo,
  onEscolher,
}: {
  estado: EstadoSlot;
  selecionado: boolean;
  inicio: boolean;
  rotulo: string;
  onEscolher: () => void;
}) {
  const base = "flex h-10 w-full items-center justify-center rounded-md text-[11px] font-bold md:text-xs";

  if (selecionado) {
    return inicio ? (
      <button
        type="button"
        onClick={onEscolher}
        aria-pressed="true"
        aria-label={`${rotulo}, selecionado. Toque para desmarcar`}
        className={`${base} bg-[#c8a24a] text-[#0f0d0b] shadow-[0_0_24px_rgba(200,162,74,.45)] outline-none focus-visible:ring-2 focus-visible:ring-[#f3ece0]`}
      >
        <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Seu
      </button>
    ) : (
      <span className={`${base} bg-[#c8a24a]/70 text-[#0f0d0b]`} aria-label={`${rotulo}, faz parte do horário selecionado`}>
        ·
      </span>
    );
  }

  if (estado === "livre") {
    return (
      <button
        type="button"
        onClick={onEscolher}
        aria-pressed="false"
        aria-label={`${rotulo}, livre`}
        className={`${base} border border-[#c8a24a]/50 bg-[#c8a24a]/[.07] text-[#c8a24a] outline-none transition-all hover:bg-[#c8a24a] hover:text-[#0f0d0b] focus-visible:ring-2 focus-visible:ring-[#f3ece0]`}
      >
        Livre
      </button>
    );
  }

  if (estado === "seu") {
    return (
      <span className={`${base} bg-[#f3ece0] text-[#0f0d0b]`} aria-label={`${rotulo}, o seu horário reservado`}>
        Você
      </span>
    );
  }

  if (estado === "ocupado") {
    return (
      <span className={`${base} border border-[#f3ece0]/10 ${HACHURA} font-semibold text-[#f3ece0]/55`} aria-label={`${rotulo}, ocupado`}>
        Ocupado
      </span>
    );
  }

  if (estado === "curto") {
    return (
      <span
        className={`${base} border border-dashed border-[#f3ece0]/15 font-medium italic text-[#f3ece0]/45`}
        aria-label={`${rotulo}, livre, mas o intervalo é curto demais para este serviço`}
      >
        Curto
      </span>
    );
  }

  return (
    <span className={`${base} font-medium text-[#f3ece0]/30`} aria-label={`${rotulo}, horário já passou`}>
      —
    </span>
  );
}

export default function AgendaBarbearia() {
  const [agora, setAgora] = useState<Date | null>(null);
  const [servicoIdx, setServicoIdx] = useState(0);
  const [dataEscolhida, setDataEscolhida] = useState<string | null>(null);
  const [escolha, setEscolha] = useState<Escolha | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [confirmada, setConfirmada] = useState<Confirmada | null>(null);
  const [aviso, setAviso] = useState("");
  const [erro, setErro] = useState("");

  // A data só é lida no navegador: a página é gerada antes, e "hoje" muda de pessoa para pessoa.
  useEffect(() => {
    setAgora(new Date());
    const timer = window.setInterval(() => setAgora(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!agora) {
    return (
      <div
        className="grid min-h-[520px] place-items-center rounded-3xl border border-[#f3ece0]/10 bg-[#181512] text-sm text-[#f3ece0]/50"
        role="status"
      >
        Carregando a agenda...
      </div>
    );
  }

  const servico = SERVICOS_BARBEARIA[servicoIdx];
  const dias = proximosDias(agora);
  const hojeISO = dataParaISO(agora);
  const dataISO = dataEscolhida ?? primeiroDiaComVaga(dias, agora, servicoIdx, reservas);
  const dia = dias.find((d) => d.dataISO === dataISO) ?? dias[0];
  const grade = montarGrade({
    dataISO,
    agoraMin: dataISO === hojeISO ? agora.getHours() * 60 + agora.getMinutes() : null,
    servico,
    reservas,
  });
  const { livres, ocupados } = contarLivres(grade);
  const precisa = servico.minutos / 30;
  const barbeiroEscolhido = BARBEIROS.find((b) => b.id === escolha?.barbeiro);
  const horaEscolhida = escolha ? rotuloDoSlot(escolha.slot) : "";

  function trocarServico(i: number) {
    setServicoIdx(i);
    setEscolha(null);
    setErro("");
    setAviso("");
  }

  function trocarDia(iso: string) {
    setDataEscolhida(iso);
    setEscolha(null);
    setErro("");
    setAviso("");
  }

  function escolherHorario(barbeiro: string, slot: number) {
    setErro("");
    setConfirmada(null);
    if (escolha && escolha.barbeiro === barbeiro && escolha.slot === slot) {
      setEscolha(null);
      setAviso("Horário desmarcado.");
      return;
    }
    setEscolha({ barbeiro, slot });
    const nomeBarbeiro = BARBEIROS.find((b) => b.id === barbeiro)?.nome ?? "";
    setAviso(`Selecionado: ${rotuloDoSlot(slot)} com ${nomeBarbeiro}.`);
  }

  function confirmar() {
    if (!escolha) {
      setErro("Escolha um horário livre na agenda.");
      return;
    }
    if (nome.trim().length < 2) {
      setErro("Informe o seu nome para confirmar.");
      return;
    }
    const reserva: Reserva = { dataISO, barbeiro: escolha.barbeiro, slot: escolha.slot, slots: precisa };
    setReservas((anteriores) => [...anteriores, reserva]);
    setConfirmada({ ...reserva, servico: servico.nome, nome: nome.trim(), preco: servico.preco, dia: dia.rotulo });
    setEscolha(null);
    setErro("");
    setAviso("Horário reservado. Demonstração: nada foi enviado.");
  }

  function cancelar() {
    if (!confirmada) return;
    setReservas((anteriores) =>
      anteriores.filter(
        (r) => !(r.dataISO === confirmada.dataISO && r.barbeiro === confirmada.barbeiro && r.slot === confirmada.slot),
      ),
    );
    setConfirmada(null);
    setAviso("Horário cancelado. Ele voltou a ficar livre.");
  }

  const campo =
    "mt-1.5 w-full rounded-xl border border-[#f3ece0]/15 bg-[#0f0d0b] px-4 py-3 text-sm text-[#f3ece0] outline-none transition-colors placeholder:text-[#f3ece0]/30 focus:border-[#c8a24a] focus-visible:ring-2 focus-visible:ring-[#c8a24a]/40";

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
      <p className="sr-only" role="status" aria-live="polite">
        {aviso}
      </p>

      {/* 1 e 2: serviço e dia */}
      <div className="rounded-3xl border border-[#f3ece0]/10 bg-[#181512] p-5 md:p-6 lg:col-start-1">
        <fieldset>
          <legend className="text-[11px] font-bold uppercase tracking-[.22em]" style={{ color: OURO }}>
            1. Serviço
          </legend>
          <div className="mt-3 space-y-2">
            {SERVICOS_BARBEARIA.map((s, i) => {
              const marcado = i === servicoIdx;
              return (
                <label key={s.id} className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name="servico-barbearia"
                    checked={marcado}
                    onChange={() => trocarServico(i)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-[#f3ece0] ${
                      marcado ? "border-[#c8a24a] bg-[#c8a24a]/10" : "border-[#f3ece0]/10 hover:border-[#f3ece0]/30"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[#f3ece0]">{s.nome}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#f3ece0]/50">
                        <Clock className="h-3 w-3" aria-hidden="true" /> {s.minutos} min
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold" style={{ color: marcado ? OURO : "rgba(243,236,224,.8)" }}>
                      {s.preco}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[#f3ece0]/40">Valores ilustrativos: o seu negócio coloca os próprios.</p>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="text-[11px] font-bold uppercase tracking-[.22em]" style={{ color: OURO }}>
            2. Dia
          </legend>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {dias.map((d) => {
              const marcado = d.dataISO === dataISO;
              return (
                <label key={d.dataISO} className={`relative block shrink-0 ${d.fechado ? "cursor-not-allowed" : "cursor-pointer"}`}>
                  <input
                    type="radio"
                    name="dia-barbearia"
                    checked={marcado}
                    disabled={d.fechado}
                    onChange={() => trocarDia(d.dataISO)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex w-[68px] flex-col items-center rounded-xl border py-2.5 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-[#f3ece0] ${
                      d.fechado
                        ? "border-[#f3ece0]/5 opacity-40"
                        : marcado
                          ? "border-[#c8a24a] bg-[#c8a24a] text-[#0f0d0b]"
                          : "border-[#f3ece0]/10 hover:border-[#f3ece0]/30"
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wide">{d.semana}</span>
                    <span className={`mt-0.5 text-xs ${marcado ? "" : "text-[#f3ece0]/60"}`}>{d.dia}</span>
                    {d.fechado && <span className="mt-0.5 text-[9px] font-bold uppercase">Fechado</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Agenda: livre x ocupado por barbeiro */}
      <div className="rounded-3xl border border-[#f3ece0]/10 bg-[#181512] p-5 md:p-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.22em]" style={{ color: OURO }}>
              3. Horário
            </p>
            <h3 className="mt-1 font-serif text-2xl font-bold text-[#f3ece0]">{dia.rotulo}</h3>
          </div>
          <p className="text-sm text-[#f3ece0]/60">
            <span className="font-bold" style={{ color: OURO }}>{livres} livres</span> · {ocupados} ocupados
            <span className="text-[#f3ece0]/40"> · {servico.nome}, {servico.minutos} min</span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Legenda classe="border border-[#c8a24a]/60 bg-[#c8a24a]/10" texto="Livre" />
          <Legenda classe={`border border-[#f3ece0]/15 ${HACHURA}`} texto="Ocupado" />
          <Legenda classe="bg-[#f3ece0]" texto="Seu horário" />
          <Legenda classe="border border-dashed border-[#f3ece0]/30" texto="Curto: não comporta o serviço" />
        </div>

        {dia.fechado ? (
          <p className="mt-6 rounded-2xl border border-[#f3ece0]/10 p-8 text-center text-sm text-[#f3ece0]/60">
            Fechado neste dia. Escolha outro dia ao lado.
          </p>
        ) : (
          <div className="mt-4 max-h-[560px] overflow-auto rounded-2xl border border-[#f3ece0]/10 bg-[#0f0d0b] p-2">
            <table className="w-full border-separate border-spacing-1">
              <caption className="sr-only">
                Horários de {dia.rotulo} para {servico.nome}, por barbeiro: livres e ocupados.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky top-0 z-10 w-12 bg-[#0f0d0b] pb-2 text-left text-[10px] font-bold uppercase tracking-widest text-[#f3ece0]/40 md:w-16">
                    Hora
                  </th>
                  {BARBEIROS.map((b) => (
                    <th key={b.id} scope="col" className="sticky top-0 z-10 bg-[#0f0d0b] pb-2 text-center">
                      <span className="block text-xs font-bold text-[#f3ece0]">{b.nome}</span>
                      <span className="hidden text-[10px] font-normal text-[#f3ece0]/40 md:block">{b.especialidade}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: TOTAL_SLOTS }, (_, s) => (
                  <tr key={s}>
                    <th scope="row" className="pr-1 text-left font-mono text-[11px] font-semibold text-[#f3ece0]/55 md:text-xs">
                      {rotuloDoSlot(s)}
                    </th>
                    {BARBEIROS.map((b, c) => {
                      const selecionado = Boolean(
                        escolha && escolha.barbeiro === b.id && s >= escolha.slot && s < escolha.slot + precisa,
                      );
                      return (
                        <td key={b.id}>
                          <Celula
                            estado={grade[s][c]}
                            selecionado={selecionado}
                            inicio={Boolean(escolha && escolha.slot === s)}
                            rotulo={`${b.nome}, ${rotuloDoSlot(s)}`}
                            onEscolher={() => escolherHorario(b.id, s)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[11px] leading-5 text-[#f3ece0]/40">
          Modelo de demonstração: a ocupação mostrada é fictícia e nada é enviado ou guardado.
        </p>
      </div>

      {/* 4: resumo e confirmação */}
      <div className="rounded-3xl border border-[#c8a24a]/30 bg-[#181512] p-5 md:p-6 lg:col-start-1">
        {confirmada ? (
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#c8a24a] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0f0d0b]">
              <Check className="h-3.5 w-3.5" aria-hidden="true" /> Horário reservado
            </p>
            <p className="mt-4 font-serif text-xl font-bold text-[#f3ece0]">
              {confirmada.servico} com {BARBEIROS.find((b) => b.id === confirmada.barbeiro)?.nome}
            </p>
            <p className="mt-1 text-sm text-[#f3ece0]/70">
              {confirmada.dia} às {rotuloDoSlot(confirmada.slot)} · {confirmada.preco}
            </p>
            <p className="mt-3 text-sm text-[#f3ece0]/60">Tudo certo, {confirmada.nome}! Na agenda ao lado, o seu horário aparece como &quot;Você&quot;.</p>
            <p className="mt-3 text-[11px] leading-5 text-[#f3ece0]/40">Demonstração: nenhuma mensagem foi enviada e nenhum dado foi guardado.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirmada(null)}
                className="cta-press rounded-full bg-[#c8a24a] px-5 py-3 text-sm font-bold text-[#0f0d0b] outline-none transition-colors hover:bg-[#f3ece0] focus-visible:ring-2 focus-visible:ring-[#f3ece0]"
              >
                Agendar outro horário
              </button>
              <button
                type="button"
                onClick={cancelar}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#f3ece0]/20 px-5 py-3 text-sm font-semibold text-[#f3ece0]/75 outline-none transition-colors hover:border-[#f3ece0]/50 focus-visible:ring-2 focus-visible:ring-[#c8a24a]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" /> Cancelar este horário
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.22em]" style={{ color: OURO }}>
              4. Confirmar
            </p>

            <div className="mt-3 rounded-2xl border border-[#f3ece0]/10 bg-[#0f0d0b] p-4 text-sm" aria-live="polite">
              {escolha && barbeiroEscolhido ? (
                <>
                  <p className="font-bold text-[#f3ece0]">
                    {servico.nome} com {barbeiroEscolhido.nome}
                  </p>
                  <p className="mt-1 text-[#f3ece0]/65">
                    {dia.rotulo} às {horaEscolhida} · {servico.minutos} min · {servico.preco}
                  </p>
                </>
              ) : (
                <p className="text-[#f3ece0]/55">Escolha um horário <span style={{ color: OURO }}>livre</span> na agenda. Os ocupados já têm cliente.</p>
              )}
            </div>

            <label className="mt-4 block text-xs font-semibold text-[#f3ece0]/70">
              Seu nome <span style={{ color: OURO }}>*</span>
              <input
                type="text"
                value={nome}
                maxLength={60}
                autoComplete="off"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setNome(e.target.value);
                  setErro("");
                }}
                placeholder="Como podemos te chamar?"
                className={campo}
              />
            </label>
            <label className="mt-3 block text-xs font-semibold text-[#f3ece0]/70">
              WhatsApp <span className="font-normal text-[#f3ece0]/40">(opcional)</span>
              <input
                type="tel"
                value={telefone}
                maxLength={20}
                autoComplete="off"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                className={campo}
              />
            </label>

            <p className="mt-3 min-h-[1.25rem] text-xs font-medium text-[#e9a08a]" role="alert">
              {erro}
            </p>

            <button
              type="button"
              onClick={confirmar}
              className="cta-press mt-1 w-full rounded-full bg-[#c8a24a] px-6 py-4 text-sm font-bold text-[#0f0d0b] shadow-[0_18px_40px_-14px_rgba(200,162,74,.6)] outline-none transition-all hover:-translate-y-0.5 hover:bg-[#f3ece0] focus-visible:ring-2 focus-visible:ring-[#f3ece0]"
            >
              Confirmar agendamento
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-[#f3ece0]/40">
              Modelo de demonstração: o que você digitar aqui não é enviado nem guardado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}