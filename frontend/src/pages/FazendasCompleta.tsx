import React, { useState } from 'react';
import { MapPin, Users, Building, Plus, Edit, Trash2, X, Star, Phone, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFazendas } from '../context/FazendasContext';
import { Fazenda, Funcionario } from '../context/FazendasContext';

// Interfaces para nova fazenda e funcionário
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
  cultivos: {
    milho: boolean;
    soja: boolean;
  };
  funcionariosIniciais: NovoFuncionario[];
}

interface NovoFuncionario {
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
}

const FazendasCompleta: React.FC = () => {
  const { isDark } = useTheme();
  const { fazendas, adicionarFazenda, editarFazenda, removerFazenda, adicionarFuncionario } = useFazendas();
  
  // Estados
  const [fazendaSelecionada, setFazendaSelecionada] = useState<Fazenda | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  
  const [novaFazenda, setNovaFazenda] = useState<NovaFazenda>({
    nome: '',
    endereco: { cidade: '', estado: '', cep: '' },
    area: 0,
    proprietario: '',
    telefone: '',
    email: '',
    realizaRacao: false,
    realizaNutricao: false,
    cultivos: {
      milho: false,
      soja: false
    },
    funcionariosIniciais: []
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

  // Estatísticas
  const totalFazendas = fazendas.length;
  const fazendasAtivas = fazendas.filter((f: Fazenda) => f.status === 'ativa').length;
  const totalFuncionarios = fazendas.reduce((total: number, fazenda: Fazenda) => total + fazenda.funcionarios.length, 0);
  const areaTotal = fazendas.reduce((total: number, fazenda: Fazenda) => total + fazenda.area, 0);

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
      realizaNutricao: false,
      cultivos: {
        milho: false,
        soja: false
      },
      funcionariosIniciais: []
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
      cultivos: {
        milho: fazenda.cultivos.includes('milho') || fazenda.cultivos.includes('Milho'),
        soja: fazenda.cultivos.includes('soja') || fazenda.cultivos.includes('Soja')
      },
      funcionariosIniciais: []
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
          cultivos: [
            ...(novaFazenda.cultivos.milho ? ['Milho'] : []),
            ...(novaFazenda.cultivos.soja ? ['Soja'] : [])
          ]
        };

        await editarFazenda(fazendaAtualizada.id, fazendaAtualizada);
      } else {
        // Criar nova fazenda
        const fazendaNova: Fazenda = {
          id: Date.now(), // Temporary ID for local storage
          nome: novaFazenda.nome,
          endereco: novaFazenda.endereco,
          area: novaFazenda.area,
          proprietario: novaFazenda.proprietario,
          telefone: novaFazenda.telefone,
          email: novaFazenda.email,
          realizaRacao: novaFazenda.realizaRacao,
          realizaNutricao: novaFazenda.realizaNutricao,
          cultivos: [
            ...(novaFazenda.cultivos.milho ? ['Milho'] : []),
            ...(novaFazenda.cultivos.soja ? ['Soja'] : [])
          ],
          status: 'ativa',
          dataAquisicao: new Date().toISOString().split('T')[0],
          valorCompra: 0,
          producaoAnual: 0,
          custoOperacional: 0,
          funcionarios: []
        };

        await adicionarFazenda(fazendaNova);
        
        // Adicionar funcionários iniciais se houver
        if (novaFazenda.funcionariosIniciais.length > 0) {
          for (const funcionario of novaFazenda.funcionariosIniciais) {
            const funcionarioCompleto: Funcionario = {
              id: Date.now() + Math.random(),
              nome: funcionario.nome,
              email: funcionario.email,
              cargo: funcionario.cargo,
              dataContratacao: funcionario.dataAdmissao,
              salario: funcionario.salario,
              status: 'ativo',
              telefone: funcionario.telefone,
              fazendaId: fazendaNova.id,
              cpf: funcionario.cpf,
              endereco: funcionario.endereco,
              especialidade: funcionario.especialidade,
              observacoes: funcionario.observacoes,
              permissoes: []
            };
            
            await adicionarFuncionario(fazendaNova.id, funcionarioCompleto);
          }
        }
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

  // Funções para gerenciar funcionários na criação da fazenda
  const adicionarFuncionarioInicial = () => {
    const novoFunc: NovoFuncionario = {
      nome: '',
      email: '',
      cargo: 'peao',
      telefone: '',
      dataAdmissao: new Date().toISOString().split('T')[0],
      salario: 0,
      cpf: '',
      endereco: '',
      especialidade: '',
      observacoes: '',
      fazendaId: 0
    };
    
    setNovaFazenda(prev => ({
      ...prev,
      funcionariosIniciais: [...prev.funcionariosIniciais, novoFunc]
    }));
  };

  const removerFuncionarioInicial = (index: number) => {
    setNovaFazenda(prev => ({
      ...prev,
      funcionariosIniciais: prev.funcionariosIniciais.filter((_, i) => i !== index)
    }));
  };

  const atualizarFuncionarioInicial = (index: number, funcionario: Partial<NovoFuncionario>) => {
    setNovaFazenda(prev => ({
      ...prev,
      funcionariosIniciais: prev.funcionariosIniciais.map((f, i) => 
        i === index ? { ...f, ...funcionario } : f
      )
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

  // Estilos
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: '100vh',
      backgroundColor: isDark ? '#111827' : '#f9fafb',
      color: isDark ? '#f9fafb' : '#111827',
      padding: '20px'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: isDark ? '#9ca3af' : '#64748b'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    controls: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    input: {
      padding: '10px 12px',
      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
      borderRadius: '8px',
      backgroundColor: isDark ? '#374151' : '#ffffff',
      color: isDark ? '#f9fafb' : '#111827',
      fontSize: '14px'
    },
    select: {
      padding: '10px 12px',
      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
      borderRadius: '8px',
      backgroundColor: isDark ? '#374151' : '#ffffff',
      color: isDark ? '#f9fafb' : '#111827',
      fontSize: '14px'
    },
    button: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    buttonPrimary: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    buttonSecondary: {
      backgroundColor: isDark ? '#374151' : '#f3f4f6',
      color: isDark ? '#f9fafb' : '#374151',
      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`
    },
    fazendasGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '24px'
    },
    fazendaCard: {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    modal: {
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
    },
    modalContent: {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏡 Gestão de Fazendas</h1>
        <p style={styles.subtitle}>
          Sistema completo de gestão para suas propriedades rurais
        </p>
      </div>

      {/* Estatísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Building size={24} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: isDark ? '#9ca3af' : '#64748b' }}>
              Total de Fazendas
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalFazendas}</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Star size={24} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: isDark ? '#9ca3af' : '#64748b' }}>
              Fazendas Ativas
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{fazendasAtivas}</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Users size={24} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: isDark ? '#9ca3af' : '#64748b' }}>
              Total de Funcionários
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalFuncionarios}</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <MapPin size={24} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: isDark ? '#9ca3af' : '#64748b' }}>
              Área Total (ha)
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{areaTotal.toFixed(1)}</div>
        </div>
      </div>

      {/* Controles */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Pesquisar fazendas..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          style={{ ...styles.input, minWidth: '200px' }}
        />

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={styles.select}
        >
          <option value="todas">Todas as fazendas</option>
          <option value="ativa">Fazendas ativas</option>
          <option value="inativa">Fazendas inativas</option>
        </select>

        <button
          onClick={abrirModalNovaFazenda}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
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
              : 'Comece cadastrando sua primeira fazenda'
            }
          </p>
        </div>
      ) : (
        <div style={styles.fazendasGrid}>
          {fazendasFiltradas.map((fazenda: Fazenda) => (
            <div key={fazenda.id} style={styles.fazendaCard}>
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
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: fazenda.status === 'ativa' ? '#dcfce7' : '#fef3c7',
                    color: fazenda.status === 'ativa' ? '#166534' : '#92400e'
                  }}>
                    {fazenda.status === 'ativa' ? '✅ Ativa' : '⏸️ Inativa'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => abrirModalEditarFazenda(fazenda)}
                    style={{
                      ...styles.button,
                      ...styles.buttonSecondary,
                      padding: '8px',
                      minWidth: 'auto'
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deletarFazenda(fazenda.id)}
                    style={{
                      ...styles.button,
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '8px',
                      minWidth: 'auto'
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

                {(fazenda.telefone || fazenda.email) && (
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    {fazenda.telefone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} style={{ color: isDark ? '#9ca3af' : '#64748b' }} />
                        <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b' }}>
                          {fazenda.telefone}
                        </span>
                      </div>
                    )}
                    {fazenda.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} style={{ color: isDark ? '#9ca3af' : '#64748b' }} />
                        <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b' }}>
                          {fazenda.email}
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
                  onClick={() => setFazendaSelecionada(fazenda)}
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary,
                    padding: '6px 12px',
                    fontSize: '12px'
                  }}
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nova/Editar Fazenda */}
      {modalAberto && (
        <div style={styles.modal}>
          <div style={{
            ...styles.modalContent,
            maxWidth: '800px',
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

            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Informações Básicas */}
              <div style={{
                padding: '20px',
                backgroundColor: isDark ? '#374151' : '#f9fafb',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827',
                  marginBottom: '16px'
                }}>
                  📋 Informações Básicas
                </h3>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                        style={styles.input}
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
                        style={styles.input}
                      />
                      {errosValidacaoFazenda.proprietario && (
                        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                          {errosValidacaoFazenda.proprietario}
                        </p>
                      )}
                    </div>
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
                      style={styles.input}
                    />
                    {errosValidacaoFazenda.area && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errosValidacaoFazenda.area}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div style={{
                padding: '20px',
                backgroundColor: isDark ? '#374151' : '#f9fafb',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827',
                  marginBottom: '16px'
                }}>
                  📍 Localização
                </h3>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
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
                        style={styles.input}
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
                        style={styles.input}
                      />
                      {errosValidacaoFazenda.estado && (
                        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                          {errosValidacaoFazenda.estado}
                        </p>
                      )}
                    </div>
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
                      maxLength={9}
                      value={novaFazenda.endereco.cep}
                      onChange={(e) => {
                        let valor = e.target.value.replace(/\D/g, '');
                        if (valor.length > 5) {
                          valor = valor.replace(/(\d{5})(\d{3})/, '$1-$2');
                        }
                        setNovaFazenda(prev => ({ 
                          ...prev, 
                          endereco: { ...prev.endereco, cep: valor }
                        }));
                      }}
                      style={styles.input}
                    />
                    {errosValidacaoFazenda.cep && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errosValidacaoFazenda.cep}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cultivos */}
              <div style={{
                padding: '20px',
                backgroundColor: isDark ? '#374151' : '#f9fafb',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827',
                  marginBottom: '16px'
                }}>
                  🌾 Cultivos
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: `2px solid ${novaFazenda.cultivos.milho ? '#10b981' : (isDark ? '#4b5563' : '#e5e7eb')}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setNovaFazenda(prev => ({
                    ...prev,
                    cultivos: { ...prev.cultivos, milho: !prev.cultivos.milho }
                  }))}>
                    <input
                      type="checkbox"
                      checked={novaFazenda.cultivos.milho}
                      onChange={() => {}}
                      style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                    />
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: isDark ? '#f9fafb' : '#111827'
                      }}>
                        🌽 Milho
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: isDark ? '#9ca3af' : '#64748b'
                      }}>
                        Cultivo de milho
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: `2px solid ${novaFazenda.cultivos.soja ? '#10b981' : (isDark ? '#4b5563' : '#e5e7eb')}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setNovaFazenda(prev => ({
                    ...prev,
                    cultivos: { ...prev.cultivos, soja: !prev.cultivos.soja }
                  }))}>
                    <input
                      type="checkbox"
                      checked={novaFazenda.cultivos.soja}
                      onChange={() => {}}
                      style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                    />
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: isDark ? '#f9fafb' : '#111827'
                      }}>
                        🌱 Soja
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: isDark ? '#9ca3af' : '#64748b'
                      }}>
                        Cultivo de soja
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Atividades Especiais */}
              <div style={{
                padding: '20px',
                backgroundColor: isDark ? '#374151' : '#f9fafb',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827',
                  marginBottom: '16px'
                }}>
                  🏭 Atividades Especiais
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: `2px solid ${novaFazenda.realizaRacao ? '#f59e0b' : (isDark ? '#4b5563' : '#e5e7eb')}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setNovaFazenda(prev => ({ ...prev, realizaRacao: !prev.realizaRacao }))}>
                    <input
                      type="checkbox"
                      checked={novaFazenda.realizaRacao}
                      onChange={() => {}}
                      style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
                    />
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: isDark ? '#f9fafb' : '#111827'
                      }}>
                        🥜 Produção de Ração
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: isDark ? '#9ca3af' : '#64748b'
                      }}>
                        Fábrica de ração animal
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: `2px solid ${novaFazenda.realizaNutricao ? '#8b5cf6' : (isDark ? '#4b5563' : '#e5e7eb')}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setNovaFazenda(prev => ({ ...prev, realizaNutricao: !prev.realizaNutricao }))}>
                    <input
                      type="checkbox"
                      checked={novaFazenda.realizaNutricao}
                      onChange={() => {}}
                      style={{ width: '18px', height: '18px', accentColor: '#8b5cf6' }}
                    />
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: isDark ? '#f9fafb' : '#111827'
                      }}>
                        🧪 Nutrição Animal
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: isDark ? '#9ca3af' : '#64748b'
                      }}>
                        Suplementos nutricionais
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Funcionários Iniciais (apenas para nova fazenda) */}
              {!fazendaSelecionada && (
                <div style={{
                  padding: '20px',
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: isDark ? '#f9fafb' : '#111827'
                    }}>
                      👥 Funcionários Iniciais (Opcional)
                    </h3>
                    <button
                      onClick={adicionarFuncionarioInicial}
                      style={{
                        ...styles.button,
                        ...styles.buttonPrimary,
                        padding: '8px 12px',
                        fontSize: '14px'
                      }}
                    >
                      <Plus size={16} style={{ marginRight: '6px' }} />
                      Adicionar
                    </button>
                  </div>

                  {novaFazenda.funcionariosIniciais.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '24px',
                      color: isDark ? '#9ca3af' : '#64748b',
                      fontSize: '14px'
                    }}>
                      Nenhum funcionário adicionado. Você pode adicionar funcionários após criar a fazenda.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {novaFazenda.funcionariosIniciais.map((funcionario, index) => (
                        <div key={index} style={{
                          padding: '16px',
                          backgroundColor: isDark ? '#4b5563' : 'white',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? '#6b7280' : '#d1d5db'}`
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                            <div>
                              <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: isDark ? '#f9fafb' : '#374151',
                                marginBottom: '4px'
                              }}>
                                Nome
                              </label>
                              <input
                                type="text"
                                placeholder="Nome do funcionário"
                                value={funcionario.nome}
                                onChange={(e) => atualizarFuncionarioInicial(index, { nome: e.target.value })}
                                style={{
                                  ...styles.input,
                                  fontSize: '14px',
                                  padding: '8px'
                                }}
                              />
                            </div>

                            <div>
                              <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: isDark ? '#f9fafb' : '#374151',
                                marginBottom: '4px'
                              }}>
                                Cargo
                              </label>
                              <select
                                value={funcionario.cargo}
                                onChange={(e) => atualizarFuncionarioInicial(index, { 
                                  cargo: e.target.value as 'administrador' | 'supervisor' | 'peao' 
                                })}
                                style={{
                                  ...styles.input,
                                  fontSize: '14px',
                                  padding: '8px'
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
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: isDark ? '#f9fafb' : '#374151',
                                marginBottom: '4px'
                              }}>
                                Salário (R$)
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={funcionario.salario || ''}
                                onChange={(e) => atualizarFuncionarioInicial(index, { 
                                  salario: parseFloat(e.target.value) || 0 
                                })}
                                style={{
                                  ...styles.input,
                                  fontSize: '14px',
                                  padding: '8px'
                                }}
                              />
                            </div>

                            <button
                              onClick={() => removerFuncionarioInicial(index)}
                              style={{
                                ...styles.button,
                                backgroundColor: '#dc2626',
                                color: 'white',
                                padding: '8px',
                                minWidth: 'auto'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Contato (Opcional) */}
              <div style={{
                padding: '20px',
                backgroundColor: isDark ? '#374151' : '#f9fafb',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: isDark ? '#f9fafb' : '#111827',
                  marginBottom: '16px'
                }}>
                  📞 Contato (Opcional)
                </h3>

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
                      placeholder="(00) 00000-0000"
                      value={novaFazenda.telefone}
                      onChange={(e) => {
                        let valor = e.target.value.replace(/\D/g, '');
                        valor = valor.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
                        setNovaFazenda(prev => ({ ...prev, telefone: valor }));
                      }}
                      style={styles.input}
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
                      placeholder="exemplo@email.com"
                      value={novaFazenda.email}
                      onChange={(e) => setNovaFazenda(prev => ({ ...prev, email: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
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
                  ...styles.button,
                  ...styles.buttonSecondary
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarFazenda}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary
                }}
              >
                {fazendaSelecionada ? 'Atualizar Fazenda' : 'Criar Fazenda'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FazendasCompleta;