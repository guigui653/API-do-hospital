import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const maskCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
};

type RecoveryStep = 'solicitar' | 'resetar' | 'sucesso';

interface RecoveryModalProps {
  onClose: () => void;
}

const RecoveryModal: React.FC<RecoveryModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<RecoveryStep>('solicitar');
  const [cpf, setCpf] = useState('');
  const [emailMascarado, setEmailMascarado] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) {
      setErro('Informe um CPF válido com 11 dígitos.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/esqueci-senha`, { cpf: digits });
      setEmailMascarado(data.emailMascarado);
      setStep('resetar');
    } catch (err: any) {
      setErro(err?.response?.data?.erro ?? 'CPF não encontrado no sistema.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo.length !== 6) { setErro('O código deve ter 6 dígitos.'); return; }
    if (novaSenha.length < 6) { setErro('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (novaSenha !== confirmarSenha) { setErro('As senhas não coincidem.'); return; }
    setErro('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/resetar-senha`, { codigo, novaSenha });
      setStep('sucesso');
    } catch (err: any) {
      setErro(err?.response?.data?.erro ?? 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = '#0d8389';
      e.target.style.boxShadow = '0 0 0 3px rgba(152,230,236,0.4)';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = '#e5e7eb';
      e.target.style.boxShadow = 'none';
    },
  };

  return (

    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,75,73,0.2)',
        padding: '40px 36px', width: '100%', maxWidth: '400px',
        position: 'relative', animation: 'slideUp 0.25s ease',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: '#f3f4f6', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer',
            fontSize: '18px', color: '#6b7280', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Fechar"
        >×</button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: '#e8f4f3', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
            border: '2px solid #0d8389',
          }}>
            <span style={{ fontSize: '28px' }}>
              {step === 'sucesso' ? '✅' : '🔐'}
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#004b49', margin: 0 }}>
            {step === 'solicitar' && 'Recuperar Senha'}
            {step === 'resetar' && 'Criar Nova Senha'}
            {step === 'sucesso' && 'Senha Redefinida!'}
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
            {step === 'solicitar' && 'Informe seu CPF para receber o código de verificação.'}
            {step === 'resetar' && `Código enviado para ${emailMascarado}. Informe-o abaixo.`}
            {step === 'sucesso' && 'Sua senha foi redefinida com sucesso. Você já pode fazer login.'}
          </p>
        </div>
        {step === 'solicitar' && (
          <form onSubmit={handleSolicitarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              id="recovery-cpf"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => { setCpf(maskCPF(e.target.value)); setErro(''); }}
              style={inputStyle}
              {...focusHandlers}
              autoFocus
            />
            {erro && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
                {erro}
              </div>
            )}
            <button
              id="btn-recovery-solicitar"
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#004b49',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '13px', fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        )}
        {step === 'resetar' && (
          <form onSubmit={handleResetarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>
                Código de Verificação
              </label>
              <input
                id="recovery-codigo"
                type="text"
                placeholder="000000"
                value={codigo}
                maxLength={6}
                onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '')); setErro(''); }}
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '12px', fontSize: '20px', fontWeight: 700 }}
                {...focusHandlers}
                autoFocus
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>Nova Senha</label>
              <input id="recovery-nova-senha" type="password" placeholder="Mínimo 6 caracteres" value={novaSenha}
                onChange={(e) => { setNovaSenha(e.target.value); setErro(''); }}
                style={inputStyle} {...focusHandlers} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>Confirmar Senha</label>
              <input id="recovery-confirmar-senha" type="password" placeholder="Repita a senha" value={confirmarSenha}
                onChange={(e) => { setConfirmarSenha(e.target.value); setErro(''); }}
                style={inputStyle} {...focusHandlers} />
            </div>
            {erro && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
                {erro}
              </div>
            )}
            <button
              id="btn-recovery-resetar"
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#004b49',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '13px', fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}
        {step === 'sucesso' && (
          <button
            id="btn-recovery-fechar-sucesso"
            onClick={onClose}
            style={{
              width: '100%', background: '#004b49', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px',
            }}
          >
            Ir para o Login
          </button>
        )}
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [cpf, setCpf]                 = useState('');
  const [senha, setSenha]             = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showRecovery, setShowRecovery] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(maskCPF(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!cpf || !senha) { setError('Preencha o CPF e a senha para continuar.'); return; }
    if (senha.length < 4) { setError('A senha deve ter pelo menos 4 caracteres.'); return; }
    setLoading(true);
    try {
      await login(cpf, senha);
      navigate('/triagem');
    } catch {
      setError('CPF ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showRecovery && <RecoveryModal onClose={() => setShowRecovery(false)} />}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#f0f4f4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}>
        <div style={{
          background: '#ffffff', borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0,75,73,0.12)',
          padding: '44px 40px', width: '100%', maxWidth: '420px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#004b49', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#004b49', marginBottom: '6px' }}>
              Cuidar+
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
              Olá! Seja bem-vindo ao seu portal de cuidados.<br />
              Acesso restrito para colaboradores.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: loading ? 0.7 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                id="login-cpf"
                type="text"
                placeholder="Digite seu CPF (000.000.000-00)"
                value={cpf}
                onChange={handleCpfChange}
                required
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  border: '1.5px solid #e5e7eb', borderRadius: '10px',
                  fontSize: '14px', fontFamily: 'inherit',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#0d8389'; e.target.style.boxShadow = '0 0 0 3px rgba(152,230,236,0.4)'; }}
                onBlur={e  => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="login-senha"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 42px 13px 42px',
                  border: '1.5px solid #e5e7eb', borderRadius: '10px',
                  fontSize: '14px', fontFamily: 'inherit',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#0d8389'; e.target.style.boxShadow = '0 0 0 3px rgba(152,230,236,0.4)'; }}
                onBlur={e  => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                disabled={loading}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0,
                }}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button
                id="btn-esqueci-senha"
                type="button"
                disabled={loading}
                onClick={() => setShowRecovery(true)}
                style={{
                  background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  color: '#0d8389', fontSize: '13px', fontWeight: 600,
                  textDecoration: 'underline', textUnderlineOffset: '2px',
                }}
              >
                Esqueceu sua senha?
              </button>
            </div>
            {error && (
              <div style={{
                background: '#fce8e6', color: '#c5221f',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '13px', fontWeight: 500,
              }}>
                {error}
              </div>
            )}
            <button
              id="login-btn-entrar"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#6b9e9a' : '#004b49',
                color: '#ffffff', border: 'none', borderRadius: '10px',
                fontSize: '16px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
