/**
 * @file authService.test.ts
 * @description Testes unitários para o authService
 *
 * Cenários cobertos:
 *  1. loginPaciente: login tradicional por CPF/senha (sucesso)
 *  2. loginPaciente: trata erros de rede e de status
 */

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

jest.mock('axios', () => {
  const actualCreate = jest.fn(() => mockAxiosInstance);
  return {
    __esModule: true,
    default: {
      create: actualCreate,
      get: jest.fn(),
      post: jest.fn(),
    },
    create: actualCreate,
  };
});

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────
  // loginPaciente (login tradicional)
  // ─────────────────────────────────────────
  describe('loginPaciente', () => {
    it('deve retornar uma PacienteSession válida com CPF e senha corretos', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          token: 'jwt-spring-boot',
          idPaciente: 10,
          nome: 'João',
          leito: 'B-202',
        },
      });

      const { loginPaciente } = require('../services/authService');

      const sessao = await loginPaciente({ cpf: '12345678901', senha: '123' });

      expect(sessao.token).toBe('jwt-spring-boot');
      expect(sessao.idPaciente).toBe(10);
      expect(sessao.nome).toBe('João');
    });

    it('deve lançar erro quando a API retorna 401', async () => {
      mockAxiosInstance.post.mockRejectedValue({
        response: { status: 401 },
        message: 'Unauthorized',
      });

      const { loginPaciente } = require('../services/authService');

      await expect(loginPaciente({ cpf: '12345678901', senha: 'errada' })).rejects.toMatchObject({
        response: { status: 401 },
      });
    });
  });
});
