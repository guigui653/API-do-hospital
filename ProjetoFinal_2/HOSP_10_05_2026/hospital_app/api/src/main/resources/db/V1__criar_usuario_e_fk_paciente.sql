-- =============================================================
-- MIGRAÇÃO: Garantir estrutura para criação automática de Usuário
--           vinculado ao Paciente na finalização da Triagem
--
-- Banco: PostgreSQL  |  Projeto: Cuidar+ Hospital
-- Execute este script manualmente no DBeaver antes de reiniciar a API.
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. TABELA usuario
--    Cria a tabela caso ainda não exista.
--    Se ela já existir, o IF NOT EXISTS ignora silenciosamente.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario   SERIAL       PRIMARY KEY,
    nome         VARCHAR(255) NOT NULL,
    cpf          VARCHAR(11)  NOT NULL UNIQUE,
    email        VARCHAR(255),
    telefone     VARCHAR(20),
    senha        TEXT         NOT NULL,             -- BCrypt hash (sempre 60 chars)
    tipo         VARCHAR(50)  NOT NULL DEFAULT 'PACIENTE',
    ativo        BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_login TIMESTAMP,
    criado_em    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 2. TABELA paciente
--    Garante a coluna id_usuario (FK para usuario).
--    Se a coluna já existir o bloco DO NOTHING evita erros.
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
    -- Adiciona a coluna id_usuario em paciente (se ainda não existir)
    IF NOT EXISTS (
        SELECT 1
          FROM information_schema.columns
         WHERE table_name  = 'paciente'
           AND column_name = 'id_usuario'
    ) THEN
        ALTER TABLE paciente
            ADD COLUMN id_usuario INTEGER REFERENCES usuario(id_usuario);

        RAISE NOTICE 'Coluna id_usuario adicionada à tabela paciente.';
    ELSE
        RAISE NOTICE 'Coluna id_usuario já existe em paciente — nenhuma alteração feita.';
    END IF;

    -- Garante que criado_em existe em paciente
    IF NOT EXISTS (
        SELECT 1
          FROM information_schema.columns
         WHERE table_name  = 'paciente'
           AND column_name = 'criado_em'
    ) THEN
        ALTER TABLE paciente
            ADD COLUMN criado_em TIMESTAMP NOT NULL DEFAULT NOW();
        RAISE NOTICE 'Coluna criado_em adicionada à tabela paciente.';
    END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 3. ÍNDICES — aceleram as buscas por CPF (usadas no login)
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_usuario_cpf   ON usuario (cpf);
CREATE INDEX IF NOT EXISTS idx_paciente_cpf  ON paciente (cpf);

-- ─────────────────────────────────────────────────────────────
-- 4. VERIFICAÇÃO RÁPIDA (rode após a migração no DBeaver)
-- ─────────────────────────────────────────────────────────────
-- Descomente o SELECT abaixo para ver quais pacientes têm usuário:
--
-- SELECT
--     p.id_paciente,
--     p.nome            AS nome_paciente,
--     p.cpf,
--     u.id_usuario,
--     u.tipo,
--     u.ativo,
--     u.criado_em       AS usuario_criado_em
-- FROM paciente p
-- LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
-- ORDER BY p.id_paciente;
-- =============================================================
