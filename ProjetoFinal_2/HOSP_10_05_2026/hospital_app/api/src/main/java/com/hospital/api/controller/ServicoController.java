package com.hospital.api.controller;

import com.hospital.api.dto.response.ServicoResponseDTO;
import com.hospital.api.service.ServicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/servicos")
public class ServicoController {

    private final ServicoService service;

    public ServicoController(ServicoService service) {
        this.service = service;
    }

    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<ServicoResponseDTO>> listarServicosPorCategoria(@PathVariable Integer idCategoria) {
        return ResponseEntity.ok(service.listarPorCategoria(idCategoria));
    }
}
