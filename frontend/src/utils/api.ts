/**
 * Utilitário para comunicação com a API do Sistema Agropecuário
 * Centraliza todas as requisições HTTP
 */

import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // URL do backend (corrigida)
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
});

// Interceptor para adicionar token de autorização (quando implementado)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipos para as requisições
export interface FazendaAPI {
  id?: number;
  nome: string;
  proprietario: string;
  area: number;
  localizacao: string;
  telefone: string;
  email: string;
  status: 'ativa' | 'inativa';
  culturas?: string[];
}

export interface FuncionarioAPI {
  id?: number;
  nome: string;
  email: string;
  cargo: 'administrador' | 'supervisor' | 'peao';
  telefone: string;
  dataAdmissao: string;
  salario: number;
  cpf: string;
  endereco: string;
  especialidade?: string;
  observacoes?: string;
  fazendaId: number;
  status?: 'ativo' | 'inativo';
  permissoes?: any[];
}

export interface CultivoAPI {
  id?: number;
  fazendaId: number;
  tipoCultura: 'Milho' | 'Soja';
  variedade: string;
  areaHectares: number;
  dataPlantio: string;
  dataColheitaPrevista?: string;
  status: 'plantado' | 'crescimento' | 'colhido' | 'perdido';
  producaoEstimadaTon?: number;
  fertilizanteTipo?: string;
  fertilizanteQuantidade?: number;
  irrigacao?: 'sequeiro' | 'aspersao' | 'gotejamento' | 'pivotcentral';
  observacoes?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

// =========================
// 🌱 CULTIVOS API
// =========================

/**
 * Busca todos os cultivos
 */
export const buscarCultivos = async () => {
  try {
    const response = await api.get('/cultivos');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cultivos:', error);
    throw error;
  }
};

/**
 * Busca cultivo por ID
 */
export const buscarCultivoPorId = async (id: number) => {
  try {
    const response = await api.get(`/cultivos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cultivo:', error);
    throw error;
  }
};

/**
 * Cria novo cultivo
 */
export const criarCultivo = async (cultivo: CultivoAPI) => {
  try {
    const response = await api.post('/cultivos', cultivo);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar cultivo:', error);
    throw error;
  }
};

/**
 * Atualiza cultivo completo
 */
export const atualizarCultivo = async (id: number, cultivo: Partial<CultivoAPI>) => {
  try {
    const response = await api.put(`/cultivos/${id}`, cultivo);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar cultivo:', error);
    throw error;
  }
};

/**
 * Atualiza apenas o status do cultivo
 */
export const atualizarStatusCultivo = async (id: number, status: CultivoAPI['status']) => {
  try {
    const response = await api.patch(`/cultivos/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar status do cultivo:', error);
    throw error;
  }
};

/**
 * Remove cultivo
 */
export const removerCultivo = async (id: number) => {
  try {
    const response = await api.delete(`/cultivos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao remover cultivo:', error);
    throw error;
  }
};

/**
 * Busca cultivos por fazenda
 */
export const buscarCultivosPorFazenda = async (fazendaId: number) => {
  try {
    const response = await api.get(`/cultivos?fazenda=${fazendaId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cultivos por fazenda:', error);
    throw error;
  }
};


// Funções da API para Fazendas
export const fazendasAPI = {
  // Listar todas as fazendas
  listar: async () => {
    try {
      const response = await api.get('/fazendas');
      console.log('📡 Resposta da API /fazendas:', response.data);
      
      // A API retorna { success, data, total, message }
      // Precisamos extrair apenas o array de fazendas
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data; // Retorna apenas o array de fazendas
      } else {
        console.error('❌ Formato de resposta inválido:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao listar fazendas:', error);
      throw error;
    }
  },

  // Buscar fazenda por ID
  buscarPorId: async (id: number) => {
    try {
      const response = await api.get(`/fazendas/${id}`);
      console.log('📡 Resposta da API /fazendas/:id:', response.data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.error('❌ Formato de resposta inválido:', response.data);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar fazenda:', error);
      throw error;
    }
  },

  // Criar nova fazenda
  criar: async (fazenda: FazendaAPI) => {
    try {
      const response = await api.post('/fazendas', fazenda);
      console.log('📡 Resposta da API POST /fazendas:', response.data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.error('❌ Formato de resposta inválido:', response.data);
        return fazenda; // Fallback
      }
    } catch (error) {
      console.error('❌ Erro ao criar fazenda:', error);
      throw error;
    }
  },

  // Atualizar fazenda
  atualizar: async (id: number, fazenda: Partial<FazendaAPI>) => {
    try {
      const response = await api.put(`/fazendas/${id}`, fazenda);
      console.log('📡 Resposta da API PUT /fazendas:', response.data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.error('❌ Formato de resposta inválido:', response.data);
        return fazenda; // Fallback
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar fazenda:', error);
      throw error;
    }
  },

  // Excluir fazenda
  excluir: async (id: number) => {
    try {
      const response = await api.delete(`/fazendas/${id}`);
      console.log('📡 Resposta da API DELETE /fazendas:', response.data);
      
      if (response.data.success) {
        return response.data;
      } else {
        console.error('❌ Formato de resposta inválido:', response.data);
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Erro ao excluir fazenda:', error);
      throw error;
    }
  },
};

// Funções da API para Funcionários
export const funcionariosAPI = {
  // Listar funcionários de uma fazenda
  listarPorFazenda: async (fazendaId: number) => {
    try {
      const response = await api.get(`/fazendas/${fazendaId}/funcionarios`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar funcionários:', error);
      throw error;
    }
  },

  // Criar novo funcionário
  criar: async (funcionario: FuncionarioAPI) => {
    try {
      const response = await api.post(`/fazendas/${funcionario.fazendaId}/funcionarios`, funcionario);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      throw error;
    }
  },

  // Atualizar funcionário
  atualizar: async (fazendaId: number, funcionarioId: number, funcionario: Partial<FuncionarioAPI>) => {
    try {
      const response = await api.put(`/fazendas/${fazendaId}/funcionarios/${funcionarioId}`, funcionario);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      throw error;
    }
  },

  // Excluir funcionário
  excluir: async (fazendaId: number, funcionarioId: number) => {
    try {
      const response = await api.delete(`/fazendas/${fazendaId}/funcionarios/${funcionarioId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      throw error;
    }
  },
};

// Interface para dados do dashboard
export interface DashboardData {
  resumo: {
    totalFazendas: number;
    areaTotal: number;
    areaPlantada: number;
    fazendasAtivas: number;
    totalFuncionarios: number;
    faturamentoMes: number;
    custoMes: number;
    lucroMes: number;
    produtividade: number;
    alertas: number;
    margemLucro: number;
  };
  cultivos: {
    porTipo: any;
    total: number;
    areaTotal: number;
    producaoEstimada: number;
    producaoRealizada: number;
  };
  vendas: {
    mensal: {
      total: number;
      quantidade: number;
      vendas: number;
    };
    compradores: any[];
    porProduto: any[];
  };
  adubos: {
    gastoMes: number;
    aplicacoesMes: number;
    principais: any[];
  };
  estoque: {
    valorTotal: number;
    itensTotal: number;
    principais: any[];
    alertas: any[];
  };
  racao: {
    producaoMensal: number;
    valorMensal: number;
    milhoUtilizado: number;
    custoProducao: number;
    margem: number;
    fazendasProdutoras: number;
  };
  temporal: any[];
  ultima_atualizacao: string;
}

// Funções da API para Dashboard
export const dashboardAPI = {
  // Buscar dados agregados do dashboard
  buscarDados: async (): Promise<DashboardData> => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  },
};

// Função para verificar conectividade com a API
export const verificarConectividade = async (): Promise<boolean> => {
  try {
    console.log('🔗 Testando conectividade com a API...');
    await api.get('/fazendas');
    console.log('✅ API disponível!');
    return true;
  } catch (error) {
    console.warn('⚠️ API não disponível, usando dados locais:', error);
    return false;
  }
};

export default api;
