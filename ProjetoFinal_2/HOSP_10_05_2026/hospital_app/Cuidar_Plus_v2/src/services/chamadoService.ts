import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiAutenticada } from './authService';

export type TipoChamado =
  | 'ENFERMAGEM'
  | 'NUTRICAO'
  | 'ROUPARIA'
  | 'LIMPEZA'
  | 'MANUTENCAO'
  | 'HOSPITALIDADE'
  | 'PEDIDO_RAPIDO'
  | 'APOIO_PSICOLOGICO'
  | 'APOIO_RELIGIOSO'
  | 'APOIO_HUMANIZADO';

export interface ChamadoResponse {
  idChamado: number;
  observacao: string;
  status: string;
  tipo: string;
  dataAbertura: string;
  nomePaciente: string;
  leitoPaciente: string;
  notaAvaliacao?: number;
  comentarioAvaliacao?: string;
}

const TOKEN_KEY = '@CuidarPlus:token';
const PACIENTE_KEY = '@CuidarPlus:id_paciente';

async function getToken(): Promise<string> {
  const token =
    Platform.OS === 'web'
      ? localStorage.getItem(TOKEN_KEY)
      : await AsyncStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error('Usuário não autenticado. Token não encontrado. Faça login novamente.');
  }

  return token;
}

export async function abrirChamado(
  tipo: TipoChamado,
  observacao?: string
): Promise<ChamadoResponse> {

  // Lê o idPaciente do AsyncStorage — OBRIGATÓRIO para o backend
  const idPacienteStr =
    Platform.OS === 'web'
      ? localStorage.getItem(PACIENTE_KEY)
      : await AsyncStorage.getItem(PACIENTE_KEY);

  // Converte e valida — NaN ou 0 indicam problema na sessão
  const idPaciente = idPacienteStr ? Number(idPacienteStr) : null;

  if (!idPaciente || isNaN(idPaciente)) {
    // O backend faz cast direto (Usuario) auth.getPrincipal() quando idPaciente é null,
    // mas o principal do paciente é do tipo Paciente, não Usuario — causa ClassCastException.
    // Por isso precisamos garantir que o idPaciente chegue sempre no body.
    throw new Error(
      'Sessão inválida: idPaciente não encontrado. Faça logout e entre novamente.'
    );
  }

  // O interceptor de apiAutenticada já injeta o Authorization Bearer automaticamente.
  const response = await apiAutenticada.post<ChamadoResponse>('/api/chamados', {
    tipo,
    idPaciente,   // sempre enviado como número válido
    observacao: observacao ?? `Solicitação de ${tipo.toLowerCase().replace(/_/g, ' ')}`,
  });

  return response.data;
}

export async function abrirPedidoRapido(idItem: string): Promise<ChamadoResponse> {

  // O interceptor de apiAutenticada já injeta o Authorization Bearer automaticamente.
  const response = await apiAutenticada.post<ChamadoResponse>('/api/chamados/pedido-rapido', {
    idItem,
  });

  return response.data;
}

export async function avaliarChamado(
  idChamado: number,
  nota: number,
  comentario?: string
): Promise<ChamadoResponse> {
  // O interceptor de apiAutenticada já injeta o Authorization Bearer automaticamente.
  const response = await apiAutenticada.post<ChamadoResponse>(
    `/api/chamados/${idChamado}/avaliar`,
    { nota, comentario },
  );
  return response.data;
}
