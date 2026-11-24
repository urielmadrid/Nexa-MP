-- =====================================================================================================
-- Nexa MP — Diagnóstico de presença digital (página /formulario)
-- Desenho das tabelas para quando o site/CRM passar a usar banco de dados.
-- AINDA NÃO É USADO: hoje o envio só vira e-mail (veja src/lib/formulario/repositorio.ts).
--
-- Alvo: PostgreSQL 13 ou mais novo (usa gen_random_uuid() nativo).
-- Como ler: o código TypeScript já entrega os dados neste formato (src/lib/formulario/tipos.ts):
--
--   Formulario / Etapa / Pergunta / Opcao   -> formulario, formulario_versao, pergunta, opcao   (catálogo)
--   EnvioNormalizado.lead                   -> lead
--   EnvioNormalizado (id, origem, criadoEm) -> envio
--   EnvioNormalizado.consentimento          -> consentimento
--   EnvioNormalizado.respostas              -> resposta (+ resposta_opcao para as escolhas)
--
-- Regras de ouro:
--   * "codigo" (formulário, pergunta, opção) é o identificador estável; "rotulo" é só o texto exibido.
--   * Mudou pergunta ou opção? Crie uma nova linha em formulario_versao e carregue o catálogo de novo.
--     Os envios antigos continuam apontando para a versão em que foram respondidos.
--   * O id do envio nasce na aplicação (UUID). Assim, repetir o mesmo envio não duplica nada
--     (INSERT ... ON CONFLICT (id) DO NOTHING).
--   * Grave um envio inteiro em UMA transação (lead, envio, consentimento, respostas).
--   * Perguntas com campo_lead preenchido NÃO viram linha em "resposta": vão para a coluna do lead.
-- =====================================================================================================

BEGIN;

-- ---------- Catálogo (muda raramente; carregado a partir de src/lib/formulario/diagnostico.ts) ----------

CREATE TABLE formulario (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text        NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9_-]+$'),   -- ex.: diagnostico-digital
  titulo     text        NOT NULL,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE formulario_versao (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id  uuid        NOT NULL REFERENCES formulario (id),
  versao         integer     NOT NULL CHECK (versao >= 1),                 -- Formulario.versao
  publicada_em   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (formulario_id, versao)
);

CREATE TABLE pergunta (
  id                    uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_versao_id  uuid    NOT NULL REFERENCES formulario_versao (id),
  codigo                text    NOT NULL CHECK (codigo ~ '^[a-z0-9_]+$'),  -- ex.: dificuldade_principal
  etapa_codigo          text    NOT NULL,                                   -- ex.: momento_atual
  ordem                 integer NOT NULL,                                   -- ordem na página, de 1 em diante
  tipo                  text    NOT NULL CHECK (tipo IN ('texto_curto', 'texto_longo', 'escolha_unica', 'escolha_multipla')),
  rotulo                text    NOT NULL,
  obrigatoria           boolean NOT NULL,
  campo_lead            text    CHECK (campo_lead IN ('nome', 'empresa', 'email', 'whatsapp', 'canal_preferido')),
  UNIQUE (formulario_versao_id, codigo),
  UNIQUE (formulario_versao_id, ordem)
);

CREATE TABLE opcao (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta_id  uuid    NOT NULL REFERENCES pergunta (id),
  codigo       text    NOT NULL CHECK (codigo ~ '^[a-z0-9_]+$'),            -- ex.: ate_500
  rotulo       text    NOT NULL,
  ordem        integer NOT NULL,
  exclusiva    boolean NOT NULL DEFAULT false,                              -- ex.: "Nenhum"
  pede_texto   boolean NOT NULL DEFAULT false,                              -- ex.: "Outra": o texto vai em resposta.texto
  UNIQUE (pergunta_id, codigo),
  UNIQUE (pergunta_id, ordem)
);

-- ---------- Dados (crescem a cada envio) ----------

-- Quem respondeu. O CRM próprio pode estender esta tabela (responsável, origem comercial, anotações etc.).
-- Antes de inserir, a aplicação procura um lead existente pelo e-mail ou pelo WhatsApp e reaproveita (UPDATE) se achar.
CREATE TABLE lead (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             text        NOT NULL,
  empresa          text,
  email            text        CHECK (email IS NULL OR email = lower(email)),
  whatsapp_e164    text        CHECK (whatsapp_e164 IS NULL OR whatsapp_e164 ~ '^\+[0-9]{10,15}$'),  -- ex.: +5553991234567
  canal_preferido  text        CHECK (canal_preferido IN ('whatsapp', 'email', 'ambos')),
  status           text        NOT NULL DEFAULT 'novo'
                               CHECK (status IN ('novo', 'em_contato', 'qualificado', 'proposta', 'ganho', 'perdido')),
  criado_em        timestamptz NOT NULL DEFAULT now(),
  atualizado_em    timestamptz NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR whatsapp_e164 IS NOT NULL)
);
CREATE INDEX lead_email_idx    ON lead (email)         WHERE email IS NOT NULL;
CREATE INDEX lead_whatsapp_idx ON lead (whatsapp_e164) WHERE whatsapp_e164 IS NOT NULL;
CREATE INDEX lead_status_idx   ON lead (status, criado_em DESC);

