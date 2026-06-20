import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { apiAutenticada, API_BASE_URL } from '../services/authService';
import { avaliarChamado } from '../services/chamadoService';
import { useAuth } from '../context/AuthContext';

export interface Chamado {
  idChamado: number;
  observacao: string;
  status: 'PENDENTE' | 'ABERTO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'FINALIZADO' | 'CANCELADO';
  tipo: string;
  dataAbertura: string;
  leitoPaciente?: string;
  nomePaciente?: string;
  notaAvaliacao?: number;
  comentarioAvaliacao?: string;
}

export function useSolicitacoesViewModel() {
  const { paciente } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState<'ativos' | 'historico'>('ativos');
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [notaSelecionada, setNotaSelecionada] = useState<number>(5);
  const [comentarioAvaliacaoText, setComentarioAvaliacaoText] = useState('');
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  const carregarChamados = useCallback(async () => {
    if (!paciente?.idPaciente) return;
    try {
      setLoading(true);
      if (abaAtiva === 'ativos') {
        const response = await apiAutenticada.get<Chamado[]>(`/api/chamados/paciente/${paciente.idPaciente}`);

        const ativos = response.data.filter(
          (c) => c.status === 'ABERTO' || c.status === 'PENDENTE' || c.status === 'EM_ATENDIMENTO' || c.status === 'CONCLUIDO'
        );
        const ordenados = ativos.sort(
          (a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime()
        );
        setChamados(ordenados);
      } else {
        const response = await apiAutenticada.get<Chamado[]>(`/api/chamados/historico/${paciente.idPaciente}`);
        const ordenados = response.data.sort(
          (a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime()
        );
        setChamados(ordenados);
      }
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
    } finally {
      setLoading(false);
    }
  }, [paciente?.idPaciente, abaAtiva]);

  useEffect(() => {
    carregarChamados();
  }, [carregarChamados]);

  // ─── abrirModalAvaliacao declarada ANTES do useEffect do WebSocket ───
  // Isso é necessário pois o useEffect do WebSocket a referencia no array de
  // dependências e no seu callback — com `const`, não há hoisting de valor.
  const abrirModalAvaliacao = useCallback((chamado: Chamado) => {
    setChamadoSelecionado(chamado);
    setNotaSelecionada(5);
    setComentarioAvaliacaoText('');
    setModalVisivel(true);
  }, []);

  useEffect(() => {
    if (!paciente?.idPaciente) return;

    const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/ws';
    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function conectar() {
      console.log('Conectando ao WebSocket de solicitações:', wsUrl);
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket conectado com sucesso.');
        socket?.send('CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\u0000');
      };

      socket.onmessage = (event) => {
        const data = event.data;

        if (data.startsWith('CONNECTED')) {
          console.log('STOMP conectado. Inscrevendo nos tópicos...');
          socket?.send(`SUBSCRIBE\nid:sub-0\ndestination:/topic/paciente/${paciente?.idPaciente}\n\n\u0000`);
          socket?.send(`SUBSCRIBE\nid:sub-1\ndestination:/topic/notificacoes/${paciente?.idPaciente}\n\n\u0000`);
          return;
        }

        const isPacienteTopic = data.includes(`destination:/topic/paciente/${paciente?.idPaciente}`);
        const isNotificacaoTopic = data.includes(`destination:/topic/notificacoes/${paciente?.idPaciente}`);

        if (data.includes('MESSAGE') && (isPacienteTopic || isNotificacaoTopic)) {
          try {
            const bodyStartIndex = data.indexOf('\n\n') + 2;
            const bodyEndIndex = data.lastIndexOf('\u0000');
            const bodyStr = data.substring(bodyStartIndex, bodyEndIndex).trim();
            const chamadoAtualizado: Chamado = JSON.parse(bodyStr);

            console.log('Chamado atualizado recebido via WS:', chamadoAtualizado);

            setChamados((prev) => {
              const existe = prev.some((c) => c.idChamado === chamadoAtualizado.idChamado);

              if (abaAtiva === 'ativos') {
                const aindaAtivo = chamadoAtualizado.status === 'ABERTO' ||
                                   chamadoAtualizado.status === 'PENDENTE' ||
                                   chamadoAtualizado.status === 'EM_ATENDIMENTO' ||
                                   chamadoAtualizado.status === 'CONCLUIDO';
                if (aindaAtivo) {
                  if (existe) {
                    return prev.map((c) => c.idChamado === chamadoAtualizado.idChamado ? chamadoAtualizado : c);
                  } else {
                    return [chamadoAtualizado, ...prev];
                  }
                } else {
                  return prev.filter((c) => c.idChamado !== chamadoAtualizado.idChamado);
                }
              } else {
                const finalizado = chamadoAtualizado.status === 'FINALIZADO' ||
                                   chamadoAtualizado.status === 'CANCELADO';
                if (finalizado) {
                  if (existe) {
                    return prev.map((c) => c.idChamado === chamadoAtualizado.idChamado ? chamadoAtualizado : c);
                  } else {
                    return [chamadoAtualizado, ...prev];
                  }
                } else {
                  return prev.filter((c) => c.idChamado !== chamadoAtualizado.idChamado);
                }
              }
            });

            if (chamadoAtualizado.status === 'CONCLUIDO') {
              Alert.alert(
                'Atendimento Concluído! ✅',
                'Por favor, avalie o serviço prestado para encerrarmos o seu chamado.',
                [{ text: 'Avaliar Agora', onPress: () => abrirModalAvaliacao(chamadoAtualizado) }]
              );
            }

            carregarChamados();
          } catch (e) {
            console.error('Erro ao processar mensagem do WebSocket:', e);
          }
        }
      };

      socket.onerror = (error) => {
        console.warn('Erro no WebSocket:', error);
      };

      socket.onclose = (e) => {
        console.log('WebSocket fechado. Reconectando...');
        reconnectTimeout = setTimeout(() => {
          conectar();
        }, 5000);
      };
    }

    conectar();

    return () => {
      if (socket) {
        socket.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [paciente?.idPaciente, abaAtiva, carregarChamados, abrirModalAvaliacao]);

  const enviarAvaliacaoHandler = useCallback(async () => {
    if (!chamadoSelecionado) return;
    if (notaSelecionada < 1 || notaSelecionada > 5) {
      Alert.alert('Nota inválida', 'Por favor, dê uma nota de 1 a 5 estrelas.');
      return;
    }

    setEnviandoAvaliacao(true);
    try {
      await avaliarChamado(chamadoSelecionado.idChamado, notaSelecionada, comentarioAvaliacaoText);
      Alert.alert('Avaliação enviada', 'Obrigado por nos ajudar a melhorar o atendimento!');
      setModalVisivel(false);
      setChamadoSelecionado(null);
      carregarChamados();
    } catch (error) {
      Alert.alert('Falha', 'Não foi possível salvar sua avaliação. Tente novamente mais tarde.');
    } finally {
      setEnviandoAvaliacao(false);
    }
  }, [chamadoSelecionado, notaSelecionada, comentarioAvaliacaoText, carregarChamados]);

  const handleFinalizarChamado = useCallback(async (item: Chamado) => {
    Alert.alert(
      'Finalizar Chamado',
      'Confirma que você foi atendido e deseja encerrar este chamado?',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Sim, Finalizar',
          style: 'default',
          onPress: async () => {
            try {
              const response = await apiAutenticada.patch<Chamado>(`/api/chamados/${item.idChamado}/finalizar`);
              Alert.alert('Sucesso', 'Atendimento confirmado e chamado finalizado!');
              carregarChamados();
              // Abre imediatamente o modal de avaliação para o chamado recém-finalizado
              abrirModalAvaliacao(response.data);
            } catch (error) {
              console.error('Erro ao finalizar chamado:', error);
              Alert.alert('Erro', 'Não foi possível finalizar o chamado.');
            }
          }
        }
      ]
    );
  }, [carregarChamados, abrirModalAvaliacao]);

  return {
    abaAtiva,
    setAbaAtiva,
    chamados,
    loading,
    modalVisivel,
    setModalVisivel,
    chamadoSelecionado,
    notaSelecionada,
    setNotaSelecionada,
    comentarioAvaliacaoText,
    setComentarioAvaliacaoText,
    enviandoAvaliacao,
    carregarChamados,
    abrirModalAvaliacao,
    enviarAvaliacaoHandler,
    handleFinalizarChamado,
  };
}
