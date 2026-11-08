import type { LucideIcon } from "lucide-react";
import CreditoNexaMP from "@/src/components/ui/CreditoNexaMP";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Crown,
  Droplets,
  Eye,
  MapPin,
  MessageCircle,
  Plus,
  Scissors,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ModeloBarra from "@/src/components/modelos/ModeloBarra";
import AgendaBarbearia from "@/src/components/modelos/AgendaBarbearia";
import Reveal from "@/src/components/modelos/Reveal";
import { BARBEIROS, SERVICOS_BARBEARIA } from "@/src/lib/data/agendaBarbearia";
import { PLANOS } from "@/src/lib/data/planos";

/**
 * Landing page MODELO para barbearia (demonstração da Nexa MP).
 * Nome, textos, valores, horários e imagens são ilustrativos. Não há clientes, depoimentos,
 * números, endereço ou telefone reais. Campos pessoais aparecem como "Seu ... aqui".
 */

const ICONES_SERVICO: Record<string, LucideIcon> = {
  corte: Scissors,
  barba: Droplets,
  combo: Sparkles,
  sobrancelha: Eye,
  completo: Crown,
};

const PASSOS = [
  { n: "1", titulo: "Escolha o serviço", texto: "Corte, barba ou o combo. Cada serviço mostra a duração e o valor." },
  { n: "2", titulo: "Veja os horários", texto: "Na agenda, cada barbeiro mostra o que está livre e o que já está ocupado." },
  { n: "3", titulo: "Confirme em segundos", texto: "Escolha o horário livre, informe o nome e pronto: o seu horário fica reservado." },
];

const DIFERENCIAIS = [
  { titulo: "Hora marcada de verdade", texto: "Você escolhe o horário e é atendido nele, sem passar a tarde na fila.", Icone: CalendarDays },
  { titulo: "Higiene em primeiro lugar", texto: "Materiais higienizados a cada cliente e navalha com lâmina nova.", Icone: ShieldCheck },
  { titulo: "Ambiente para relaxar", texto: "Toalha quente, boa conversa e um espaço pensado para você aproveitar o tempo.", Icone: Sparkles },
];

const ESTILOS = [
  { nome: "Degradê", tom: "from-[#2a251f] to-[#c8a24a]/40" },
  { nome: "Barba desenhada", tom: "from-[#c8a24a]/50 to-[#1c1814]" },
  { nome: "Clássico", tom: "from-[#1c1814] to-[#f3ece0]/25" },
  { nome: "Navalhado", tom: "from-[#f3ece0]/20 to-[#2a251f]" },
  { nome: "Social", tom: "from-[#2a251f] to-[#c8a24a]/25" },
  { nome: "Platinado", tom: "from-[#c8a24a]/30 to-[#f3ece0]/20" },
];

const FAQ = [
  {
    pergunta: "Preciso agendar ou posso chegar direto?",
    resposta:
      "Trabalhamos com hora marcada para você não esperar. Quando há horário livre na agenda, também atendemos quem chega sem agendar.",
  },
  {
    pergunta: "Posso escolher o barbeiro?",
    resposta: "Pode. Na agenda você vê os horários de cada barbeiro e escolhe com quem quer ser atendido.",
  },
  {
    pergunta: "E se eu precisar remarcar ou cancelar?",
    resposta: "Sem problema. Pedimos apenas um aviso com antecedência para liberar o horário a outro cliente.",
  },
  {
    pergunta: "Quais são as formas de pagamento?",
    resposta: "Aceitamos Pix, cartão e dinheiro. Aqui você informa as formas que o seu negócio aceita.",
  },
];

const OURO = "text-[#c8a24a]";

