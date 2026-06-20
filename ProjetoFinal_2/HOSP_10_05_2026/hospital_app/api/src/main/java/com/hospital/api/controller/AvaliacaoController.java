package com.hospital.api.controller;

import com.hospital.api.dto.request.DadosCadastroAvaliacaoDTO;
import com.hospital.api.entity.Avaliacao;
import com.hospital.api.repository.AvaliacaoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoRepository repository;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroAvaliacaoDTO dados) {
        var avaliacao = new Avaliacao();
        avaliacao.setIdInternacao(dados.idInternacao());
        avaliacao.setNota(dados.nota());
        avaliacao.setComentario(dados.comentario());

        repository.save(avaliacao);

        return ResponseEntity.ok("{\"message\": \"Avaliação registrada com sucesso! Obrigado pelo seu feedback.\"}");
    }
}
