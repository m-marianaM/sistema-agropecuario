import React, { useState } from 'react';
import { MapPin, Users, Building, Plus, Edit, Trash2, X, Eye, UserPlus, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFazendas } from '../context/FazendasContext';
import { Fazenda, Funcionario, Permissao } from '../context/FazendasContext';

// Interface para nova fazenda - compatível com o tipo string[] de cultivos
interface NovaFazenda {
  nome: string;
  endereco: {
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
  cultivos: string[]; // Usando string[] para compatibilidade
}

const FazendasCompleta: React.FC = () => {
  const { isDark } = useTheme();
  const { fazendas, adicionarFazenda, editarFazenda, removerFazenda, adicionarFuncionario, editarFuncionario, removerFuncionario, alterarStatusFazenda } = useFazendas();
  
  // Estados
  const [fazendaSelecionada, setFazendaSelecionada] = useState<Fazenda | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalFuncionarios, setModalFuncionarios] = useState(false);
  const [modalNovoFuncionario, setModalNovoFuncionario] = useState(false);
  const [modalEditarFuncionario, setModalEditarFuncionario] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<Funcionario | null>(null);
  
  const [novaFazenda, setNovaFazenda] = useState<NovaFazenda>({
    nome: '',
    endereco: { cidade: '', estado: '', cep: '' },
    area: 0,
    proprietario: '',
    telefone: '',
    email: '',
    realizaRacao: false,
    realizaNutricao: false,
    cultivos: []
  });

  const [errosValidacaoFazenda, setErrosValidacaoFazenda] = useState<{[key: string]: string}>({});
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [pesquisa, setPesquisa] = useState('');

  // Função para validar fazenda
  const validarFazenda = (fazenda: NovaFazenda): boolean => {
    const erros: {[key: string]: string} = {};

    if (!fazenda.nome.trim()) {
      erros.nome = 'Nome da fazenda é obrigatório';
    }

    if (!fazenda.proprietario.trim()) {
      erros.proprietario = 'Proprietário é obrigatório';
    }

    if (!fazenda.area || fazenda.area <= 0) {
      erros.area = 'Área deve ser maior que zero';
    }

    if (!fazenda.endereco.cidade.trim()) {
      erros.cidade = 'Cidade é obrigatória';
    }

    if (!fazenda.endereco.estado.trim()) {
      erros.estado = 'Estado é obrigatório';
    } else if (fazenda.endereco.estado.length !== 2) {
      erros.estado = 'Estado deve ter 2 caracteres';
    }

    if (!fazenda.endereco.cep.trim()) {
      erros.cep = 'CEP é obrigatório';
    } else if (!/^\d{5}-?\d{3}$/.test(fazenda.endereco.cep)) {
      erros.cep = 'CEP deve ter formato 00000-000';
    }

    setErrosValidacaoFazenda(erros);
    return Object.keys(erros).length === 0;
  };

  // Funções de CRUD
  const abrirModalNovaFazenda = () => {
    setNovaFazenda({
      nome: '',
      endereco: { cidade: '', estado: '', cep: '' },
      area: 0,
      proprietario: '',
      telefone: '',
      email: '',
      realizaRacao: false,
      realizaNutricao: false,
      cultivos: []
    });
    setErrosValidacaoFazenda({});
    setModalAberto(true);
  };

  const abrirModalEditarFazenda = (fazenda: Fazenda) => {
    setFazendaSelecionada(fazenda);
    setNovaFazenda({
      nome: fazenda.nome,
      endereco: fazenda.endereco,
      area: fazenda.area,
      proprietario: fazenda.proprietario,
      telefone: fazenda.telefone || '',
      email: fazenda.email || '',
      realizaRacao: fazenda.realizaRacao || false,
      realizaNutricao: fazenda.realizaNutricao || false,
      cultivos: fazenda.cultivos || []
    });
    setErrosValidacaoFazenda({});
    setModalAberto(true);
  };

