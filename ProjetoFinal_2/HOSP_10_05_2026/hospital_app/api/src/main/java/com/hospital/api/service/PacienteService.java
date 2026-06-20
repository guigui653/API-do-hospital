package com.hospital.api.service;

import com.hospital.api.dto.request.LoginRequestDTO;
import com.hospital.api.dto.request.PacienteAtualizacaoDTO;
import com.hospital.api.dto.request.PacienteRequestDTO;
import com.hospital.api.dto.response.PacienteResponseDTO;
import com.hospital.api.entity.Paciente;
import com.hospital.api.repository.PacienteRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final PasswordEncoder passwordEncoder;

    public PacienteService(PacienteRepository pacienteRepository, PasswordEncoder passwordEncoder) {
        this.pacienteRepository = pacienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public PacienteResponseDTO cadastrar(PacienteRequestDTO dto) {
        if (dto.cpf() == null || dto.cpf().isBlank()) {
            throw new IllegalArgumentException("Erro: O CPF é obrigatório para cadastrar o paciente!");
        }

        var cpfLimpo = dto.cpf().replaceAll("\\D", "");

        if (cpfLimpo.length() < 11) {
            throw new IllegalArgumentException("Erro: CPF inválido! Digite todos os 11 números.");
        }

        String senhaInicial = cpfLimpo.substring(0, 3);

        Paciente paciente = new Paciente();
        paciente.setNome(dto.nome());
        paciente.setCpf(cpfLimpo);
        paciente.setSenha(passwordEncoder.encode(senhaInicial));
        paciente.setTelefoneContato(dto.telefoneContato());
        paciente.setNumeroProntuario(dto.numeroProntuario());
        paciente.setDataNascimento(dto.dataNascimento());
        paciente.setSexo(dto.sexo());
        paciente.setNomeResponsavel(dto.nomeResponsavel());
        paciente.setTelefoneResponsavel(dto.telefoneResponsavel());
        paciente.setAtivo(true);

        pacienteRepository.save(paciente);

        return new PacienteResponseDTO(paciente);
    }

    @Transactional(readOnly = true)
    public PacienteResponseDTO login(LoginRequestDTO dados) {
        var cpfLimpo = dados.cpf().replaceAll("\\D", "");

        Paciente paciente = pacienteRepository.findByCpf(cpfLimpo)
                .orElseThrow(() -> new RuntimeException("Erro: CPF não encontrado!"));

        if (paciente.getSenha() == null || !passwordEncoder.matches(dados.senha(), paciente.getSenha())) {
            throw new RuntimeException("Erro: Senha incorreta!");
        }

        return new PacienteResponseDTO(paciente);
    }

    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> listarTodos() {
        return pacienteRepository.findAll()
                .stream()
                .map(PacienteResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public PacienteResponseDTO buscarPorId(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        return new PacienteResponseDTO(paciente);
    }

    @Transactional
    public PacienteResponseDTO atualizar(Long id, PacienteAtualizacaoDTO dto) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado para atualização"));

        if (dto.telefoneContato() != null) {
            paciente.setTelefoneContato(dto.telefoneContato());
        }
        if (dto.nomeResponsavel() != null) {
            paciente.setNomeResponsavel(dto.nomeResponsavel());
        }
        if (dto.telefoneResponsavel() != null) {
            paciente.setTelefoneResponsavel(dto.telefoneResponsavel());
        }

        pacienteRepository.save(paciente);
        return new PacienteResponseDTO(paciente);
    }

    @Transactional
    public void deletar(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado para exclusão"));

        paciente.setAtivo(false);

        pacienteRepository.save(paciente);
    }
}
