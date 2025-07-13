/**
 * Página de Gestão de Fazendas - Sistema Agropecuário  
 * Gestão completa de fazendas e funcionários
 * Atualizada para usar o contexto compartilhado
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFazendas, type Fazenda, type Funcionario, type Permissao } from '../context/FazendasContext';
import { 
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Users,
  User,
  Shield,
  UserCheck,
  Calendar,
  Activity,
  Search,
  Filter,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';

// Tipos para novos itens
interface NovaFazenda {
  nome: string;
  endereco: {
    rua?: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  area: number;
  proprietario: string;
  telefone: string;
  email: string;
  realizaRacao: boolean;
  realizaNutricao: boolean;
}

interface NovoFuncionario {
  nome: string;
  email: string;
  cargo: 'administrador' | 'peao' | 'supervisor';
  salario: number;
  telefone: string;
  cpf: string;
  endereco: string;
  fazendaId: number;
}

// Função para gerar permissões padrão localmente
const getPermissoesPadrao = (cargo: 'administrador' | 'supervisor' | 'peao'): Permissao[] => {
  const modulos = ['fazendas', 'cultivos', 'adubagem', 'vendas', 'estoque'];
  
  return modulos.map(modulo => {
    switch (cargo) {
      case 'administrador':
        return { 
          modulo, 
          ler: true, 
          criar: true, 
          editar: true, 
          deletar: true, 
          gerarRelatorio: true, 
          exportarDados: true 
        };
      case 'supervisor':
        return { 
          modulo, 
          ler: true, 
          criar: true, 
          editar: true, 
          deletar: false, 
          gerarRelatorio: true, 
          exportarDados: false 
        };
      case 'peao':
        return { 
          modulo, 
          ler: true, 
          criar: false, 
          editar: false, 
          deletar: false, 
          gerarRelatorio: false, 
          exportarDados: false 
        };
      default:
        return { 
          modulo, 
          ler: false, 
          criar: false, 
          editar: false, 
          deletar: false, 
          gerarRelatorio: false, 
          exportarDados: false 
        };
    }
  });
};

const Fazendas: React.FC = () => {
  const { isDark } = useTheme();
  const { 
    fazendas, 
    loading, 
    erro, 
    adicionarFazenda, 
    editarFazenda, 
    removerFazenda,
    alterarStatusFazenda,
    adicionarFuncionario, 
    editarFuncionario, 
    removerFuncionario,
    recarregarFazendas
  } = useFazendas();

  // Debug: log para verificar dados das fazendas
  console.log('🔍 Debug Fazendas:', {
    totalFazendas: fazendas.length,
    fazendas: fazendas.map(f => ({ 
      id: f.id, 
      nome: f.nome, 
      status: f.status,
      statusType: typeof f.status,
      hasStatus: f.status !== undefined && f.status !== null
    })),
    loading,
    erro
  });

  // Debug adicional: verificar se há fazendas carregadas
  useEffect(() => {
    if (fazendas.length > 0) {
      console.log('✅ Fazendas carregadas com sucesso:', fazendas);
    }
  }, [fazendas]);

  const [fazendaSelecionada, setFazendaSelecionada] = useState<Fazenda | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalFuncionario, setModalFuncionario] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] = useState<Funcionario | null>(null);
  const [editandoPermissoes, setEditandoPermissoes] = useState(false);
  const [permissoesCustomizadas, setPermissoesCustomizadas] = useState<Permissao[]>([]);
  const [modalPermissoes, setModalPermissoes] = useState(false);
  const [novaFazenda, setNovaFazenda] = useState<NovaFazenda>({
    nome: '',
    endereco: {
      cidade: '',
      estado: '',
      cep: ''
    },
    area: 0,
    proprietario: '',
    telefone: '',
    email: '',
    realizaRacao: false,
    realizaNutricao: false
  });
  const [errosValidacaoFazenda, setErrosValidacaoFazenda] = useState<{[key: string]: string}>({});
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [pesquisa, setPesquisa] = useState('');
  const [novoFuncionario, setNovoFuncionario] = useState<NovoFuncionario>({
    nome: '',
    email: '',
    cargo: 'peao',
    salario: 0,
    telefone: '',
    cpf: '',
    endereco: '',
    fazendaId: 0
  });
  const [errosValidacaoFuncionario, setErrosValidacaoFuncionario] = useState<{[key: string]: string}>({});

  // Estatísticas
  const totalFazendas = fazendas.length;
  const fazendasAtivas = fazendas.filter(f => f.status === 'ativa').length;
  const fazendasInativas = fazendas.filter(f => f.status === 'inativa').length;
  const fazendasManutencao = fazendas.filter(f => f.status === 'manutencao').length;
  const totalFuncionarios = fazendas.reduce((total, fazenda) => total + fazenda.funcionarios.length, 0);
  const areaTotal = fazendas.reduce((total, fazenda) => total + fazenda.area, 0);

  // Funções de CRUD - Fazendas
  const abrirModalNovaFazenda = () => {
    setNovaFazenda({
      nome: '',
      endereco: { cidade: '', estado: '', cep: '' },
      area: 0,
      proprietario: '',
      telefone: '',
      email: '',
      realizaRacao: false,
      realizaNutricao: false
    });
    setErrosValidacaoFazenda({});
    setModalAberto(true);
  };

  const abrirModalEditarFazenda = (fazenda: Fazenda) => {
    setNovaFazenda({
      nome: fazenda.nome,
      endereco: fazenda.endereco,
      area: fazenda.area,
      proprietario: fazenda.proprietario,
      telefone: fazenda.telefone || '',
      email: fazenda.email || '',
      realizaRacao: fazenda.realizaRacao || false,
      realizaNutricao: fazenda.realizaNutricao || false
    });
    setFazendaSelecionada(fazenda);
    setErrosValidacaoFazenda({});
    setModalAberto(true);
  };

  const validarFazenda = (): boolean => {
    const erros: {[key: string]: string} = {};

    if (!novaFazenda.nome) erros.nome = 'Nome é obrigatório';
    if (!novaFazenda.proprietario) erros.proprietario = 'Proprietário é obrigatório';
    if (!novaFazenda.endereco.cidade) erros.cidade = 'Cidade é obrigatória';
    if (!novaFazenda.endereco.estado) erros.estado = 'Estado é obrigatório';
    if (!novaFazenda.endereco.cep) erros.cep = 'CEP é obrigatório';
    if (novaFazenda.area <= 0) erros.area = 'Área deve ser maior que zero';

    setErrosValidacaoFazenda(erros);
    return Object.keys(erros).length === 0;
  };

  const salvarFazenda = () => {
    if (!validarFazenda()) return;

    if (fazendaSelecionada) {
      // Editando fazenda existente
      editarFazenda(fazendaSelecionada.id, {
        nome: novaFazenda.nome,
        endereco: novaFazenda.endereco,
        area: novaFazenda.area,
        proprietario: novaFazenda.proprietario,
        telefone: novaFazenda.telefone,
        email: novaFazenda.email,
        realizaRacao: novaFazenda.realizaRacao,
        realizaNutricao: novaFazenda.realizaNutricao
      });
    } else {
      // Criando nova fazenda
      const novaFazendaCompleta: Fazenda = {
        id: Date.now(),
        nome: novaFazenda.nome,
        area: novaFazenda.area,
        status: 'ativa',
        cultivos: [],
        endereco: novaFazenda.endereco,
        proprietario: novaFazenda.proprietario,
        dataAquisicao: new Date().toISOString().split('T')[0],
        valorCompra: 0,
        producaoAnual: 0,
        custoOperacional: 0,
        funcionarios: [],
        telefone: novaFazenda.telefone,
        email: novaFazenda.email,
        realizaRacao: novaFazenda.realizaRacao,
        realizaNutricao: novaFazenda.realizaNutricao
      };
      adicionarFazenda(novaFazendaCompleta);
    }

    setModalAberto(false);
    setFazendaSelecionada(null);
  };

  const handleDeletarFazenda = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta fazenda?')) {
      removerFazenda(id);
      setFazendaSelecionada(null);
    }
  };

  // Funções de CRUD - Funcionários
  const abrirModalNovoFuncionario = (fazendaId: number) => {
    setNovoFuncionario({
      nome: '',
      email: '',
      cargo: 'peao',
      salario: 0,
      telefone: '',
      cpf: '',
      endereco: '',
      fazendaId
    });
    setFuncionarioEditando(null);
    setErrosValidacaoFuncionario({});
    setPermissoesCustomizadas(getPermissoesPadrao('peao'));
    setModalFuncionario(true);
  };

  const abrirModalEditarFuncionario = (funcionario: Funcionario) => {
    setNovoFuncionario({
      nome: funcionario.nome,
      email: funcionario.email,
      cargo: funcionario.cargo,
      salario: funcionario.salario,
      telefone: funcionario.telefone,
      cpf: funcionario.cpf || '',
      endereco: funcionario.endereco || '',
      fazendaId: funcionario.fazendaId
    });
    setFuncionarioEditando(funcionario);
    setPermissoesCustomizadas([...funcionario.permissoes]);
    setErrosValidacaoFuncionario({});
    setModalFuncionario(true);
  };

  const validarFuncionario = (): boolean => {
    const erros: {[key: string]: string} = {};

    if (!novoFuncionario.nome) erros.nome = 'Nome é obrigatório';
    if (!novoFuncionario.email) erros.email = 'Email é obrigatório';
    if (!novoFuncionario.telefone) erros.telefone = 'Telefone é obrigatório';
    if (!novoFuncionario.cpf) erros.cpf = 'CPF é obrigatório';
    if (novoFuncionario.salario <= 0) erros.salario = 'Salário deve ser maior que zero';

    setErrosValidacaoFuncionario(erros);
    return Object.keys(erros).length === 0;
  };

  const salvarFuncionario = () => {
    if (!validarFuncionario()) return;

    const fazenda = fazendas.find(f => f.id === novoFuncionario.fazendaId);
    if (!fazenda) return;

    const novoFuncionarioCompleto: Funcionario = {
      id: funcionarioEditando?.id || Date.now(),
      nome: novoFuncionario.nome,
      email: novoFuncionario.email,
      cargo: novoFuncionario.cargo,
      dataContratacao: funcionarioEditando?.dataContratacao || new Date().toISOString().split('T')[0],
      salario: novoFuncionario.salario,
      status: funcionarioEditando?.status || 'ativo',
      telefone: novoFuncionario.telefone,
      fazendaId: novoFuncionario.fazendaId,
      cpf: novoFuncionario.cpf,
      endereco: novoFuncionario.endereco,
      permissoes: permissoesCustomizadas
    };

    let funcionariosAtualizados;
    if (funcionarioEditando) {
      funcionariosAtualizados = fazenda.funcionarios.map(f => 
        f.id === funcionarioEditando.id ? novoFuncionarioCompleto : f
      );
    } else {
      funcionariosAtualizados = [...fazenda.funcionarios, novoFuncionarioCompleto];
    }

    editarFazenda(fazenda.id, { funcionarios: funcionariosAtualizados });
    setModalFuncionario(false);
    setFuncionarioEditando(null);
  };

  const deletarFuncionario = (funcionarioId: number, fazendaId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      const fazenda = fazendas.find(f => f.id === fazendaId);
      if (fazenda) {
        const funcionariosAtualizados = fazenda.funcionarios.filter(f => f.id !== funcionarioId);
        editarFazenda(fazenda.id, { funcionarios: funcionariosAtualizados });
      }
    }
  };

  // Filtragem
  const fazendasFiltradas = fazendas.filter(fazenda => {
    const matchStatus = filtroStatus === 'todas' || fazenda.status === filtroStatus;
    const matchPesquisa = fazenda.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
                         fazenda.proprietario.toLowerCase().includes(pesquisa.toLowerCase()) ||
                         fazenda.endereco.cidade.toLowerCase().includes(pesquisa.toLowerCase());
    return matchStatus && matchPesquisa;
  });

  // Atualizar permissões
  const atualizarPermissao = (index: number, campo: keyof Permissao, valor: boolean) => {
    const novasPermissoes = [...permissoesCustomizadas];
    novasPermissoes[index] = { ...novasPermissoes[index], [campo]: valor };
    setPermissoesCustomizadas(novasPermissoes);
  };

  const aplicarPermissoesPadrao = (cargo: 'administrador' | 'supervisor' | 'peao') => {
    setPermissoesCustomizadas(getPermissoesPadrao(cargo));
    setNovoFuncionario(prev => ({ ...prev, cargo }));
  };

  // Função para alterar status da fazenda
  const handleAlterarStatus = async (fazendaId: number, novoStatus: 'ativa' | 'inativa' | 'manutencao') => {
    try {
      await alterarStatusFazenda(fazendaId, novoStatus);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: 'ativa' | 'inativa' | 'manutencao') => {
    switch (status) {
      case 'ativa': return '#10b981'; // Verde
      case 'inativa': return '#6b7280'; // Cinza
      case 'manutencao': return '#f59e0b'; // Amarelo/Laranja
      default: return '#6b7280';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: 'ativa' | 'inativa' | 'manutencao') => {
    switch (status) {
      case 'ativa': return 'Ativa';
      case 'inativa': return 'Inativa';
      case 'manutencao': return 'Manutenção';
      default: return status;
    }
  };

  // Estilos
  const styles = {
    container: {
      padding: '24px',
      backgroundColor: isDark ? '#111827' : '#f9fafb',
      minHeight: '100vh',
      transition: 'background-color 0.3s ease'
    },
    // ... resto dos estilos permanecem iguais ...
  };

  return (
    <div className={`p-6 min-h-screen transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header com estatísticas */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Gestão de Fazendas
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          Gerencie suas propriedades rurais e equipes
        </p>

        {/* Cards de estatísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: isDark ? '#1f2937' : 'white',
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={24} color="#3b82f6" />
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827'
                }}>
                  {totalFazendas}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: isDark ? '#9ca3af' : '#64748b'
                }}>
                  Total de Fazendas
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: isDark ? '#1f2937' : 'white',
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={24} color="#10b981" />
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827'
                }}>
                  {fazendasAtivas}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: isDark ? '#9ca3af' : '#64748b'
                }}>
                  Fazendas Ativas
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: isDark ? '#1f2937' : 'white',
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={24} color="#f59e0b" />
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827'
                }}>
                  {totalFuncionarios}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: isDark ? '#9ca3af' : '#64748b'
                }}>
                  Total de Funcionários
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: isDark ? '#1f2937' : 'white',
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={24} color="#8b5cf6" />
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827'
                }}>
                  {areaTotal.toLocaleString()} ha
                </div>
                <div style={{
                  fontSize: '14px',
                  color: isDark ? '#9ca3af' : '#64748b'
                }}>
                  Área Total
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: isDark ? '#1f2937' : 'white',
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={24} color="#6b7280" />
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827'
                }}>
                  {fazendasInativas}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: isDark ? '#9ca3af' : '#64748b'
                }}>
                  Fazendas Inativas
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: isDark ? '#1f2937' : 'white',
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={24} color="#f59e0b" />
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827'
                }}>
                  {fazendasManutencao}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: isDark ? '#9ca3af' : '#64748b'
                }}>
                  Em Manutenção
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de filtro e busca */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={abrirModalNovaFazenda}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.3s ease'
            }}
          >
            <Plus size={20} />
            Nova Fazenda
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={20} color={isDark ? '#9ca3af' : '#64748b'} />
            <input
              type="text"
              placeholder="Buscar fazendas..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                borderRadius: '6px',
                background: isDark ? '#1f2937' : 'white',
                color: isDark ? '#f9fafb' : '#111827',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={20} color={isDark ? '#9ca3af' : '#64748b'} />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                borderRadius: '6px',
                background: isDark ? '#1f2937' : 'white',
                color: isDark ? '#f9fafb' : '#111827',
                outline: 'none'
              }}
            >
              <option value="todas">Todas</option>
              <option value="ativa">Ativas</option>
              <option value="inativa">Inativas</option>
              <option value="manutencao">Em Manutenção</option>
            </select>
          </div>

          {/* Debug: Botão para recarregar fazendas */}
          <button
            onClick={() => {
              console.log('🔄 Recarregando fazendas...');
              recarregarFazendas();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Debug: Recarregar
          </button>
        </div>
      </div>

      {/* Debug: Mostrar informações das fazendas */}
      <div style={{
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        fontSize: '14px'
      }}>
        <strong>🐛 DEBUG:</strong> {fazendas.length} fazendas carregadas | {fazendasFiltradas.length} filtradas | Filtro: {filtroStatus}
        {fazendas.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            Fazendas: {fazendas.map(f => `${f.nome} (${f.status || 'sem status'})`).join(', ')}
          </div>
        )}
      </div>

      {/* Lista de fazendas com estilos inline melhorados */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {fazendasFiltradas.length > 0 ? (
          fazendasFiltradas.map(fazenda => (
            <div
              key={fazenda.id}
              style={{
                background: isDark ? '#1f2937' : 'white',
                border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {/* Nome da fazenda e badge de status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: isDark ? '#f9fafb' : '#111827',
                      margin: 0
                    }}>
                      {fazenda.nome}
                    </h3>
                    
                    {/* Badge de Status com Dropdown - MAIS VISÍVEL */}
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={fazenda.status || 'ativa'}
                        onChange={(e) => {
                          console.log('🔄 Alterando status de:', fazenda.status, 'para:', e.target.value);
                          handleAlterarStatus(fazenda.id, e.target.value as 'ativa' | 'inativa' | 'manutencao');
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          border: 'none',
                          outline: 'none',
                          minWidth: '130px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          ...(
                            (fazenda.status || 'ativa') === 'ativa' ? {
                              backgroundColor: '#dcfce7', // bg-green-200
                              color: '#166534' // text-green-800
                            } : 
                            (fazenda.status || 'ativa') === 'inativa' ? {
                              backgroundColor: '#fecaca', // bg-red-200  
                              color: '#991b1b' // text-red-800
                            } : {
                              backgroundColor: '#fef3c7', // bg-yellow-200
                              color: '#92400e' // text-yellow-800
                            }
                          )
                        }}
                      >
                        <option value="ativa" style={{ color: 'black', backgroundColor: 'white' }}>✅ Ativa</option>
                        <option value="inativa" style={{ color: 'black', backgroundColor: 'white' }}>❌ Inativa</option>
                        <option value="manutencao" style={{ color: 'black', backgroundColor: 'white' }}>🔧 Manutenção</option>
                      </select>
                    </div>
                  </div>

                  {/* Informações da fazenda */}
                  <p style={{
                    color: isDark ? '#9ca3af' : '#64748b',
                    marginBottom: '12px',
                    fontSize: '14px'
                  }}>
                    👤 {fazenda.proprietario} • 📐 {fazenda.area} ha • 👥 {fazenda.funcionarios.length} funcionários
                  </p>

                  {/* Localização */}
                  <p style={{
                    color: isDark ? '#6b7280' : '#6b7280',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '12px'
                  }}>
                    <MapPin size={16} />
                    {fazenda.endereco.cidade}, {fazenda.endereco.estado}
                  </p>

                  {/* Tags de atividades */}
                  {(fazenda.realizaRacao || fazenda.realizaNutricao) && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      {fazenda.realizaRacao && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#fed7aa', // bg-orange-100
                          color: '#9a3412', // text-orange-800
                          fontSize: '12px',
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}>
                          🥄 Ração Animal
                        </span>
                      )}
                      {fazenda.realizaNutricao && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#e9d5ff', // bg-purple-100
                          color: '#6b21a8', // text-purple-800
                          fontSize: '12px',
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}>
                          🌱 Nutrição Animal
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                  <button
                    onClick={() => abrirModalEditarFazenda(fazenda)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    title="Editar fazenda"
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletarFazenda(fazenda.id)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    title="Excluir fazenda"
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Funcionários (se houver) */}
              {fazenda.funcionarios.length > 0 && (
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`
                }}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#2563eb',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title="Ver funcionários"
                    onMouseOver={(e) => e.currentTarget.style.color = '#1d4ed8'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#2563eb'}
                  >
                    <Users size={16} />
                    Ver Funcionários ({fazenda.funcionarios.length})
                  </button>
                </div>
              )}
            </div>
        ))
        ) : (
          <div style={{
            background: isDark ? '#1f2937' : 'white',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            color: isDark ? '#9ca3af' : '#64748b'
          }}>
            Nenhuma fazenda encontrada
          </div>
        )}
      </div>

      {/* Modal de fazenda simplificado */}
      {modalAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: isDark ? '#1f2937' : 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: isDark ? '#f9fafb' : '#111827',
              marginBottom: '20px'
            }}>
              {fazendaSelecionada ? 'Editar Fazenda' : 'Nova Fazenda'}
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '4px'
                }}>
                  Nome da Fazenda *
                </label>
                <input
                  type="text"
                  value={novaFazenda.nome}
                  onChange={(e) => setNovaFazenda(prev => ({ ...prev, nome: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errosValidacaoFazenda.nome ? '#ef4444' : isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: isDark ? '#374151' : 'white',
                    color: isDark ? '#f9fafb' : '#111827',
                    outline: 'none'
                  }}
                />
                {errosValidacaoFazenda.nome && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errosValidacaoFazenda.nome}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '4px'
                }}>
                  Proprietário *
                </label>
                <input
                  type="text"
                  value={novaFazenda.proprietario}
                  onChange={(e) => setNovaFazenda(prev => ({ ...prev, proprietario: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errosValidacaoFazenda.proprietario ? '#ef4444' : isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: isDark ? '#374151' : 'white',
                    color: isDark ? '#f9fafb' : '#111827',
                    outline: 'none'
                  }}
                />
                {errosValidacaoFazenda.proprietario && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errosValidacaoFazenda.proprietario}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '4px'
                  }}>
                    Área (hectares) *
                  </label>
                  <input
                    type="number"
                    value={novaFazenda.area}
                    onChange={(e) => setNovaFazenda(prev => ({ ...prev, area: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${errosValidacaoFazenda.area ? '#ef4444' : isDark ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: isDark ? '#374151' : 'white',
                      color: isDark ? '#f9fafb' : '#111827',
                      outline: 'none'
                    }}
                  />
                  {errosValidacaoFazenda.area && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errosValidacaoFazenda.area}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '4px'
                  }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={novaFazenda.telefone}
                    onChange={(e) => setNovaFazenda(prev => ({ ...prev, telefone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: isDark ? '#374151' : 'white',
                      color: isDark ? '#f9fafb' : '#111827',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={() => {
                  setModalAberto(false);
                  setFazendaSelecionada(null);
                }}
                style={{
                  background: 'transparent',
                  color: isDark ? '#9ca3af' : '#64748b',
                  border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarFazenda}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fazendas;
