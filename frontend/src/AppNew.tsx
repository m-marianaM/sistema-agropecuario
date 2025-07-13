/**
 * Aplicação principal do Sistema Agropecuário com Autenticação
 * Integra todos os componentes: layout, navegação, tema, autenticação e roteamento
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Contextos
import { ThemeProvider } from './context/ThemeContext';
import { FazendasProvider } from './context/FazendasContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componentes
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';

// Páginas
import FazendasGestao from './pages/FazendasGestao';

// Componente de Loading
const LoadingSpinner: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

// Componente para proteger rotas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout principal da aplicação
const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app">
      <Header 
        onToggleSidebar={toggleSidebar} 
        isSidebarOpen={sidebarOpen}
      />
      <div className="app-content">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fazendas" element={<FazendasGestao />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Componente principal
const AppMain: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FazendasProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </FazendasProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default AppMain;