  const salvarFazenda = async () => {
    if (!validarFazenda(novaFazenda)) {
      return;
    }

    try {
      if (fazendaSelecionada) {
        // Editar fazenda existente
        const fazendaAtualizada: Fazenda = {
          ...fazendaSelecionada,
          nome: novaFazenda.nome,
          endereco: novaFazenda.endereco,
          area: novaFazenda.area,
          proprietario: novaFazenda.proprietario,
          telefone: novaFazenda.telefone,
          email: novaFazenda.email,
          realizaRacao: novaFazenda.realizaRacao,
          realizaNutricao: novaFazenda.realizaNutricao,
          cultivos: novaFazenda.cultivos
        };

        await editarFazenda(fazendaAtualizada.id, fazendaAtualizada);
      } else {
        // Criar nova fazenda
        const fazendaNova: Fazenda = {
          id: Date.now(),
          nome: novaFazenda.nome,
          endereco: novaFazenda.endereco,
          area: novaFazenda.area,
          proprietario: novaFazenda.proprietario,
          telefone: novaFazenda.telefone,
          email: novaFazenda.email,
          realizaRacao: novaFazenda.realizaRacao,
          realizaNutricao: novaFazenda.realizaNutricao,
          cultivos: novaFazenda.cultivos,
          status: 'ativa',
          dataAquisicao: new Date().toISOString().split('T')[0],
          valorCompra: 0,
          producaoAnual: 0,
          custoOperacional: 0,
          funcionarios: []
        };

        await adicionarFazenda(fazendaNova);
      }

      setModalAberto(false);
      setFazendaSelecionada(null);
    } catch (error) {
      console.error('Erro ao salvar fazenda:', error);
      alert('Erro ao salvar fazenda. Tente novamente.');
    }
  };

