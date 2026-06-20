package com.hospital.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PedidoRapidoRequestDTO(
        @NotBlank(message = "O item do pedido é obrigatório.")
        String idItem
) {}
