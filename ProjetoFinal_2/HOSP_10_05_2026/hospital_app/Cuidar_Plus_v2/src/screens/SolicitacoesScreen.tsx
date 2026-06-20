import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSolicitacoesViewModel, Chamado } from '../viewmodels/useSolicitacoesViewModel';
// O componente reutilizável ModalAvaliacao está disponível em src/components/ModalAvaliacao.tsx.
// Esta tela usa um modal inline equivalente (mais completo), mas o componente
// pode ser importado em outras telas com:
// import ModalAvaliacao from '../components/ModalAvaliacao';


const getStatusStyle = (status: string) => {
  switch (status) {
    case 'PENDENTE':
    case 'ABERTO':
      return { bg: '#FEF3C7', text: '#D97706', label: 'Aguardando' };
    case 'EM_ATENDIMENTO':
      return { bg: '#DBEAFE', text: '#2563EB', label: 'A Caminho' };
    case 'CONCLUIDO':
      return { bg: '#FEF3C7', text: '#B45309', label: 'Avaliar Agora' };
    case 'FINALIZADO':
      return { bg: '#D1FAE5', text: '#059669', label: 'Finalizado' };
    case 'CANCELADO':
      return { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelado' };
    default:
      return { bg: '#F3F4F6', text: '#4B5563', label: status };
  }
};

export default function SolicitacoesScreen() {
  const {
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
  } = useSolicitacoesViewModel();

  const renderEstrelasLeitura = (nota: number) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <Ionicons
          key={i}
          name={i <= nota ? 'star' : 'star-outline'}
          size={15}
          color="#FFB000"
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.estrelasLeituraRow}>{estrelas}</View>;
  };

  const renderSeletorEstrelas = () => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <TouchableOpacity
          key={i}
          onPress={() => setNotaSelecionada(i)}
          style={{ paddingHorizontal: 6 }}
        >
          <Ionicons
            name={i <= notaSelecionada ? 'star' : 'star-outline'}
            size={36}
            color="#FFB000"
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.seletorEstrelasRow}>{estrelas}</View>;
  };

  const renderChamado = ({ item }: { item: Chamado }) => {
    const statusConfig = getStatusStyle(item.status);
    const dataFormatada = new Date(item.dataAbertura).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    let iconName: keyof typeof Ionicons.glyphMap = 'document-text-outline';
    if (item.tipo === 'ENFERMAGEM') iconName = 'medkit-outline';
    else if (item.tipo === 'LIMPEZA') iconName = 'brush-outline';
    else if (item.tipo === 'NUTRICAO') iconName = 'restaurant-outline';
    else if (item.tipo === 'ROUPARIA') iconName = 'bed-outline';
    else if (item.tipo === 'HOSPITALIDADE') iconName = 'people-outline';
    else if (item.tipo === 'APOIO_PSICOLOGICO') iconName = 'people-circle-outline';
    else if (item.tipo === 'APOIO_RELIGIOSO') iconName = 'book-outline';
    else if (item.tipo === 'APOIO_HUMANIZADO') iconName = 'heart-outline';

    const showConfirmacao = item.status === 'EM_ATENDIMENTO' || item.status === 'CONCLUIDO' || item.status === 'REALIZADO';
    const showAvaliacao = item.status === 'FINALIZADO';
    const jaAvaliado = item.notaAvaliacao !== undefined && item.notaAvaliacao !== null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTypeRow}>
            <View style={styles.cardIconBg}>
              <Ionicons name={iconName} size={18} color="#007A72" />
            </View>
            <Text style={styles.cardTitle}>
              {item.tipo.replace(/_/g, ' ')}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusConfig.bg, flexDirection: 'row', alignItems: 'center' }]}>
            {item.status === 'EM_ATENDIMENTO' && (
              <Ionicons
                name="walk-outline"
                size={12}
                color={statusConfig.text}
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={[styles.badgeText, { color: statusConfig.text }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDesc}>{item.observacao}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cardTime}>Solicitado às {dataFormatada}</Text>
          <Text style={styles.cardId}>Nº #{item.idChamado}</Text>
        </View>

        {showConfirmacao && (
          <TouchableOpacity
            style={styles.confirmarAtendimentoBtn}
            onPress={() => handleFinalizarChamado(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.confirmarAtendimentoBtnText}>✓ Confirmar Atendimento</Text>
          </TouchableOpacity>
        )}

        {showAvaliacao && (
          <View style={styles.avaliacaoSection}>
            {jaAvaliado ? (
              <View style={styles.avaliacaoInfoBox}>
                <View style={styles.avaliacaoInfoTitleRow}>
                  <Text style={styles.avaliacaoInfoLabel}>Sua avaliação:</Text>
                  {renderEstrelasLeitura(item.notaAvaliacao!)}
                </View>
                {item.comentarioAvaliacao ? (
                  <Text style={styles.avaliacaoComentarioText}>
                    "{item.comentarioAvaliacao}"
                  </Text>
                ) : null}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.avaliarBtnDestaque}
                onPress={() => abrirModalAvaliacao(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="star" size={15} color="#92400E" style={{ marginRight: 6 }} />
                <Text style={styles.avaliarBtnDestaqueText}>⭐ Avaliar Atendimento</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Solicitações</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={carregarChamados}>
          <Ionicons name="refresh" size={14} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.refreshText}>Atualizar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, abaAtiva === 'ativos' && styles.tabButtonActive]}
          onPress={() => setAbaAtiva('ativos')}
        >
          <Text style={[styles.tabText, abaAtiva === 'ativos' && styles.tabTextActive]}>
            Ativos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, abaAtiva === 'historico' && styles.tabButtonActive]}
          onPress={() => setAbaAtiva('historico')}
        >
          <Text style={[styles.tabText, abaAtiva === 'historico' && styles.tabTextActive]}>
            Histórico (24h)
          </Text>
        </TouchableOpacity>
      </View>
      {loading && chamados.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007A72" />
          <Text style={styles.loadingText}>Buscando solicitações...</Text>
        </View>
      ) : (
        <FlatList
          data={chamados}
          keyExtractor={(item) => String(item.idChamado)}
          renderItem={renderChamado}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#9DB8B5" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyTitle}>Nenhuma solicitação encontrada</Text>
              <Text style={styles.emptySubtitle}>
                {abaAtiva === 'ativos'
                  ? 'Quando você solicitar auxílio, os atendimentos ativos aparecerão aqui.'
                  : 'Nenhum chamado foi finalizado ou encerrado nas últimas 24 horas.'}
              </Text>
            </View>
          }
        />
      )}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardAvoiding}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Avaliar Atendimento</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisivel(false)}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={24} color="#5A7572" />
                  </TouchableOpacity>
                </View>

                {chamadoSelecionado && (
                  <View style={styles.modalInfoChamado}>
                    <Text style={styles.modalChamadoTipo}>
                      {chamadoSelecionado.tipo.replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.modalChamadoDesc} numberOfLines={2}>
                      {chamadoSelecionado.observacao}
                    </Text>
                  </View>
                )}

                <Text style={styles.modalLabel}>Qual nota você dá para este atendimento?</Text>
                {renderSeletorEstrelas()}

                <Text style={styles.modalLabel}>Deixe um comentário (opcional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Conte-nos brevemente como foi sua experiência..."
                  placeholderTextColor="#9DB8B5"
                  value={comentarioAvaliacaoText}
                  onChangeText={setComentarioAvaliacaoText}
                  multiline
                  numberOfLines={3}
                  maxLength={150}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnCancel]}
                    onPress={() => setModalVisivel(false)}
                    disabled={enviandoAvaliacao}
                  >
                    <Text style={styles.modalBtnCancelText}>Voltar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      styles.modalBtnSubmit,
                      enviandoAvaliacao && styles.modalBtnDisabled,
                    ]}
                    onPress={enviarAvaliacaoHandler}
                    disabled={enviandoAvaliacao}
                  >
                    {enviandoAvaliacao ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.modalBtnSubmitText}>Enviar Avaliação</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFA',
  },
  header: {
    backgroundColor: '#007A72',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F4',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#007A72',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8DA2B0',
  },
  tabTextActive: {
    color: '#007A72',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#5A7572',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F5F4',
    shadowColor: 'rgba(0, 122, 114, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#E8F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A2E2C',
    textTransform: 'capitalize',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    color: '#5A7572',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F5F5',
    paddingTop: 10,
  },
  cardTime: {
    fontSize: 11,
    color: '#9DB8B5',
  },
  cardId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9DB8B5',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2E2C',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#5A7572',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 18,
  },
  avaliacaoSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F5F5',
    paddingTop: 12,
  },
  avaliarBtn: {
    backgroundColor: '#E8F5F4',
    borderRadius: 10,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8DEDD',
  },
  avaliarBtnText: {
    color: '#007A72',
    fontSize: 13,
    fontWeight: '700',
  },

  avaliarBtnDestaque: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  avaliarBtnDestaqueText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '800',
  },
  avaliacaoInfoBox: {
    backgroundColor: '#F7FAFA',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8F5F4',
  },
  avaliacaoInfoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  avaliacaoInfoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A7572',
  },
  estrelasLeituraRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avaliacaoComentarioText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#1A2E2C',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalKeyboardAvoiding: {
    width: '100%',
    maxWidth: 340,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2E2C',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalInfoChamado: {
    backgroundColor: '#F7FAFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F5F4',
  },
  modalChamadoTipo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#007A72',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalChamadoDesc: {
    fontSize: 12,
    color: '#5A7572',
    lineHeight: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A7572',
    marginBottom: 8,
  },
  seletorEstrelasRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#C8DEDD',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#1A2E2C',
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#007A72',
  },
  modalBtnCancelText: {
    color: '#007A72',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBtnSubmit: {
    backgroundColor: '#007A72',
  },
  modalBtnSubmitText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBtnDisabled: {
    backgroundColor: '#005A54',
    opacity: 0.8,
  },
  confirmarAtendimentoBtn: {
    backgroundColor: '#005F54',
    borderRadius: 10,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#004B42',
    marginTop: 12,
  },
  confirmarAtendimentoBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
