import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);
const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconBell = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconClipboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const navItems = [
  { to: '/dashboard',    label: 'Início',        Icon: IconHome      },
  { to: '/triagem',      label: 'Triagem',       Icon: IconClipboard },
  { to: '/notificacoes', label: 'Notificações',  Icon: IconBell      },
  { to: '/perfil',       label: 'Meu Perfil',    Icon: IconUser      },

];

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '80px',
    minWidth: '80px',
    height: '100vh',
    background: '#004b49',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '0',
    zIndex: 100,
  },
  logo: {
    width: '100%',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '18px',
    letterSpacing: '-0.5px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '12px',
    gap: '4px',
    width: '100%',
  },
  navItem: {
    width: '64px',
    padding: '10px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    fontSize: '10px',
    fontWeight: 500,
    transition: 'background 0.18s, color 0.18s',
    cursor: 'pointer',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
  },
  logoutBtn: {
    width: '64px',
    padding: '10px 0',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.5)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 500,
    transition: 'color 0.18s',
  },
};

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>C+</div>
      <nav style={styles.nav}>
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <Icon />
            <span style={{ textAlign: 'center', lineHeight: '1.2' }}>{label}</span>
          </NavLink>
        ))}
      </nav>
      <button style={styles.logoutBtn} onClick={handleLogout} title="Sair">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Sair</span>
      </button>
    </aside>
  );
};

export default Sidebar;
