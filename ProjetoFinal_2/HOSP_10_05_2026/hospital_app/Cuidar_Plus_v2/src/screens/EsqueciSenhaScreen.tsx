import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRecuperacaoViewModel } from '../viewmodels/useRecuperacaoViewModel';

export default function EsqueciSenhaScreen() {
  const vm = useRecuperacaoViewModel();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Ionicons name="lock-closed" size={32} color="#0d8389" />
            </View>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              {vm.step === 1
                ? 'Informe seu CPF. Enviaremos um código de verificação para o seu e-mail cadastrado.'
                : `Código enviado para ${vm.emailMascarado}. Digite-o abaixo junto com a sua nova senha.`}
            </Text>
          </View>
          {vm.step === 1 && (
            <View style={styles.form}>
              <Text style={styles.label}>CPF</Text>
              <TextInput
                id="recuperacao-cpf"
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#9ca3af"
                value={vm.cpf}
                onChangeText={vm.handleCpfChange}
                keyboardType="numeric"
                maxLength={14}
                returnKeyType="send"
                onSubmitEditing={vm.handleSolicitarCodigo}
              />

              {vm.errorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color="#b91c1c" style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{vm.errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                id="btn-solicitar-codigo"
                style={[styles.btnPrimary, vm.loading && styles.btnDisabled]}
                onPress={vm.handleSolicitarCodigo}
                disabled={vm.loading}
                activeOpacity={0.85}
              >
                {vm.loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Enviar Código</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          {vm.step === 2 && (
            <View style={styles.form}>
              {vm.successMessage && (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={16} color="#15803d" style={{ marginRight: 6 }} />
                  <Text style={styles.successText}>{vm.successMessage}</Text>
                </View>
              )}

              <Text style={styles.label}>Código de Verificação</Text>
              <TextInput
                id="recuperacao-codigo"
                style={[styles.input, styles.inputCodigo]}
                placeholder="000000"
                placeholderTextColor="#9ca3af"
                value={vm.codigo}
                onChangeText={vm.setCodigo}
                keyboardType="numeric"
                maxLength={6}
              />

              <Text style={styles.label}>Nova Senha</Text>
              <TextInput
                id="recuperacao-nova-senha"
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#9ca3af"
                value={vm.novaSenha}
                onChangeText={vm.setNovaSenha}
                secureTextEntry
              />

              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <TextInput
                id="recuperacao-confirmar-senha"
                style={styles.input}
                placeholder="Repita a nova senha"
                placeholderTextColor="#9ca3af"
                value={vm.confirmarSenha}
                onChangeText={vm.setConfirmarSenha}
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={vm.handleResetarSenha}
              />

              {vm.errorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color="#b91c1c" style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{vm.errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                id="btn-redefinir-senha"
                style={[styles.btnPrimary, vm.loading && styles.btnDisabled]}
                onPress={vm.handleResetarSenha}
                disabled={vm.loading}
                activeOpacity={0.85}
              >
                {vm.loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Redefinir Senha</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            id="btn-voltar-login"
            style={styles.btnSecundario}
            onPress={vm.voltarParaLogin}
          >
            <Ionicons name="arrow-back" size={16} color="#0d8389" style={{ marginRight: 6 }} />
            <Text style={styles.btnSecundarioText}>Voltar para o Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PRIMARY = '#004b49';
const PRIMARY_LIGHT = '#0d8389';
const ACCENT = '#e8f4f3';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f7f7',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: PRIMARY_LIGHT,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    gap: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
  },
  inputCodigo: {
    textAlign: 'center',
    letterSpacing: 10,
    fontSize: 22,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '500',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successText: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: '500',
  },
  btnPrimary: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  btnSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  btnSecundarioText: {
    color: PRIMARY_LIGHT,
    fontSize: 14,
    fontWeight: '600',
  },
});
