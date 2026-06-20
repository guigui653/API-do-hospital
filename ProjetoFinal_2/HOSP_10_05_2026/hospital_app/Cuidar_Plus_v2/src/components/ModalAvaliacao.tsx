import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─────────────────────────────────────────────────────────────────────────────
// Props do componente
// ─────────────────────────────────────────────────────────────────────────────
interface ModalAvaliacaoProps {
  /** Controla a visibilidade do modal */
  visivel: boolean;
  /** Chamada quando o usuário fecha o modal sem enviar */
  onFechar: () => void;
  /**
   * Chamada quando o usuário confirma a avaliação.
   * @param nota - Nota de 1 a 5 estrelas
   * @param comentario - Comentário opcional
   */
  onEnviarAvaliacao: (nota: number, comentario: string) => Promise<void> | void;
  /** Título opcional exibido no topo do modal (ex: tipo do chamado) */
  tituloChamado?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente ModalAvaliacao
//
// Componente reutilizável de avaliação com estrelas (1–5) e campo de
// comentário opcional. Integra-se ao useSolicitacoesViewModel via
// onEnviarAvaliacao, que chama avaliarChamado() em chamadoService.ts.
// ─────────────────────────────────────────────────────────────────────────────
export default function ModalAvaliacao({
  visivel,
  onFechar,
  onEnviarAvaliacao,
  tituloChamado,
}: ModalAvaliacaoProps) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  // ── Envio ──────────────────────────────────────────────────────────────────
  const handleEnviar = async () => {
    if (nota === 0) {
      Alert.alert('Aviso', 'Por favor, selecione pelo menos 1 estrela.');
      return;
    }

    setEnviando(true);
    try {
      await onEnviarAvaliacao(nota, comentario);
      // Limpa o estado interno após envio bem-sucedido
      setNota(0);
      setComentario('');
    } finally {
      setEnviando(false);
    }
  };

  const handleFechar = () => {
    if (enviando) return; // impede fechar enquanto está enviando
    setNota(0);
    setComentario('');
    onFechar();
  };

  // ── Seletor de estrelas ────────────────────────────────────────────────────
  const renderEstrelas = () =>
    [1, 2, 3, 4, 5].map((estrela) => (
      <TouchableOpacity
        key={estrela}
        onPress={() => setNota(estrela)}
        style={styles.estrelaTouchable}
        disabled={enviando}
        activeOpacity={0.7}
      >
        <Ionicons
          name={estrela <= nota ? 'star' : 'star-outline'}
          size={38}
          color="#FFB000"
        />
      </TouchableOpacity>
    ));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      onRequestClose={handleFechar}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}
          >
            <View style={styles.caixaModal}>

              {/* Cabeçalho */}
              <View style={styles.cabecalho}>
                <Text style={styles.titulo}>Avaliar Atendimento</Text>
                <TouchableOpacity
                  onPress={handleFechar}
                  style={styles.botaoFechar}
                  disabled={enviando}
                >
                  <Ionicons name="close" size={22} color="#5A7572" />
                </TouchableOpacity>
              </View>

              {/* Subtítulo com o tipo do chamado (opcional) */}
              {tituloChamado ? (
                <View style={styles.boxTipoChamado}>
                  <Text style={styles.textTipoChamado}>
                    {tituloChamado.replace(/_/g, ' ')}
                  </Text>
                </View>
              ) : null}

              {/* Pergunta de nota */}
              <Text style={styles.pergunta}>
                Qual nota você dá para este atendimento?
              </Text>

              {/* Estrelas */}
              <View style={styles.containerEstrelas}>{renderEstrelas()}</View>

              {/* Campo de comentário */}
              <Text style={styles.pergunta}>
                Deixe um comentário (opcional)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Conte-nos brevemente como foi sua experiência..."
                placeholderTextColor="#9DB8B5"
                multiline
                numberOfLines={3}
                maxLength={150}
                value={comentario}
                onChangeText={setComentario}
                editable={!enviando}
              />

              {/* Botões */}
              <View style={styles.botoesContainer}>
                <TouchableOpacity
                  style={styles.botaoVoltar}
                  onPress={handleFechar}
                  disabled={enviando}
                  activeOpacity={0.8}
                >
                  <Text style={styles.textoBotaoVoltar}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.botaoEnviar, enviando && styles.botaoDesabilitado]}
                  onPress={handleEnviar}
                  disabled={enviando}
                  activeOpacity={0.8}
                >
                  {enviando ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.textoBotaoEnviar}>Enviar Avaliação</Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Estilos — paleta alinhada ao SolicitacoesScreen.tsx (#007A72)
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardAvoiding: {
    width: '100%',
    maxWidth: 360,
  },
  caixaModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2E2C',
  },
  botaoFechar: {
    padding: 4,
  },
  boxTipoChamado: {
    backgroundColor: '#F7FAFA',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F5F4',
  },
  textTipoChamado: {
    fontSize: 13,
    fontWeight: '800',
    color: '#007A72',
    textTransform: 'uppercase',
  },
  pergunta: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A7572',
    marginBottom: 10,
  },
  containerEstrelas: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  estrelaTouchable: {
    paddingHorizontal: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#C8DEDD',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#1A2E2C',
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 22,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoVoltar: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#007A72',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoVoltar: {
    color: '#007A72',
    fontWeight: '700',
    fontSize: 14,
  },
  botaoEnviar: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#007A72',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesabilitado: {
    backgroundColor: '#005A54',
    opacity: 0.8,
  },
  textoBotaoEnviar: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
