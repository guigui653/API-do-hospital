import React from 'react';

interface AtendimentoCardProps {
  quarto: string;
  paciente: string;
  medicalId: string;
  solicitacao: string;
  tempo: string;
  status?: 'PENDENTE' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO' | string;
  loadingIniciar?: boolean;
  onIniciar?: () => void;
  onFinalizar?: () => void;
  onCancelar: () => void;
}

const AtendimentoCard: React.FC<AtendimentoCardProps> = ({
  quarto, paciente, medicalId, solicitacao, tempo, status, loadingIniciar, onIniciar, onFinalizar, onCancelar,
}) => {

  const getStatusColor = (statusVal?: string) => {
    switch (statusVal) {
      case 'PENDENTE':
        return '#ef4444';
      case 'EM_ATENDIMENTO':
        return '#3b82f6';
      case 'CONCLUIDO':
        return '#10b981';
      case 'CANCELADO':
        return '#9ca3af';
      default:
        return '#ef4444';
    }
  };

  const isEmAtendimento = status === 'EM_ATENDIMENTO';

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,75,73,0.06)',
      padding: '18px',
      minWidth: '240px',
      maxWidth: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: '18px', color: '#1a1a1a' }}>{quarto}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {status && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: getStatusColor(status),
              textTransform: 'uppercase',
            }}>
              {status === 'EM_ATENDIMENTO' ? 'Em Atendimento' : status.toLowerCase()}
            </span>
          )}
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: getStatusColor(status),
            display: 'block'
          }} />
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a' }}>{paciente}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>ID: {medicalId}</div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#f0f9f8', borderRadius: '8px', padding: '8px 12px',
      }}>
        <span style={{ fontSize: '13px', color: '#004b49', fontWeight: 500, flex: 1 }}>{solicitacao}</span>
        <span style={{ fontSize: '12px', color: '#0d8389', fontWeight: 700, whiteSpace: 'nowrap' }}>{tempo}</span>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {isEmAtendimento && onFinalizar ? (
          <button
            onClick={onFinalizar}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              background: '#16a34a',
              color: '#ffffff',
              border: 'none', borderRadius: '8px',
              padding: '10px 8px',
              cursor: 'pointer',
              fontSize: '12px', fontWeight: 600,
              transition: 'background 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#16a34a'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Finalizar Atendimento
          </button>
        ) : (
          <button
            onClick={onIniciar}
            disabled={isEmAtendimento || loadingIniciar}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              background: isEmAtendimento || loadingIniciar ? '#9ca3af' : '#004b49',
              color: '#ffffff',
              border: 'none', borderRadius: '8px',
              padding: '10px 8px',
              cursor: isEmAtendimento || loadingIniciar ? 'not-allowed' : 'pointer',
              fontSize: '12px', fontWeight: 600,
              transition: 'background 0.18s',
            }}
            onMouseEnter={e => {
              if (!isEmAtendimento && !loadingIniciar) e.currentTarget.style.background = '#1a6b65';
            }}
            onMouseLeave={e => {
              if (!isEmAtendimento && !loadingIniciar) e.currentTarget.style.background = '#004b49';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            {loadingIniciar ? 'Aguarde...' : isEmAtendimento ? 'Em Progresso' : 'Iniciar Atendimento'}
          </button>
        )}

        <button
          onClick={onCancelar}
          style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            background: 'transparent', color: '#6b7280',
            border: '1.5px solid #e5e7eb', borderRadius: '8px',
            padding: '10px 8px', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600,
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#b91c1c'; e.currentTarget.style.borderColor = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default AtendimentoCard;
