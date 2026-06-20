package com.hospital.api.controller;

import com.hospital.api.dto.request.AvaliacaoRequestDTO;
import com.hospital.api.dto.request.ChamadoAtualizacaoDTO;
import com.hospital.api.dto.request.ChamadoRequestDTO;
import com.hospital.api.dto.request.PedidoRapidoRequestDTO;
import com.hospital.api.dto.request.FinalizarChamadoRequestDTO;
import com.hospital.api.dto.response.ChamadoResponseDTO;
import com.hospital.api.enums.StatusChamado;
import com.hospital.api.enums.TipoChamado;
import com.hospital.api.service.ChamadoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/chamados", "/api/chamados"})
@CrossOrigin(originPatterns = "*")
public class ChamadoController {

    private final ChamadoService chamadoService;
    private final SimpMessagingTemplate ws;

    public ChamadoController(ChamadoService chamadoService, SimpMessagingTemplate ws) {
        this.chamadoService = chamadoService;
        this.ws = ws;
    }

    @PostMapping
    public ResponseEntity<ChamadoResponseDTO> abrirChamado(
            @RequestBody @Valid ChamadoRequestDTO dados) {

        ChamadoResponseDTO chamado = chamadoService.abrirChamado(dados);

        ws.convertAndSend("/topic/painel", chamado);

        return ResponseEntity.status(HttpStatus.CREATED).body(chamado);
    }

    @PostMapping("/pedido-rapido")
    public ResponseEntity<ChamadoResponseDTO> abrirPedidoRapido(
            @RequestBody @Valid PedidoRapidoRequestDTO dto) {

        ChamadoResponseDTO chamado = chamadoService.abrirPedidoRapido(dto);

        ws.convertAndSend("/topic/painel", chamado);

        return ResponseEntity.status(HttpStatus.CREATED).body(chamado);
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<ChamadoResponseDTO> confirmarAtendimento(@PathVariable Long id) {
        ChamadoResponseDTO chamado = chamadoService.confirmarAtendimento(id);

        if (chamado.idPaciente() != null) {
            ws.convertAndSend(
                "/topic/paciente/" + chamado.idPaciente(),
                chamado
            );
        }

        ws.convertAndSend("/topic/painel", chamado);

        return ResponseEntity.ok(chamado);
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<ChamadoResponseDTO> finalizarAtendimento(
            @PathVariable Long id,
            @RequestBody @Valid FinalizarChamadoRequestDTO dados) {

        ChamadoResponseDTO chamado = chamadoService.finalizarAtendimento(id, dados);

        if (chamado.idPaciente() != null) {
            ws.convertAndSend(
                "/topic/paciente/" + chamado.idPaciente(),
                chamado
            );
        }

        ws.convertAndSend("/topic/painel", chamado);

        return ResponseEntity.ok(chamado);
    }

    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<ChamadoResponseDTO> finalizarChamadoPaciente(@PathVariable Long id) {
        ChamadoResponseDTO chamado = chamadoService.finalizarChamadoPaciente(id);

        if (chamado.idPaciente() != null) {
            ws.convertAndSend(
                "/topic/paciente/" + chamado.idPaciente(),
                chamado
            );
        }

        ws.convertAndSend("/topic/painel", chamado);

        return ResponseEntity.ok(chamado);
    }

    @GetMapping
    public ResponseEntity<List<ChamadoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(chamadoService.listarTodos());
    }

    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<List<ChamadoResponseDTO>> listarPorPaciente(@PathVariable Long idPaciente) {
        return ResponseEntity.ok(chamadoService.listarPorPaciente(idPaciente));
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<ChamadoResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(chamadoService.listarAtivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChamadoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(chamadoService.buscarPorId(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ChamadoResponseDTO>> listarPorStatus(
            @PathVariable StatusChamado status) {
        return ResponseEntity.ok(chamadoService.listarPorStatus(status));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<ChamadoResponseDTO>> listarPorTipo(
            @PathVariable TipoChamado tipo) {
        return ResponseEntity.ok(chamadoService.listarPorTipo(tipo));
    }

    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<ChamadoResponseDTO>> listarPorCategoria(
            @PathVariable Integer idCategoria) {
        return ResponseEntity.ok(chamadoService.listarPorCategoria(idCategoria));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChamadoResponseDTO> atualizarChamado(
            @PathVariable Long id,
            @RequestBody ChamadoAtualizacaoDTO dados) {
        return ResponseEntity.ok(chamadoService.atualizarChamado(id, dados));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarChamado(@PathVariable Long id) {
        chamadoService.deletarChamado(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/avaliar")
    public ResponseEntity<ChamadoResponseDTO> avaliarChamado(
            @PathVariable Long id,
            @RequestBody @Valid AvaliacaoRequestDTO dados) {

        ChamadoResponseDTO chamado = chamadoService.avaliarChamado(id, dados);

        ws.convertAndSend("/topic/painel", chamado);

        if (chamado.idPaciente() != null) {
            ws.convertAndSend("/topic/paciente/" + chamado.idPaciente(), chamado);
        }

        return ResponseEntity.ok(chamado);
    }

    @GetMapping("/historico/{idPaciente}")
    public ResponseEntity<List<ChamadoResponseDTO>> obterHistorico24Horas(
            @PathVariable Long idPaciente) {
        return ResponseEntity.ok(chamadoService.obterHistorico24Horas(idPaciente));
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "ok", "websocket", "ws://localhost:8080/ws"));
    }
}
