package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank(message = "O CPF é obrigatório")
        String cpf,

        @NotBlank(message = "A senha é obrigatória")
        String senha
) {
}
