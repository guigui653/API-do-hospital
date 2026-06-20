package com.hospital.api.service;

import com.hospital.api.dto.request.EsqueciSenhaRequestDTO;
import com.hospital.api.dto.request.ResetarSenhaRequestDTO;
import com.hospital.api.entity.RecuperacaoSenha;
import com.hospital.api.entity.Usuario;
import com.hospital.api.entity.Paciente;
import com.hospital.api.repository.RecuperacaoSenhaRepository;
import com.hospital.api.repository.UsuarioRepository;
import com.hospital.api.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecuperacaoSenhaService {

    private static final int EXPIRACAO_MINUTOS = 15;

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final RecuperacaoSenhaRepository recuperacaoSenhaRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Map<String, String> solicitarRecuperacao(EsqueciSenhaRequestDTO dto) {
        String cpfLimpo = dto.cpf().replaceAll("\\D", "");

        var usuarioOpt = usuarioRepository.findByCpf(cpfLimpo);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            recuperacaoSenhaRepository.findByUsuarioAndUtilizadoFalse(usuario)
                    .ifPresent(tokenAntigo -> {
                        tokenAntigo.setUtilizado(true);
                        recuperacaoSenhaRepository.save(tokenAntigo);
                    });

            String codigo = gerarCodigoDe6Digitos();
            RecuperacaoSenha recuperacao = new RecuperacaoSenha();
            recuperacao.setUsuario(usuario);
            recuperacao.setCodigoConfirmacao(codigo);
            recuperacao.setDataExpiracao(LocalDateTime.now().plusMinutes(EXPIRACAO_MINUTOS));
            recuperacao.setUtilizado(false);
            recuperacaoSenhaRepository.save(recuperacao);

            log.info("╔══════════════════════════════════════════════════════════╗");
            log.info("║  [SIMULAÇÃO DE E-MAIL] Recuperação de Senha — Cuidar+   ║");
            log.info("║  Destinatário: {}                                         ║", usuario.getEmail());
            log.info("║  Código de verificação: {}                                ║", codigo);
            log.info("║  Válido por {} minutos.                                   ║", EXPIRACAO_MINUTOS);
            log.info("╚══════════════════════════════════════════════════════════╝");

            return Map.of("emailMascarado", mascararEmail(usuario.getEmail()));
        }

        var pacienteOpt = pacienteRepository.findByCpf(cpfLimpo);
        if (pacienteOpt.isPresent()) {
            Paciente paciente = pacienteOpt.get();
            recuperacaoSenhaRepository.findByPacienteAndUtilizadoFalse(paciente)
                    .ifPresent(tokenAntigo -> {
                        tokenAntigo.setUtilizado(true);
                        recuperacaoSenhaRepository.save(tokenAntigo);
                    });

            String codigo = gerarCodigoDe6Digitos();
            RecuperacaoSenha recuperacao = new RecuperacaoSenha();
            recuperacao.setPaciente(paciente);
            recuperacao.setCodigoConfirmacao(codigo);
            recuperacao.setDataExpiracao(LocalDateTime.now().plusMinutes(EXPIRACAO_MINUTOS));
            recuperacao.setUtilizado(false);
            recuperacaoSenhaRepository.save(recuperacao);

            String emailPaciente = cpfLimpo + "@paciente.hospital.com";

            log.info("╔══════════════════════════════════════════════════════════╗");
            log.info("║  [SIMULAÇÃO DE E-MAIL] Recuperação de Senha — Cuidar+   ║");
            log.info("║  Destinatário: {}                                         ║", emailPaciente);
            log.info("║  Código de verificação: {}                                ║", codigo);
            log.info("║  Válido por {} minutos.                                   ║", EXPIRACAO_MINUTOS);
            log.info("╚══════════════════════════════════════════════════════════╝");

            return Map.of("emailMascarado", mascararEmail(emailPaciente));
        }

        throw new RuntimeException("Nenhum usuário ou paciente encontrado com este CPF.");
    }

    @Transactional
    public void resetarSenha(ResetarSenhaRequestDTO dto) {
        RecuperacaoSenha recuperacao = recuperacaoSenhaRepository
                .findByCodigoConfirmacao(dto.codigo())
                .orElseThrow(() -> new RuntimeException("Código de verificação inválido."));

        if (recuperacao.getUtilizado()) {
            throw new RuntimeException("Este código já foi utilizado. Solicite um novo.");
        }

        if (LocalDateTime.now().isAfter(recuperacao.getDataExpiracao())) {
            throw new RuntimeException("Código expirado. Solicite um novo código de verificação.");
        }

        if (recuperacao.getUsuario() != null) {
            Usuario usuario = recuperacao.getUsuario();
            usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));
            usuarioRepository.save(usuario);
            log.info("[RecuperacaoSenha] Senha redefinida com sucesso para o usuário CPF: {}", usuario.getCpf());
        } else if (recuperacao.getPaciente() != null) {
            Paciente paciente = recuperacao.getPaciente();
            paciente.setSenha(passwordEncoder.encode(dto.novaSenha()));
            pacienteRepository.save(paciente);
            log.info("[RecuperacaoSenha] Senha redefinida com sucesso para o paciente CPF: {}", paciente.getCpf());
        }

        recuperacao.setUtilizado(true);
        recuperacaoSenhaRepository.save(recuperacao);
    }

    private String gerarCodigoDe6Digitos() {
        SecureRandom random = new SecureRandom();
        int numero = 100000 + random.nextInt(900000);
        return String.valueOf(numero);
    }

    private String mascararEmail(String email) {
        if (email == null || !email.contains("@")) return "***@***.com";
        String[] partes = email.split("@");
        String usuario = partes[0];
        String dominio = partes[1];
        if (usuario.length() <= 1) return email;
        return usuario.charAt(0) + "****@" + dominio;
    }
}
