package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LeitoRequestDTO(
        @NotBlank(message = "O código do leito é obrigatório")
        String codigo,

        @NotNull(message = "O ID do quarto é obrigatório")
        Integer idQuarto,

        @NotBlank String numero,
        @NotNull Boolean ocupado,
        @NotNull Boolean ativo
) {
}
