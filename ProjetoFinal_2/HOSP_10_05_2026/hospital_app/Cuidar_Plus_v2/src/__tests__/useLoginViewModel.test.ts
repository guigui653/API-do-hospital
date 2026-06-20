/**
 * @file useLoginViewModel.test.ts
 * @description Testes unitários para useLoginViewModel
 *
 * Cenários cobertos:
 *  1. handleLogin: validações de CPF e senha
 *  2. handleCpfChange: máscara de CPF
 */

import { renderHook, act } from '@testing-library/react-native';

// ── Mocks do authService ──
const mockLoginPaciente = jest.fn();

jest.mock('../services/authService', () => ({
  loginPaciente: (...args: any[]) => mockLoginPaciente(...args),
  apiPublica: { post: jest.fn(), get: jest.fn() },
  apiAutenticada: { post: jest.fn(), get: jest.fn(), put: jest.fn() },
}));

// ── Mock do AuthContext ──
const mockSalvarSessao = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    salvarSessao: mockSalvarSessao,
    encerrarSessao: jest.fn(),
    paciente: null,
    isLoading: false,
    isAuthenticated: false,
  }),
  STORAGE_TOKEN_KEY: '@CuidarPlus:token',
}));

import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

describe('useLoginViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────
  // handleCpfChange — Máscara de CPF
  // ─────────────────────────────────────────
  describe('handleCpfChange', () => {
    it('deve formatar CPF com máscara XXX.XXX.XXX-XX', () => {
      const { result } = renderHook(() => useLoginViewModel());

      act(() => {
        result.current.handleCpfChange('12345678901');
      });

      expect(result.current.cpf).toBe('123.456.789-01');
    });

    it('deve limpar mensagem de erro ao digitar CPF', () => {
      const { result } = renderHook(() => useLoginViewModel());

      act(() => {
        result.current.handleCpfChange('123');
      });

      expect(result.current.errorMessage).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  // handleLogin — Validações
  // ─────────────────────────────────────────
  describe('handleLogin', () => {
    it('deve mostrar erro se CPF estiver vazio', async () => {
      const { result } = renderHook(() => useLoginViewModel());

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(result.current.errorMessage).toBe('Por favor, informe o seu CPF.');
    });

    it('deve mostrar erro se CPF tiver menos de 11 dígitos', async () => {
      const { result } = renderHook(() => useLoginViewModel());

      act(() => {
        result.current.handleCpfChange('12345');
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(result.current.errorMessage).toBe('CPF inválido. Informe todos os 11 dígitos.');
    });

    it('deve mostrar erro se senha estiver vazia', async () => {
      const { result } = renderHook(() => useLoginViewModel());

      act(() => {
        result.current.handleCpfChange('12345678901');
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(result.current.errorMessage).toBe('Por favor, informe a sua senha.');
    });

    it('deve chamar loginPaciente e salvarSessao com CPF e senha válidos', async () => {
      const sessaoMock = {
        token: 'jwt-token',
        idPaciente: 1,
        nome: 'Teste',
        leito: 'A-1',
      };
      mockLoginPaciente.mockResolvedValue(sessaoMock);

      const { result } = renderHook(() => useLoginViewModel());

      act(() => {
        result.current.handleCpfChange('12345678901');
        result.current.setSenha('123');
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(mockLoginPaciente).toHaveBeenCalledWith({
        cpf: '12345678901',
        senha: '123',
      });
      expect(mockSalvarSessao).toHaveBeenCalledWith(sessaoMock);
    });

    it('deve mostrar erro 401/403 como CPF ou senha incorretos', async () => {
      mockLoginPaciente.mockRejectedValue({ response: { status: 401 } });

      const { result } = renderHook(() => useLoginViewModel());

      act(() => {
        result.current.handleCpfChange('12345678901');
        result.current.setSenha('999');
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(result.current.errorMessage).toBe('CPF ou senha incorretos. Verifique e tente novamente.');
    });
  });
});
