package com.hospital.api.dto.response;

public record TriagemResponseDTO(
        Long idTriagem,
        Long idPaciente,
        String nomePaciente,
        String cpf,
        String senhaGerada,
        boolean usuarioCriado,
        String mensagem
) {
}
