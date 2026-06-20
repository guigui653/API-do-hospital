import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../viewmodels/useLoginViewModel';
import { abrirChamado } from '../services/chamadoService';
import { apiAutenticada } from '../services/authService';
import { useAuth } from '../context/AuthContext';

type HomeNavProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface CategoriaItem {
  id: string;
  label: string;
  descricao: string;
  iconName: keyof typeof Ionicons.glyphMap;
  quickActions: string[];
}

const CATEGORIAS: CategoriaItem[] = [
  {
    id: 'enfermagem',
    label: 'Enfermagem',
    descricao: 'Dor ou desconforto, Medicação, Curativo',
    iconName: 'medkit-outline',
    quickActions: ['Dor ou desconforto', 'Medicação', 'Troca de curativo'],
  },
  {
    id: 'nutricao',
    label: 'Cozinha e Nutrição',
    descricao: 'Dieta especial, Restrição, Cardápio',
    iconName: 'restaurant-outline',
    quickActions: ['Dieta especial', 'Cardápio do dia', 'Água / Bebidas'],
  },
  {
    id: 'limpeza',
    label: 'Limpeza e Manutenção',
    descricao: 'Limpeza de quarto, Reparos de leito',
    iconName: 'build-outline',
    quickActions: ['Limpeza do quarto', 'Limpeza banheiro', 'Reparos no leito'],
  },
  {
    id: 'rouparia',
    label: 'Rouparia',
    descricao: 'Troca de lençol, Cobertor, Toalhas',
    iconName: 'bed-outline',
    quickActions: ['Troca de lençol', 'Cobertor extra', 'Toalha de banho'],
  },
  {
    id: 'hospitalidade',
    label: 'Hospitalidade',
    descricao: 'Apoio religioso, Dúvidas, Acompanhante',
    iconName: 'people-outline',
    quickActions: ['Apoio religioso', 'Dúvidas', 'Guia de internação'],
  },
];

interface Chamado {
  idChamado: number;
  observacao: string;
  status: 'ABERTO' | 'PENDENTE' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO';
  tipo: string;
  dataAbertura: string;
  leitoPaciente?: string;
  nomePaciente?: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { paciente, encerrarSessao } = useAuth();
  const [emergenciaLoading, setEmergenciaLoading] = useState(false);
  const [pedidosAbertos, setPedidosAbertos] = useState<Chamado[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);

  const primeiroNome = paciente?.nome?.split(' ')[0] ?? 'Davi';
  const leito = paciente?.leito ? `Leito ${paciente.leito}` : '';

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

  const handleEmergencia = () => {
    Alert.alert(
      'Chamado de Emergência',
      'Deseja chamar a equipe de enfermagem imediatamente?\n\nUm chamado de alta prioridade será registrado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Chamar agora',
          style: 'destructive',
          onPress: async () => {
            setEmergenciaLoading(true);
            try {
              await abrirChamado(
                'ENFERMAGEM',
                'Chamado de Emergência acionado via botão de pânico no app mobile'
              );
              Alert.alert(
                'Equipe alertada!',
                'A equipe de enfermagem foi notificada e está a caminho.'
              );
              carregarChamadosAtivos();
            } catch {
              Alert.alert(
                'Erro ao registrar',
                'Não foi possível registrar o chamado. Use o botão físico ao lado da cama.'
              );
            } finally {
              setEmergenciaLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleQuickAction = (categoria: CategoriaItem, subCategoria: string) => {
    navigation.navigate('NovoPedido', {
      categoriaId: categoria.id,
      categoriaLabel: categoria.label,
      subCategoriaLabel: subCategoria,
    });
  };

  const handleVerTudo = (categoria: CategoriaItem) => {
    navigation.navigate('CategoriaDetalhes', {
      categoriaId: categoria.id,
      label: categoria.label,
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
      <StatusBar barStyle="light-content" backgroundColor="#005A54" />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <View style={styles.miniLogoCircle}>
              <Ionicons name="add-circle" size={20} color="#007A72" />
            </View>
            <View style={styles.headerTitles}>
              <Text style={styles.headerLogoName}>Cuidar+</Text>
              <Text style={styles.headerHospital}>HOSPITAL BRASILIA</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>

        <Text style={styles.greetingTitle}>Olá, {primeiroNome}!</Text>
        <Text style={styles.greetingSubtitle}>Como podemos te ajudar hoje?</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.searchBar}
          onPress={() => (navigation as any).navigate('SelecaoAtendimento')}
        >
          <Ionicons name="search-outline" size={20} color="#9DB8B5" />
          <Text style={styles.searchText}>Buscar atendimento</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyIconBg}>
            {emergenciaLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            )}
          </View>
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>Precisa de ajuda agora?</Text>
            <Text style={styles.emergencySubtitle}>Fale com a enfermagem agora!</Text>
          </View>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={handleEmergencia}
            disabled={emergenciaLoading}
          >
            <Text style={styles.emergencyButtonText}>EMERGÊNCIA</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pedidos Rápidos</Text>
          {CATEGORIAS.map((categoria) => (
            <View key={categoria.id} style={styles.categoryCard}>
              <View style={styles.categoryCardHeader}>
                <View style={styles.categoryLogoCircle}>
                  <Ionicons name={categoria.iconName} size={22} color="#007A72" />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryLabel}>{categoria.label}</Text>
                  <Text style={styles.categoryDesc} numberOfLines={1}>
                    {categoria.descricao}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleVerTudo(categoria)}
                  style={styles.verTudoButton}
                >
                  <Text style={styles.verTudoText}>Ver tudo</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.quickButtonsGrid}>
                {categoria.quickActions.map((action, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleQuickAction(categoria, action)}
                    style={styles.quickActionButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickActionText} numberOfLines={1}>
                      {action}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pedidos em aberto</Text>
          {loadingPedidos ? (
            <ActivityIndicator color="#007A72" size="small" style={{ marginVertical: 12 }} />
          ) : pedidosAbertos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={24} color="#9DB8B5" />
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
                      <Ionicons
                        name={item.status === 'EM_ATENDIMENTO' ? 'walk-outline' : 'time-outline'}
                        size={12}
                        color={statusConfig.text}
                        style={{ marginRight: 4 }}
                      />
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

        <View style={{ height: 40 }} />
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
    backgroundColor: '#007A72',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    justifyContent: 'center',
  },
  headerLogoName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  headerHospital: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  onlineText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchText: {
    color: '#9DB8B5',
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005A54',
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  emergencyIconBg: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  emergencySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E2C',
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F5F4',
    shadowColor: 'rgba(0, 122, 114, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2E2C',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#5A7572',
    marginTop: 2,
  },
  verTudoButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  verTudoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007A72',
  },
  quickButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: '#F7FAFA',
    borderWidth: 1,
    borderColor: '#E8F5F4',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '48%',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 11,
    color: '#007A72',
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8F5F4',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
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
    flexDirection: 'row',
    alignItems: 'center',
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
