package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InternacaoRequestDTO(
        @NotNull Long idPaciente,
        @NotNull Integer idLeito,
        @NotBlank String motivo
) {
}
