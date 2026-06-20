-- =============================================================
-- MIGRAÇÃO V2: Sincronizar status 'PENDENTE' → 'ABERTO'
--
-- Motivo: O Enum Java StatusChamado continha o valor 'PENDENTE'
-- que não existe na constraint do PostgreSQL (chamado_status_check).
-- O valor correto de abertura de chamado é 'ABERTO'.
--
-- Banco: PostgreSQL  |  Projeto: Cuidar+ Hospital
-- =============================================================

-- 1. Converte chamados legados com status PENDENTE para ABERTO
UPDATE chamado
   SET status = 'ABERTO'
 WHERE status = 'PENDENTE';

-- 2. Verificação após a migração
-- SELECT status, COUNT(*) FROM chamado GROUP BY status ORDER BY status;