-- Uma resposta completa ao formulário. Um lead pode ter vários envios.
-- Apagar o lead apaga também os envios e as respostas (pedido de exclusão de dados, LGPD).
CREATE TABLE envio (
  id                    uuid        PRIMARY KEY,                           -- vem da aplicação (EnvioNormalizado.id)
  lead_id               uuid        NOT NULL REFERENCES lead (id) ON DELETE CASCADE,
  formulario_versao_id  uuid        NOT NULL REFERENCES formulario_versao (id),
  criado_em             timestamptz NOT NULL,                              -- EnvioNormalizado.criadoEm
  pagina                text,
  referrer              text,
  utm_source            text,
  utm_medium            text,
  utm_campaign          text,
  utm_term              text,
  utm_content           text
);
CREATE INDEX envio_lead_idx  ON envio (lead_id, criado_em DESC);
CREATE INDEX envio_data_idx  ON envio (criado_em DESC);

-- Prova do aceite da Política de Privacidade e dos Termos, com a versão em vigor (VERSAO_POLITICA).
CREATE TABLE consentimento (
  envio_id         uuid        PRIMARY KEY REFERENCES envio (id) ON DELETE CASCADE,
  aceito           boolean     NOT NULL CHECK (aceito),
  versao_politica  text        NOT NULL,                                   -- ex.: 2026-11-20
  registrado_em    timestamptz NOT NULL DEFAULT now()
);

-- Uma linha por pergunta respondida (menos as que preenchem o lead). A pergunta precisa ser da mesma
-- formulario_versao do envio: a aplicação garante ao gravar.
CREATE TABLE resposta (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envio_id     uuid NOT NULL REFERENCES envio (id) ON DELETE CASCADE,
  pergunta_id  uuid NOT NULL REFERENCES pergunta (id),
  texto        text,                                                       -- texto livre ou complemento de "Outra"
  UNIQUE (envio_id, pergunta_id)
);

-- As opções marcadas (uma em escolha única; várias em escolha múltipla).
CREATE TABLE resposta_opcao (
  resposta_id  uuid NOT NULL REFERENCES resposta (id) ON DELETE CASCADE,
  opcao_id     uuid NOT NULL REFERENCES opcao (id),
  PRIMARY KEY (resposta_id, opcao_id)
);
CREATE INDEX resposta_opcao_opcao_idx ON resposta_opcao (opcao_id);        -- "quem respondeu X?" (filtros do CRM)

-- ---------- Leitura pronta para o CRM ----------

-- Cada resposta com o texto que a pessoa viu, sem precisar de vários JOINs.
CREATE VIEW vw_resposta_legivel AS
SELECT
  r.envio_id,
  p.codigo                                                   AS pergunta_codigo,
  p.rotulo                                                   AS pergunta_rotulo,
  coalesce(array_agg(o.codigo ORDER BY o.ordem) FILTER (WHERE o.id IS NOT NULL), '{}') AS opcao_codigos,
  coalesce(array_agg(o.rotulo ORDER BY o.ordem) FILTER (WHERE o.id IS NOT NULL), '{}') AS opcao_rotulos,
  r.texto
FROM resposta r
JOIN pergunta p              ON p.id = r.pergunta_id
LEFT JOIN resposta_opcao ro  ON ro.resposta_id = r.id
LEFT JOIN opcao o            ON o.id = ro.opcao_id
GROUP BY r.id, r.envio_id, p.codigo, p.rotulo, r.texto;

COMMIT;

-- ---------- Exemplos de consulta (para o CRM) ----------
-- Leads novos com o investimento mensal que informaram:
--   SELECT l.nome, l.empresa, l.whatsapp_e164, l.email, v.opcao_rotulos[1] AS investimento
--   FROM lead l
--   JOIN envio e ON e.lead_id = l.id
--   JOIN vw_resposta_legivel v ON v.envio_id = e.id AND v.pergunta_codigo = 'investimento_mensal'
--   WHERE l.status = 'novo'
--   ORDER BY e.criado_em DESC;