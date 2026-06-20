package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetarSenhaRequestDTO(
        @NotBlank(message = "O código de verificação é obrigatório.")
        @Size(min = 6, max = 6, message = "O código deve ter exatamente 6 dígitos.")
        String codigo,

        @NotBlank(message = "A nova senha é obrigatória.")
        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres.")
        String novaSenha
) {}
