package com.hospital.api.dto.response;

public record TokenDTO(
        String token,
        Long   idPaciente,
        String nome,
        String leito
) {
}
