package com.hospital.api.dto.request;

import com.hospital.api.enums.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CPF;

public record UsuarioRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O CPF é obrigatório")
        @CPF(message = "CPF inválido")
        String cpf,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "Formato de e-mail inválido")
        String email,

        String telefone,

        @NotBlank(message = "A senha é obrigatória")
        String senha,

        @NotNull(message = "O tipo de usuário é obrigatório")
        TipoUsuario tipo
) {
}
