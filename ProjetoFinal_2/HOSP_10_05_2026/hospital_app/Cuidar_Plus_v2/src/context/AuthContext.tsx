import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PacienteSession } from '../models/auth/AuthTypes';

export const STORAGE_TOKEN_KEY     = '@CuidarPlus:token';
export const STORAGE_PACIENTE_KEY  = '@CuidarPlus:paciente_session';

export const AUTH_TOKEN_KEY  = STORAGE_TOKEN_KEY;
export const PACIENTE_ID_KEY = '@CuidarPlus:id_paciente';

interface AuthContextData {

  paciente: PacienteSession | null;

  isLoading: boolean;

  isAuthenticated: boolean;

  salvarSessao: (sessao: PacienteSession) => Promise<void>;

  encerrarSessao: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [paciente, setPaciente] = useState<PacienteSession | null>(null);
  const [isLoading, setIsLoading]   = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const json = await AsyncStorage.getItem(STORAGE_PACIENTE_KEY);
        if (json) {
          const sessaoSalva: PacienteSession = JSON.parse(json);
          setPaciente(sessaoSalva);
        }
      } catch {

        await AsyncStorage.removeItem(STORAGE_PACIENTE_KEY);
      } finally {
        setIsLoading(false);
      }
    }

    restaurarSessao();
  }, []);

  const salvarSessao = useCallback(async (sessao: PacienteSession) => {

    await AsyncStorage.setItem(STORAGE_PACIENTE_KEY, JSON.stringify(sessao));

    await AsyncStorage.setItem(STORAGE_TOKEN_KEY, sessao.token);
    await AsyncStorage.setItem(PACIENTE_ID_KEY,   String(sessao.idPaciente));
    setPaciente(sessao);
  }, []);

  const encerrarSessao = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_PACIENTE_KEY,
      STORAGE_TOKEN_KEY,
      PACIENTE_ID_KEY,
    ]);
    setPaciente(null);
  }, []);

  const value = useMemo<AuthContextData>(
    () => ({
      paciente,
      isLoading,
      isAuthenticated: paciente !== null,
      salvarSessao,
      encerrarSessao,
    }),
    [paciente, isLoading, salvarSessao, encerrarSessao]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextData {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
