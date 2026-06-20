package com.hospital.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DadosCadastroAvaliacaoDTO(
        Long idInternacao,
        Long idChamado,

        @NotNull
        @Min(1)
        @Max(5)
        Integer nota,

        String comentario
) {
}
