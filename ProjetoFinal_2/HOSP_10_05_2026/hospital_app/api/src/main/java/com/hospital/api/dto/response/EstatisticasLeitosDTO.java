package com.hospital.api.dto.response;

public record EstatisticasLeitosDTO(
        long totalLeitos,
        long leitosLivres,
        long leitosOcupados
) {}
