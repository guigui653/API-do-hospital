export interface LoginRequest {

  cpf: string;

  senha: string;
}

export interface LoginResponse {

  token: string;

  idPaciente: number;

  nome?: string;

  leito?: string;
}

export interface PacienteSession {

  token: string;

  idPaciente: number;

  nome: string;

  leito?: string;
}
