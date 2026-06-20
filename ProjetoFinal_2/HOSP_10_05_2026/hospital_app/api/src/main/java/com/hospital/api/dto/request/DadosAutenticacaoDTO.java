package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record DadosAutenticacaoDTO(
        @NotBlank
        String cpf,

        @NotBlank
        String senha
) {
}
