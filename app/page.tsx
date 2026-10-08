import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import Hero from "@/src/components/sections/Hero";
import Problema from "@/src/components/sections/Problema";
import Solucao from "@/src/components/sections/Solucao";
import Servicos from "@/src/components/sections/Servicos";
import ComoFunciona from "@/src/components/sections/ComoFunciona";
import Diferenciais from "@/src/components/sections/Diferenciais";
import Planos from "@/src/components/sections/Planos";
import Portfolio from "@/src/components/sections/Portfolio";
import CtaFinal from "@/src/components/sections/CtaFinal";
import Contato from "@/src/components/sections/Contato";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />
        <Problema />
        <Solucao />
        <Servicos />
        <ComoFunciona />
        <Diferenciais />
        <Planos />
        <Portfolio />
        <CtaFinal />
        <Suspense fallback={<section id="contato" className="py-24"><div className="mx-auto max-w-6xl px-6"><div className="h-[520px] animate-pulse rounded-3xl border border-black/10 bg-[#f7f5f2]" aria-hidden="true" /></div></section>}>
          <Contato />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}