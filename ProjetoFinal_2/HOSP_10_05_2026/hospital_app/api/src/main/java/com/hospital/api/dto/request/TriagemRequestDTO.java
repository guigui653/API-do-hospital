package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CPF;

public record TriagemRequestDTO(

        @NotBlank(message = "O nome do paciente é obrigatório")
        String pacienteNome,

        @NotBlank(message = "O CPF é obrigatório")
        @CPF(message = "CPF inválido")
        String cpf,

        Integer idade,

        String pressaoArterial,

        Double temperatura,

        String alergias,

        @NotBlank(message = "É obrigatório relatar os sintomas")
        String sintomas,

        @NotBlank(message = "O nível de urgência é obrigatório")
        String nivelUrgencia
) {
}
