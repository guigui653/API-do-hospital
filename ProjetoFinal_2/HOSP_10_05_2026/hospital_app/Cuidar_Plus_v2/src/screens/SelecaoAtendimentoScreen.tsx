import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../viewmodels/useLoginViewModel';
import { abrirChamado } from '../services/chamadoService';

type SelecaoAtendimentoNavProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function SelecaoAtendimentoScreen() {
  const navigation = useNavigation<SelecaoAtendimentoNavProp>();
  const [emergenciaLoading, setEmergenciaLoading] = useState(false);

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
                'Chamado de Emergência acionado via botão de pânico na seleção de atendimento'
              );
              Alert.alert(
                'Equipe alertada!',
                'A equipe de enfermagem foi notificada e está a caminho.'
              );
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

  const handleSelectCategory = (id: string, label: string) => {
    navigation.navigate('CategoriaDetalhes', {
      categoriaId: id,
      label: label,
    });
  };

  const handleAcompanhamento = () => {

    navigation.navigate('Solicitações' as any);
  };

  const handleServicosGerais = () => {
    Alert.alert(
      'Serviços Gerais',
      'Selecione uma categoria adicional:',
      [
        { text: 'Rouparia', onPress: () => handleSelectCategory('rouparia', 'Rouparia') },
        { text: 'Hospitalidade', onPress: () => handleSelectCategory('hospitalidade', 'Hospitalidade') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
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
        <Text style={styles.headerTitle}>Solicitar Atendimento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        <Text style={styles.sectionTitle}>Selecione a categoria de serviço</Text>
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => handleSelectCategory('nutricao', 'Cozinha e Nutrição')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconContainer}>
            <Ionicons name="restaurant-outline" size={36} color="#007A72" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Cozinha e Nutrição</Text>
            <Text style={styles.cardDesc}>
              Água, chás, sucos, cardápio do dia e dietas com acompanhamento nutricional.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9DB8B5" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => handleSelectCategory('limpeza', 'Limpeza e Manutenção')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconContainer}>
            <Ionicons name="brush-outline" size={36} color="#007A72" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Limpeza e Manutenção</Text>
            <Text style={styles.cardDesc}>
              Limpeza do leito, reposição de insumos do banheiro e pequenos consertos no quarto.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9DB8B5" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => handleSelectCategory('apoio_humanizado', 'Apoio Humanizado')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconContainer}>
            <Ionicons name="heart-outline" size={36} color="#007A72" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Apoio Humanizado</Text>
            <Text style={styles.cardDesc}>
              Suporte e acolhimento com serviços de apoio psicológico ou apoio religioso.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9DB8B5" />
        </TouchableOpacity>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleAcompanhamento}
            activeOpacity={0.8}
          >
            <Ionicons name="list-outline" size={20} color="#007A72" style={{ marginRight: 6 }} />
            <Text style={styles.secondaryButtonText}>Acompanhamento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleServicosGerais}
            activeOpacity={0.8}
          >
            <Ionicons name="apps-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryButtonText}>Serviços Gerais</Text>
          </TouchableOpacity>
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
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005A54',
    padding: 16,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5A7572',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F5F4',
    shadowColor: 'rgba(0, 122, 114, 0.05)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#E8F5F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2E2C',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#5A7572',
    lineHeight: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#007A72',
    shadowColor: '#007A72',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#007A72',
    shadowColor: 'rgba(0,0,0,0.05)',
  },
  secondaryButtonText: {
    color: '#007A72',
    fontSize: 14,
    fontWeight: '700',
  },
});
