import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso do site da Nexa MP.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-20 text-brand-black">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-brand-orange">← Voltar para a Nexa MP</Link>
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight">Termos de Uso</h1>
        <p className="mt-4 text-sm text-brand-black/60">Última atualização: 27 de setembro de 2026</p>
        <div className="mt-10 space-y-8 text-base leading-7 text-brand-black/75">
          <section><h2 className="text-xl font-bold text-brand-black">1. Uso do site</h2><p className="mt-3">O site tem finalidade institucional e comercial, apresentando informações sobre serviços e planos da Nexa MP.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">2. Informações comerciais</h2><p className="mt-3">Preços, escopos e condições exibidos no site correspondem às informações publicadas no momento da atualização e podem ser alterados pela empresa. Uma conversa pelo site não constitui, por si só, contrato ou aceite de proposta comercial.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">3. Conteúdo e propriedade intelectual</h2><p className="mt-3">Textos, identidade visual, código e demais elementos deste site não devem ser reproduzidos ou utilizados comercialmente sem autorização.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">4. Links externos</h2><p className="mt-3">O site pode direcionar para serviços de terceiros. O uso desses serviços está sujeito aos termos e políticas de cada plataforma.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">5. Atualizações</h2><p className="mt-3">Os termos podem ser atualizados quando houver mudança relevante no site ou nas formas de atendimento.</p></section>
        </div>
      </article>
    </main>
  );
}
