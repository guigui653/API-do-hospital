import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  name: string;
  cpf: string;
  role: string;
  sector: string;
  medicalId: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (cpf: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('cuidar_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (cpf: string, password: string) => {
    const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: cpf.replace(/\D/g, ''), senha: password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `Erro ${res.status}: CPF ou senha incorretos.`);
    }

    const data: { token: string; nome?: string; role?: string } = await res.json();

    const loggedUser: User = {
      name: data.nome ?? 'Colaborador',
      cpf,
      role: data.role ?? 'COLABORADOR',
      sector: '',
      medicalId: '',
      email: '',
      token: data.token,
    };

    localStorage.setItem('cuidar_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cuidar_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
};
