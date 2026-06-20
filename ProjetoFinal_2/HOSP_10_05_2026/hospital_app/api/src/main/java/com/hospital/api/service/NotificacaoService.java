package com.hospital.api.service;

import com.hospital.api.entity.Notificacao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notificarPaciente(Long idPaciente, Notificacao notificacao) {
        String destino = "/topic/paciente/" + idPaciente;

        log.info("[WebSocket] Enviando notificação para o canal '{}': {}",
                destino, notificacao.getMensagem());

        messagingTemplate.convertAndSend(destino, notificacao);
    }

    public void notificarPaciente(Long idPaciente, String mensagem) {
        String destino = "/topic/paciente/" + idPaciente;

        log.info("[WebSocket] Enviando mensagem de texto para o canal '{}': {}",
                destino, mensagem);

        messagingTemplate.convertAndSend(destino, mensagem);
    }
}
