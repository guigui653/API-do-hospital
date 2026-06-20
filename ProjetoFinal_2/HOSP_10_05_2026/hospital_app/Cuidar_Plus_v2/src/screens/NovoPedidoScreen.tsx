import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../viewmodels/useLoginViewModel';
import { abrirChamado } from '../services/chamadoService';

type NovoPedidoRouteProp = RouteProp<RootStackParamList, 'NovoPedido'>;
type NovoPedidoNavProp = StackNavigationProp<RootStackParamList, 'NovoPedido'>;

export default function NovoPedidoScreen() {
  const navigation = useNavigation<NovoPedidoNavProp>();
  const route = useRoute<NovoPedidoRouteProp>();
  const { categoriaId, categoriaLabel, subCategoriaLabel } = route.params;

  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      let tipoMapeado = categoriaId.toUpperCase();
      if (categoriaId === 'apoio_humanizado') {
        if (subCategoriaLabel === 'Apoio Psicológico') {
          tipoMapeado = 'APOIO_PSICOLOGICO';
        } else if (subCategoriaLabel === 'Apoio Religioso') {
          tipoMapeado = 'APOIO_RELIGIOSO';
        } else {
          tipoMapeado = 'APOIO_HUMANIZADO';
        }
      }
      const obsFinal = `${subCategoriaLabel}${comentario ? ` - Comentário: ${comentario}` : ''}`;

      await abrirChamado(tipoMapeado as any, obsFinal);

      Alert.alert(
        'Chamado Registrado',
        'Sua solicitação foi criada com sucesso e a equipe já está a caminho.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            },
          },
        ]
      );
    } catch (err: any) {
      // Log completo do erro para diagnóstico
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message
        ?? err?.response?.data?.error
        ?? JSON.stringify(err?.response?.data)
        ?? err?.message
        ?? 'Erro desconhecido';
      console.error('[NovoPedido] Erro ao abrir chamado:', { status, serverMsg, err });
      Alert.alert(
        `Erro ${status ?? ''}`.trim(),
        `Não foi possível enviar a solicitação.\n\nDetalhe: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                disabled={loading}
              >
                <Ionicons name="arrow-back" size={24} color="#007A72" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Novo Pedido</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
              <View style={styles.chipRow}>
                <View style={styles.chip}>
                  <Ionicons name="pricetag-outline" size={14} color="#007A72" style={{ marginRight: 6 }} />
                  <Text style={styles.chipText}>
                    {categoriaLabel} · {subCategoriaLabel}
                  </Text>
                </View>
              </View>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="checkbox-outline" size={22} color="#007A72" />
                  <Text style={styles.cardTitle}>Confirmar chamado</Text>
                </View>

                <View style={styles.summaryTable}>
                  <View style={styles.summaryRow}>
                    <View style={styles.rowLabelGroup}>
                      <Ionicons name="notifications-outline" size={16} color="#5A7572" style={{ marginRight: 8 }} />
                      <Text style={styles.summaryLabel}>Tipo</Text>
                    </View>
                    <Text style={styles.summaryValue}>{categoriaLabel}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <View style={styles.rowLabelGroup}>
                      <Ionicons name="list-outline" size={16} color="#5A7572" style={{ marginRight: 8 }} />
                      <Text style={styles.summaryLabel}>Pedido</Text>
                    </View>
                    <Text style={styles.summaryValue}>{subCategoriaLabel}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.commentContainer}>
                <Text style={styles.inputLabel}>Comentário (opcional)</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Adicione um detalhe à sua solicitação..."
                  placeholderTextColor="#9DB8B5"
                  value={comentario}
                  onChangeText={setComentario}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                  editable={!loading}
                />
              </View>

              <Text style={styles.disclaimer}>
                Ao confirmar, a equipe de {categoriaLabel} será imediatamente notificada.
              </Text>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonLoading,
                ]}
                onPress={handleConfirmar}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>Confirmar e Registrar Chamado</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  },
  chipRow: {
    marginBottom: 20,
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#E8F5F4',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    color: '#007A72',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8F5F4',
    shadowColor: 'rgba(0,122,114,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E2C',
  },
  summaryTable: {
    backgroundColor: '#F7FAFA',
    borderWidth: 1,
    borderColor: '#E8F5F4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#5A7572',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A2E2C',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E8F5F4',
  },
  commentContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5A7572',
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#C8DEDD',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#1A2E2C',
    textAlignVertical: 'top',
    height: 110,
  },
  disclaimer: {
    fontSize: 12,
    color: '#5A7572',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#007A72',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#007A72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonLoading: {
    backgroundColor: '#005F58',
    opacity: 0.8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
