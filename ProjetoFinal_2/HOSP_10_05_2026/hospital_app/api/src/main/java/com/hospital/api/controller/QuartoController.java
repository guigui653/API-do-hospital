package com.hospital.api.controller;

import com.hospital.api.dto.request.QuartoRequestDTO;
import com.hospital.api.dto.response.QuartoResponseDTO;
import com.hospital.api.service.QuartoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quartos")
public class QuartoController {

    @Autowired
    private QuartoService service;

    @GetMapping
    public ResponseEntity<List<QuartoResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuartoResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<QuartoResponseDTO> cadastrar(@RequestBody @Valid QuartoRequestDTO dados) {
        return ResponseEntity.ok(service.cadastrar(dados));
    }
}
