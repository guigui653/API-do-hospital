import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePainelWebSocket } from '../hooks/useWebSocket';
import type { ChamadoWS } from '../hooks/useWebSocket';

const BLINK_STYLE = `
  @keyframes notif-blink {
    0%   { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); border-color: #fb923c; }
    50%  { box-shadow: 0 0 0 8px rgba(234, 88, 12, 0);  border-color: #f97316; }
    100% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0);    border-color: #e5e7eb; }
  }
  .notif-nova {
    animation: notif-blink 0.8s ease-out 3;
    border-color: #fb923c !important;
  }
`;
if (!document.getElementById('ws-blink-style')) {
  const tag = document.createElement('style');
  tag.id = 'ws-blink-style';
  tag.textContent = BLINK_STYLE;
  document.head.appendChild(tag);
}

interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  horario: string;
  urgencia: 'alta' | 'media' | 'baixa';
  setor: string;
}

const CHAMADOS_INICIAIS: Chamado[] = [
  {
    id: 1,
    titulo: 'Solicitação de Água',
    descricao: 'Paciente do Leito 05 solicitou água e medicação.',
    horario: '10:42',
    urgencia: 'baixa',
    setor: 'Ala A - Pediatria',
  },
  {
    id: 2,
    titulo: 'Triagem de Emergência Finalizada',
    descricao: 'Paciente João Pereira (MED-1238) aguarda avaliação médica.',
    horario: '10:31',
    urgencia: 'alta',
    setor: 'Pronto-Socorro',
  },
  {
    id: 3,
    titulo: 'Revisão de Prontuário',
    descricao: 'Prontuário de Ana Santos (MED-1235) requer assinatura digital.',
    horario: '09:58',
    urgencia: 'media',
    setor: 'Ala B - Pediatria',
  },
];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [chamados, setChamados]       = useState<Chamado[]>(CHAMADOS_INICIAIS);
  const [novaNotifIds, setNovaNotifIds] = useState<Set<number>>(new Set());

  const handleNotificacao = useCallback((notif: ChamadoWS) => {
    const horario = new Date(notif.dataAbertura).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit',
    });

    const novoChamado: Chamado = {
      id:       notif.idChamado,
      titulo:   `Novo Chamado: ${notif.tipo}`,
      descricao: notif.observacao ?? 'Chamado sem observação',
      horario,
      urgencia: notif.tipo === 'ENFERMAGEM' ? 'alta' : 'media',
      setor:    notif.leitoPaciente ? `Leito ${notif.leitoPaciente}` : 'Leito N/A',
    };

    setChamados(prev => [novoChamado, ...prev]);
    setNovaNotifIds(prev => new Set(prev).add(notif.idChamado));

    setTimeout(() => {
      setNovaNotifIds(prev => {
        const updated = new Set(prev);
        updated.delete(notif.idChamado);
        return updated;
      });
    }, 2500);
  }, []);

  usePainelWebSocket({
    onChamadoRecebido: handleNotificacao,
    ativo: !!user,
  });

  const urgenciaBadge = (u: 'alta' | 'media' | 'baixa') => {
    const map = {
      alta:  { bg: '#fee2e2', color: '#b91c1c', label: '● Alta'  },
      media: { bg: '#fef3c7', color: '#b45309', label: '● Média' },
      baixa: { bg: '#dcfce7', color: '#15803d', label: '● Baixa' },
    };
    return map[u];
  };

  const now = new Date();
  const diasPT  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const mesesPT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const dataFormatada = `${diasPT[now.getDay()]}, ${now.getDate()} ${mesesPT[now.getMonth()]}`;

  const marcarTodosLidos = () => {
    setChamados([]);
    setNovaNotifIds(new Set());
  };

  return (
    <div style={{ display: 'flex', gap: '24px', minHeight: '100%' }}>
      <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '2px' }}>
            Olá, {user?.name?.split(' ')[0] ?? 'Dr.'}.
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Seu plantão atual:</p>
        </div>
        <div style={{ background: '#004b49', borderRadius: '14px', padding: '20px', color: '#ffffff' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
            {dataFormatada}
          </p>
          <p style={{ fontSize: '28px', fontWeight: 800, lineHeight: '1.1', marginBottom: '12px' }}>
            07:00 -<br />19:00
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '14px' }}>
            {user?.sector ?? 'Pediatria - Ala A'}
          </p>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              2h 53min restantes
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Plantão
            </span>
          </div>
        </div>
        <div style={{
          background: chamados.length > 0 ? '#fff7ed' : '#f0fdf4',
          border: `1px solid ${chamados.length > 0 ? '#fed7aa' : '#bbf7d0'}`,
          borderRadius: '12px', padding: '14px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: chamados.length > 0 ? '#ffedd5' : '#dcfce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={chamados.length > 0 ? '#ea580c' : '#16a34a'} strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', color: chamados.length > 0 ? '#9a3412' : '#166534' }}>
              {chamados.length} {chamados.length === 1 ? 'Aviso' : 'Avisos'}
            </p>
            <p style={{ fontSize: '12px', color: chamados.length > 0 ? '#c2410c' : '#15803d' }}>
              {chamados.length > 0 ? 'Pendentes' : 'Tudo em ordem ✔'}
            </p>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '2px' }}>Notificações</h1>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Avisos e alertas do sistema em tempo real</p>
          </div>
          {chamados.length > 0 && (
            <button
              onClick={marcarTodosLidos}
              style={{
                padding: '9px 18px', background: '#004b49', color: '#fff',
                border: 'none', borderRadius: '10px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Marcar todos como lidos
            </button>
          )}
        </div>
        {chamados.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '12px', padding: '60px 20px',
            background: '#f9fafb', borderRadius: '16px', border: '1.5px dashed #d1d5db',
            color: '#9ca3af', textAlign: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#6b7280' }}>Nenhuma notificação no momento</p>
            <p style={{ fontSize: '13px' }}>O sistema te avisará aqui assim que houver novidades.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chamados.map((chamado) => {
              const badge  = urgenciaBadge(chamado.urgencia);
              const isNova = novaNotifIds.has(chamado.id);
              return (
                <div
                  key={chamado.id}
                  className={isNova ? 'notif-nova' : undefined}
                  style={{
                    background:    isNova ? '#fff7ed' : '#ffffff',
                    border:        `1px solid ${isNova ? '#fb923c' : '#e5e7eb'}`,
                    borderRadius:  '14px',
                    padding:       '18px 20px',
                    display:       'flex',
                    alignItems:    'flex-start',
                    gap:           '14px',
                    boxShadow:     isNova ? '0 2px 12px rgba(234,88,12,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transition:    'background 0.4s, box-shadow 0.4s, border-color 0.4s',
                  }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                    background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={badge.color} strokeWidth="2.5">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a', margin: 0 }}>
                        {chamado.titulo}
                      </p>
                      <span style={{
                        background: badge.bg, color: badge.color,
                        fontSize: '11px', fontWeight: 700,
                        padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap',
                      }}>
                        {badge.label}
                      </span>
                      {isNova && (
                        <span style={{
                          background: '#fef3c7', color: '#b45309',
                          fontSize: '10px', fontWeight: 700,
                          padding: '2px 8px', borderRadius: '20px',
                        }}>NOVO •</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 8px', lineHeight: '1.5' }}>
                      {chamado.descricao}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#9ca3af' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {chamado.horario}
                      </span>
                      <span>{chamado.setor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ width: '220px', flexShrink: 0 }}>
        <div style={{
          background: '#ffffff', borderRadius: '14px', padding: '20px',
          border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,75,73,0.06)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#d1dbd9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 10px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <p style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>{user?.name ?? 'Dr. Silva'}</p>
          </div>
          {[
            { label: 'CPF/Código', value: user?.cpf ?? '000.000.000-00' },
            { label: 'E-mail Profissional', value: user?.email ?? 'dr.silva@hospital.com' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{f.label}</p>
              <div style={{
                background: '#f9fafb', border: '1px solid #e5e7eb',
                borderRadius: '8px', padding: '8px 12px',
                fontSize: '12px', color: '#374151',
              }}>
                {f.value}
              </div>
            </div>
          ))}
          <div>
            <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>Setor Primário</p>
            <select style={{
              width: '100%', padding: '8px 12px',
              border: '1px solid #e5e7eb', borderRadius: '8px',
              fontSize: '12px', background: '#fff', color: '#374151',
              outline: 'none', cursor: 'pointer',
            }}>
              <option>Pediatria</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
