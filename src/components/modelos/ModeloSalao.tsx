import type { LucideIcon } from "lucide-react";
import CreditoNexaMP from "@/src/components/ui/CreditoNexaMP";
import {
  ArrowRight,
  Brush,
  Camera,
  Clock,
  Droplets,
  HandHeart,
  Heart,
  MapPin,
  MessageCircle,
  Palette,
  Plus,
  Quote,
  Scissors,
  Sparkles,
  Wind,
} from "lucide-react";
import ModeloBarra from "@/src/components/modelos/ModeloBarra";
import AgendaDemo from "@/src/components/modelos/AgendaDemo";
import Reveal from "@/src/components/modelos/Reveal";

/**
 * Landing page MODELO para salão de beleza (demonstração da Nexa MP).
 * Nome, textos, valores e imagens são ilustrativos. Não há clientes, depoimentos,
 * números, endereço ou telefone reais. Campos pessoais aparecem como "Seu ... aqui".
 */

const SERVICOS: { titulo: string; texto: string; Icone: LucideIcon }[] = [
  { titulo: "Corte", texto: "Corte pensado para o seu estilo, o formato do rosto e a sua rotina.", Icone: Scissors },
  { titulo: "Coloração", texto: "Cor, mechas e retoques com cuidado para preservar a saúde dos fios.", Icone: Palette },
  { titulo: "Escova e penteados", texto: "Do dia a dia aos eventos especiais, o penteado certo para cada ocasião.", Icone: Wind },
  { titulo: "Hidratação e tratamentos", texto: "Cuidados que devolvem brilho, maciez e disciplina ao cabelo.", Icone: Droplets },
  { titulo: "Manicure e pedicure", texto: "Mãos e pés bem cuidados, com materiais higienizados.", Icone: HandHeart },
  { titulo: "Maquiagem", texto: "Make para o dia, a noite ou aquele evento importante.", Icone: Brush },
];

const PASSOS = [
  { n: "1", titulo: "Escolha o serviço", texto: "Diga o que você quer fazer. Se tiver dúvida, a gente ajuda a escolher." },
  { n: "2", titulo: "Mande a mensagem", texto: "Um toque no botão e a conversa abre no WhatsApp, com o pedido já escrito." },
  { n: "3", titulo: "Receba o horário", texto: "A gente responde com as opções disponíveis e confirma o seu horário." },
];

const FAQ = [
  {
    pergunta: "Preciso agendar com antecedência?",
    resposta: "Aqui você explica como funciona o seu atendimento: com hora marcada, por ordem de chegada ou os dois.",
  },
  {
    pergunta: "Quais são as formas de pagamento?",
    resposta: "Liste as formas de pagamento que o seu salão aceita (Pix, cartão, dinheiro...).",
  },
  {
    pergunta: "Como funciona o cancelamento ou a remarcação?",
    resposta: "Explique a sua política em poucas palavras, para evitar dúvidas e faltas.",
  },
  {
    pergunta: "Vocês atendem em dias de semana e fins de semana?",
    resposta: "Informe os dias e os horários de funcionamento do seu salão.",
  },
];

const GALERIA = [
  "from-[#e9b7b0] to-[#f3d9d4]",
  "from-[#c9a36b]/70 to-[#f3d9d4]",
  "from-[#b8586b]/80 to-[#e9b7b0]",
  "from-[#f3d9d4] to-[#c9a36b]/60",
  "from-[#e9b7b0] to-[#b8586b]/70",
  "from-[#f3d9d4] to-[#e9b7b0]",
];

