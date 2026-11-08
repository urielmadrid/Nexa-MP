import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import Hero from "@/src/components/sections/Hero";
import Problema from "@/src/components/sections/Problema";
import Servicos from "@/src/components/sections/Servicos";
import Diferenciais from "@/src/components/sections/Diferenciais";
import ComoFunciona from "@/src/components/sections/ComoFunciona";
import Modelos from "@/src/components/sections/Modelos";
import Planos from "@/src/components/sections/Planos";
import CtaFinal from "@/src/components/sections/CtaFinal";
import Contato from "@/src/components/sections/Contato";
import CtaFlutuante from "@/src/components/ui/CtaFlutuante";
import WhatsAppFlutuante from "@/src/components/ui/WhatsAppFlutuante";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />
        <Problema />
        <Servicos />
        <Diferenciais />
        <ComoFunciona />
        <Modelos />
        <Planos />
        <CtaFinal />
        <Suspense fallback={<section id="contato" className="bg-[#070707] py-24"><div className="mx-auto max-w-7xl px-5 md:px-8"><div className="h-[620px] animate-pulse rounded-3xl border border-white/10 bg-white/[.03]" aria-hidden="true" /></div></section>}>
          <Contato />
        </Suspense>
      </main>
      <Footer />
      <CtaFlutuante />
      <WhatsAppFlutuante />
    </>
  );
}