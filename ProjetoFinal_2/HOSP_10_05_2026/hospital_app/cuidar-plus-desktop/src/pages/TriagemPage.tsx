import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type UrgencyLevel = 'VERDE' | 'AMARELO' | 'VERMELHO' | '';

interface FormData {
  pacienteNome: string;
  cpf: string;
  idade: string;
  nivelUrgencia: UrgencyLevel;
  pressaoArterial: string;
  temperatura: string;
  alergias: string;
  sintomas: string;
}

const maskCPF = (v: string) =>
  v.replace(/\D/g, '').slice(0, 11)
   .replace(/(\d{3})(\d)/, '$1.$2')
   .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
   .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');

const TriagemPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    pacienteNome: '', cpf: '', idade: '', nivelUrgencia: '',
    pressaoArterial: '', temperatura: '', alergias: '', sintomas: '',
  });
  const [alertaIdade, setAlertaIdade] = useState('');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<{ message: string; senhaGerada?: string; idPaciente?: number } | null>(null);
  const [error, setError]             = useState('');
  const [copiado, setCopiado]         = useState(false);

  const handleIdadeChange = (value: string) => {
    const idade = parseInt(value);
    let novaUrgencia = form.nivelUrgencia;
    let alerta = '';

    if (!isNaN(idade)) {
      if (idade >= 80) {
        alerta = '⚠️ Risco Crítico: Paciente superidoso (+80)';
        novaUrgencia = 'VERMELHO';
      } else if (idade >= 60) {
        alerta = '⚠️ Risco Elevado: Paciente idoso (+60)';
        if (novaUrgencia === '' || novaUrgencia === 'VERDE') novaUrgencia = 'AMARELO';
      }
    }

    setAlertaIdade(alerta);
    setForm(prev => ({ ...prev, idade: value, nivelUrgencia: novaUrgencia }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setForm(prev => ({ ...prev, cpf: maskCPF(value) }));
    } else if (name === 'idade') {
      handleIdadeChange(value);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    const payload = {
      pacienteNome:  form.pacienteNome,
      cpf:           form.cpf.replace(/\D/g, ''),
      idade:         parseInt(form.idade) || null,
      pressaoArterial: form.pressaoArterial,
      temperatura:   parseFloat(form.temperatura) || null,
      alergia:       form.alergias,
      sintomas:      form.sintomas,
      nivelUrgencia: form.nivelUrgencia,
    };

    try {
      const res = await fetch('http://localhost:8080/api/triagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok) {
        setResult(data);
        setForm({ pacienteNome: '', cpf: '', idade: '', nivelUrgencia: '', pressaoArterial: '', temperatura: '', alergias: '', sintomas: '' });
        setAlertaIdade('');
      } else {
        throw new Error(data.error || 'Erro ao enviar triagem.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro de conexão com o servidor.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopiar = () => {
    if (result?.senhaGerada) {
      navigator.clipboard.writeText(result.senhaGerada);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
          Triagem Inteligente
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Cadastre os dados do paciente para geração e posicionamento automático na fila de urgência.
        </p>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: '30px' }}>
          {!result && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Nome do Paciente *</label>
                <input
                  name="pacienteNome"
                  type="text"
                  className="form-input"
                  placeholder="Nome completo"
                  value={form.pacienteNome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CPF *</label>
                <input
                  name="cpf"
                  type="text"
                  className="form-input"
                  placeholder="Ex: 123.456.789-00"
                  value={form.cpf}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Idade</label>
                  <input
                    name="idade"
                    type="number"
                    className="form-input"
                    placeholder="Ex: 35"
                    value={form.idade}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Urgência *</label>
                  <select
                    name="nivelUrgencia"
                    className="form-select"
                    value={form.nivelUrgencia}
                    onChange={handleChange}
                    required
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Selecione...</option>
                    <option value="VERDE">Verde (Pouco Urgente)</option>
                    <option value="AMARELO">Amarelo (Urgente)</option>
                    <option value="VERMELHO">Vermelho (Emergência)</option>
                  </select>
                  {alertaIdade && (
                    <div className="alerta-risco">
                      {alertaIdade}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Pressão Arterial</label>
                  <input
                    name="pressaoArterial"
                    type="text"
                    className="form-input"
                    placeholder="Ex: 12/8"
                    value={form.pressaoArterial}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Temperatura (°C)</label>
                  <input
                    name="temperatura"
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="Ex: 36.5"
                    value={form.temperatura}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Alergias Conhecidas</label>
                <input
                  name="alergias"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Dipirona, Penicilina (deixe em branco se não houver)"
                  value={form.alergias}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Relato de Sintomas *</label>
                <textarea
                  name="sintomas"
                  rows={3}
                  className="form-textarea"
                  placeholder="Descreva as queixas do paciente..."
                  value={form.sintomas}
                  onChange={handleChange}
                  required
                />
              </div>
              {error && (
                <div style={{ background: '#fce8e6', color: '#c5221f', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full"
                style={{ height: '48px', fontSize: '15px' }}
              >
                {loading ? 'Enviando...' : 'Enviar Dados da Triagem'}
              </button>
            </form>
          )}
          {result && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: '#e6f4ea', color: '#137333', borderRadius: '8px',
                padding: '16px', marginBottom: '20px', fontSize: '14px', fontWeight: 600,
              }}>
                {result.message || 'Triagem registrada com sucesso!'}
              </div>

              {result.senhaGerada ? (
                <div style={{
                  background: '#ffffff', padding: '24px', borderRadius: '12px',
                  border: '2px dashed #137333', marginBottom: '24px',
                }}>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                    🔐 Senha de Acesso Gerada:
                  </p>
                  <span style={{
                    fontSize: '36px', color: '#004b49',
                    letterSpacing: '4px', fontWeight: 800, display: 'block',
                    marginBottom: '16px',
                  }}>
                    {result.senhaGerada}
                  </span>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '8px' }}>
                    <button
                      onClick={handleCopiar}
                      style={{
                        padding: '8px 12px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#166534',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>📋</span> {copiado ? 'Copiado!' : 'Copiar Senha'}
                    </button>
                    <button
                      onClick={handleImprimir}
                      style={{
                        padding: '8px 12px',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>🖨️</span> Imprimir Acesso
                    </button>
                  </div>

                  <small style={{ color: '#666', display: 'block', marginTop: '12px', fontSize: '12px' }}>
                    Por favor, anote esta senha ou informe ao paciente.
                  </small>
                </div>
              ) : (
                <div style={{
                  background: '#f9fafb', padding: '20px', borderRadius: '12px',
                  border: '1px solid #e5e7eb', marginBottom: '24px', color: '#666',
                  fontSize: '13.5px'
                }}>
                  ℹ️ O paciente já possuía acesso cadastrado anteriormente. Peça para utilizar a senha atual ou redefini-la no celular.
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setResult(null)}
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: 'center', height: '42px' }}
                >
                  Nova Triagem
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', height: '42px' }}
                >
                  Ir para o Dashboard →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriagemPage;
