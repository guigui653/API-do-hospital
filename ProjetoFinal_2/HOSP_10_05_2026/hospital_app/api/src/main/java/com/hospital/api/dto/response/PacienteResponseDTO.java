package com.hospital.api.dto.response;

import com.hospital.api.entity.Paciente;
import com.hospital.api.enums.SexoPaciente;
import java.time.LocalDate;

public record PacienteResponseDTO(
        Long       idPaciente,
        String     nome,
        String     cpf,
        String     leito,
        String     numeroProntuario,
        LocalDate  dataNascimento,
        SexoPaciente sexo,
        String     telefoneContato,
        String     nomeResponsavel,
        String     telefoneResponsavel,
        Boolean    ativo
) {

    public PacienteResponseDTO(Paciente paciente) {
        this(
                paciente.getIdPaciente(),

                paciente.getNome() != null ? paciente.getNome() : "",

                paciente.getCpf() != null ? paciente.getCpf() : "",

                paciente.getLeito(),

                paciente.getNumeroProntuario(),
                paciente.getDataNascimento(),
                paciente.getSexo(),

                paciente.getTelefoneContato(),

                paciente.getNomeResponsavel(),
                paciente.getTelefoneResponsavel(),
                paciente.getAtivo()
        );
    }
}
