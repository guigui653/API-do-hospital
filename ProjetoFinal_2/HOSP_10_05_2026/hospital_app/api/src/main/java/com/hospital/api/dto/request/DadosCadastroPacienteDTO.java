package com.hospital.api.dto.request;

import com.hospital.api.enums.SexoPaciente;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record DadosCadastroPacienteDTO(
        @NotBlank String nome,
        @NotBlank @CPF String cpf,
        @NotBlank @Email String email,
        @NotBlank String senha,
        LocalDate dataNascimento,
        SexoPaciente sexo,
        String leito,
        String numeroProntuario
) {
}
