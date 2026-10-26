import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import Button from "@/src/components/ui/Button";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "A página solicitada não foi encontrada na Nexa MP.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="conteudo" className="flex min-h-[70vh] items-center py-32">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand-orange">Erro 404</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">Ops! Essa página não foi encontrada.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-brand-black/60 md:text-lg">
            O endereço pode estar incorreto ou a página pode ter sido removida. Você pode voltar ao início, conhecer nossos serviços ou falar com a Nexa MP.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button href="/">Voltar para o início</Button>
            <Button href="/#servicos" variant="secondary">Conhecer serviços</Button>
            <Link href="/#contato" className="inline-flex items-center justify-center rounded-full border border-black/15 px-7 py-3.5 font-semibold transition-colors hover:border-black/40">
              Entrar em contato
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
