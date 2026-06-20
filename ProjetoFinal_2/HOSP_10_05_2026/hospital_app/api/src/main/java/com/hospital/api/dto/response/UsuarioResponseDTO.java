package com.hospital.api.dto.response;

import com.hospital.api.entity.Usuario;
import com.hospital.api.enums.TipoUsuario;

public record UsuarioResponseDTO(
        Integer idUsuario,
        String nome,
        String cpf,
        String email,
        String telefone,
        TipoUsuario tipo,
        Boolean ativo
) {

    public UsuarioResponseDTO(Usuario usuario) {
        this(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getCpf(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getTipo(),
                usuario.getAtivo()
        );
    }
}
