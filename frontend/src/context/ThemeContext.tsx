/**
 * Context para gerenciar tema claro/escuro do Sistema Agropecuário
 * Permite alternância entre temas e persistência da preferência do usuário
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// Tipo para o contexto do tema
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

// Criação do contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider do contexto de tema
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para controlar se o tema está em modo escuro
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Verifica se há preferência salva no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Se não há preferência salva, usa a preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Função para alternar entre temas
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Efeito para aplicar o tema no document e salvar no localStorage
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Efeito para ouvir mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Só muda automaticamente se não há preferência salva
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value: ThemeContextType = {
    isDark,
    toggleTheme,
    theme: isDark ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar o contexto de tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;
