import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const MeuPerfilPage: React.FC = () => {
  const { user } = useAuth();
  const [nome, setNome]     = useState(user?.name ?? 'Dr. Carlos Eduardo Silva');
  const [email, setEmail]   = useState(user?.email ?? 'dr.silva@hospital.com');
  const [setor, setSetor]   = useState('Pediatria');
  const [telefone, setTelefone] = useState('(11) 98765-4321');

  const [notifSonora, setNotifSonora]  = useState(true);
  const [painelKiosk, setPainelKiosk] = useState(false);
  const [biometria, setBiometria]     = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit',
    color: '#374151', background: '#ffffff', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '13px', color: '#6b7280', marginBottom: '6px', display: 'block',
  };

  const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; id: string }> = ({ value, onChange, id }) => (
    <button
      id={id}
      onClick={() => onChange(!value)}
      aria-checked={value}
      role="switch"
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: value ? '#004b49' : '#d1d5db',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: value ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#ffffff', transition: 'left 0.2s',
      }} />
    </button>
  );

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Meu Perfil</h1>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '28px' }}>
        Gerencie suas informações pessoais e preferências
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 280px', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#004b49' }}>Configurações de Perfil</h3>
          <div style={{
            background: '#ffffff', borderRadius: '14px',
            border: '1px solid #e5e7eb', padding: '20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: '#d1dbd9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <button style={{
                position: 'absolute', bottom: '0', right: '0',
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#004b49', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>{nome.split(' ')[0]} {nome.split(' ').slice(-1)}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>CRM: 123456-SP</p>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#004b49', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Alterar Foto
            </button>
          </div>
          <div style={{
            background: '#e8f4f3', borderRadius: '12px',
            border: '1px solid #b7e0dd', padding: '16px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#004b49', marginBottom: '10px' }}>Status do Turno</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#0d8389' }}>Horas na Semana</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#004b49' }}>42h acumuladas</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#0d8389' }}>Setor Atual</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#004b49' }}>{setor} - Ala A</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#004b49', marginBottom: '16px' }}>Informações Gerais</h3>
          <div style={{
            background: '#ffffff', borderRadius: '14px',
            border: '1px solid #e5e7eb', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <div>
              <label style={labelStyle}>Nome Completo</label>
              <input value={nome} onChange={e => setNome(e.target.value)} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#0d8389')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            </div>
            <div>
              <label style={labelStyle}>CPF/Código</label>
              <input value={user?.cpf ?? '123.456.789-00'} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#9ca3af' }} />
            </div>
            <div>
              <label style={labelStyle}>E-mail Profissional</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#0d8389')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            </div>
            <div>
              <label style={labelStyle}>Setor Primário</label>
              <select value={setor} onChange={e => setSetor(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option>Pediatria</option>
                <option>Cardiologia</option>
                <option>Neurologia</option>
                <option>Ortopedia</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Telefone/Ramal Hospitalar</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#0d8389')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            </div>
            <button style={{
              width: '100%', padding: '12px', background: '#004b49', color: '#fff',
              border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1a6b65')}
              onMouseLeave={e => (e.currentTarget.style.background = '#004b49')}
              onClick={() => alert('Alterações salvas!')}
            >
              Salvar Alterações
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#004b49', marginBottom: '16px' }}>Segurança da Conta</h3>
            <div style={{
              background: '#ffffff', borderRadius: '14px',
              border: '1px solid #e5e7eb', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}>
              {[
                { label: 'Senha Atual', placeholder: 'Digite sua senha atual', id: 'senha-atual' },
                { label: 'Nova Senha',   placeholder: 'Digite sua nova senha',  id: 'nova-senha' },
                { label: 'Confirmar Nova Senha', placeholder: 'Confirme sua nova senha', id: 'conf-senha' },
              ].map(f => (
                <div key={f.id}>
                  <label style={labelStyle}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input id={f.id} type="password" placeholder={f.placeholder}
                      style={{ ...inputStyle, paddingRight: '42px' }}
                      onFocus={e => (e.target.style.borderColor = '#0d8389')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    <button style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <button style={{
                width: '100%', padding: '11px', background: '#ffffff', color: '#374151',
                border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Alterar Senha
              </button>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#004b49', marginBottom: '16px' }}>Preferências do Sistema</h3>
            <div style={{
              background: '#ffffff', borderRadius: '14px',
              border: '1px solid #e5e7eb', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              {[
                { label: 'Notificações Sonoras de Chamados Urgentes', sub: 'Alertas como "A bomba está apitando"', value: notifSonora, onChange: setNotifSonora, id: 'toggle-notif' },
                { label: 'Manter Painel Sempre Visível', sub: 'Ativar Modo Kiosk', value: painelKiosk, onChange: setPainelKiosk, id: 'toggle-kiosk' },
                { label: 'Autenticação por Biometria/FaceID', sub: 'Usar no Tablet', value: biometria, onChange: setBiometria, id: 'toggle-bio' },
              ].map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' }}>{item.label}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>{item.sub}</p>
                  </div>
                  <Toggle id={item.id} value={item.value} onChange={item.onChange} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MeuPerfilPage;
