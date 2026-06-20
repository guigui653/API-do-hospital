import axios from 'axios';
import type { ChamadoWS } from '../types/chamado';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  let token: string | null = null;

  const stored = localStorage.getItem('cuidar_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user?.token) token = user.token;
    } catch {  }
  }

  if (!token) {
    token = localStorage.getItem('@CuidarPlus:token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authService = {

  login: (cpf: string, senha: string) =>
    api.post<{ token: string; nome?: string; role?: string }>(
      '/api/auth/login', { cpf, senha }
    ),

  logout: () => api.post('/api/auth/logout').catch(() => {}),
};

export interface TriagemPayload {
  pacienteNome: string;
  cpf: string;
  idade: number | null;
  pressaoArterial: string;
  temperatura: number | null;
  alergias: string;
  sintomas: string;
  nivelUrgencia: string;
}

export const triagemService = {
  enviar: (payload: TriagemPayload) =>
    api.post('/api/triagem', payload),
};

export const pacienteService = {
  listar: () => api.get('/pacientes'),
  buscarPorId: (id: number | string) => api.get(`/pacientes/${id}`),
};

export const chamadoService = {

  listarAtivos: () =>
    api.get<ChamadoWS[]>('/chamados/ativos'),

  listarPorTipo: (tipo: string) =>
    api.get<ChamadoWS[]>(`/chamados/tipo/${tipo}`),

  listarTodos: () =>
    api.get<ChamadoWS[]>('/chamados'),

  confirmar: (id: number) =>
    api.put<ChamadoWS>(`/chamados/${id}/confirmar`),

  finalizar: (id: number, descricaoResolucao: string) =>
    api.put<ChamadoWS>(`/chamados/${id}/finalizar`, { descricaoResolucao }),

  // Chamados finalizados — no backend o status é 'CONCLUIDO' (não 'FINALIZADO')
  listarFinalizados: () =>
    api.get<ChamadoWS[]>('/chamados/status/CONCLUIDO'),

  listarHistoricoSetor: (tipo: string) =>
    api.get<ChamadoWS[]>(`/chamados/tipo/${tipo}`),

  cancelar: (id: number) =>
    api.put<ChamadoWS>(`/chamados/${id}`, { status: 'CANCELADO' }),
};

export default api;
