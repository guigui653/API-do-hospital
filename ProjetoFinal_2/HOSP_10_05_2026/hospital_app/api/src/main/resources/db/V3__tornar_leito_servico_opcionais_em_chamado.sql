-- =============================================================
-- MIGRAÇÃO V3: Tornar id_leito e id_servico opcionais na tabela chamado
--
-- Motivo: O frontend não envia id_leito nem id_servico ao abrir
-- um chamado via app mobile. O backend agora envia NULL nesses campos.
-- Se as colunas tiverem NOT NULL, o INSERT falha com violação de constraint.
--
-- Banco: PostgreSQL  |  Projeto: Cuidar+ Hospital
-- =============================================================

-- 1. Permite NULL em id_leito (caso esteja NOT NULL)
ALTER TABLE chamado
    ALTER COLUMN id_leito DROP NOT NULL;

-- 2. Permite NULL em id_servico (caso esteja NOT NULL)
ALTER TABLE chamado
    ALTER COLUMN id_servico DROP NOT NULL;

-- 3. (Opcional) Dados de seed — cria um Quarto e um Leito padrão
--    para testes no ambiente de desenvolvimento.
--    Remova este bloco em produção se os leitos já existirem.
INSERT INTO quarto (numero, andar, ativo)
VALUES ('1', 'Térreo', true)
ON CONFLICT DO NOTHING;

INSERT INTO leito (numero, id_quarto, ocupado, ativo)
SELECT '101-A',
       (SELECT id_quarto FROM quarto WHERE numero = '1' LIMIT 1),
       false,
       true
WHERE NOT EXISTS (SELECT 1 FROM leito WHERE numero = '101-A');

-- 4. Verificação
SELECT column_name, is_nullable
  FROM information_schema.columns
 WHERE table_name = 'chamado'
   AND column_name IN ('id_leito', 'id_servico');
