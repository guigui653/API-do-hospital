import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { loginPaciente } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  EsqueciSenha: undefined;
  ResetarSenha: { emailMascarado: string };
  CategoriaDetalhes: { categoriaId: string; label: string };
  NovoPedido: { categoriaId: string; categoriaLabel: string; subCategoriaLabel: string };
  SelecaoAtendimento: undefined;
};

type LoginNavProp = StackNavigationProp<RootStackParamList, 'Login'>;

export const AUTH_TOKEN_KEY = '@CuidarPlus:token';
export const PACIENTE_ID_KEY = '@CuidarPlus:id_paciente';

export interface LoginViewState {
  cpf: string;
  senha: string;
  loading: boolean;
  errorMessage: string | null;
}

export interface LoginViewActions {
  setCpf: (value: string) => void;
  setSenha: (value: string) => void;
  handleCpfChange: (value: string) => void;
  handleLogin: () => Promise<void>;
}

export function useLoginViewModel(): LoginViewState & LoginViewActions {
  const navigation = useNavigation<LoginNavProp>();
  const { salvarSessao } = useAuth();

  const [cpf, setCpfRaw] = useState('');
  const [senha, setSenhaRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCpfChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    let masked = digits;
    if (digits.length > 9) masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    else if (digits.length > 6) masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    else if (digits.length > 3) masked = `${digits.slice(0, 3)}.${digits.slice(3)}`;

    setCpfRaw(masked);
    setErrorMessage(null);
  }, []);

  const setCpf = useCallback((value: string) => {
    setCpfRaw(value);
    setErrorMessage(null);
  }, []);

  const setSenha = useCallback((value: string) => {
    setSenhaRaw(value);
    setErrorMessage(null);
  }, []);

  const handleLogin = useCallback(async () => {
    const cpfDigits = cpf.replace(/\D/g, '');

    if (!cpfDigits) {
      setErrorMessage('Por favor, informe o seu CPF.');
      return;
    }
    if (cpfDigits.length !== 11) {
      setErrorMessage('CPF inválido. Informe todos os 11 dígitos.');
      return;
    }
    if (!senha.trim()) {
      setErrorMessage('Por favor, informe a sua senha.');
      return;
    }
    if (senha.trim().length < 3) {
      setErrorMessage('A senha deve ter pelo menos 3 caracteres.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const sessao = await loginPaciente({ cpf: cpfDigits, senha: senha.trim() });
      await salvarSessao(sessao);
    } catch (error: any) {
      const status = error?.response?.status;
      const code = error?.code;
      console.error('[ERROR] useLoginViewModel.ts', error);
      if (status === 401 || status === 403) {
        setErrorMessage('CPF ou senha incorretos. Verifique e tente novamente.');
      } else if (status === 404) {
        setErrorMessage('Paciente não encontrado. Confirme o CPF com a recepção.');
      } else if (code === 'ECONNREFUSED' || code === 'ERR_NETWORK') {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique sua conexão Wi-Fi.');
      } else if (code === 'ECONNABORTED') {
        setErrorMessage('O servidor demorou para responder. Tente novamente.');
      } else {
        setErrorMessage('Ocorreu um erro inesperado. Tente novamente em instantes.');
      }
    } finally {
      setLoading(false);
    }
  }, [cpf, senha, navigation, salvarSessao]);

  return {
    cpf,
    senha,
    loading,
    errorMessage,
    setCpf,
    setSenha,
    handleCpfChange,
    handleLogin,
  };
}