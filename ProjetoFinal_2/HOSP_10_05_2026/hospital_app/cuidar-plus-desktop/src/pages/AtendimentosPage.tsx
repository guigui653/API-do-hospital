import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chamadoService } from '../services/api';
import { usePainelWebSocket } from '../hooks/useWebSocket';
import type { ChamadoWS, StatusChamado } from '../types/chamado';
import AtendimentoCard from '../components/AtendimentoCard';
import SlaChart from '../components/SlaChart';

type SetorId = 'enfermagem' | 'hospitalidade' | 'nutricao' | 'limpeza' | 'manutencao' | 'rouparia';
type StatusHistorico = 'Finalizado' | 'Em Atendimento' | 'Cancelado';

interface ChamadoLocal extends ChamadoWS {

  novo?: boolean;
}

interface Historico {
  id: number;
  quarto: string;
  paciente: string;
  medicalId: string;
  solicitacao: string;
  abertura: string;
  status: StatusHistorico;
  colaboradorAceite: string;
  colaboradorFinalizacao: string;
  tempoFinalizacao?: string;
  isLate?: boolean;
}

const SETORES: { id: SetorId; label: string; icon: string; tipoChamado: string }[] = [
  { id: 'enfermagem',    label: 'Enfermagem',    icon: '🩺', tipoChamado: 'ENFERMAGEM' },
  { id: 'hospitalidade', label: 'Hospitalidade', icon: '🤝', tipoChamado: 'HOSPITALIDADE' },
  { id: 'nutricao',      label: 'Nutrição',      icon: '🍽️', tipoChamado: 'NUTRICAO' },
  { id: 'limpeza',       label: 'Limpeza',       icon: '✨', tipoChamado: 'LIMPEZA' },
  { id: 'manutencao',    label: 'Manutenção',    icon: '🔧', tipoChamado: 'MANUTENCAO' },
  { id: 'rouparia',      label: 'Rouparia',      icon: '👕', tipoChamado: 'ROUPARIA' },
];

const HISTORICO_MOCK: Historico[] = [
  { id: 1, quarto: '201-A', paciente: 'Maria Silva', medicalId: 'MED-1234', solicitacao: 'Troca de roupa de cama', abertura: '14:23', status: 'Finalizado', colaboradorAceite: 'Dr. Silva', colaboradorFinalizacao: 'Dr. Silva', tempoFinalizacao: '14 min' },
  { id: 2, quarto: '208-B', paciente: 'Julia Mendes', medicalId: 'MED-1241', solicitacao: 'Kit Conforto', abertura: '15:10', status: 'Em Atendimento', colaboradorAceite: 'Carlos Lima', colaboradorFinalizacao: '-' },
  { id: 3, quarto: '209-A', paciente: 'Roberto Alves', medicalId: 'MED-1242', solicitacao: 'Retirada do enxoval', abertura: '14:05', status: 'Finalizado', colaboradorAceite: 'Ana Santos', colaboradorFinalizacao: 'Pedro Costa', tempoFinalizacao: '35 min', isLate: true },
];

// Chamados que devem aparecer no painel ativo
// CONCLUIDO é removido do painel (já vai para o histórico)
const ATIVOS: StatusChamado[] = ['ABERTO', 'EM_ATENDIMENTO'];

const calcularTempo = (dataAbertura: string): string => {
  const diff = Math.floor((Date.now() - new Date(dataAbertura).getTime()) / 60000);
  if (diff < 60) return `${diff} min`;
  return `${Math.floor(diff / 60)}h ${diff % 60}min`;
};

