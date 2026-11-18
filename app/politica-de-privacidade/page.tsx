import type { Metadata } from "next";
import Link from "next/link";
import { DATA_POLITICA } from "@/src/lib/data/legal";

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
        <p className="mt-4 text-sm text-brand-black/60">Última atualização: {DATA_POLITICA}</p>

        <div className="mt-10 space-y-8 text-base leading-7 text-brand-black/75">
          <section><h2 className="text-xl font-bold text-brand-black">1. O que este site faz</h2><p className="mt-3">Este site apresenta os serviços, planos e formas de contato da Nexa MP.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">2. Dados informados no contato</h2><p className="mt-3">O assistente de mensagem do site pede informações fornecidas voluntariamente pelo visitante, como nome, empresa, ramo de atuação, necessidades, plano de interesse, forma preferida e dado de contato para retorno (e-mail, telefone ou Instagram) e detalhes opcionais. Antes de montar a mensagem, o visitante marca que leu e aceita esta Política de Privacidade e os Termos de Uso; esse aceite é registrado no e-mail recebido pela Nexa MP, junto com a versão do texto. Essas respostas são usadas para montar a mensagem no navegador do visitante e ficam no estado da página durante a sessão. O site não as grava em banco de dados.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">3. Continuação do atendimento</h2><p className="mt-3">A mensagem só chega à Nexa MP quando o visitante toca em um botão de envio. Em "Enviar pelo WhatsApp", o WhatsApp abre no aparelho do visitante com o texto já preenchido, e o envio segue as regras desse serviço. Em "Enviar por e-mail", o conteúdo da mensagem é enviado pelo servidor do site à caixa de e-mail da Nexa MP (contato@nexa-mp.com.br), hospedada no Zoho Mail, para que a equipe possa responder ao contato informado. O site não guarda essa mensagem em banco de dados; ela fica na caixa de e-mail da Nexa MP e é usada apenas para responder ao visitante e dar andamento ao atendimento. O visitante também pode apenas copiar o texto para enviá-lo por outro canal, como o Instagram.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">4. Serviços de terceiros</h2><p className="mt-3">Links e envios para serviços externos, como WhatsApp e Instagram, seguem as políticas de privacidade desses próprios serviços. O envio por e-mail passa pela infraestrutura de hospedagem do site e pelo Zoho Mail, que processam a mensagem apenas para entregá-la à Nexa MP. Para pedir a correção ou a exclusão de uma mensagem enviada, o visitante pode escrever para contato@nexa-mp.com.br.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">5. Cookies e armazenamento no navegador</h2><div className="mt-3 space-y-3"><p>Este site usa dois tipos de armazenamento no navegador:</p><p><strong className="text-brand-black">Necessário.</strong> Guardamos no próprio navegador a sua escolha sobre cookies, para não perguntar de novo a cada visita. Esse registro não identifica o visitante e não é enviado a terceiros.</p><p><strong className="text-brand-black">Estatísticas.</strong> Se o recurso do Google Analytics estiver ativo no site e o visitante aceitar, são usados cookies do Google para medir, de forma agregada, como o site é utilizado, com anonimização de IP. Sem o aceite, esses cookies não são carregados, e quem já aceitou pode retirar o consentimento a qualquer momento.</p><p>A escolha pode ser feita, alterada ou retirada a qualquer momento pelo botão &quot;Preferências de cookies&quot;, no rodapé de cada página. Serviços de hospedagem, segurança ou terceiros usados na publicação podem ter seus próprios registros técnicos e políticas.</p></div></section>
          <section><h2 className="text-xl font-bold text-brand-black">6. Seus direitos</h2><p className="mt-3">Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o visitante pode solicitar a confirmação de que seus dados são tratados, o acesso a eles, a correção de dados incompletos ou desatualizados, a anonimização, o bloqueio ou a eliminação de dados desnecessários, informações sobre com quem os dados são compartilhados e a revogação do consentimento, quando for o caso. Para exercer esses direitos, escreva para contato@nexa-mp.com.br.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">7. Alterações</h2><p className="mt-3">Esta política pode ser atualizada quando as funcionalidades ou integrações do site mudarem. Se for adicionada coleta persistente de dados, publicidade ou uma nova integração de atendimento, o texto deve ser revisado antes da publicação, e a data de atualização acima passa a refletir a nova versão.</p></section>
          <section><h2 className="text-xl font-bold text-brand-black">8. Contato</h2><p className="mt-3">Para falar com a Nexa MP, utilize o e-mail contato@nexa-mp.com.br, o WhatsApp +55 53 9145-6599 ou o Instagram @nexamp_.</p></section>
        </div>
      </article>
    </main>
  );
}
