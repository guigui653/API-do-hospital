package com.hospital.api.dto.response;

import com.hospital.api.entity.Quarto;

public record QuartoResponseDTO(Integer idQuarto, String numero, String andar, Boolean ativo) {
    public QuartoResponseDTO(Quarto quarto) {
        this(quarto.getIdQuarto(), quarto.getNumero(), quarto.getAndar(), quarto.getAtivo());
    }
}
