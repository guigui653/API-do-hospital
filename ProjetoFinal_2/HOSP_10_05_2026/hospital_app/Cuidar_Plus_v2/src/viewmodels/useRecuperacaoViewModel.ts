import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { esqueciSenha, resetarSenha } from '../services/authService';
import { RootStackParamList } from './useLoginViewModel';

type RecuperacaoNavProp = StackNavigationProp<RootStackParamList, 'EsqueciSenha'>;

export type RecuperacaoStep = 1 | 2;

export interface RecuperacaoViewState {
  step: RecuperacaoStep;
  cpf: string;
  emailMascarado: string;
  codigo: string;
  novaSenha: string;
  confirmarSenha: string;
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

export interface RecuperacaoViewActions {
  setCpf: (v: string) => void;
  handleCpfChange: (v: string) => void;
  setCodigo: (v: string) => void;
  setNovaSenha: (v: string) => void;
  setConfirmarSenha: (v: string) => void;
  handleSolicitarCodigo: () => Promise<void>;
  handleResetarSenha: () => Promise<void>;
  voltarParaLogin: () => void;
}

export function useRecuperacaoViewModel(): RecuperacaoViewState & RecuperacaoViewActions {
  const navigation = useNavigation<RecuperacaoNavProp>();

  const [step, setStep] = useState<RecuperacaoStep>(1);
  const [cpf, setCpfRaw] = useState('');
  const [emailMascarado, setEmailMascarado] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCpfChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    let masked = digits;
    if (digits.length > 9) {
      masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    } else if (digits.length > 6) {
      masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else if (digits.length > 3) {
      masked = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    setCpfRaw(masked);
    setErrorMessage(null);
  }, []);

  const setCpf = useCallback((v: string) => {
    setCpfRaw(v);
    setErrorMessage(null);
  }, []);

  const handleSolicitarCodigo = useCallback(async () => {
    const digits = cpf.replace(/\D/g, '');

    if (!digits || digits.length !== 11) {
      setErrorMessage('Informe um CPF válido com 11 dígitos.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const resposta = await esqueciSenha(digits);
      setEmailMascarado(resposta.emailMascarado);
      setSuccessMessage(`Código enviado para ${resposta.emailMascarado}`);
      setStep(2);
    } catch (error: any) {
      if (error?.response?.status === 400) {
        setErrorMessage(error.response.data?.erro ?? 'CPF não encontrado no sistema.');
      } else if (error?.code === 'ERR_NETWORK') {
        setErrorMessage('Sem conexão com o servidor. Verifique sua rede.');
      } else {
        setErrorMessage('Erro ao solicitar o código. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [cpf]);

  const handleResetarSenha = useCallback(async () => {
    if (!codigo || codigo.length !== 6) {
      setErrorMessage('O código deve ter exatamente 6 dígitos.');
      return;
    }
    if (!novaSenha || novaSenha.length < 6) {
      setErrorMessage('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErrorMessage('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      await resetarSenha(codigo, novaSenha);
      setSuccessMessage('Senha redefinida com sucesso! Redirecionando...');
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }, 1800);
    } catch (error: any) {
      if (error?.response?.status === 400) {
        setErrorMessage(error.response.data?.erro ?? 'Código inválido ou expirado.');
      } else {
        setErrorMessage('Erro ao redefinir a senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [codigo, novaSenha, confirmarSenha, navigation]);

  const voltarParaLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return {
    step,
    cpf,
    emailMascarado,
    codigo,
    novaSenha,
    confirmarSenha,
    loading,
    errorMessage,
    successMessage,
    setCpf,
    handleCpfChange,
    setCodigo,
    setNovaSenha,
    setConfirmarSenha,
    handleSolicitarCodigo,
    handleResetarSenha,
    voltarParaLogin,
  };
}
