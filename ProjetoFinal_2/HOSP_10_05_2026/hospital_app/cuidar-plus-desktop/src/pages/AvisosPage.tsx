import React from 'react';

const AvisosPage: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px', color: '#9ca3af' }}>
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#6b7280' }}>Avisos</h2>
    <p style={{ fontSize: '14px' }}>Esta seção está em construção.</p>
  </div>
);

export default AvisosPage;
