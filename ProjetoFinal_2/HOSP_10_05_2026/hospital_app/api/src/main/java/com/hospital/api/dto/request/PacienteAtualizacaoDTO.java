package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotNull;

public record PacienteAtualizacaoDTO(
        @NotNull
        Long idPaciente,

        String telefoneContato,
        String nomeResponsavel,
        String telefoneResponsavel
) {
}
