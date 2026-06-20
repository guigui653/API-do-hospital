import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../viewmodels/useLoginViewModel';
import { apiAutenticada } from '../services/authService';
import { useAuth } from '../context/AuthContext';

type CategoriaDetalhesRouteProp = RouteProp<RootStackParamList, 'CategoriaDetalhes'>;
type CategoriaDetalhesNavProp = StackNavigationProp<RootStackParamList, 'CategoriaDetalhes'>;

interface ServicoItem {
  titulo: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const SERVICOS_POR_CATEGORIA: Record<string, ServicoItem[]> = {
  enfermagem: [
    { titulo: 'Dor ou desconforto', iconName: 'alert-circle-outline' },
    { titulo: 'Troca de curativo', iconName: 'medkit-outline' },
    { titulo: 'Medicação', iconName: 'medical-outline' },
    { titulo: 'Verificar glicemia', iconName: 'pulse-outline' },
    { titulo: 'Verificar pressão', iconName: 'speedometer-outline' },
    { titulo: 'Outros serviços', iconName: 'options-outline' },
  ],
  nutricao: [
    { titulo: 'Cardápio do dia', iconName: 'restaurant-outline' },
    { titulo: 'Água / Bebidas', iconName: 'cafe-outline' },
    { titulo: 'Dieta especial', iconName: 'nutrition-outline' },
    { titulo: 'Restrição alimentar', iconName: 'warning-outline' },
    { titulo: 'Outros serviços', iconName: 'options-outline' },
  ],
  limpeza: [
    { titulo: 'Varrer o quarto', iconName: 'brush-outline' },
    { titulo: 'Passar pano', iconName: 'color-fill-outline' },
    { titulo: 'Limpeza banheiro', iconName: 'water-outline' },
    { titulo: 'Trocar lençóis', iconName: 'bed-outline' },
    { titulo: 'Conserto aparelho', iconName: 'build-outline' },
    { titulo: 'Outros serviços', iconName: 'options-outline' },
  ],
  manutencao: [
    { titulo: 'Ar condicionado', iconName: 'thermometer-outline' },
    { titulo: 'Televisão', iconName: 'tv-outline' },
    { titulo: 'Iluminação', iconName: 'bulb-outline' },
    { titulo: 'Leito/Cama', iconName: 'bed-outline' },
    { titulo: 'Outros serviços', iconName: 'options-outline' },
  ],
  rouparia: [
    { titulo: 'Cobertor extra', iconName: 'copy-outline' },
    { titulo: 'Travesseiro extra', iconName: 'albums-outline' },
    { titulo: 'Troca de lençol', iconName: 'bed-outline' },
    { titulo: 'Toalha de banho', iconName: 'shirt-outline' },
    { titulo: 'Outros serviços', iconName: 'options-outline' },
  ],
  hospitalidade: [
    { titulo: 'Apoio religioso', iconName: 'book-outline' },
    { titulo: 'Devolução de pertences', iconName: 'briefcase-outline' },
    { titulo: 'Dúvidas', iconName: 'help-circle-outline' },
    { titulo: 'Guia de internação', iconName: 'document-text-outline' },
    { titulo: 'Acompanhante', iconName: 'people-outline' },
    { titulo: 'Outros serviços', iconName: 'options-outline' },
  ],
  apoio_humanizado: [
    { titulo: 'Apoio Psicológico', iconName: 'people-outline' },
    { titulo: 'Apoio Religioso', iconName: 'book-outline' },
    { titulo: 'Outros serviços', iconName: 'options-outline' },
  ],
};

interface Chamado {
  idChamado: number;
  observacao: string;
  status: 'ABERTO' | 'PENDENTE' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO';
  tipo: string;
  dataAbertura: string;
}

export default function CategoriaDetalhesScreen() {
  const navigation = useNavigation<CategoriaDetalhesNavProp>();
  const route = useRoute<CategoriaDetalhesRouteProp>();
  const { categoriaId, label } = route.params;
  const { paciente } = useAuth();

  const [pedidosAbertos, setPedidosAbertos] = useState<Chamado[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);

  const itens = SERVICOS_POR_CATEGORIA[categoriaId] || [
    { titulo: 'Outros serviços', iconName: 'options-outline' },
  ];

  const carregarChamadosAtivos = async () => {
    if (!paciente?.idPaciente) return;
    try {
      setLoadingPedidos(true);
      const response = await apiAutenticada.get<Chamado[]>(`/api/chamados/paciente/${paciente.idPaciente}`);
      const ativos = response.data.filter(
        (c) => c.status === 'ABERTO' || c.status === 'PENDENTE' || c.status === 'EM_ATENDIMENTO'
      );
      ativos.sort((a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime());
      setPedidosAbertos(ativos);
    } catch (error) {
      console.warn('Erro ao carregar chamados ativos:', error);
    } finally {
      setLoadingPedidos(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarChamadosAtivos();
    }, [paciente?.idPaciente])
  );

  const handleSelectSub = (subLabel: string) => {
    navigation.navigate('NovoPedido', {
      categoriaId,
      categoriaLabel: label,
      subCategoriaLabel: subLabel,
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDENTE':
      case 'ABERTO':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Pendente' };
      case 'EM_ATENDIMENTO':
        return { bg: '#DBEAFE', text: '#2563EB', label: 'A Caminho' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007A72" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitar atendimento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.subheader}>
          <Text style={styles.sectionTitle}>Qual atendimento você precisa agora?</Text>
          <Text style={styles.subcategoryTitle}>{label}</Text>
        </View>
        <View style={styles.grid}>
          {itens.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridButton}
              onPress={() => handleSelectSub(item.titulo)}
              activeOpacity={0.7}
            >
              <View style={styles.gridButtonIconContainer}>
                <Ionicons name={item.iconName} size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.gridButtonText}>{item.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitleHeader}>Pedidos em aberto</Text>
          {loadingPedidos ? (
            <ActivityIndicator color="#007A72" size="small" style={{ marginVertical: 12 }} />
          ) : pedidosAbertos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={22} color="#9DB8B5" />
              <Text style={styles.emptyText}>Nenhum chamado aberto no momento</Text>
            </View>
          ) : (
            pedidosAbertos.map((item) => {
              const statusConfig = getStatusStyle(item.status);
              const dataFormatada = new Date(item.dataAbertura).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View key={item.idChamado} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestType}>{item.tipo}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.requestDesc}>{item.observacao}</Text>
                  <Text style={styles.requestTime}>Solicitado às {dataFormatada}</Text>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F4',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2E2C',
  },
  scrollContent: {
    padding: 16,
  },
  subheader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#5A7572',
    fontWeight: '600',
    marginBottom: 4,
  },
  subcategoryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A2E2C',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  gridButton: {
    width: '48%',
    height: 110,
    backgroundColor: '#8DA2B0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridButtonIconContainer: {
    marginBottom: 8,
  },
  gridButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 12,
  },
  sectionTitleHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E2C',
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8F5F4',
    gap: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#5A7572',
    fontWeight: '500',
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8F5F4',
    shadowColor: 'rgba(0, 122, 114, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestType: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A2E2C',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  requestDesc: {
    fontSize: 13,
    color: '#5A7572',
    lineHeight: 18,
    marginBottom: 8,
  },
  requestTime: {
    fontSize: 11,
    color: '#9DB8B5',
    fontWeight: '500',
  },
});
