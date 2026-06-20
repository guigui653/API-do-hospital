package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record FinalizarChamadoRequestDTO(
        @NotBlank(message = "A descrição da resolução é obrigatória.")
        String descricaoResolucao
) {}
