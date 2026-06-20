export type StatusChamado = 'PENDENTE' | 'ABERTO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'FINALIZADO' | 'CANCELADO';

export type TipoChamado =
  | 'ENFERMAGEM'
  | 'HOSPITALIDADE'
  | 'NUTRICAO'
  | 'LIMPEZA'
  | 'MANUTENCAO'
  | 'ROUPARIA'
  | 'PEDIDO_RAPIDO';

export interface ChamadoWS {
  idChamado: number;
  idPaciente: number | null;
  idServico: number | null;
  observacao: string;
  status: StatusChamado;
  tipo: TipoChamado;
  dataAbertura: string;
  dataInicioAtend: string | null;
  dataConclusao: string | null;
  nomePaciente: string;
  leitoPaciente: string;
}
