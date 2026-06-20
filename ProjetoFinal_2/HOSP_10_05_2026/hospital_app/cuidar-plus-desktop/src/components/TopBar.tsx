import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const TopBar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: '56px',
      background: '#004b49',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      zIndex: 50,
    }}>
      <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
        Cuidar+
      </span>
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: '1.5px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          color: '#ffffff',
          padding: '7px 14px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          transition: 'background 0.18s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        LogOut
      </button>
    </header>
  );
};

export default TopBar;
