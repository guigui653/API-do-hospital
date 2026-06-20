package com.hospital.api.dto.response;

import com.hospital.api.entity.Leito;

public record LeitoResponseDTO(Integer idLeito, String numero, Boolean ocupado, Boolean ativo) {

    public LeitoResponseDTO(Leito leito) {
        this(leito.getIdLeito(), leito.getNumero(), leito.getOcupado(), leito.getAtivo());
    }
}
