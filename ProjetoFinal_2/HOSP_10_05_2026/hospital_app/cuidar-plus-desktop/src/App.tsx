import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar          from './components/Sidebar';
import TopBar           from './components/TopBar';
import LoginPage        from './pages/LoginPage';
import TriagemPage      from './pages/TriagemPage';
import DashboardPage    from './pages/DashboardPage';
import AtendimentosPage from './pages/AtendimentosPage';
import MeuPerfilPage    from './pages/MeuPerfilPage';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppLayout: React.FC = () => (
  <div className="app-shell">
    <Sidebar />
    <div className="main-content">
      <TopBar />
      <main className="page-body">
        <Outlet />
      </main>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard"    element={<AtendimentosPage />} />
          <Route path="/triagem"      element={<TriagemPage />} />
          <Route path="/notificacoes" element={<DashboardPage />} />
          <Route path="/perfil"       element={<MeuPerfilPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