  const deletarFazenda = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta fazenda?')) {
      removerFazenda(id);
      setFazendaSelecionada(null);
    }
  };

  // Funções para gerenciar cultivos
  const toggleCultivo = (cultivo: string) => {
    setNovaFazenda(prev => ({
      ...prev,
      cultivos: prev.cultivos.includes(cultivo)
        ? prev.cultivos.filter(c => c !== cultivo)
        : [...prev.cultivos, cultivo]
    }));
  };

  // Filtros
  const fazendasFiltradas = fazendas.filter((fazenda: Fazenda) => {
    const filtroStatusOk = filtroStatus === 'todas' || fazenda.status === filtroStatus;
    const filtroPesquisaOk = fazenda.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
                           fazenda.proprietario.toLowerCase().includes(pesquisa.toLowerCase()) ||
                           fazenda.endereco.cidade.toLowerCase().includes(pesquisa.toLowerCase());
    
    return filtroStatusOk && filtroPesquisaOk;
  });

  // Funções de gestão de funcionários
  const [novoFuncionario, setNovoFuncionario] = useState<Partial<Funcionario>>({
    nome: '',
    email: '',
    cargo: 'peao',
    salario: 0,
    telefone: '',
    cpf: '',
    endereco: '',
    especialidade: '',
    observacoes: ''
  });

  // Estado para gerenciar permissões do funcionário
  const [permissoesFuncionario, setPermissoesFuncionario] = useState<{[key: string]: {[key: string]: boolean}}>({});

  // Função para inicializar permissões padrão baseado no cargo
  const inicializarPermissoesPadrao = (cargo: 'administrador' | 'supervisor' | 'peao') => {
    const modulos = ['fazendas', 'funcionarios', 'cultivos', 'adubagem', 'vendas', 'estoque', 'relatorios', 'dashboard'];
    const permissoes: {[key: string]: {[key: string]: boolean}} = {};
    
    modulos.forEach(modulo => {
      switch (cargo) {
        case 'administrador':
          permissoes[modulo] = {
            ler: true,
            criar: true,
            editar: true,
            deletar: true,
            gerarRelatorio: true,
            exportarDados: true
          };
          break;
        case 'supervisor':
          permissoes[modulo] = {
            ler: true,
            criar: true,
            editar: true,
            deletar: false,
            gerarRelatorio: true,
            exportarDados: false
          };
          break;
        case 'peao':
          permissoes[modulo] = {
            ler: true,
            criar: false,
            editar: false,
            deletar: false,
            gerarRelatorio: false,
            exportarDados: false
          };
          break;
      }
    });
    
    setPermissoesFuncionario(permissoes);
  };

  // Função para atualizar uma permissão específica
  const atualizarPermissao = (modulo: string, acao: string, valor: boolean) => {
    setPermissoesFuncionario(prev => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [acao]: valor
      }
    }));
  };

  // Função para atualizar cargo e permissões
  const atualizarCargoEPermissoes = (novoCargo: 'administrador' | 'supervisor' | 'peao') => {
    setNovoFuncionario(prev => ({ ...prev, cargo: novoCargo }));
    inicializarPermissoesPadrao(novoCargo);
  };

  const abrirModalFuncionarios = (fazenda: Fazenda) => {
    setFazendaSelecionada(fazenda);
    setModalFuncionarios(true);
  };

  const abrirModalNovoFuncionario = () => {
    setNovoFuncionario({
      nome: '',
      email: '',
      cargo: 'peao',
      salario: 0,
      telefone: '',
      cpf: '',
      endereco: '',
      especialidade: '',
      observacoes: ''
    });
    inicializarPermissoesPadrao('peao');
    setModalNovoFuncionario(true);
  };

  const abrirModalEditarFuncionario = (funcionario: Funcionario) => {
    setFuncionarioSelecionado(funcionario);
    setNovoFuncionario({
      nome: funcionario.nome,
      email: funcionario.email,
      cargo: funcionario.cargo,
      salario: funcionario.salario,
      telefone: funcionario.telefone,
      cpf: funcionario.cpf,
      endereco: funcionario.endereco,
      especialidade: funcionario.especialidade,
      observacoes: funcionario.observacoes
    });
    
    // Carregar permissões existentes
    const permissoesExistentes: {[key: string]: {[key: string]: boolean}} = {};
    funcionario.permissoes.forEach(permissao => {
      permissoesExistentes[permissao.modulo] = {
        ler: permissao.ler,
        criar: permissao.criar,
        editar: permissao.editar,
        deletar: permissao.deletar,
        gerarRelatorio: permissao.gerarRelatorio,
        exportarDados: permissao.exportarDados
      };
    });
    setPermissoesFuncionario(permissoesExistentes);
    
    setModalEditarFuncionario(true);
  };

  const salvarFuncionario = async () => {
    if (!fazendaSelecionada || !novoFuncionario.nome || !novoFuncionario.email) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      // Converter permissões do estado para o formato do funcionário
      const permissoesArray: Permissao[] = Object.entries(permissoesFuncionario).map(([modulo, acoes]) => ({
        modulo,
        ler: acoes.ler,
        criar: acoes.criar,
        editar: acoes.editar,
        deletar: acoes.deletar,
        gerarRelatorio: acoes.gerarRelatorio,
        exportarDados: acoes.exportarDados
      }));

      const funcionarioCompleto: Funcionario = {
        id: funcionarioSelecionado?.id || Date.now(),
        nome: novoFuncionario.nome!,
        email: novoFuncionario.email!,
        cargo: novoFuncionario.cargo as 'administrador' | 'supervisor' | 'peao',
        dataContratacao: funcionarioSelecionado?.dataContratacao || new Date().toISOString().split('T')[0],
        salario: novoFuncionario.salario || 0,
        status: 'ativo',
        telefone: novoFuncionario.telefone || '',
        fazendaId: fazendaSelecionada.id,
        cpf: novoFuncionario.cpf,
        endereco: novoFuncionario.endereco,
        especialidade: novoFuncionario.especialidade,
        observacoes: novoFuncionario.observacoes,
        permissoes: permissoesArray
      };

      if (funcionarioSelecionado) {
        // Editar funcionário existente
        await editarFuncionario(fazendaSelecionada.id, funcionarioSelecionado.id, funcionarioCompleto);
      } else {
        // Criar novo funcionário
        await adicionarFuncionario(fazendaSelecionada.id, funcionarioCompleto);
      }

      setModalNovoFuncionario(false);
      setModalEditarFuncionario(false);
      setFuncionarioSelecionado(null);
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      alert('Erro ao salvar funcionário. Tente novamente.');
    }
  };

  const removerFuncionarioConfirm = async (funcionarioId: number) => {
    if (!fazendaSelecionada) return;
    
    if (window.confirm('Tem certeza que deseja remover este funcionário?')) {
      try {
        await removerFuncionario(fazendaSelecionada.id, funcionarioId);
      } catch (error) {
        console.error('Erro ao remover funcionário:', error);
        alert('Erro ao remover funcionário. Tente novamente.');
      }
    }
  };

  // Função para alterar status da fazenda
  const handleAlterarStatus = async (fazendaId: number, novoStatus: 'ativa' | 'inativa' | 'manutencao') => {
    try {
      console.log('🔄 Alterando status da fazenda:', fazendaId, 'para:', novoStatus);
      await alterarStatusFazenda(fazendaId, novoStatus);
      console.log('✅ Status alterado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDark ? '#111827' : '#f9fafb',
      color: isDark ? '#f9fafb' : '#111827',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          🏡 Gestão de Fazendas
        </h1>
        <p style={{ fontSize: '16px', color: isDark ? '#9ca3af' : '#64748b' }}>
          Sistema completo de gestão para suas propriedades rurais incluindo proprietário, hectares, funcionários, cultivos e atividades especiais
        </p>
      </div>

      {/* Controles */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Pesquisar fazendas..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          style={{
            padding: '10px 12px',
            border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '8px',
            backgroundColor: isDark ? '#374151' : '#ffffff',
            color: isDark ? '#f9fafb' : '#111827',
            fontSize: '14px',
            minWidth: '200px'
          }}
        />

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={{
            padding: '10px 12px',
            border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '8px',
            backgroundColor: isDark ? '#374151' : '#ffffff',
            color: isDark ? '#f9fafb' : '#111827',
            fontSize: '14px'
          }}
        >
          <option value="todas">Todas as fazendas</option>
          <option value="ativa">Fazendas ativas</option>
          <option value="inativa">Fazendas inativas</option>
        </select>

        <button
          onClick={abrirModalNovaFazenda}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            marginLeft: 'auto'
          }}
        >
          <Plus size={20} />
          Nova Fazenda
        </button>
      </div>

      {/* Lista de Fazendas */}
      {fazendasFiltradas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: isDark ? '#9ca3af' : '#64748b'
        }}>
          <Building size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
            {pesquisa ? 'Nenhuma fazenda encontrada' : 'Nenhuma fazenda cadastrada'}
          </h3>
          <p style={{ fontSize: '14px' }}>
            {pesquisa 
              ? 'Tente ajustar os filtros de pesquisa' 
              : 'Comece cadastrando sua primeira fazenda com todas as informações solicitadas'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {fazendasFiltradas.map((fazenda: Fazenda) => (
            <div key={fazenda.id} style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              {/* Header do Card */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}>
                    {fazenda.nome}
                  </h3>
                  
                  {/* Seletor de Status Interativo */}
                  <select 
                    value={fazenda.status || 'ativa'}
                    onChange={(e) => {
                      console.log('🔄 Alterando status de:', fazenda.status, 'para:', e.target.value);
                      handleAlterarStatus(fazenda.id, e.target.value as 'ativa' | 'inativa' | 'manutencao');
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      minWidth: '110px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      ...(
                        (fazenda.status || 'ativa') === 'ativa' ? {
                          backgroundColor: '#dcfce7', // verde claro
                          color: '#166534' // verde escuro
                        } : 
                        (fazenda.status || 'ativa') === 'inativa' ? {
                          backgroundColor: '#fecaca', // vermelho claro
                          color: '#991b1b' // vermelho escuro
                        } : {
                          backgroundColor: '#fef3c7', // amarelo claro
                          color: '#92400e' // amarelo escuro
                        }
                      )
                    }}
                  >
                    <option value="ativa" style={{ color: 'black', backgroundColor: 'white' }}>✅ Ativa</option>
                    <option value="inativa" style={{ color: 'black', backgroundColor: 'white' }}>❌ Inativa</option>
                    <option value="manutencao" style={{ color: 'black', backgroundColor: 'white' }}>🔧 Manutenção</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => abrirModalEditarFazenda(fazenda)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      color: isDark ? '#f9fafb' : '#374151'
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deletarFazenda(fazenda.id)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#dc2626',
                      color: 'white'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Informações básicas */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <Users size={16} style={{ color: isDark ? '#9ca3af' : '#64748b' }} />
                  <span style={{ fontSize: '14px' }}>
                    Proprietário: <strong>{fazenda.proprietario}</strong>
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <MapPin size={16} style={{ color: isDark ? '#9ca3af' : '#64748b' }} />
                  <span style={{ fontSize: '14px' }}>
                    {fazenda.endereco.cidade}, {fazenda.endereco.estado} • {fazenda.area} ha
                  </span>
                </div>
              </div>

              {/* Cultivos e Atividades */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {fazenda.cultivos?.includes('Milho') && (
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      🌽 Milho
                    </span>
                  )}
                  {fazenda.cultivos?.includes('Soja') && (
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      🌱 Soja
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {fazenda.realizaRacao && (
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      🥜 Ração Animal
                    </span>
                  )}
                  {fazenda.realizaNutricao && (
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#ede9fe',
                      color: '#6b21a8',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      🧪 Nutrição Animal
                    </span>
                  )}
                </div>
              </div>

              {/* Funcionários */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Users size={16} style={{ color: isDark ? '#9ca3af' : '#64748b' }} />
                  <span style={{ fontSize: '14px' }}>
                    {fazenda.funcionarios.length} funcionário{fazenda.funcionarios.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <button
                  onClick={() => abrirModalFuncionarios(fazenda)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff'
                  }}
                >
                  <Eye size={14} />
                  Ver Funcionários
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nova/Editar Fazenda */}
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: isDark ? '#f9fafb' : '#111827'
              }}>
                {fazendaSelecionada ? 'Editar Fazenda' : 'Nova Fazenda'}
              </h2>
              <button
                onClick={() => {
                  setModalAberto(false);
                  setFazendaSelecionada(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#9ca3af' : '#64748b'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Formulário simples */}
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '6px'
                }}>
                  Nome da Fazenda *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fazenda São João"
                  value={novaFazenda.nome}
                  onChange={(e) => setNovaFazenda(prev => ({ ...prev, nome: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827',
                    fontSize: '14px'
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
                  marginBottom: '6px'
                }}>
                  Proprietário *
                </label>
                <input
                  type="text"
                  placeholder="Nome do proprietário"
                  value={novaFazenda.proprietario}
                  onChange={(e) => setNovaFazenda(prev => ({ ...prev, proprietario: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827',
                    fontSize: '14px'
                  }}
                />
                {errosValidacaoFazenda.proprietario && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errosValidacaoFazenda.proprietario}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '6px'
                }}>
                  Área da Fazenda (hectares) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Ex: 150.5"
                  value={novaFazenda.area || ''}
                  onChange={(e) => setNovaFazenda(prev => ({ ...prev, area: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827',
                    fontSize: '14px'
                  }}
                />
                {errosValidacaoFazenda.area && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errosValidacaoFazenda.area}
                  </p>
                )}
              </div>

              {/* Campos de Localização */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '6px'
                  }}>
                    Cidade *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Goiânia"
                    value={novaFazenda.endereco.cidade}
                    onChange={(e) => setNovaFazenda(prev => ({ 
                      ...prev, 
                      endereco: { ...prev.endereco, cidade: e.target.value }
                    }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: '14px'
                    }}
                  />
                  {errosValidacaoFazenda.cidade && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errosValidacaoFazenda.cidade}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '6px'
                  }}>
                    Estado *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: GO"
                    maxLength={2}
                    value={novaFazenda.endereco.estado}
                    onChange={(e) => setNovaFazenda(prev => ({ 
                      ...prev, 
                      endereco: { ...prev.endereco, estado: e.target.value.toUpperCase() }
                    }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: '14px'
                    }}
                  />
                  {errosValidacaoFazenda.estado && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errosValidacaoFazenda.estado}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '6px'
                  }}>
                    CEP *
                  </label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={novaFazenda.endereco.cep}
                    onChange={(e) => setNovaFazenda(prev => ({ 
                      ...prev, 
                      endereco: { ...prev.endereco, cep: e.target.value }
                    }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: '14px'
                    }}
                  />
                  {errosValidacaoFazenda.cep && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errosValidacaoFazenda.cep}
                    </p>
                  )}
                </div>
              </div>

              {/* Campos Opcionais */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '6px'
                  }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={novaFazenda.telefone}
                    onChange={(e) => setNovaFazenda(prev => ({ ...prev, telefone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '6px'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="fazenda@exemplo.com"
                    value={novaFazenda.email}
                    onChange={(e) => setNovaFazenda(prev => ({ ...prev, email: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Cultivos */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '6px'
                }}>
                  Cultivos
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={novaFazenda.cultivos.includes('Milho')}
                      onChange={() => toggleCultivo('Milho')}
                    />
                    <span>🌽 Milho</span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={novaFazenda.cultivos.includes('Soja')}
                      onChange={() => toggleCultivo('Soja')}
                    />
                    <span>🌱 Soja</span>
                  </label>
                </div>
              </div>

              {/* Atividades Especiais */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '6px'
                }}>
                  Atividades Especiais
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={novaFazenda.realizaRacao}
                      onChange={(e) => setNovaFazenda(prev => ({ ...prev, realizaRacao: e.target.checked }))}
                    />
                    <span>🥜 Ração Animal</span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={novaFazenda.realizaNutricao}
                      onChange={(e) => setNovaFazenda(prev => ({ ...prev, realizaNutricao: e.target.checked }))}
                    />
                    <span>🧪 Nutrição Animal</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
            }}>
              <button
                onClick={() => {
                  setModalAberto(false);
                  setFazendaSelecionada(null);
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  color: isDark ? '#f9fafb' : '#374151'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarFazenda}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#10b981',
                  color: '#ffffff'
                }}
              >
                {fazendaSelecionada ? 'Atualizar Fazenda' : 'Criar Fazenda'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestão de Funcionários */}
      {modalFuncionarios && fazendaSelecionada && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            color: isDark ? '#f9fafb' : '#111827'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                👥 Funcionários - {fazendaSelecionada.nome}
              </h2>
              <button
                onClick={() => setModalFuncionarios(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: isDark ? '#f9fafb' : '#111827'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Botão Adicionar Funcionário */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={abrirModalNovoFuncionario}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#10b981',
                    color: '#ffffff'
                  }}
                >
                  <UserPlus size={16} />
                  Adicionar Funcionário
                </button>
              </div>

              {/* Lista de Funcionários */}
              {fazendaSelecionada.funcionarios.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px',
                  color: isDark ? '#9ca3af' : '#64748b'
                }}>
                  <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
                    Nenhum funcionário cadastrado
                  </h3>
                  <p style={{ fontSize: '14px' }}>
                    Comece adicionando o primeiro funcionário desta fazenda
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '16px'
                }}>
                  {fazendaSelecionada.funcionarios.map((funcionario: Funcionario) => (
                    <div key={funcionario.id} style={{
                      backgroundColor: isDark ? '#374151' : '#f9fafb',
                      border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      padding: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '8px'
                          }}>
                            {funcionario.nome}
                          </h4>
                          
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            fontSize: '14px'
                          }}>
                            <div>
                              <strong>Cargo:</strong> {funcionario.cargo}
                            </div>
                            <div>
                              <strong>Status:</strong> {funcionario.status}
                            </div>
                            <div>
                              <strong>Email:</strong> {funcionario.email}
                            </div>
                            <div>
                              <strong>Telefone:</strong> {funcionario.telefone}
                            </div>
                            <div>
                              <strong>Admissão:</strong> {new Date(funcionario.dataContratacao).toLocaleDateString('pt-BR')}
                            </div>
                            <div>
                              <strong>Salário:</strong> R$ {funcionario.salario.toLocaleString('pt-BR')}
                            </div>
                            {funcionario.especialidade && (
                              <div>
                                <strong>Especialidade:</strong> {funcionario.especialidade}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                          <button
                            onClick={() => abrirModalEditarFuncionario(funcionario)}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: '#3b82f6',
                              color: 'white'
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => removerFuncionarioConfirm(funcionario.id)}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: '#dc2626',
                              color: 'white'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo/Editar Funcionário */}
      {(modalNovoFuncionario || modalEditarFuncionario) && (
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
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            color: isDark ? '#f9fafb' : '#111827'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                {funcionarioSelecionado ? '✏️ Editar Funcionário' : '👤 Novo Funcionário'}
              </h2>
              <button
                onClick={() => {
                  setModalNovoFuncionario(false);
                  setModalEditarFuncionario(false);
                  setFuncionarioSelecionado(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: isDark ? '#f9fafb' : '#111827'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{
              padding: '24px',
              display: 'grid',
              gap: '16px'
            }}>
              {/* Nome */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '6px'
                }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={novoFuncionario.nome || ''}
                  onChange={(e) => setNovoFuncionario(prev => ({ ...prev, nome: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827',
                    fontSize: '14px'
                  }}
                  placeholder="Digite o nome completo"
                />
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '6px'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={novoFuncionario.email || ''}
                  onChange={(e) => setNovoFuncionario(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827',
                    fontSize: '14px'
                  }}
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* Cargo e Salário em linha */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '6px'
                  }}>
                    Cargo
                  </label>
                  <select
                    value={novoFuncionario.cargo || 'peao'}
                    onChange={(e) => atualizarCargoEPermissoes(e.target.value as 'administrador' | 'supervisor' | 'peao')}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: '14px'
                    }}
                  >
                    <option value="peao">Peão</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '6px'
                  }}>
                    Salário (R$)
                  </label>
                  <input
                    type="number"
                    value={novoFuncionario.salario || ''}
                    onChange={(e) => setNovoFuncionario(prev => ({ ...prev, salario: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: '14px'
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Telefone e CPF em linha */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '6px'
                  }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={novoFuncionario.telefone || ''}
                    onChange={(e) => setNovoFuncionario(prev => ({ ...prev, telefone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: '14px'
                    }}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    marginBottom: '6px'
                  }}>
                    CPF
                  </label>
                  <input
                    type="text"
                    value={novoFuncionario.cpf || ''}
                    onChange={(e) => setNovoFuncionario(prev => ({ ...prev, cpf: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: '14px'
                    }}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '6px'
                }}>
                  Endereço
                </label>
                <input
                  type="text"
                  value={novoFuncionario.endereco || ''}
                  onChange={(e) => setNovoFuncionario(prev => ({ ...prev, endereco: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827',
                    fontSize: '14px'
                  }}
                  placeholder="Rua, número, bairro, cidade/estado"
                />
              </div>

              {/* Especialidade */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '6px'
                }}>
                  Especialidade/Função
                </label>
                <input
                  type="text"
                  value={novoFuncionario.especialidade || ''}
                  onChange={(e) => setNovoFuncionario(prev => ({ ...prev, especialidade: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827',
                    fontSize: '14px'
                  }}
                  placeholder="Ex: Operador de máquinas, Veterinário, etc."
                />
              </div>

              {/* Observações */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#374151',
                  marginBottom: '6px'
                }}>
                  Observações
                </label>
                <textarea
                  value={novoFuncionario.observacoes || ''}
                  onChange={(e) => setNovoFuncionario(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  placeholder="Informações adicionais sobre o funcionário..."
                />
              </div>

              {/* Permissões do Sistema */}
              <div style={{
                borderTop: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
                paddingTop: '20px',
                marginTop: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <Shield size={20} style={{ color: isDark ? '#60a5fa' : '#3b82f6', marginRight: '8px' }} />
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: isDark ? '#f9fafb' : '#374151',
                    margin: 0
                  }}>
                    Permissões do Sistema
                  </h3>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px'
                }}>
                  {Object.entries(permissoesFuncionario).map(([modulo, permissoes]) => (
                    <div key={modulo} style={{
                      border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: isDark ? '#374151' : '#f9fafb'
                    }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: isDark ? '#60a5fa' : '#3b82f6',
                        marginBottom: '12px',
                        textTransform: 'capitalize'
                      }}>
                        {modulo === 'fazendas' ? 'Fazendas' :
                         modulo === 'funcionarios' ? 'Funcionários' :
                         modulo === 'cultivos' ? 'Cultivos' :
                         modulo === 'adubagem' ? 'Adubagem' :
                         modulo === 'vendas' ? 'Vendas' :
                         modulo === 'estoque' ? 'Estoque' :
                         modulo === 'relatorios' ? 'Relatórios' :
                         modulo === 'dashboard' ? 'Dashboard' : modulo}
                      </h4>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '8px'
                      }}>
                        {Object.entries(permissoes).map(([acao, valor]) => (
                          <label key={acao} style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '13px',
                            color: isDark ? '#d1d5db' : '#6b7280',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={valor}
                              onChange={(e) => atualizarPermissao(modulo, acao, e.target.checked)}
                              style={{
                                marginRight: '6px',
                                accentColor: '#3b82f6'
                              }}
                            />
                            {acao === 'ler' ? 'Visualizar' :
                             acao === 'criar' ? 'Criar' :
                             acao === 'editar' ? 'Editar' :
                             acao === 'deletar' ? 'Deletar' :
                             acao === 'gerarRelatorio' ? 'Gerar Relatório' :
                             acao === 'exportarDados' ? 'Exportar Dados' : acao}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: isDark ? '#1f2937' : '#eff6ff',
                  border: `1px solid ${isDark ? '#374151' : '#bfdbfe'}`,
                  borderRadius: '6px'
                }}>
                  <p style={{
                    fontSize: '12px',
                    color: isDark ? '#9ca3af' : '#6b7280',
                    margin: 0
                  }}>
                    <strong>Dica:</strong> As permissões definem o que o funcionário pode fazer em cada módulo do sistema. 
                    Selecione apenas as ações necessárias para o cargo do funcionário.
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              padding: '24px',
              paddingTop: '0'
            }}>
              <button
                onClick={() => {
                  setModalNovoFuncionario(false);
                  setModalEditarFuncionario(false);
                  setFuncionarioSelecionado(null);
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  color: isDark ? '#f9fafb' : '#374151'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarFuncionario}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#10b981',
                  color: '#ffffff'
                }}
              >
                {funcionarioSelecionado ? 'Atualizar Funcionário' : 'Adicionar Funcionário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FazendasCompleta;
