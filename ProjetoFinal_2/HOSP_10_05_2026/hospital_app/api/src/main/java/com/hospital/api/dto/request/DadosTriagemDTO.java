package com.hospital.api.dto.request;

import com.hospital.api.enums.NivelUrgencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CPF;

public record DadosTriagemDTO(
        @NotBlank String pacienteNome,
        @NotBlank String cpf,
        @NotNull Integer idade,
        String pressaoArterial,
        Double temperatura,
        String alergia,
        @NotBlank String sintomas,

        @NotNull
        NivelUrgencia nivelUrgencia
) {
}
