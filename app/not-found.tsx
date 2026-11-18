import type { Metadata } from "next";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import NaoEncontrado from "@/src/components/sections/NaoEncontrado";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "A página solicitada não foi encontrada na Nexa MP.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <NaoEncontrado />
      </main>
      <Footer />
    </>
  );
}
