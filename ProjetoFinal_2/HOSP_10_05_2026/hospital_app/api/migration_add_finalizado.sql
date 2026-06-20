-- ============================================================
-- MIGRATION: Adicionar status FINALIZADO ao ciclo de vida dos chamados
-- 
-- ⚠️  RODAR ESTE SCRIPT NO BANCO PostgreSQL ANTES de reiniciar a API
--     após a atualização do enum StatusChamado.java.
--
-- Fluxo após a migration:
--   ABERTO → EM_ATENDIMENTO → CONCLUIDO → FINALIZADO  (ou CANCELADO)
--
--   CONCLUIDO  = Colaborador encerrou; aguarda avaliação do paciente.
--   FINALIZADO = Paciente avaliou; chamado encerrado definitivamente.
-- ============================================================

-- Passo 1: Remove a constraint antiga (que não inclui FINALIZADO)
ALTER TABLE chamado DROP CONSTRAINT IF EXISTS chamado_status_check;

-- Passo 2: Recria a constraint incluindo o novo status FINALIZADO
ALTER TABLE chamado ADD CONSTRAINT chamado_status_check
    CHECK (status IN ('ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO', 'FINALIZADO', 'CANCELADO'));

-- Verificação (opcional): listar os chamados CONCLUIDOS que ainda precisam de avaliação
-- SELECT id_chamado, status, nota_avaliacao FROM chamado WHERE status = 'CONCLUIDO';
