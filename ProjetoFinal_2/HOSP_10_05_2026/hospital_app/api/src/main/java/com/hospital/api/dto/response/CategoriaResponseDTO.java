package com.hospital.api.dto.response;

import com.hospital.api.entity.Categoria;

public record CategoriaResponseDTO(
        Integer idCategoria,
        String nome,
        String descricao
) {
    public CategoriaResponseDTO(Categoria categoria) {
        this(
                categoria.getIdCategoria(),
                categoria.getNome(),
                categoria.getDescricao()
        );
    }
}
