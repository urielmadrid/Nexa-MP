"use client";

import { ArrowUpRight, MessageCircle, Mail, Sparkles } from "lucide-react";
import { CONTATO, linkEmail, linkWhatsApp } from "@/src/lib/data/contato";
import MensagemAssistente from "@/src/components/sections/MensagemAssistente";

export default function Contato() {
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
          <p className="max-w-md text-base leading-7 text-white/45 lg:justify-self-end">Escolha o que você precisa, preencha seus dados e receba uma mensagem pronta para enviar pelo WhatsApp ou pelo e-mail. Se preferir, fale direto pelo canal que quiser, inclusive o Instagram.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <div className="space-y-3">
            <div className="contact-presence rounded-3xl border border-white/10 bg-white/[.025] p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-brand-orange/30 bg-brand-orange/10 text-brand-orange"><Sparkles className="h-5 w-5" /></div>
                <div><p className="text-sm font-semibold">Nexa MP</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[.2em] text-white/30">vamos construir</p></div>
              </div>
              <p className="mt-7 text-sm leading-6 text-white/40">Escolha um canal ou monte a sua mensagem ao lado, em poucos passos. Sem pressão e sem compromisso: é só o primeiro contato.</p>
            </div>

            <a
              href={linkWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link group flex items-center justify-between rounded-2xl border border-brand-orange/40 bg-brand-orange/[.08] p-4 text-white shadow-[0_0_40px_rgba(255,106,0,.12)] transition-all hover:-translate-y-1 hover:border-brand-orange hover:bg-brand-orange/[.14]"
            >
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <MessageCircle className="h-4 w-4 text-brand-orange" aria-hidden="true" /> WhatsApp
                </p>
                <p className="mt-1 text-sm text-white/70">{CONTATO.whatsappExibicao}</p>
                <p className="mt-1 text-[11px] text-white/40">A mensagem já abre escrita. É só enviar.</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-brand-orange transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
              <span className="sr-only">(abre o WhatsApp em uma nova aba)</span>
            </a>

            <a
              href={linkEmail()}
              className="contact-link group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.02] p-4 text-white transition-all hover:-translate-y-1 hover:border-brand-orange/40 hover:bg-brand-orange/[.06]"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="h-4 w-4 text-brand-orange" aria-hidden="true" /> E-mail
                </p>
                <p className="mt-1 break-all text-sm text-white/50">{CONTATO.email}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-orange" aria-hidden="true" />
            </a>

            <a
              href={CONTATO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.02] p-4 text-white transition-all hover:-translate-y-1 hover:border-brand-orange/40 hover:bg-brand-orange/[.06]"
            >
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-brand-orange" aria-hidden="true" /> Instagram
                </p>
                <p className="mt-1 text-sm text-white/50">{CONTATO.instagramUsuario}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-white/25 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-orange" aria-hidden="true" />
              <span className="sr-only">(abre em uma nova aba)</span>
            </a>
          </div>

          <MensagemAssistente />
        </div>
      </div>
    </section>
  );
}
