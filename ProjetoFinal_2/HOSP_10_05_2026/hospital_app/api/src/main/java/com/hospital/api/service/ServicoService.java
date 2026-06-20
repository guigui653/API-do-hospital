package com.hospital.api.service;

import com.hospital.api.dto.response.ServicoResponseDTO;
import com.hospital.api.repository.ServicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicoService {

    private final ServicoRepository repository;

    public ServicoService(ServicoRepository repository) {
        this.repository = repository;
    }

    public List<ServicoResponseDTO> listarPorCategoria(Integer idCategoria) {

        return repository.findByCategoriaIdCategoria(idCategoria)
                .stream()
                .map(ServicoResponseDTO::new)
                .toList();
    }
}
