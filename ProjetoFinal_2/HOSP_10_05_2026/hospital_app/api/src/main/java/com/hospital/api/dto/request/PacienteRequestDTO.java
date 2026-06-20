package com.hospital.api.dto.request;

import com.hospital.api.enums.SexoPaciente;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.br.CPF;
import java.time.LocalDate;

public record PacienteRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O CPF é obrigatório")
        @CPF(message = "CPF inválido")
        String cpf,

        String numeroProntuario,
        LocalDate dataNascimento,
        SexoPaciente sexo,
        String telefoneContato,
        String nomeResponsavel,
        String telefoneResponsavel
) {
}
