import type { Formulario } from "@/src/lib/formulario/tipos";

/**
 * Perguntas do "Diagnóstico de presença digital" (página /formulario).
 * É a ÚNICA fonte das perguntas: a página, a validação do servidor, o e-mail e (depois) o banco leem daqui.
 *
 * Para mudar:
 *   - texto de pergunta ou de opção: troque o "rotulo" (os códigos não mudam, os dados antigos continuam valendo);
 *   - pergunta ou opção nova/removida: suba "versao" em 1 e use um "codigo" novo;
 *   - nunca reaproveite um "codigo" antigo para significar outra coisa.
 */
export const DIAGNOSTICO: Formulario = {
  slug: "diagnostico-digital",
  versao: 1,
  titulo: "Descubra o que está travando o crescimento do seu negócio no digital",
  descricao: "Responda algumas perguntas rápidas. A Nexa MP analisa as suas respostas e mostra por onde começar.",
  etapas: [
    {
      codigo: "sobre_voce",
      rotulo: "Sobre você",
      titulo: "Vamos começar pelo básico",
      apoio: "Só o seu nome é obrigatório aqui. O resto ajuda a entender o seu negócio.",
      perguntas: [
        {
          codigo: "nome",
          tipo: "texto_curto",
          rotulo: "Seu nome",
          placeholder: "Como podemos te chamar?",
          obrigatoria: true,
          maxCaracteres: 80,
          campoLead: "nome",
        },
        {
          codigo: "empresa",
          tipo: "texto_curto",
          rotulo: "Nome da empresa",
          apoio: "Se você ainda não tem empresa, pode deixar em branco.",
          placeholder: "Nome do seu negócio",
          obrigatoria: false,
          maxCaracteres: 80,
          campoLead: "empresa",
        },
        {
          codigo: "setor",
          tipo: "escolha_unica",
          rotulo: "Qual é o seu setor de atuação?",
          obrigatoria: true,
          opcoes: [
            { codigo: "varejo", rotulo: "Varejo" },
            { codigo: "servicos", rotulo: "Serviços" },
            { codigo: "saude", rotulo: "Saúde" },
            { codigo: "educacao", rotulo: "Educação" },
            { codigo: "alimentacao", rotulo: "Alimentação" },
            { codigo: "industria", rotulo: "Indústria" },
            { codigo: "outro", rotulo: "Outro", pedeTexto: true },
          ],
          maxCaracteres: 80,
        },
        {
          codigo: "decisor",
          tipo: "escolha_unica",
          rotulo: "Você é quem toma as decisões sobre marketing e vendas?",
          obrigatoria: true,
          opcoes: [
            { codigo: "sim", rotulo: "Sim" },
            { codigo: "participo", rotulo: "Participo, mas não decido sozinho" },
            { codigo: "nao", rotulo: "Não" },
          ],
        },
      ],
    },
    {
      codigo: "momento_atual",
      rotulo: "Momento atual",
      titulo: "Como está o seu digital hoje?",
      apoio: "Escolha o que mais se parece com a sua situação.",
      perguntas: [
        {
          codigo: "dificuldade_principal",
          tipo: "escolha_unica",
          rotulo: "Qual é a sua maior dificuldade no digital hoje?",
          obrigatoria: true,
          opcoes: [
            { codigo: "sem_tempo_conteudo", rotulo: "Não tenho tempo para produzir conteúdo" },
            { codigo: "nao_sei_o_que_postar", rotulo: "Não sei o que postar" },
            { codigo: "sem_vendas_nas_redes", rotulo: "Não consigo gerar vendas pelas redes" },
            { codigo: "pouco_encontrado_no_google", rotulo: "Quase ninguém me encontra no Google" },
            { codigo: "nao_sei_medir", rotulo: "Não sei medir resultados" },
            { codigo: "outra", rotulo: "Outra", pedeTexto: true },
          ],
          maxCaracteres: 120,
        },
        {
          codigo: "ja_fez_trafego_pago",
          tipo: "escolha_unica",
          rotulo: "Já fez tráfego pago (anúncios no Instagram, Facebook ou Google)?",
          obrigatoria: true,
          opcoes: [
            { codigo: "sim", rotulo: "Sim" },
            { codigo: "nao", rotulo: "Não" },
          ],
        },
        {
          codigo: "presenca_atual",
          tipo: "escolha_multipla",
          rotulo: "Sua empresa tem:",
          apoio: "Pode marcar mais de uma opção.",
          obrigatoria: true,
          opcoes: [
            { codigo: "instagram", rotulo: "Instagram" },
            { codigo: "site", rotulo: "Site" },
            { codigo: "google_meu_negocio", rotulo: "Google Meu Negócio" },
            { codigo: "nenhum", rotulo: "Nenhum", exclusiva: true },
          ],
        },
      ],
    },
    {
      codigo: "objetivos",
      rotulo: "Objetivos",
      titulo: "Para onde você quer ir?",
      apoio: "Não existe resposta certa. É só para a Nexa MP entender o seu momento.",
      perguntas: [
        {
          codigo: "investimento_mensal",
          tipo: "escolha_unica",
          rotulo: "Quanto você pretende investir por mês em crescimento digital?",
          obrigatoria: true,
          opcoes: [
            { codigo: "ate_500", rotulo: "Até R$ 500" },
            { codigo: "de_500_a_1500", rotulo: "R$ 500 a R$ 1.500" },
            { codigo: "de_1500_a_3000", rotulo: "R$ 1.500 a R$ 3.000" },
            { codigo: "acima_3000", rotulo: "Acima de R$ 3.000" },
            { codigo: "ainda_nao_sei", rotulo: "Ainda não sei" },
          ],
        },
        {
          codigo: "objetivo_6_meses",
          tipo: "texto_longo",
          rotulo: "Qual é o seu objetivo de crescimento no digital nos próximos 6 meses?",
          placeholder: "Ex.: receber mais pedidos pelo WhatsApp, aparecer melhor no Google...",
          obrigatoria: false,
          maxCaracteres: 600,
        },
        {
          codigo: "maior_trava",
          tipo: "texto_longo",
          rotulo: "Em poucas palavras, o que mais trava o seu crescimento no digital hoje?",
          placeholder: "Conte do seu jeito.",
          obrigatoria: false,
          maxCaracteres: 600,
        },
      ],
    },
    {
      codigo: "contato",
      rotulo: "Contato",
      titulo: "Como a Nexa MP pode te responder?",
      apoio: "Usamos o seu contato apenas para responder a este diagnóstico.",
      perguntas: [
        {
          codigo: "canal_preferido",
          tipo: "escolha_unica",
          rotulo: "Como prefere ser contatado?",
          obrigatoria: true,
          opcoes: [
            { codigo: "whatsapp", rotulo: "WhatsApp" },
            { codigo: "email", rotulo: "E-mail" },
            { codigo: "ambos", rotulo: "Os dois" },
          ],
          campoLead: "canal_preferido",
        },
        {
          codigo: "whatsapp",
          tipo: "texto_curto",
          rotulo: "Seu WhatsApp (com DDD)",
          placeholder: "Ex.: (53) 99999-9999",
          obrigatoria: true,
          visivelQuando: { pergunta: "canal_preferido", em: ["whatsapp", "ambos"] },
          maxCaracteres: 25,
          campoLead: "whatsapp",
        },
        {
          codigo: "email",
          tipo: "texto_curto",
          rotulo: "Seu e-mail",
          placeholder: "seu@email.com",
          obrigatoria: true,
          visivelQuando: { pergunta: "canal_preferido", em: ["email", "ambos"] },
          maxCaracteres: 120,
          campoLead: "email",
        },
      ],
    },
  ],
};

/** Todas as perguntas na ordem em que aparecem. */
export const PERGUNTAS_DIAGNOSTICO = DIAGNOSTICO.etapas.flatMap((etapa) => etapa.perguntas);