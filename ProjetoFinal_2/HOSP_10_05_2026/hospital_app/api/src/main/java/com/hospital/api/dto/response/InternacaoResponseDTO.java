package com.hospital.api.dto.response;

import com.hospital.api.entity.Internacao;
import java.time.LocalDate;

public record InternacaoResponseDTO(
        Integer idInternacao,
        Long idPaciente,
        String nomePaciente,
        Integer idLeito,
        String numeroLeito,
        LocalDate dataEntrada,
        LocalDate dataSaida,
        String motivoInternacao,
        Boolean ativo
) {
    public InternacaoResponseDTO(Internacao internacao) {
        this(

                internacao.getIdInternacao() != null ? internacao.getIdInternacao().intValue() : null,

                internacao.getPaciente() != null ? internacao.getPaciente().getIdPaciente() : null,

                internacao.getPaciente() != null ? internacao.getPaciente().getNome() : null,
                internacao.getLeito() != null ? internacao.getLeito().getIdLeito() : null,
                internacao.getLeito() != null ? internacao.getLeito().getNumero() : null,
                internacao.getDataEntrada(),
                internacao.getDataSaida(),
                internacao.getMotivoInternacao(),
                internacao.getAtivo()
        );
    }
}
