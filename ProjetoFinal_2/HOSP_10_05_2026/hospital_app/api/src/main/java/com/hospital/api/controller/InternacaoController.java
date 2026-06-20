package com.hospital.api.controller;

import com.hospital.api.dto.request.InternacaoRequestDTO;
import com.hospital.api.dto.response.InternacaoResponseDTO;
import com.hospital.api.service.InternacaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internacoes")
public class InternacaoController {

    @Autowired
    private InternacaoService service;

    @GetMapping
    public ResponseEntity<List<InternacaoResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternacaoResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<InternacaoResponseDTO> cadastrar(@RequestBody @Valid InternacaoRequestDTO dados) {
        return ResponseEntity.ok(service.cadastrar(dados));
    }
}
