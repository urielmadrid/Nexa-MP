/**
 * Tipos do formulário de diagnóstico.
 *
 * Pensados para virar tabelas SQL (veja docs/banco/formulario-diagnostico.sql):
 *   - Formulario / Etapa / Pergunta / Opcao  -> catálogo (tabelas formulario, formulario_versao, pergunta, opcao)
 *   - LeadNormalizado                        -> tabela lead
 *   - RespostaNormalizada                    -> tabelas resposta e resposta_opcao
 *   - EnvioNormalizado                       -> tabelas envio e consentimento
 *
 * Os "codigo" (de formulário, pergunta e opção) são identificadores estáveis, em minúsculas e sem acento.
 * Eles é que vão para o banco; o "rotulo" é só o texto que a pessoa lê e pode mudar sem quebrar os dados antigos.
 */

export type TipoPergunta = "texto_curto" | "texto_longo" | "escolha_unica" | "escolha_multipla";

/** Quando a pergunta preenche um campo do lead (e não vira linha em "resposta"). */
export type CampoLead = "nome" | "empresa" | "email" | "whatsapp" | "canal_preferido";

export type Opcao = {
  codigo: string;
  rotulo: string;
  /** Em escolha múltipla: ao marcar esta opção, as outras são desmarcadas (ex.: "Nenhum"). */
  exclusiva?: boolean;
  /** Ao marcar, a pessoa escreve um complemento (ex.: "Outra"). O texto fica em resposta.texto. */
  pedeTexto?: boolean;
};

export type Pergunta = {
  codigo: string;
  tipo: TipoPergunta;
  rotulo: string;
  apoio?: string;
  placeholder?: string;
  obrigatoria: boolean;
  /** Só aparece (e só é exigida) quando a resposta de outra pergunta estiver entre estes códigos. */
  visivelQuando?: { pergunta: string; em: string[] };
  /** Limite de caracteres para tipos de texto (e para o complemento de "pedeTexto"). */
  maxCaracteres?: number;
  opcoes?: Opcao[];
  campoLead?: CampoLead;
};

export type Etapa = {
  codigo: string;
  rotulo: string;
  titulo: string;
  apoio: string;
  perguntas: Pergunta[];
};

export type Formulario = {
  slug: string;
  /** Sobe 1 sempre que perguntas ou opções mudarem, para os envios antigos continuarem fazendo sentido. */
  versao: number;
  titulo: string;
  descricao: string;
  etapas: Etapa[];
};

/** O que o navegador envia: códigos das opções marcadas ou texto digitado, por código de pergunta. */
export type RespostasBrutas = {
  valores: Record<string, string | string[]>;
  /** Complemento digitado de opções "pedeTexto", por código de pergunta. */
  outros: Record<string, string>;
};

export type LeadNormalizado = {
  nome: string;
  empresa: string | null;
  email: string | null;
  /** Formato internacional, só com + e dígitos. Ex.: +5553991234567 */
  whatsappE164: string | null;
  /** Código da opção escolhida em canal_preferido: "email", "whatsapp" ou "ambos". */
  canalPreferido: string | null;
};

export type RespostaNormalizada = {
  perguntaCodigo: string;
  /** Escolhas feitas (vazio nas perguntas de texto). */
  opcaoCodigos: string[];
  /** Texto livre da pergunta ou complemento de uma opção "pedeTexto". */
  texto: string | null;
};

export type OrigemEnvio = {
  /** Caminho da página, sem domínio. Ex.: /formulario */
  pagina: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
};

export type EnvioNormalizado = {
  /** UUID gerado no servidor. Vai no e-mail agora e será a chave da tabela envio. */
  id: string;
  formularioSlug: string;
  formularioVersao: number;
  criadoEm: string;
  lead: LeadNormalizado;
  respostas: RespostaNormalizada[];
  consentimento: { aceito: true; versaoPolitica: string };
  origem: OrigemEnvio;
};

export type ErrosPorCampo = Record<string, string>;