package com.hospital.api.service;

import com.hospital.api.dto.response.CategoriaResponseDTO;
import com.hospital.api.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository repository;

    public CategoriaService(CategoriaRepository repository) {
        this.repository = repository;
    }

    public List<CategoriaResponseDTO> listarTodas() {
        return repository.findAll()
                .stream()
                .map(CategoriaResponseDTO::new)
                .toList();
    }
}
