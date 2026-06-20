import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiAutenticada, atualizarPaciente } from '../services/authService';
import { RootStackParamList } from '../viewmodels/useLoginViewModel';

type PerfilScreenNavProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface PacienteDetalhes {
  idPaciente: number;
  nome: string;
  cpf: string;
  leito?: string;
  numeroProntuario?: string;
  dataNascimento?: string;
  sexo?: string;
  telefoneContato?: string;
  nomeResponsavel?: string;
  telefoneResponsavel?: string;
}

export default function PerfilScreen() {
  const navigation = useNavigation<PerfilScreenNavProp>();
  const { paciente, salvarSessao, encerrarSessao } = useAuth();

  const [detalhes, setDetalhes] = useState<PacienteDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [telefoneResponsavel, setTelefoneResponsavel] = useState('');
  const [salvando, setSalvando] = useState(false);

  const aplicarMascaraTelefone = (valor: string) => {
    const digitos = valor.replace(/\D/g, '');
    if (digitos.length <= 10) {
      return digitos.replace(/^(\d{2})(\d{4})(\d{0,4})$/, (_, g1, g2, g3) => {
        return g3 ? `(${g1}) ${g2}-${g3}` : g2 ? `(${g1}) ${g2}` : g1 ? `(${g1}` : '';
      });
    } else {
      return digitos.replace(/^(\d{2})(\d{5})(\d{0,4})$/, (_, g1, g2, g3) => {
        return g3 ? `(${g1}) ${g2}-${g3}` : g2 ? `(${g1}) ${g2}` : g1 ? `(${g1}` : '';
      });
    }
  };

  const handleOpenEdit = () => {
    setTelefone(detalhes?.telefoneContato ? aplicarMascaraTelefone(detalhes.telefoneContato) : '');
    setNomeResponsavel(detalhes?.nomeResponsavel ?? '');
    setTelefoneResponsavel(detalhes?.telefoneResponsavel ? aplicarMascaraTelefone(detalhes.telefoneResponsavel) : '');
    setModalVisible(true);
  };

  const handleSalvar = async () => {
    if (!paciente?.idPaciente) return;

    if (!telefone.trim()) {
      Alert.alert('Aviso', 'O telefone de contato é obrigatório.');
      return;
    }

    setSalvando(true);
    try {
      const dadosAtualizacao = {
        idPaciente: paciente.idPaciente,
        telefoneContato: telefone.replace(/\D/g, ''),
        nomeResponsavel: nomeResponsavel.trim(),
        telefoneResponsavel: telefoneResponsavel.replace(/\D/g, ''),
      };

      const response = await atualizarPaciente(paciente.idPaciente, dadosAtualizacao);

      setDetalhes(response);

      await salvarSessao({
        ...paciente,
        nome: response.nome,
        leito: response.leito,
      });

      Alert.alert('Sucesso', 'Seus dados de perfil foram atualizados com sucesso!');
      setModalVisible(false);
    } catch (error: any) {
      console.warn('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Verifique sua conexão.');
    } finally {
      setSalvando(false);
    }
  };

  useEffect(() => {
    async function carregarDetalhes() {
      if (!paciente?.idPaciente) return;
      try {
        setLoading(true);
        const response = await apiAutenticada.get<PacienteDetalhes>(`/api/pacientes/${paciente.idPaciente}`);
        setDetalhes(response.data);
      } catch (error) {
        console.warn('Erro ao carregar dados complementares do perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDetalhes();
  }, [paciente?.idPaciente]);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmado = window.confirm('Tem certeza de que deseja encerrar sua sessão no Cuidar+?');
      if (!confirmado) return;

      setLogoutLoading(true);
      try {
        localStorage.clear();
        await encerrarSessao();
      } catch (err) {
        console.error('Erro ao encerrar sessão:', err);
      } finally {
        window.location.href = '/';
      }
    } else {
      Alert.alert(
        'Encerrar Sessão',
        'Tem certeza de que deseja sair do Cuidar+?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Encerrar Sessão',
            style: 'destructive',
            onPress: async () => {
              setLogoutLoading(true);
              try {
                await encerrarSessao();
              } catch {
                Alert.alert('Erro', 'Não foi possível encerrar a sessão. Tente novamente.');
                setLogoutLoading(false);
              }
            },
          },
        ]
      );
    }
  };

  const formatCpf = (cpfRaw?: string) => {
    if (!cpfRaw) return 'Não informado';
    const digits = cpfRaw.replace(/\D/g, '');
    if (digits.length !== 11) return cpfRaw;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatDate = (dateRaw?: string) => {
    if (!dateRaw) return 'Não informada';

    const date = new Date(dateRaw.replace(/-/g, '/'));
    if (isNaN(date.getTime())) return dateRaw;
    return date.toLocaleDateString('pt-BR');
  };

  const initialLetter = paciente?.nome ? paciente.nome.charAt(0).toUpperCase() : 'D';

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
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007A72" />
            <Text style={styles.loaderText}>Carregando informações...</Text>
          </View>
        ) : (
          <>
            <View style={styles.profileHeaderCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initialLetter}</Text>
              </View>
              <Text style={styles.profileName}>{detalhes?.nome ?? paciente?.nome ?? 'Paciente'}</Text>
              <Text style={styles.profileLeito}>
                {paciente?.leito ? `Leito ${paciente.leito}` : 'Sem leito atribuído'}
              </Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Dados do Paciente</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="person-outline" size={16} color="#5A7572" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Nome completo</Text>
                </View>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {detalhes?.nome ?? paciente?.nome ?? 'Não informado'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="card-outline" size={16} color="#5A7572" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>CPF</Text>
                </View>
                <Text style={styles.infoValue}>
                  {formatCpf(detalhes?.cpf)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="calendar-outline" size={16} color="#5A7572" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Data de nascimento</Text>
                </View>
                <Text style={styles.infoValue}>
                  {formatDate(detalhes?.dataNascimento)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="shield-outline" size={16} color="#5A7572" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Alergias</Text>
                </View>
                <Text style={[styles.infoValue, { color: '#EF4444' }]}>
                  Nenhuma registrada
                </Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="call-outline" size={16} color="#5A7572" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Telefone contato</Text>
                </View>
                <Text style={styles.infoValue}>
                  {detalhes?.telefoneContato ? aplicarMascaraTelefone(detalhes.telefoneContato) : 'Não informado'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="people-outline" size={16} color="#5A7572" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Responsável</Text>
                </View>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {detalhes?.nomeResponsavel ?? 'Não informado'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="call-outline" size={16} color="#5A7572" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Telefone resp.</Text>
                </View>
                <Text style={styles.infoValue}>
                  {detalhes?.telefoneResponsavel ? aplicarMascaraTelefone(detalhes.telefoneResponsavel) : 'Não informado'}
                </Text>
              </View>

              <View style={[styles.infoRow, styles.infoRowLast]}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="medical-outline" size={16} color="#5A7572" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Data de internação</Text>
                </View>
                <Text style={styles.infoValue}>
                  12/06/2026
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleOpenEdit}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" style={styles.editIcon} />
              <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                logoutLoading && styles.logoutButtonDisabled,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.logoutIcon} />
                  <Text style={styles.logoutButtonText}>Encerrar Sessão</Text>
                </>
              )}
            </Pressable>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Editar Perfil</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModalButton}>
                      <Ionicons name="close" size={24} color="#1A2E2C" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>CPF (Não editável)</Text>
                      <TextInput
                        style={[styles.textInput, styles.disabledInput]}
                        value={formatCpf(detalhes?.cpf)}
                        editable={false}
                        selectTextOnFocus={false}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Data de Nascimento (Não editável)</Text>
                      <TextInput
                        style={[styles.textInput, styles.disabledInput]}
                        value={formatDate(detalhes?.dataNascimento)}
                        editable={false}
                        selectTextOnFocus={false}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Telefone de Contato</Text>
                      <TextInput
                        style={styles.textInput}
                        value={telefone}
                        onChangeText={(t) => setTelefone(aplicarMascaraTelefone(t))}
                        keyboardType="phone-pad"
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Nome do Responsável</Text>
                      <TextInput
                        style={styles.textInput}
                        value={nomeResponsavel}
                        onChangeText={setNomeResponsavel}
                        placeholder="Nome do acompanhante/responsável"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Telefone do Responsável</Text>
                      <TextInput
                        style={styles.textInput}
                        value={telefoneResponsavel}
                        onChangeText={(t) => setTelefoneResponsavel(aplicarMascaraTelefone(t))}
                        keyboardType="phone-pad"
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </View>
                  </ScrollView>
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.cancelModalButton}
                      onPress={() => setModalVisible(false)}
                      disabled={salvando}
                    >
                      <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveModalButton}
                      onPress={handleSalvar}
                      disabled={salvando}
                    >
                      {salvando ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.saveModalButtonText}>Salvar Alterações</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>
          </>
        )}
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
  content: {
    padding: 16,
    alignItems: 'center',
  },
  loaderContainer: {
    marginTop: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#5A7572',
    fontWeight: '600',
  },
  profileHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8F5F4',
    shadowColor: 'rgba(0, 122, 114, 0.04)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E8F5F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#007A72',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#007A72',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2E2C',
    textAlign: 'center',
    marginBottom: 6,
  },
  profileLeito: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007A72',
    backgroundColor: '#E8F5F4',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E8F5F4',
    shadowColor: 'rgba(0, 122, 114, 0.04)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5A7572',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F5F5',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#5A7572',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A2E2C',
    maxWidth: '50%',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 16,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: 'rgba(239, 68, 68, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonPressed: {
    opacity: 0.85,
    backgroundColor: '#FFF5F5',
    transform: [{ scale: 0.99 }],
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '800',
  },
  editProfileButton: {
    backgroundColor: '#007A72',
    borderRadius: 16,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: 'rgba(0, 122, 114, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  editIcon: {
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F4',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2E2C',
  },
  closeModalButton: {
    padding: 4,
  },
  modalForm: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A7572',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E8F5F4',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    color: '#1A2E2C',
    backgroundColor: '#F7FAFA',
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: '#EAEAEA',
    borderColor: '#D2D2D2',
    color: '#7C7C7C',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F4',
  },
  cancelModalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#9DB8B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5A7572',
  },
  saveModalButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#007A72',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveModalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
