/**
 * Tabelas do CRM no MySQL (MySQL 8, MariaDB 10.5+ ou TiDB). O mesmo texto está em docs/banco/crm-mysql.sql.
 *
 * Decisões de projeto:
 *  - SEM chaves estrangeiras: bancos "serverless" (TiDB, PlanetScale) costumam não aceitá-las. Quem apaga os
 *    dados "filhos" junto com o lead é o código (src/lib/crm/servidor/leads.ts), dentro de uma transação.
 *  - Datas em UTC (DATETIME(3)); a tela converte para o horário local.
 *  - Todas as tabelas começam com "crm_" para não esbarrar em outras tabelas do mesmo banco.
 *  - "ordem" guarda a posição original (respostas, etiquetas, histórico), para a tela mostrar sempre na mesma ordem.
 *  - Pode rodar de novo à vontade: tudo é "CREATE TABLE IF NOT EXISTS".
 */

const FIM = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

export const TABELAS_CRM: string[] = [
  // Pastas criadas pela equipe para separar as empresas.
  `CREATE TABLE IF NOT EXISTS crm_pasta (
  id VARCHAR(80) NOT NULL,
  nome VARCHAR(40) NOT NULL,
  cor CHAR(7) NOT NULL,
  criado_em DATETIME(3) NOT NULL,
  PRIMARY KEY (id)
) ${FIM}`,

  // Um lead = uma empresa/pessoa no CRM. Leads do formulário usam o id do envio (UUID).
  `CREATE TABLE IF NOT EXISTS crm_lead (
  id VARCHAR(80) NOT NULL,
  fonte VARCHAR(12) NOT NULL,
  criado_em DATETIME(3) NOT NULL,
  atualizado_em DATETIME(3) NOT NULL,
  nome VARCHAR(120) NOT NULL,
  empresa VARCHAR(120) NULL,
  email VARCHAR(160) NULL,
  whatsapp_e164 VARCHAR(20) NULL,
  canal_preferido VARCHAR(20) NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'novo',
  pasta_id VARCHAR(80) NULL,
  proximo_contato DATE NULL,
  formulario_slug VARCHAR(60) NULL,
  formulario_versao INT NULL,
  tem_origem TINYINT(1) NOT NULL DEFAULT 0,
  origem_pagina VARCHAR(200) NULL,
  origem_referrer VARCHAR(300) NULL,
  utm_source VARCHAR(100) NULL,
  utm_medium VARCHAR(100) NULL,
  utm_campaign VARCHAR(100) NULL,
  utm_term VARCHAR(100) NULL,
  utm_content VARCHAR(100) NULL,
  consentimento_versao VARCHAR(20) NULL,
  consentimento_em DATETIME(3) NULL,
  PRIMARY KEY (id),
  KEY crm_lead_status_idx (status, criado_em),
  KEY crm_lead_pasta_idx (pasta_id),
  KEY crm_lead_email_idx (email),
  KEY crm_lead_criado_idx (criado_em)
) ${FIM}`,

  // Etiquetas livres escritas pela equipe.
  `CREATE TABLE IF NOT EXISTS crm_lead_tag (
  lead_id VARCHAR(80) NOT NULL,
  tag VARCHAR(30) NOT NULL,
  ordem SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (lead_id, tag),
  KEY crm_lead_tag_tag_idx (tag)
) ${FIM}`,

  // Uma linha por pergunta respondida do diagnóstico (texto livre ou complemento de "Outro").
  `CREATE TABLE IF NOT EXISTS crm_resposta (
  lead_id VARCHAR(80) NOT NULL,
  pergunta_codigo VARCHAR(60) NOT NULL,
  texto VARCHAR(700) NULL,
  ordem SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (lead_id, pergunta_codigo)
) ${FIM}`,

  // As opções marcadas em cada pergunta (uma em escolha única; várias em escolha múltipla).
  // Serve para perguntar ao banco "quem respondeu investimento_mensal = acima_3000?".
  `CREATE TABLE IF NOT EXISTS crm_resposta_opcao (
  lead_id VARCHAR(80) NOT NULL,
  pergunta_codigo VARCHAR(60) NOT NULL,
  opcao_codigo VARCHAR(60) NOT NULL,
  ordem SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (lead_id, pergunta_codigo, opcao_codigo),
  KEY crm_resposta_opcao_idx (pergunta_codigo, opcao_codigo)
) ${FIM}`,

  // Histórico do lead (notas, mudanças de etapa e de pasta, contatos). Só cresce: nada é reescrito.
  `CREATE TABLE IF NOT EXISTS crm_evento (
  id VARCHAR(80) NOT NULL,
  lead_id VARCHAR(80) NOT NULL,
  em DATETIME(3) NOT NULL,
  tipo VARCHAR(10) NOT NULL,
  texto VARCHAR(2000) NOT NULL,
  status VARCHAR(12) NULL,
  ordem INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY crm_evento_lead_idx (lead_id, em)
) ${FIM}`,
];

/** Nomes das tabelas, para conferir se já existem. */
export const NOMES_TABELAS = ["crm_pasta", "crm_lead", "crm_lead_tag", "crm_resposta", "crm_resposta_opcao", "crm_evento"];