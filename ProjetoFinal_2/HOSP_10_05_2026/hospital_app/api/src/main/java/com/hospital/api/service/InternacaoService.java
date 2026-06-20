package com.hospital.api.service;

import com.hospital.api.dto.request.InternacaoRequestDTO;
import com.hospital.api.dto.response.InternacaoResponseDTO;
import com.hospital.api.entity.Internacao;
import com.hospital.api.entity.Leito;
import com.hospital.api.entity.Paciente;
import com.hospital.api.repository.InternacaoRepository;
import com.hospital.api.repository.LeitoRepository;
import com.hospital.api.repository.PacienteRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InternacaoService {

    @Autowired
    private InternacaoRepository repository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private LeitoRepository leitoRepository;

    public List<InternacaoResponseDTO> listarTodos() {
        return repository.findAll().stream().map(InternacaoResponseDTO::new).collect(Collectors.toList());
    }

    public InternacaoResponseDTO buscarPorId(Integer id) {
        Internacao internacao = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Internação não encontrada"));
        return new InternacaoResponseDTO(internacao);
    }

    public InternacaoResponseDTO cadastrar(InternacaoRequestDTO dados) {

        Paciente paciente = pacienteRepository.findById(dados.idPaciente())
                .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado"));

        Leito leito = leitoRepository.findById(dados.idLeito())
                .orElseThrow(() -> new EntityNotFoundException("Leito não encontrado"));

        Internacao internacao = new Internacao();
        internacao.setPaciente(paciente);
        internacao.setLeito(leito);
        internacao.setMotivoInternacao(dados.motivo());
        internacao.setDataEntrada(LocalDate.now());
        internacao.setCriadoEm(LocalDateTime.now());
        internacao.setAtivo(true);

        repository.save(internacao);

        leito.setOcupado(true);
        leitoRepository.save(leito);

        return new InternacaoResponseDTO(internacao);
    }
}
