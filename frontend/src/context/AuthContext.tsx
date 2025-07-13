import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: 'ADMINISTRADOR' | 'SUPERVISOR' | 'PEAO';
  status: string;
  telefone?: string;
  cpf?: string;
  endereco?: string;
  salario?: number;
  especialidade?: string;
  observacoes?: string;
  fazendaId?: number;
  dataContratacao: string;
  ultimoLogin?: string;
  permissoes: Permissao[];
  fazenda?: {
    id: number;
    nome: string;
  };
}

export interface Permissao {
  id: number;
  modulo: string;
  ler: boolean;
  criar: boolean;
  editar: boolean;
  deletar: boolean;
  gerarRelatorio: boolean;
  exportarDados: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (modulo: string, acao: keyof Omit<Permissao, 'id' | 'modulo'>) => boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isPeao: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há token salvo no localStorage
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          await fetchUserData(storedToken);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  // Buscar dados do usuário
  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data.data);
        return true;
      } else {
        throw new Error('Token inválido');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return false;
    }
  };

  // Função de login
  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (data.success) {
        const { usuario: userData, token: authToken } = data.data;
        
        setUsuario(userData);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
        
        return true;
      } else {
        console.error('Erro no login:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Erro na requisição de login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  // Verificar se tem permissão específica
  const hasPermission = (modulo: string, acao: keyof Omit<Permissao, 'id' | 'modulo'>): boolean => {
    if (!usuario) return false;
    
    // Administrador tem todas as permissões
    if (usuario.cargo === 'ADMINISTRADOR') return true;
    
    // Buscar permissão específica
    const permissao = usuario.permissoes.find(p => p.modulo === modulo);
    if (!permissao) return false;
    
    return permissao[acao];
  };

  // Verificar cargos
  const isAdmin = usuario?.cargo === 'ADMINISTRADOR';
  const isSupervisor = usuario?.cargo === 'SUPERVISOR';
  const isPeao = usuario?.cargo === 'PEAO';
  const isAuthenticated = !!usuario && !!token;

  const value: AuthContextType = {
    usuario,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasPermission,
    isAdmin,
    isSupervisor,
    isPeao
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