export default function ModeloSalao() {
  return (
    <div className="min-h-screen bg-[#fbf5f0] text-[#2a1f1c]">
      <ModeloBarra />

      {/* Cabeçalho do salão */}
      <header className="border-b border-[#2a1f1c]/10 bg-[#fbf5f0]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#topo" className="flex items-center gap-2 font-serif text-xl font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#b8586b] text-white">
              <Scissors className="h-4 w-4" aria-hidden="true" />
            </span>
            Seu Salão
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#2a1f1c]/70 md:flex" aria-label="Menu do modelo">
            <a href="#servicos" className="transition-colors hover:text-[#b8586b]">Serviços</a>
            <a href="#como-agendar" className="transition-colors hover:text-[#b8586b]">Como agendar</a>
            <a href="#galeria" className="transition-colors hover:text-[#b8586b]">Galeria</a>
            <a href="#contato-salao" className="transition-colors hover:text-[#b8586b]">Contato</a>
          </nav>
          <a
            href="#agendar"
            className="cta-press rounded-full bg-[#2a1f1c] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#b8586b]"
          >
            Agendar
          </a>
        </div>
      </header>

      <main id="topo">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#e9b7b0]/50 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#c9a36b]/30 blur-3xl" aria-hidden="true" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_.9fr] md:px-8 md:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#b8586b]/30 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#b8586b]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Cabelo, unhas e beleza
              </p>
              <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.02] md:text-7xl">
                Seu cabelo, do jeito que você <span className="italic text-[#b8586b]">imaginou.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#2a1f1c]/70">
                Cortes, coloração, tratamentos e cuidados com as mãos, em um ambiente pensado para você relaxar enquanto se
                cuida.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#agendar"
                  className="cta-press group inline-flex items-center gap-2 rounded-full bg-[#b8586b] px-7 py-4 text-sm font-bold text-white shadow-[0_20px_50px_-15px_rgba(184,88,107,.7)] transition-all hover:-translate-y-0.5 hover:bg-[#2a1f1c]"
                >
                  Agendar meu horário
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </a>
                <a
                  href="#servicos"
                  className="cta-press rounded-full border border-[#2a1f1c]/20 px-6 py-4 text-sm font-semibold text-[#2a1f1c]/80 transition-colors hover:border-[#2a1f1c]"
                >
                  Ver serviços
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#2a1f1c]/60">
                <li className="flex items-center gap-2"><Heart className="h-4 w-4 text-[#b8586b]" aria-hidden="true" /> Atendimento com hora marcada</li>
                <li className="flex items-center gap-2"><Heart className="h-4 w-4 text-[#b8586b]" aria-hidden="true" /> Ambiente acolhedor</li>
              </ul>
            </div>

            {/* Arte do hero (no lugar da foto do salão) */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-[2rem] bg-gradient-to-b from-[#f3d9d4] via-[#e9b7b0] to-[#b8586b] shadow-[0_40px_80px_-30px_rgba(184,88,107,.6)]">
                <div className="absolute inset-0 grid place-items-center">
                  <Scissors className="h-24 w-24 -rotate-12 text-white/70" aria-hidden="true" />
                </div>
                <p className="absolute inset-x-0 bottom-5 text-center text-[11px] font-semibold uppercase tracking-widest text-white/80">
                  Foto do seu salão aqui
                </p>
              </div>
              <div className="mod-float absolute -left-6 top-16 rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-xl" style={{ "--r": "-4deg" } as React.CSSProperties}>
                <span className="text-[#b8586b]">✂</span> Corte + escova
              </div>
              <div className="mod-float absolute -right-4 top-1/2 rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-xl" style={{ "--r": "3deg", animationDelay: "1.2s" } as React.CSSProperties}>
                <span className="text-[#b8586b]">✦</span> Tratamentos
              </div>
              <div className="mod-float absolute -bottom-4 left-8 rounded-2xl bg-[#2a1f1c] px-4 py-3 text-sm font-bold text-white shadow-xl" style={{ "--r": "-2deg", animationDelay: "2.4s" } as React.CSSProperties}>
                Agendamento pelo WhatsApp
              </div>
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section id="servicos" className="scroll-mt-24 bg-white py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b8586b]">Nossos serviços</p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-tight md:text-5xl">
                Tudo para você sair do salão <span className="italic text-[#b8586b]">se sentindo bem.</span>
              </h2>
            </Reveal>

            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICOS.map(({ titulo, texto, Icone }, i) => (
                <li key={titulo}>
                  <Reveal delay={i * 0.06} className="h-full">
                    <div className="group h-full rounded-3xl border border-[#2a1f1c]/10 bg-[#fbf5f0] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#b8586b]/40 hover:shadow-[0_25px_50px_-25px_rgba(184,88,107,.5)]">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#b8586b] shadow-sm transition-colors group-hover:bg-[#b8586b] group-hover:text-white">
                        <Icone className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <h3 className="mt-5 font-serif text-2xl font-bold">{titulo}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#2a1f1c]/65">{texto}</p>
                      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#2a1f1c]/35">Valores: seu preço aqui</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Como agendar */}
        <section id="como-agendar" className="scroll-mt-24 bg-[#2a1f1c] py-20 text-white md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-widest text-[#e9b7b0]">Como agendar</p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-tight md:text-5xl">
                Agendar é simples. <span className="italic text-[#e9b7b0]">Três passos.</span>
              </h2>
            </Reveal>
            <ol className="mt-12 grid gap-5 md:grid-cols-3">
              {PASSOS.map((p, i) => (
                <li key={p.n}>
                  <Reveal delay={i * 0.1} className="h-full">
                    <div className="relative h-full rounded-3xl border border-white/10 bg-white/[.05] p-7">
                      <span className="font-serif text-6xl font-bold text-[#e9b7b0]/80">{p.n}</span>
                      <h3 className="mt-3 text-lg font-bold">{p.titulo}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/65">{p.texto}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Agendar (simulador) */}
        <section id="agendar" className="scroll-mt-24 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b8586b]">Agende agora</p>
              <h2 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-5xl">
                Escolha, toque e <span className="italic text-[#b8586b]">pronto.</span>
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#2a1f1c]/65">
                Em vez de formulário longo, o cliente monta o pedido em dois toques e a mensagem já sai pronta para o
                WhatsApp do salão. Menos passos, mais agendamentos.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#2a1f1c]/60 shadow-sm">
                <MessageCircle className="h-3.5 w-3.5 text-[#b8586b]" aria-hidden="true" /> Experimente ao lado
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <AgendaDemo />
            </Reveal>
          </div>
        </section>

        {/* Galeria */}
        <section id="galeria" className="scroll-mt-24 bg-white py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b8586b]">Galeria</p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-tight md:text-5xl">
                O seu trabalho <span className="italic text-[#b8586b]">fala por você.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#2a1f1c]/60">
                Aqui entram as fotos reais de antes e depois do seu salão. Nesta demonstração, os espaços abaixo marcam onde
                elas ficam.
              </p>
            </Reveal>
            <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {GALERIA.map((c, i) => (
                <li key={i}>
                  <Reveal delay={i * 0.05}>
                    <div className={`group relative grid aspect-[4/5] place-items-center overflow-hidden rounded-3xl bg-gradient-to-br ${c}`}>
                      <Camera className="h-10 w-10 text-white/70 transition-transform duration-500 group-hover:scale-125" aria-hidden="true" />
                      <span className="absolute inset-x-0 bottom-4 text-center text-[11px] font-bold uppercase tracking-widest text-white/80">
                        Foto do seu trabalho
                      </span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Depoimentos (sem inventar) */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-5 md:px-8">
            <Reveal>
              <div className="rounded-3xl border-2 border-dashed border-[#b8586b]/35 bg-white/60 p-8 text-center md:p-12">
                <Quote className="mx-auto h-10 w-10 text-[#b8586b]" aria-hidden="true" />
                <h2 className="mt-4 font-serif text-3xl font-bold md:text-4xl">O que os clientes dizem</h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#2a1f1c]/60">
                  Aqui entram depoimentos reais e autorizados dos clientes do seu salão. A Nexa MP não cria depoimentos
                  de mentira: esta área só é preenchida com o que seus clientes realmente disseram.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Perguntas frequentes */}
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[.7fr_1.3fr] md:gap-16 md:px-8">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b8586b]">Dúvidas</p>
              <h2 className="mt-3 font-serif text-4xl font-bold leading-tight">
                Perguntas <span className="italic text-[#b8586b]">frequentes.</span>
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#2a1f1c]/55">
                Responder antes evita mensagens repetidas e deixa o cliente mais seguro para agendar.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="divide-y divide-[#2a1f1c]/10 border-y border-[#2a1f1c]/10">
                {FAQ.map((item) => (
                  <details key={item.pergunta} className="group py-1">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 text-left text-base font-semibold outline-none transition-colors hover:text-[#b8586b] focus-visible:ring-2 focus-visible:ring-[#b8586b] [&::-webkit-details-marker]:hidden">
                      {item.pergunta}
                      <Plus className="h-5 w-5 shrink-0 text-[#b8586b] transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
                    </summary>
                    <p className="pb-4 pr-8 text-sm leading-6 text-[#2a1f1c]/65">{item.resposta}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Chamada final */}
        <section className="px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#b8586b] via-[#c46a7b] to-[#2a1f1c] p-10 text-center text-white md:p-16">
              <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <h2 className="relative font-serif text-4xl font-bold leading-tight md:text-6xl">Pronta para o seu novo visual?</h2>
              <p className="relative mx-auto mt-4 max-w-md text-base leading-7 text-white/80">
                Escolha o serviço, mande a mensagem e receba o seu horário.
              </p>
              <a
                href="#agendar"
                className="cta-press group relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#2a1f1c] transition-all hover:-translate-y-0.5 hover:bg-[#fbf5f0]"
              >
                Agendar meu horário
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </section>

        {/* Contato / localização (campos do cliente) */}
        <section id="contato-salao" className="scroll-mt-24 border-t border-[#2a1f1c]/10 bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-5 px-5 md:grid-cols-3 md:px-8">
            {[
              { Icone: MapPin, titulo: "Onde estamos", texto: "Seu endereço aqui" },
              { Icone: Clock, titulo: "Horário", texto: "Seus dias e horários de funcionamento aqui" },
              { Icone: MessageCircle, titulo: "Fale com a gente", texto: "Seu WhatsApp e Instagram aqui" },
            ].map(({ Icone, titulo, texto }) => (
              <div key={titulo} className="flex items-start gap-4 rounded-2xl border border-[#2a1f1c]/10 bg-[#fbf5f0] p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#b8586b] shadow-sm">
                  <Icone className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold">{titulo}</h3>
                  <p className="mt-1 text-sm text-[#2a1f1c]/60">{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-[#2a1f1c] px-5 py-10 text-center text-white">
        <p className="font-serif text-xl font-bold">Seu Salão</p>
        <p className="mt-2 text-xs text-white/50">
          Modelo de landing page. Todo o conteúdo desta página é ilustrativo.
        </p>
        <CreditoNexaMP className="mt-2" />
        <a
          href="/?plano=landing-avulsa#contato"
          className="cta-press mt-5 inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black"
        >
          Quero uma landing page assim para o meu negócio <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
}