package com.hospital.api.dto.request;

import com.hospital.api.enums.StatusChamado;

public record ChamadoAtualizacaoDTO(
        StatusChamado status,
        String observacao
) {
}