const statusStyleHist = (s: StatusHistorico): React.CSSProperties => {
  const map: Record<StatusHistorico, React.CSSProperties> = {
    'Finalizado':     { background: '#dcfce7', color: '#16a34a' },
    'Em Atendimento': { background: '#fef9c3', color: '#92400e' },
    'Cancelado':      { background: '#fee2e2', color: '#b91c1c' },
  };
  return { ...map[s], padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' };
};

function upsertChamado(prev: ChamadoLocal[], chamado: ChamadoWS): ChamadoLocal[] {
  // Remove do painel quando finalizado ou cancelado
  const statusRemove = chamado.status === 'CONCLUIDO' || chamado.status === 'FINALIZADO' || chamado.status === 'CANCELADO';

  if (statusRemove) {
    return prev.filter(c => c.idChamado !== chamado.idChamado);
  }

  const existe = prev.some(c => c.idChamado === chamado.idChamado);
  if (existe) {
    // Atualiza chamado existente (ex: ABERTO → EM_ATENDIMENTO)
    return prev.map(c =>
      c.idChamado === chamado.idChamado ? { ...chamado, novo: false } : c
    );
  }

  // Novo chamado: adiciona no topo com animação
  return [{ ...chamado, novo: true }, ...prev];
}

const AtendimentosPage: React.FC = () => {
  const [setorAtivo, setSetorAtivo] = useState<SetorId>('enfermagem');
  const [chamados, setChamados]     = useState<ChamadoLocal[]>([]);
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState<string | null>(null);
  const [atendendo, setAtendendo]   = useState<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const [historico, setHistorico]         = useState<ChamadoWS[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chamadoParaFinalizar, setChamadoParaFinalizar] = useState<ChamadoLocal | null>(null);
  const [descricaoResolucao, setDescricaoResolucao] = useState('');
  const [finalizando, setFinalizando] = useState(false);

  usePainelWebSocket({
    ativo: true,
    onChamadoRecebido: useCallback((chamado: ChamadoWS) => {
      const setorInfo = SETORES.find(s => s.id === setorAtivo);

      // Filtra por setor ativo — mas SEMPRE processa atualizações de chamados
      // que já estão na lista (ex: atualização de status vinda de outro setor)
      const jaExiste = setorAtivo && false; // reservado para futura lógica
      if (setorInfo && chamado.tipo !== setorInfo.tipoChamado && !jaExiste) return;

      setChamados(prev => upsertChamado(prev, chamado));

      // Disparar animação para chamados novos (ABERTO é o status inicial do backend)
      // O backend NÃO emite 'PENDENTE' — o status inicial é 'ABERTO'
      if (chamado.status === 'ABERTO' || chamado.status === 'PENDENTE') {
        setTimeout(() => {
          setChamados(prev =>
            prev.map(c => c.idChamado === chamado.idChamado ? { ...c, novo: false } : c)
          );
        }, 5000);
      }
    }, [setorAtivo]),
  });

  const fetchChamados = useCallback(async (setor: SetorId) => {
    const setorInfo = SETORES.find(s => s.id === setor);
    if (!setorInfo) return;

    setLoading(true);
    setErro(null);

    try {
      const { data } = await chamadoService.listarPorTipo(setorInfo.tipoChamado);
      const ativos = data.filter(c => ATIVOS.includes(c.status as StatusChamado));
      setChamados(ativos.map(c => ({ ...c, novo: false })));
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setErro('Sessão expirada. Faça login novamente.');
      } else if (err?.code === 'ERR_NETWORK') {
        setErro('Sem conexão com o servidor. Verifique se a API está em execução.');
      } else {
        setErro('Erro ao carregar chamados. Tente atualizar a página.');
      }
      setChamados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistorico = useCallback(async (setor: SetorId) => {
    const setorInfo = SETORES.find(s => s.id === setor);
    if (!setorInfo) return;

    setLoadingHistorico(true);
    try {
      const { data } = await chamadoService.listarFinalizados();

      const doSetor = data.filter(c => c.tipo === setorInfo.tipoChamado);
      setHistorico(doSetor);
    } catch {
      setHistorico([]);
    } finally {
      setLoadingHistorico(false);
    }
  }, []);

  useEffect(() => {
    fetchChamados(setorAtivo);
    fetchHistorico(setorAtivo);
  }, [setorAtivo, fetchChamados, fetchHistorico]);

  const handleAtender = useCallback(async (idChamado: number) => {
    setAtendendo(idChamado);
    try {
      await chamadoService.confirmar(idChamado);

      setChamados(prev =>
        prev.map(c =>
          c.idChamado === idChamado
            ? { ...c, status: 'EM_ATENDIMENTO' as StatusChamado, novo: false }
            : c
        )
      );
    } catch (err: any) {
      alert(`Erro ao atender chamado: ${err?.response?.data?.message ?? err.message}`);
    } finally {
      setAtendendo(null);
    }
  }, []);

  const handleCancelar = useCallback(async (idChamado: number) => {
    if (!window.confirm('Cancelar este chamado?')) return;
    try {
      await chamadoService.cancelar(idChamado);
      setChamados(prev => prev.filter(c => c.idChamado !== idChamado));
    } catch (err: any) {
      alert(`Erro ao cancelar: ${err?.response?.data?.message ?? err.message}`);
    }
  }, []);

  const handleOpenFinalizar = useCallback((chamado: ChamadoLocal) => {
    setChamadoParaFinalizar(chamado);
    setDescricaoResolucao('');
    setIsModalOpen(true);
  }, []);

  const handleConfirmarFinalizar = useCallback(async () => {
    if (!chamadoParaFinalizar) return;
    if (!descricaoResolucao.trim()) {
      alert('A descrição da resolução é obrigatória.');
      return;
    }
    setFinalizando(true);
    try {
      await chamadoService.finalizar(chamadoParaFinalizar.idChamado, descricaoResolucao.trim());

      setChamados(prev => prev.filter(c => c.idChamado !== chamadoParaFinalizar.idChamado));
      setIsModalOpen(false);
      setChamadoParaFinalizar(null);
    } catch (err: any) {
      alert(`Erro ao finalizar chamado: ${err?.response?.data?.message ?? err.message}`);
    } finally {
      setFinalizando(false);
    }
  }, [chamadoParaFinalizar, descricaoResolucao]);

  const scrollTabs = (dir: 'left' | 'right') => {
    if (tabsRef.current) tabsRef.current.scrollLeft += dir === 'left' ? -120 : 120;
  };

  const formatarDataHora = (iso: string | null): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes piscar {
          0%,100% { box-shadow: 0 0 0 0 rgba(234,179,8,0); }
          50%      { box-shadow: 0 0 0 6px rgba(234,179,8,0.5); }
        }
        .card-novo { animation: piscar 1s ease-in-out 5; }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '2px' }}>
            Painel Multidisciplinar
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            Chamados em Tempo Real via WebSocket ·{' '}
            <span style={{ color: '#16a34a', fontWeight: 600 }}>● Conectado</span>
          </p>
        </div>
        <button
          onClick={() => fetchChamados(setorAtivo)}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', border: '1.5px solid #e5e7eb',
            borderRadius: '8px', background: '#fff',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#374151',
            fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {loading ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={() => scrollTabs('left')} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>‹</button>

        <div ref={tabsRef} style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollBehavior: 'smooth', flex: 1, scrollbarWidth: 'none' }}>
          {SETORES.map(s => (
            <button
              key={s.id}
              onClick={() => setSetorAtivo(s.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
                border: '1.5px solid',
                borderColor: setorAtivo === s.id ? '#004b49' : '#e5e7eb',
                background: setorAtivo === s.id ? '#004b49' : '#ffffff',
                color: setorAtivo === s.id ? '#ffffff' : '#374151',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.18s', fontFamily: 'inherit',
              }}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        <button onClick={() => scrollTabs('right')} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>›</button>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', minHeight: '120px' }}>

        {loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: '14px', border: '1.5px dashed #d1d5db', padding: '32px', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#004b49', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: '#6b7280', fontSize: '14px' }}>Buscando chamados...</span>
          </div>
        )}

        {!loading && erro && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', borderRadius: '14px', border: '1.5px solid #fecaca', padding: '32px', color: '#b91c1c', fontSize: '14px', gap: '10px', flexDirection: 'column' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <span>{erro}</span>
            <button onClick={() => fetchChamados(setorAtivo)} style={{ background: '#004b49', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !erro && chamados.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: '14px', border: '1.5px dashed #d1d5db', padding: '32px', color: '#9ca3af', fontSize: '14px', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Nenhum chamado ativo para <strong style={{ color: '#374151' }}>{SETORES.find(s => s.id === setorAtivo)?.label}</strong> no momento.
          </div>
        )}
        {!loading && !erro && chamados.map(c => (
          <div key={c.idChamado} className={c.novo ? 'card-novo' : ''} style={{ borderRadius: '14px' }}>
            {c.status === 'CONCLUIDO' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#fffbeb', border: '1.5px solid #f59e0b',
                borderRadius: '10px 10px 0 0', padding: '6px 14px',
                fontSize: '12px', fontWeight: 700, color: '#b45309',
              }}>
                <span>⏳</span> Aguardando Avaliação do Paciente
              </div>
            )}

            <AtendimentoCard
              quarto={c.leitoPaciente ?? 'Leito N/A'}
              paciente={c.nomePaciente ?? 'N/A'}
              medicalId={`#${c.idChamado}`}
              solicitacao={c.observacao ?? 'Sem descrição'}
              tempo={calcularTempo(c.dataAbertura)}
              status={c.status}
              onIniciar={

                (c.status === 'PENDENTE' || c.status === 'ABERTO')
                  ? () => handleAtender(c.idChamado)
                  : undefined
              }
              onFinalizar={
                (c.status === 'EM_ATENDIMENTO' && c.tipo !== 'ENFERMAGEM')
                  ? () => handleOpenFinalizar(c)
                  : undefined
              }
              loadingIniciar={atendendo === c.idChamado}
              onCancelar={

                c.status !== 'CONCLUIDO'
                  ? () => handleCancelar(c.idChamado)
                  : undefined
              }
            />
          </div>
        ))}
      </div>
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,75,73,0.06)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>↗</span> Indicadores de SLA e Performance da Ala
        </h3>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0, width: '180px' }}>
            <div style={{ background: '#e8f4f3', borderRadius: '10px', padding: '16px', border: '1px solid #b7e0dd' }}>
              <div style={{ fontSize: '12px', color: '#0d8389', fontWeight: 600, marginBottom: '6px' }}>⏱ Tempo Médio de Resposta</div>
              <p style={{ fontSize: '26px', fontWeight: 800, color: '#1d4ed8', lineHeight: 1 }}>18 min</p>
              <p style={{ fontSize: '11px', color: '#0d8389', marginTop: '4px' }}>Turno Atual</p>
            </div>
            <div style={{ background: '#e8f4f3', borderRadius: '10px', padding: '16px', border: '1px solid #b7e0dd' }}>
              <div style={{ fontSize: '12px', color: '#0d8389', fontWeight: 600, marginBottom: '6px' }}>↗ Aderência à Meta de SLA</div>
              <p style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>78%</p>
              <p style={{ fontSize: '11px', color: '#0d8389', marginTop: '4px' }}>Meta: 85%</p>
            </div>
          </div>
          <div style={{ flex: 1 }}><SlaChart /></div>
        </div>
      </div>
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,75,73,0.06)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Histórico e Auditoria de Atendimentos</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                {['PACIENTE / LEITO', 'SOLICITAÇÃO', 'ABERTURA', 'CONCLUSÃO', 'AVALIAÇÃO', 'STATUS'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingHistorico && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Carregando histórico...</td></tr>
              )}
              {!loadingHistorico && historico.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>Nenhum atendimento finalizado encontrado para este setor.</td></tr>
              )}
              {!loadingHistorico && historico.map(row => (
                <tr key={row.idChamado} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#004b49', fontSize: '13px' }}>{row.leitoPaciente}</div>
                    <div style={{ fontSize: '12px', color: '#374151' }}>{row.nomePaciente}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>#{row.idChamado}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151', maxWidth: '200px' }}>{row.observacao}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>{formatarDataHora(row.dataAbertura)}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>{formatarDataHora(row.dataConclusao)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {(row as any).notaAvaliacao != null ? (
                      <span style={{ fontWeight: 700, color: '#92400e' }}>
                        {'⭐'.repeat((row as any).notaAvaliacao)}
                      </span>
                    ) : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                      ✓ Finalizado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={() => fetchHistorico(setorAtivo)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', border: 'none', borderRadius: '8px', background: '#004b49', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Atualizar Histórico
          </button>
        </div>
      </div>
      {isModalOpen && chamadoParaFinalizar && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
          fontFamily: 'inherit',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '450px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '12px',
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#004b49' }}>
                Finalizar Atendimento
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  lineHeight: 1,
                  padding: '4px',
                }}
              >
                &times;
              </button>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px',
              color: '#4b5563',
              background: '#f9fafb',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
            }}>
              <div><strong>Paciente:</strong> {chamadoParaFinalizar.nomePaciente ?? 'N/A'}</div>
              <div><strong>Leito:</strong> {chamadoParaFinalizar.leitoPaciente ?? 'Leito N/A'}</div>
              <div><strong>Solicitação:</strong> {chamadoParaFinalizar.observacao ?? 'Sem descrição'}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                O que foi feito para resolver este chamado? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={descricaoResolucao}
                onChange={(e) => setDescricaoResolucao(e.target.value)}
                placeholder="Descreva a ação tomada..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px',
            }}>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={finalizando}
                style={{
                  padding: '8px 16px',
                  border: '1.5px solid #d1d5db',
                  borderRadius: '8px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#4b5563',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarFinalizar}
                disabled={finalizando || !descricaoResolucao.trim()}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: finalizando || !descricaoResolucao.trim() ? '#9ca3af' : '#16a34a',
                  color: '#fff',
                  cursor: finalizando || !descricaoResolucao.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {finalizando ? 'Salvando...' : 'Confirmar e Encerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtendimentosPage;
