package com.hospital.api.controller;

import com.hospital.api.dto.request.EsqueciSenhaRequestDTO;
import com.hospital.api.dto.request.ResetarSenhaRequestDTO;
import com.hospital.api.service.RecuperacaoSenhaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RecuperacaoSenhaService recuperacaoSenhaService;

    @PostMapping("/esqueci-senha")
    public ResponseEntity<Map<String, String>> esqueciSenha(@RequestBody @Valid EsqueciSenhaRequestDTO dto) {
        try {
            Map<String, String> resposta = recuperacaoSenhaService.solicitarRecuperacao(dto);
            return ResponseEntity.ok(resposta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/resetar-senha")
    public ResponseEntity<Map<String, String>> resetarSenha(@RequestBody @Valid ResetarSenhaRequestDTO dto) {
        try {
            recuperacaoSenhaService.resetarSenha(dto);
            return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso! Você já pode fazer login."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}
