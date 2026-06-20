package com.hospital.api.controller;

import com.hospital.api.dto.request.DadosAutenticacaoDTO;
import com.hospital.api.dto.response.TokenDTO;
import com.hospital.api.entity.Paciente;
import com.hospital.api.entity.Usuario;
import com.hospital.api.infra.security.TokenService;
import com.hospital.api.repository.PacienteRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(originPatterns = "*")
public class AutenticacaoController {

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PacienteRepository pacienteRepository;

    @PostMapping({"/pacientes/login", "/api/auth/login"})
    public ResponseEntity<TokenDTO> efetuarLogin(@RequestBody @Valid DadosAutenticacaoDTO dados) {
        try {

            var cpf = dados.cpf().replaceAll("\\D", "");
            if (cpf.isBlank()) {
                throw new AuthenticationCredentialsNotFoundException("CPF vazio");
            }

            var authenticationToken = new UsernamePasswordAuthenticationToken(cpf, dados.senha());
            var authentication = manager.authenticate(authenticationToken);

            var principal = authentication.getPrincipal();
            String tokenJWT;
            Long idPaciente = null;
            String nome;
            String leito = null;

            if (principal instanceof Usuario usuario) {
                tokenJWT = tokenService.gerarToken(usuario.getCpf());
                nome = usuario.getNome();

                Paciente paciente = pacienteRepository.findByCpf(usuario.getCpf()).orElse(null);
                if (paciente != null) {
                    idPaciente = paciente.getIdPaciente();
                    leito = paciente.getLeito();
                }
            } else if (principal instanceof Paciente paciente) {
                tokenJWT = tokenService.gerarToken(paciente.getCpf());
                idPaciente = paciente.getIdPaciente();
                nome = paciente.getNome();
                leito = paciente.getLeito();
            } else {
                throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException("Principal de autenticação inválido.");
            }

            return ResponseEntity.ok(new TokenDTO(tokenJWT, idPaciente, nome, leito));

        } catch (AuthenticationException e) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
