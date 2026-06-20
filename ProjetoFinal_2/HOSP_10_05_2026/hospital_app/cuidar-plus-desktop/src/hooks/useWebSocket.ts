import { useEffect, useRef, useCallback } from 'react';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChamadoWS } from '../types/chamado';

export type { ChamadoWS };

export interface UsePainelWebSocketOptions {

  onChamadoRecebido: (chamado: ChamadoWS) => void;

  apiUrl?: string;

  ativo?: boolean;
}

export function usePainelWebSocket({
  onChamadoRecebido,
  apiUrl = 'http://localhost:8080',
  ativo = true,
}: UsePainelWebSocketOptions): void {
  const clientRef        = useRef<Client | null>(null);
  const subscriptionRef  = useRef<StompSubscription | null>(null);
  const callbackRef      = useRef(onChamadoRecebido);

  useEffect(() => {
    callbackRef.current = onChamadoRecebido;
  }, [onChamadoRecebido]);

  const conectar = useCallback(() => {
    if (!ativo) return;

    console.log('[Painel WS] 🔌 Conectando via STOMP/SockJS...');

    const client = new Client({

      webSocketFactory: () => new SockJS(`${apiUrl}/ws-sock`),

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      debug: (msg) => console.debug('[Painel WS]', msg),

      onConnect: () => {
        console.log('[Painel WS] ✅ Conectado! Subscrito em /topic/painel');

        subscriptionRef.current = client.subscribe(
          '/topic/painel',
          (message: IMessage) => {
            try {
              const chamado: ChamadoWS = JSON.parse(message.body);
              console.log('[Painel WS] 📩 Chamado recebido:', chamado);
              callbackRef.current(chamado);
            } catch (err) {
              console.error('[Painel WS] ❌ Erro ao parsear mensagem:', err);
            }
          }
        );
      },

      onStompError: (frame) => {
        console.error('[Painel WS] ❌ Erro STOMP:', frame);
      },

      onDisconnect: () => {
        console.warn('[Painel WS] 🔴 Desconectado.');
        subscriptionRef.current = null;
      },
    });

    client.activate();
    clientRef.current = client;
  }, [ativo, apiUrl]);

  useEffect(() => {
    conectar();

    return () => {

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (clientRef.current?.active) {
        console.log('[Painel WS] 🧹 Desconectando (componente desmontado).');
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [conectar]);
}
