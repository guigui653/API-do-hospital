import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { LoginRequest, LoginResponse, PacienteSession } from '../models/auth/AuthTypes';
import { STORAGE_TOKEN_KEY } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────
// CONFIGURAÇÃO DA URL BASE
//
// • Emulador Android (AVD oficial): usa 10.0.2.2
//   → O AVD redireciona 10.0.2.2 automaticamente para o localhost do seu PC
//
// • Simulador iOS / dispositivo físico / web: usa o IP da sua máquina
//   → Descubra seu IP com: ipconfig (Windows) | ifconfig (Mac/Linux)
//   → Exemplo: 'http://192.168.1.105:8080'
//
// Ao trocar de rede Wi-Fi, atualize DEV_MACHINE_IP.
// ─────────────────────────────────────────────────────────────

const DEV_MACHINE_IP = '192.168.15.186'; // ← IP atual da sua máquina (Wi-Fi)

const getBaseURL = (): string => {
  if (__DEV__) {
    // Usamos o IP real (192.168.15.186) para que tanto o emulador quanto
    // o dispositivo físico (no mesmo Wi-Fi) consigam se conectar sem erro de rede.
    return `http://${DEV_MACHINE_IP}:8080`;
  }
  // ← Em produção, coloque aqui a URL do seu servidor real
  return 'https://sua-api-em-producao.com';
};

export const API_BASE_URL = getBaseURL();

export const apiPublica = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const apiAutenticada = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiAutenticada.interceptors.request.use(async (config) => {

  let token: string | null = null;

  try {
    token = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
  } catch {

    token = null;
  }

  // Fallback para Web (Expo Web)
  if (!token && (Platform.OS === 'web')) {
    try {
      token = localStorage.getItem(STORAGE_TOKEN_KEY);
    } catch {
      token = null;
    }
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function loginPaciente(dados: LoginRequest): Promise<PacienteSession> {
  const payload = {
    cpf: dados.cpf.replace(/\D/g, ''),
    senha: dados.senha,
  };

  const loginRes = await apiPublica.post<LoginResponse>('/api/auth/login', payload);
  const { token, idPaciente, nome: nomeDoToken, leito: leitoDoToken } = loginRes.data;
  console.log("[DEBUG] loginRes", loginRes);
  let nome = nomeDoToken ?? 'Paciente';
  let leito = leitoDoToken;

  if (!nomeDoToken && idPaciente) {
    try {
      const pacienteRes = await apiPublica.get<{
        nome?: string;
        leito?: string;
        numeroProntuario?: string;
      }>(`/api/pacientes/${idPaciente}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      nome = pacienteRes.data.nome ?? nome;
      leito = pacienteRes.data.leito ?? leito;
    } catch (error) {
      console.error("[ERROR] authService.ts", error)
    }
  }

  return { token, idPaciente, nome, leito };
}

export async function esqueciSenha(cpf: string): Promise<{ emailMascarado: string }> {
  const response = await apiPublica.post<{ emailMascarado: string }>(
    '/api/auth/esqueci-senha',
    { cpf: cpf.replace(/\D/g, '') }
  );
  return response.data;
}

export async function resetarSenha(
  codigo: string,
  novaSenha: string
): Promise<{ mensagem: string }> {
  const response = await apiPublica.post<{ mensagem: string }>(
    '/api/auth/resetar-senha',
    { codigo, novaSenha }
  );
  return response.data;
}

export interface PacienteAtualizacaoPayload {
  idPaciente: number;
  telefoneContato?: string;
  nomeResponsavel?: string;
  telefoneResponsavel?: string;
}

export async function atualizarPaciente(id: number, dados: PacienteAtualizacaoPayload): Promise<any> {
  const response = await apiAutenticada.put(`/api/pacientes/${id}`, dados);
  return response.data;
}

export default apiAutenticada;
