package com.hospital.api.dto.response;

import com.hospital.api.entity.Chamado;
import java.time.LocalDateTime;

public record ChamadoResponseDTO(
        Long idChamado,
        Long idPaciente,
        Integer idServico,
        String observacao,
        String status,
        String tipo,
        LocalDateTime dataAbertura,
        LocalDateTime dataInicioAtend,
        LocalDateTime dataConclusao,
        String nomePaciente,
        String leitoPaciente,
        Integer notaAvaliacao,
        String comentarioAvaliacao,
        String descricaoResolucao
) {
    public ChamadoResponseDTO(Chamado chamado) {
        this(
                chamado.getIdChamado(),
                chamado.getPaciente() != null ? chamado.getPaciente().getIdPaciente() : null,
                chamado.getServico() != null ? chamado.getServico().getIdServico() : null,
                chamado.getObservacao(),
                chamado.getStatus().name(),
                chamado.getTipo() != null ? chamado.getTipo().name() : null,
                chamado.getDataAbertura(),
                chamado.getDataInicioAtend(),
                chamado.getDataConclusao(),
                chamado.getPaciente() != null ? chamado.getPaciente().getNome() : "N/A",
                chamado.getLeito() != null ? "Leito: " + chamado.getLeito().getNumero() : "N/A",
                chamado.getNotaAvaliacao(),
                chamado.getComentarioAvaliacao(),
                chamado.getDescricaoResolucao()
        );
    }
}
