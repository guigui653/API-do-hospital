package com.hospital.api.service;

import com.hospital.api.dto.request.QuartoRequestDTO;
import com.hospital.api.dto.response.QuartoResponseDTO;
import com.hospital.api.entity.Quarto;
import com.hospital.api.repository.QuartoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuartoService {

    @Autowired
    private QuartoRepository repository;

    public List<QuartoResponseDTO> listarTodos() {
        return repository.findAll().stream().map(QuartoResponseDTO::new).collect(Collectors.toList());
    }

    public QuartoResponseDTO buscarPorId(Integer id) {
        Quarto quarto = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Quarto não encontrado"));
        return new QuartoResponseDTO(quarto);
    }

    public QuartoResponseDTO cadastrar(QuartoRequestDTO dados) {
        Quarto quarto = new Quarto();
        quarto.setNumero(dados.numero());
        quarto.setAndar(dados.andar());
        quarto.setAtivo(dados.ativo());
        repository.save(quarto);
        return new QuartoResponseDTO(quarto);
    }
}
