package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuartoRequestDTO(
        @NotBlank String numero,
        @NotBlank String andar,
        @NotBlank(message = "A ala é obrigatória")
        String ala,
        @NotNull Boolean ativo
) {
}
