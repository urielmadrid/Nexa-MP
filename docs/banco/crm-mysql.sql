-- Tabelas do CRM da Nexa MP (MySQL 8 / TiDB / MariaDB 10.4+).
-- Você NÃO precisa rodar este arquivo: o botão "Criar tabelas agora" do /crm faz isso sozinho.
-- Ele existe para consulta, ou se preferir criar as tabelas à mão no painel do seu banco.
-- Pode ser executado mais de uma vez sem apagar nada (CREATE TABLE IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS crm_pasta (
  id VARCHAR(80) NOT NULL,
  nome VARCHAR(40) NOT NULL,
  cor CHAR(7) NOT NULL,
  criado_em DATETIME(3) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_lead (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_lead_tag (
  lead_id VARCHAR(80) NOT NULL,
  tag VARCHAR(30) NOT NULL,
  ordem SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (lead_id, tag),
  KEY crm_lead_tag_tag_idx (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_resposta (
  lead_id VARCHAR(80) NOT NULL,
  pergunta_codigo VARCHAR(60) NOT NULL,
  texto VARCHAR(700) NULL,
  ordem SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (lead_id, pergunta_codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_resposta_opcao (
  lead_id VARCHAR(80) NOT NULL,
  pergunta_codigo VARCHAR(60) NOT NULL,
  opcao_codigo VARCHAR(60) NOT NULL,
  ordem SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (lead_id, pergunta_codigo, opcao_codigo),
  KEY crm_resposta_opcao_idx (pergunta_codigo, opcao_codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_evento (
  id VARCHAR(80) NOT NULL,
  lead_id VARCHAR(80) NOT NULL,
  em DATETIME(3) NOT NULL,
  tipo VARCHAR(10) NOT NULL,
  texto VARCHAR(2000) NOT NULL,
  status VARCHAR(12) NULL,
  ordem INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY crm_evento_lead_idx (lead_id, em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificação em duas etapas do login (códigos enviados por e-mail ou WhatsApp).
-- Esta tabela é criada sozinha no primeiro login com CRM_2FA=ligado; está aqui só para consulta.
CREATE TABLE IF NOT EXISTS crm_desafio (
  id CHAR(32) NOT NULL,
  criado_em DATETIME(3) NOT NULL,
  expira_em DATETIME(3) NOT NULL,
  canal VARCHAR(10) NULL,
  codigo_hash CHAR(64) NULL,
  enviado_em DATETIME(3) NULL,
  envios SMALLINT NOT NULL DEFAULT 0,
  tentativas SMALLINT NOT NULL DEFAULT 0,
  usado TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY crm_desafio_expira_idx (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;