package com.hospital.api.dto.request;

import com.hospital.api.entity.Triagem;
import com.hospital.api.enums.NivelUrgencia;

import java.time.LocalDateTime;

public record DadosListagemTriagemDTO(
        Long idtriagem,
        String nomePaciente,
        String cpf,
        Integer idade,
        String pressaoArterial,
        Double temperatura,
        String sintomas,
        NivelUrgencia urgencia,
        LocalDateTime dataTriagem
) {
    public DadosListagemTriagemDTO(Triagem triagem) {
        this(
                triagem.getIdtriagem(),
                triagem.getNomePaciente(),
                triagem.getCpf(),
                triagem.getIdade(),
                triagem.getPressaoArterial(),
                triagem.getTemperatura(),
                triagem.getSintomas(),
                triagem.getUrgencia(),
                triagem.getDataTriagem()
        );
    }
}
