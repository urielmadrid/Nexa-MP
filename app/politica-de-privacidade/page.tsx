import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Informações sobre o tratamento de dados no site da Nexa MP.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/politica-de-privacidade" },
};

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-20 text-brand-black">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-brand-orange">← Voltar para a Nexa MP</Link>
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight">Política de Privacidade</h1>
        <p className="mt-4 text-sm text-brand-black/60">Última atualização: 27 de setembro de 2026</p>

        <div className="mt-10 space-y-8 text-base leading-7 text-brand-black/75">
          <section><h2 className="text-xl font-bold text-brand-black">1. O que este site faz</h2><p className="mt-3">Este site apresenta os serviços, planos e formas de contato da Nexa MP.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">2. Dados informados no contato</h2><p className="mt-3">O chatbot de contato solicita informações fornecidas voluntariamente pelo visitante, como nome, empresa, forma de contato e descrição da necessidade. No código atual, essas respostas ficam no estado da página durante a sessão e não são enviadas automaticamente para um servidor ou banco de dados.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">3. Continuação do atendimento</h2><p className="mt-3">Ao escolher continuar pelo Instagram, o visitante é direcionado para um serviço externo. O site não transfere automaticamente o resumo da conversa para o Instagram. O recurso de copiar o resumo exige uma ação explícita do visitante.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">4. Serviços de terceiros</h2><p className="mt-3">Links para serviços externos, como Instagram, seguem as políticas de privacidade desses próprios serviços. O site não deve ser interpretado como responsável pelas práticas de terceiros.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">5. Cookies e rastreamento</h2><p className="mt-3">O Google Analytics está preparado no código, mas permanece desativado enquanto a variável NEXT_PUBLIC_GA_ID não estiver configurada. Se a empresa ativar o serviço, o uso de analytics e as informações correspondentes devem ser comunicados ao visitante e tratados conforme a configuração de consentimento e as obrigações aplicáveis. Serviços de hospedagem, segurança ou terceiros eventualmente utilizados na publicação podem ter seus próprios registros e políticas.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">6. Alterações</h2><p className="mt-3">Esta política pode ser atualizada quando as funcionalidades ou integrações do site mudarem. Se for adicionada coleta persistente de dados, analytics, publicidade ou uma integração de atendimento, o texto deve ser revisado antes da publicação.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">7. Contato</h2><p className="mt-3">Para falar com a Nexa MP, utilize o Instagram indicado na página de contato.</p></section>
        </div>
      </article>
    </main>
  );
}
