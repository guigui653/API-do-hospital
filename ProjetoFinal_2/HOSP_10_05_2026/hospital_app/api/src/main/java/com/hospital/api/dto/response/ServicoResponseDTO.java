package com.hospital.api.dto.response;

import com.hospital.api.entity.Servico;

public record ServicoResponseDTO(
        Integer idServico,
        String nome,
        String descricao,
        Short tempoEstimadoMin
) {
    public ServicoResponseDTO(Servico servico) {
        this(
                servico.getIdServico(),
                servico.getNome(),
                servico.getDescricao(),
                servico.getTempoEstimadoMin()
        );
    }
}
