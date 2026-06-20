package com.hospital.api.dto.request;

import com.hospital.api.enums.TipoChamado;

public record ChamadoRequestDTO(
        Long idPaciente,
        Integer idServico,
        Integer idLeito,
        String observacao,
        TipoChamado tipo
) {
}
