package com.hospital.api.controller;

import com.hospital.api.dto.request.LeitoRequestDTO;
import com.hospital.api.dto.response.LeitoResponseDTO;
import com.hospital.api.service.LeitoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leitos")
public class LeitoController {

    @Autowired
    private LeitoService service;

    @GetMapping
    public ResponseEntity<List<LeitoResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeitoResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<LeitoResponseDTO> cadastrar(@RequestBody @Valid LeitoRequestDTO dados) {
        return ResponseEntity.ok(service.cadastrar(dados));
    }
}
