package com.hospital.api.service;

import com.hospital.api.dto.request.LeitoRequestDTO;
import com.hospital.api.dto.response.LeitoResponseDTO;
import com.hospital.api.entity.Leito;
import com.hospital.api.repository.LeitoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeitoService {

    @Autowired
    private LeitoRepository repository;

    public List<LeitoResponseDTO> listarTodos() {
        return repository.findAll().stream().map(LeitoResponseDTO::new).collect(Collectors.toList());
    }

    public LeitoResponseDTO buscarPorId(Integer id) {
        Leito leito = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Leito não encontrado"));
        return new LeitoResponseDTO(leito);
    }

    public LeitoResponseDTO cadastrar(LeitoRequestDTO dados) {
        Leito leito = new Leito();
        leito.setNumero(dados.numero());
        leito.setOcupado(dados.ocupado());
        leito.setAtivo(dados.ativo());
        repository.save(leito);
        return new LeitoResponseDTO(leito);
    }
}
