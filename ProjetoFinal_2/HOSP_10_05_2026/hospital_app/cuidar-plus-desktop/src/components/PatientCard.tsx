import React from 'react';

type UrgencyLevel = 'Vermelho' | 'Amarelo' | 'Verde';

interface PatientCardProps {
  name: string;
  age: number;
  medicalId: string;
  specialty: string;
  urgency: UrgencyLevel;
  onAccessRecord?: () => void;
}

const urgencyColor: Record<UrgencyLevel, string> = {
  Vermelho: '#ef4444',
  Amarelo:  '#f59e0b',
  Verde:    '#22c55e',
};

const PatientCard: React.FC<PatientCardProps> = ({
  name, age, medicalId, specialty, urgency, onAccessRecord,
}) => {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,75,73,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: '#d1dbd9', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a' }}>
              {name} ({age})
            </span>
            <span style={{
              width: '9px', height: '9px', borderRadius: '50%',
              background: urgencyColor[urgency], flexShrink: 0,
              display: 'inline-block',
            }} title={urgency} />
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
            Medical ID: {medicalId}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6b7280' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        {specialty}
      </div>
      <button
        onClick={onAccessRecord}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#004b49', fontSize: '12px', fontWeight: 600,
          padding: '0', marginTop: '2px',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        Acessar Prontuário
      </button>
    </div>
  );
};

export default PatientCard;