export default function ModeloBarbearia() {
  return (
    <div className="min-h-screen bg-[#0f0d0b] text-[#f3ece0]">
      <ModeloBarra />

      {/* Cabeçalho */}
      <header className="border-b border-[#f3ece0]/10 bg-[#0f0d0b]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#topo" className="flex items-center gap-3 font-serif text-xl font-bold uppercase tracking-wider">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[#c8a24a] text-[#c8a24a]">
              <Scissors className="h-4 w-4" aria-hidden="true" />
            </span>
            Sua Barbearia
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#f3ece0]/65 md:flex" aria-label="Menu do modelo">
            <a href="#servicos" className="transition-colors hover:text-[#c8a24a]">Serviços</a>
            <a href="#barbeiros" className="transition-colors hover:text-[#c8a24a]">Barbeiros</a>
            <a href="#agenda" className="transition-colors hover:text-[#c8a24a]">Agenda</a>
            <a href="#contato-barbearia" className="transition-colors hover:text-[#c8a24a]">Contato</a>
          </nav>
          <a
            href="#agenda"
            className="cta-press rounded-full bg-[#c8a24a] px-5 py-2.5 text-sm font-bold text-[#0f0d0b] transition-colors hover:bg-[#f3ece0]"
          >
            Agendar
          </a>
        </div>
      </header>

      <main id="topo">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-16 h-[34rem] w-[34rem] rounded-full bg-[#c8a24a]/15 blur-3xl" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[.5]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(243,236,224,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(243,236,224,.035) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse at 70% 40%, #000 10%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, #000 10%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 md:grid-cols-[1.15fr_.85fr] md:px-8 md:py-28">
            <div>
              <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[.3em] text-[#c8a24a]">
                <span className="h-px w-10 bg-[#c8a24a]" aria-hidden="true" /> Barbearia clássica
              </p>
              <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.02] md:text-7xl">
                Corte, barba e estilo no <span className="italic text-[#c8a24a]">seu horário.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#f3ece0]/65">
                Atendimento com hora marcada, barbeiros que cuidam de cada detalhe e uma agenda que mostra o que está livre e
                o que já está ocupado. Escolha e agende em poucos toques.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#agenda"
                  className="cta-press group inline-flex items-center gap-2 rounded-full bg-[#c8a24a] px-7 py-4 text-sm font-bold text-[#0f0d0b] shadow-[0_20px_50px_-15px_rgba(200,162,74,.7)] transition-all hover:-translate-y-0.5 hover:bg-[#f3ece0]"
                >
                  Ver horários livres
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </a>
                <a
                  href="#servicos"
                  className="cta-press rounded-full border border-[#f3ece0]/25 px-6 py-4 text-sm font-semibold text-[#f3ece0]/85 transition-colors hover:border-[#c8a24a] hover:text-[#c8a24a]"
                >
                  Ver serviços
                </a>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#f3ece0]/60">
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 ${OURO}`} aria-hidden="true" /> Hora marcada</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 ${OURO}`} aria-hidden="true" /> Toalha quente e navalha</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 ${OURO}`} aria-hidden="true" /> Materiais higienizados</li>
              </ul>
            </div>

            {/* Arte do hero (no lugar da foto da barbearia) */}
            <div className="relative mx-auto grid h-[420px] w-full max-w-[380px] place-items-center" aria-hidden="true">
              <div className="absolute inset-4 rounded-full border border-[#c8a24a]/25" />
              <div className="absolute inset-14 rounded-full border border-dashed border-[#f3ece0]/15" />
              <div className="relative h-[340px] w-[104px]">
                <div className="absolute inset-x-[-10px] -top-3 h-6 rounded-full bg-gradient-to-b from-[#e7cf8a] to-[#c8a24a]" />
                <div className="absolute inset-0 overflow-hidden rounded-[2.2rem] border-[5px] border-[#2a251f] shadow-[0_0_60px_rgba(200,162,74,.25)]">
                  <div className="bb-pole absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/35" />
                </div>
                <div className="absolute inset-x-[-10px] -bottom-3 h-6 rounded-full bg-gradient-to-b from-[#c8a24a] to-[#8f6f25]" />
              </div>
              <span className="mod-float absolute left-0 top-10 flex items-center gap-2 rounded-2xl border border-[#f3ece0]/15 bg-[#181512] px-4 py-3 text-xs font-bold shadow-xl" style={{ "--r": "-4deg" } as React.CSSProperties}>
                <Clock className={`h-4 w-4 ${OURO}`} /> Hora marcada
              </span>
              <span className="mod-float absolute bottom-12 right-0 flex items-center gap-2 rounded-2xl border border-[#c8a24a]/40 bg-[#181512] px-4 py-3 text-xs font-bold shadow-xl" style={{ "--r": "3deg", animationDelay: "1.5s" } as React.CSSProperties}>
                <Scissors className={`h-4 w-4 ${OURO}`} /> Barbeiros especialistas
              </span>
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section id="servicos" className="scroll-mt-20 border-t border-[#f3ece0]/10 bg-[#13110e] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[#c8a24a]">Serviços</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[1.05] md:text-5xl">
                O que fazemos, <span className="italic text-[#f3ece0]/50">com calma e capricho.</span>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICOS_BARBEARIA.map((s, i) => {
                const Icone = ICONES_SERVICO[s.id] ?? Scissors;
                return (
                  <Reveal key={s.id} delay={i * 0.05}>
                    <article className="group h-full rounded-2xl border border-[#f3ece0]/10 bg-[#181512] p-6 transition-all hover:-translate-y-1 hover:border-[#c8a24a]/50">
                      <div className="flex items-start justify-between">
                        <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#c8a24a]/30 bg-[#c8a24a]/10 text-[#c8a24a]">
                          <Icone className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="font-serif text-2xl font-bold text-[#c8a24a]">{s.preco}</span>
                      </div>
                      <h3 className="mt-5 font-serif text-xl font-bold">{s.nome}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#f3ece0]/60">{s.descricao}</p>
                      <p className="mt-4 flex items-center gap-1.5 text-xs text-[#f3ece0]/45">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {s.minutos} minutos
                      </p>
                    </article>
                  </Reveal>
                );
              })}
              <Reveal delay={0.25}>
                <a
                  href="#agenda"
                  className="group flex h-full min-h-[200px] flex-col justify-between rounded-2xl border border-dashed border-[#c8a24a]/40 p-6 transition-colors hover:bg-[#c8a24a]/10"
                >
                  <span className="text-xs font-bold uppercase tracking-[.25em] text-[#c8a24a]">Pronto para escolher?</span>
                  <span className="mt-6 inline-flex items-center gap-2 font-serif text-2xl font-bold">
                    Ver horários livres
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </a>
              </Reveal>
            </div>
            <p className="mt-6 text-xs text-[#f3ece0]/40">Valores ilustrativos, só para a demonstração.</p>
          </div>
        </section>

        {/* Barbeiros */}
        <section id="barbeiros" className="scroll-mt-20 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[#c8a24a]">Barbeiros</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[1.05] md:text-5xl">
                Quem cuida do seu <span className="italic text-[#c8a24a]">visual.</span>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {BARBEIROS.map((b, i) => (
                <Reveal key={b.id} delay={i * 0.08}>
                  <article className="rounded-2xl border border-[#f3ece0]/10 bg-[#181512] p-6 text-center">
                    <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-[#c8a24a]/40 bg-gradient-to-br from-[#2a251f] to-[#0f0d0b] font-serif text-4xl font-bold text-[#c8a24a]" aria-hidden="true">
                      {b.nome[0]}
                    </div>
                    <h3 className="mt-5 font-serif text-xl font-bold">{b.nome}</h3>
                    <p className="mt-1 text-sm text-[#f3ece0]/55">{b.especialidade}</p>
                    <a href="#agenda" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#c8a24a] underline-offset-4 hover:underline">
                      Ver horários de {b.nome} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </article>
                </Reveal>
              ))}
            </div>
            <p className="mt-6 text-xs text-[#f3ece0]/40">Nomes e especialidades ilustrativos. Aqui entram a equipe e as fotos reais do seu negócio.</p>
          </div>
        </section>

        {/* Agenda */}
        <section id="agenda" className="scroll-mt-20 border-y border-[#f3ece0]/10 bg-[#13110e] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[#c8a24a]">Agenda</p>
              <h2 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-[1.05] md:text-5xl">
                Veja o que está livre e <span className="italic text-[#c8a24a]">agende agora.</span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#f3ece0]/60">
                Escolha o serviço e o dia. Na agenda, cada barbeiro mostra os horários livres e os que já têm cliente.
              </p>
            </Reveal>

            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {PASSOS.map((p) => (
                <li key={p.n} className="flex gap-4 rounded-2xl border border-[#f3ece0]/10 bg-[#181512] p-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#c8a24a] font-serif text-lg font-bold text-[#0f0d0b]">{p.n}</span>
                  <span>
                    <span className="block text-sm font-bold">{p.titulo}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#f3ece0]/55">{p.texto}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10">
              <AgendaBarbearia />
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[#c8a24a]">Por que aqui</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[1.05] md:text-5xl">
                Um lugar para <span className="italic text-[#c8a24a]">voltar sempre.</span>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {DIFERENCIAIS.map(({ titulo, texto, Icone }, i) => (
                <Reveal key={titulo} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-[#f3ece0]/10 bg-[#181512] p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#c8a24a]/10 text-[#c8a24a]">
                      <Icone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-serif text-xl font-bold">{titulo}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#f3ece0]/60">{texto}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Estilos */}
        <section id="estilos" className="border-t border-[#f3ece0]/10 bg-[#13110e] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[#c8a24a]">Estilos</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[1.05] md:text-5xl">
                Trabalhos que falam <span className="italic text-[#f3ece0]/50">por nós.</span>
              </h2>
            </Reveal>
            <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
              {ESTILOS.map((e, i) => (
                <li key={e.nome}>
                  <Reveal delay={i * 0.05}>
                    <div className={`relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl border border-[#f3ece0]/10 bg-gradient-to-br ${e.tom} p-4`}>
                      <Scissors className="absolute right-4 top-4 h-5 w-5 text-[#f3ece0]/30" aria-hidden="true" />
                      <span className="font-serif text-lg font-bold">{e.nome}</span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-[#f3ece0]/40">Espaço reservado para as fotos reais dos trabalhos da sua barbearia.</p>
          </div>
        </section>

        {/* Perguntas frequentes */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[#c8a24a]">Dúvidas</p>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-[1.05] md:text-5xl">Perguntas frequentes</h2>
            </Reveal>
            <div className="mt-10 divide-y divide-[#f3ece0]/10 rounded-2xl border border-[#f3ece0]/10 bg-[#181512]">
              {FAQ.map((item) => (
                <details key={item.pergunta} className="group p-5 md:p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-left font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#c8a24a] [&::-webkit-details-marker]:hidden">
                    {item.pergunta}
                    <Plus className="h-5 w-5 shrink-0 text-[#c8a24a] transition-transform group-open:rotate-45" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-[#f3ece0]/60">{item.resposta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contato e localização */}
        <section id="contato-barbearia" className="scroll-mt-20 border-t border-[#f3ece0]/10 bg-[#13110e] py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[#c8a24a]">Contato</p>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-[1.05] md:text-5xl">
                Venha nos <span className="italic text-[#c8a24a]">visitar.</span>
              </h2>
              <ul className="mt-8 space-y-5 text-sm">
                <li className="flex gap-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#c8a24a]" aria-hidden="true" />
                  <span>
                    <span className="block font-bold">Endereço</span>
                    <span className="text-[#f3ece0]/60">Seu endereço aqui, número, bairro e cidade</span>
                  </span>
                </li>
                <li className="flex gap-4">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#c8a24a]" aria-hidden="true" />
                  <span>
                    <span className="block font-bold">Horário de funcionamento</span>
                    <span className="text-[#f3ece0]/60">Segunda a sábado, das 09h às 19h. Domingo fechado.</span>
                  </span>
                </li>
                <li className="flex gap-4">
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#c8a24a]" aria-hidden="true" />
                  <span>
                    <span className="block font-bold">WhatsApp</span>
                    <span className="text-[#f3ece0]/60">Seu WhatsApp aqui</span>
                  </span>
                </li>
              </ul>
              <a
                href="#agenda"
                className="cta-press mt-9 inline-flex items-center gap-2 rounded-full bg-[#c8a24a] px-7 py-4 text-sm font-bold text-[#0f0d0b] transition-colors hover:bg-[#f3ece0]"
              >
                Agendar meu horário <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative grid min-h-[320px] place-items-center overflow-hidden rounded-3xl border border-[#f3ece0]/10 bg-[#181512]" aria-hidden="true">
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(243,236,224,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(243,236,224,.06) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="absolute left-[-10%] top-[38%] h-3 w-[120%] -rotate-[8deg] bg-[#f3ece0]/[.07]" />
                <div className="absolute left-[30%] top-[-10%] h-[120%] w-3 rotate-[14deg] bg-[#f3ece0]/[.07]" />
                <div className="relative text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#c8a24a] text-[#0f0d0b] shadow-[0_0_40px_rgba(200,162,74,.5)]">
                    <MapPin className="h-6 w-6" />
                  </span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[.25em] text-[#f3ece0]/60">Mapa do seu endereço aqui</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#f3ece0]/10 bg-[#0a0908] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-center text-xs text-[#f3ece0]/45 md:flex-row md:px-8 md:text-left">
          <div className="space-y-1">
            <p>© Sua Barbearia. Landing page modelo, com conteúdo ilustrativo.</p>
            <CreditoNexaMP destaque="text-[#c8a24a]" />
          </div>
          <a
            href={`/?plano=${PLANOS[0].id}#contato`}
            className="font-semibold text-[#c8a24a] underline-offset-4 hover:underline"
          >
            Quero uma landing page assim para o meu negócio
          </a>
        </div>
      </footer>
    </div>
  );
}