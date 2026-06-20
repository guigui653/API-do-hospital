package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record EsqueciSenhaRequestDTO(
        @NotBlank(message = "O CPF é obrigatório.")
        String cpf
) {}
