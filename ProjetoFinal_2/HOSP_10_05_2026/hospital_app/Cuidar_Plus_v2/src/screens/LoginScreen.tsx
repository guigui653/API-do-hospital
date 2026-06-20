import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useLoginViewModel, RootStackParamList } from '../viewmodels/useLoginViewModel';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#007A72',
  primaryLight: '#E8F5F4',
  bg: '#F7F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  inputBg: '#F3F4F6',
  borderFocused: '#007A72',
  error: '#EF4444',
  errorBg: '#FEE2E2',
};

type LoginScreenNavProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavProp>();

  // Pega a lógica tradicional + os novos recursos do Google unificados no ViewModel
  const {
    cpf,
    senha,
    loading,
    errorMessage,
    handleCpfChange,
    setSenha,
    handleLogin,
  } = useLoginViewModel();

  const senhaRef = useRef<TextInput>(null);

  const [cpfFocused, setCpfFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const handleForgotPassword = () => {
    navigation.navigate('EsqueciSenha');
  };

  const handleRegister = () => {
    Alert.alert(
        'Cadastro de Paciente',
        'Para criar uma conta, por favor dirija-se à recepção do hospital para realizar sua triagem.\n\nSua senha de acesso será gerada automaticamente usando os 3 primeiros números do seu CPF.'
    );
  };

  return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <View style={styles.logoWrapper}>
                  <MaterialCommunityIcons
                      name="hospital-building"
                      size={42}
                      color={COLORS.primary}
                  />
                </View>

                <Text style={styles.appName}>Cuidar Plus</Text>
                <Text style={styles.appTagline}>Acesso do Paciente</Text>
              </View>

              <View style={[styles.card, loading && { opacity: 0.7 }]} pointerEvents={loading ? 'none' : 'auto'}>

                {/* CAMPO CPF */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>CPF</Text>
                  <View style={[styles.inputWrapper, cpfFocused && styles.inputWrapperFocused]}>
                    <MaterialCommunityIcons
                        name="card-account-details-outline"
                        size={20}
                        color={COLORS.textGray}
                        style={styles.inputIcon}
                    />
                    <TextInput
                        value={cpf}
                        onChangeText={handleCpfChange}
                        style={styles.input}
                        placeholder="Digite seu CPF (apenas números)"
                        placeholderTextColor={COLORS.textLight}
                        keyboardType="numeric"
                        maxLength={14}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onFocus={() => setCpfFocused(true)}
                        onBlur={() => setCpfFocused(false)}
                        onSubmitEditing={() => senhaRef.current?.focus()}
                        editable={!loading}
                        testID="input-cpf"
                        accessibilityLabel="Campo CPF"
                    />
                  </View>
                </View>

                {/* CAMPO SENHA */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Senha</Text>
                  <View style={[styles.inputWrapper, senhaFocused && styles.inputWrapperFocused]}>
                    <MaterialCommunityIcons
                        name="lock-outline"
                        size={20}
                        color={COLORS.textGray}
                        style={styles.inputIcon}
                    />
                    <TextInput
                        ref={senhaRef}
                        style={styles.input}
                        placeholder="Digite sua senha"
                        placeholderTextColor={COLORS.textLight}
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry={!senhaVisivel}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onFocus={() => setSenhaFocused(true)}
                        onBlur={() => setSenhaFocused(false)}
                        blurOnSubmit={false}
                        onSubmitEditing={handleLogin}
                        editable={!loading}
                        testID="input-senha"
                        accessibilityLabel="Campo Senha"
                    />
                    <TouchableOpacity
                        onPress={() => setSenhaVisivel(prev => !prev)}
                        style={styles.eyeButton}
                        accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        disabled={loading}
                    >
                      <Feather
                          name={senhaVisivel ? 'eye-off' : 'eye'}
                          size={18}
                          color={COLORS.textGray}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helpText}>
                    * A senha padrão são os 3 primeiros dígitos do seu CPF.
                  </Text>
                </View>

                <TouchableOpacity
                    style={styles.forgotButton}
                    activeOpacity={0.7}
                    onPress={handleForgotPassword}
                    testID="btn-esqueceu-senha"
                    disabled={loading}
                >
                  <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
                </TouchableOpacity>

                {errorMessage ? (
                    <View style={styles.errorBox} testID="error-message">
                      <MaterialCommunityIcons name="alert-circle-outline" size={18} color={COLORS.error} />
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                {/* BOTÃO ENTRAR TRADICIONAL */}
                <TouchableOpacity
                    style={[
                      styles.loginButton,
                      loading && styles.loginButtonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.85}
                    testID="btn-entrar"
                    accessibilityLabel="Botão Entrar"
                    accessibilityRole="button"
                >
                  {loading ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                      <Text style={styles.loginButtonText}>Entrar</Text>
                  )}
                </TouchableOpacity>

              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Não tem uma conta? </Text>
                <TouchableOpacity testID="btn-cadastrar" disabled={loading} onPress={handleRegister}>
                  <Text style={styles.footerLink}>Cadastre-se</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  appTagline: {
    fontSize: 15,
    color: COLORS.textGray,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  card: {
    marginHorizontal: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWrapperFocused: {
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 114, 0.25)',
    backgroundColor: COLORS.inputBg,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
    padding: 0,
  },
  eyeButton: {
    padding: 6,
  },
  helpText: {
    fontSize: 11,
    color: COLORS.textGray,
    marginTop: 6,
    lineHeight: 15,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.errorBg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '500',
    lineHeight: 19,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  forgotButton: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textGray,
  },
  footerLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});