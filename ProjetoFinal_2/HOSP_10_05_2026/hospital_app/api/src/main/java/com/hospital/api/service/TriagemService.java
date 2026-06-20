package com.hospital.api.service;

import com.hospital.api.dto.request.DadosTriagemDTO;
import com.hospital.api.dto.response.TriagemResponseDTO;
import com.hospital.api.entity.Paciente;
import com.hospital.api.entity.Triagem;
import com.hospital.api.infra.utils.GeradorSenhaUtils;
import com.hospital.api.repository.PacienteRepository;
import com.hospital.api.repository.TriagemRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TriagemService {

    private final TriagemRepository triagemRepository;
    private final PacienteRepository pacienteRepository;
    private final PasswordEncoder passwordEncoder;

    public TriagemService(
            TriagemRepository triagemRepository,
            PacienteRepository pacienteRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.triagemRepository = triagemRepository;
        this.pacienteRepository = pacienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public TriagemResponseDTO registrarTriagem(DadosTriagemDTO dados) {

        String cpfLimpo = dados.cpf().replaceAll("\\D", "");

        Paciente paciente = pacienteRepository.findByCpf(cpfLimpo)
                .orElseGet(() -> criarNovoPaciente(dados.pacienteNome(), cpfLimpo));

        String senhaEmClaro = null;
        boolean usuarioCriado = false;

        if (paciente.getSenha() == null || paciente.getSenha().isBlank()) {
            senhaEmClaro = cpfLimpo.substring(0, 3);
            paciente.setSenha(passwordEncoder.encode(senhaEmClaro));
            pacienteRepository.save(paciente);
            usuarioCriado = true;
        }

        Triagem triagem = new Triagem(dados);
        triagem.setPaciente(paciente);
        Triagem triаgemSalva = triagemRepository.save(triagem);

        String mensagem = usuarioCriado
                ? "Triagem registrada! Acesso criado — entregue as credenciais ao paciente."
                : "Triagem registrada! O paciente já possui acesso ao aplicativo.";

        return new TriagemResponseDTO(
                triаgemSalva.getIdtriagem(),
                paciente.getIdPaciente(),
                paciente.getNome(),
                cpfLimpo,
                senhaEmClaro,
                usuarioCriado,
                mensagem
        );
    }

    private Paciente criarNovoPaciente(String nome, String cpfLimpo) {
        Paciente p = new Paciente();
        p.setNome(nome);
        p.setCpf(cpfLimpo);
        p.setAtivo(true);
        p.setCriadoEm(LocalDateTime.now());
        return pacienteRepository.save(p);
    }

}
