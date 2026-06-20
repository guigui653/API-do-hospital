package com.hospital.api.repository;

import com.hospital.api.entity.RecuperacaoSenha;
import com.hospital.api.entity.Usuario;
import com.hospital.api.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecuperacaoSenhaRepository extends JpaRepository<RecuperacaoSenha, Long> {

    Optional<RecuperacaoSenha> findByCodigoConfirmacao(String codigoConfirmacao);

    Optional<RecuperacaoSenha> findByUsuarioAndUtilizadoFalse(Usuario usuario);

    Optional<RecuperacaoSenha> findByPacienteAndUtilizadoFalse(Paciente paciente);
}
