package com.hospital.api.controller;

import com.hospital.api.dto.request.DadosTriagemDTO;
import com.hospital.api.dto.request.DadosListagemTriagemDTO;
import com.hospital.api.dto.response.TriagemResponseDTO;
import com.hospital.api.entity.Triagem;
import com.hospital.api.enums.NivelUrgencia;
import com.hospital.api.repository.TriagemRepository;
import com.hospital.api.service.TriagemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/triagem")
@CrossOrigin(originPatterns = "*")
public class TriagemController {

    private final TriagemRepository triagemRepository;
    private final TriagemService triagemService;

    public TriagemController(TriagemRepository triagemRepository, TriagemService triagemService) {
        this.triagemRepository = triagemRepository;
        this.triagemService = triagemService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<TriagemResponseDTO> receberTriagem(@RequestBody @Valid DadosTriagemDTO dados) {
        TriagemResponseDTO resposta = triagemService.registrarTriagem(dados);
        return ResponseEntity.ok(resposta);
    }

    @GetMapping
    public ResponseEntity<List<DadosListagemTriagemDTO>> listar() {
        var lista = triagemRepository.findAll()
                .stream()
                .map(DadosListagemTriagemDTO::new)
                .sorted(Comparator.comparingInt(this::pesoUrgencia))
                .toList();

        return ResponseEntity.ok(lista);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> atender(@PathVariable Long id) {
        if (!triagemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        triagemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private int pesoUrgencia(DadosListagemTriagemDTO dto) {
        if (dto.urgencia() == null) return 4;
        return switch (dto.urgencia()) {
            case VERMELHO -> 1;
            case AMARELO  -> 2;
            case VERDE    -> 3;
        };
    }
}
