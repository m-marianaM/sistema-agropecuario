/**
 * 🌱 Página de Gestão de Cultivos de Milho e Soja
 * 
 * Funcionalidades:
 * - Separação visual entre Milho 🌽 e Soja 🌱 com cores específicas
 * - Cards por fazenda com dados técnicos completos
 * - Formulário completo com adubações e defensivos
 * - Dashboard integrado com dados reais do banco
 * - Status coloridos e produtividade em tempo real
 */

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Sprout, Calendar, MapPin, Package, TrendingUp, Eye, Edit, Trash2, X, Wheat, Leaf, Activity, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFazendas, Cultivo, Fazenda } from '../context/FazendasContext';
import CultivoForm from '../components/CultivoForm';
import CardCultivo from '../components/CardCultivo';

const Cultivos: React.FC = () => {
  const { isDark } = useTheme();
  const { 
    cultivos, 
    fazendas, 
    loading, 
    adicionarCultivo, 
    editarCultivo, 
    removerCultivo, 
    alterarStatusCultivo
  } = useFazendas();

  // Estados locais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [cultivoSelecionado, setCultivoSelecionado] = useState<Cultivo | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroFazenda, setFiltroFazenda] = useState<string>('todas');
  const [filtroTipoCultura, setFiltroTipoCultura] = useState<string>('todas');
  const [pesquisa, setPesquisa] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'milho' | 'soja'>('cards');
  const [cultivoAtivo, setCultivoAtivo] = useState<'todos' | 'milho' | 'soja'>('todos');
  
  // Estados para edição inline
  const [dadosEdicao, setDadosEdicao] = useState<Partial<Cultivo>>({});

  // ========================
  // 🔍 FILTROS E PESQUISA
  // ========================

  const cultivosFiltrados = cultivos.filter((cultivo: Cultivo) => {
    // Filtro por status (usando novo formato)
    const filtroStatusOk = filtroStatus === 'todos' || 
      cultivo.status === filtroStatus || 
      cultivo.status?.toLowerCase() === filtroStatus;
    
    // Filtro por fazenda
    const filtroFazendaOk = filtroFazenda === 'todas' || cultivo.fazendaId.toString() === filtroFazenda;
    
    // Filtro por tipo de cultura (usando nova estrutura)
    const tipoCultura = cultivo.cultura || cultivo.tipoCultura;
    const filtroTipoCulturaOk = filtroTipoCultura === 'todas' || tipoCultura === filtroTipoCultura;
    
    // Filtro por tipo ativo (tabs Milho/Soja)
    const filtroTipoAtivoOk = cultivoAtivo === 'todos' || 
      (cultivoAtivo === 'milho' && tipoCultura === 'Milho') ||
      (cultivoAtivo === 'soja' && tipoCultura === 'Soja');
    
    // Filtro por pesquisa (busca em vários campos)
    const fazenda = fazendas.find(f => f.id === cultivo.fazendaId);
    const filtroPesquisaOk = !pesquisa || [
      fazenda?.nome,
      tipoCultura,
      cultivo.tipoCultivo,
      cultivo.variedade,
      cultivo.talhao,
      cultivo.responsavelTecnico,
      cultivo.observacoes
    ].some(campo => campo?.toLowerCase().includes(pesquisa.toLowerCase()));
    
    return filtroStatusOk && filtroFazendaOk && filtroTipoCulturaOk && filtroTipoAtivoOk && filtroPesquisaOk;
  });

  // ========================
  // 🔧 FUNÇÕES DE AÇÃO
  // ========================

  const abrirModalNovoCultivo = () => {
    setCultivoSelecionado(null);
    setModalAberto(true);
  };

  const abrirModalDetalhes = (cultivo: Cultivo) => {
    setCultivoSelecionado(cultivo);
    setDadosEdicao(cultivo);
    setModoEdicao(false);
    setModalDetalhes(true);
  };

  const alternarModoEdicao = () => {
    if (modoEdicao) {
      // Cancelar edição - voltar aos dados originais
      setDadosEdicao(cultivoSelecionado || {});
    } else {
      // Entrar em modo de edição
      setDadosEdicao(cultivoSelecionado || {});
    }
    setModoEdicao(!modoEdicao);
  };

  const salvarEdicao = async () => {
    if (cultivoSelecionado && dadosEdicao) {
      try {
        await editarCultivo(cultivoSelecionado.id, dadosEdicao);
        setCultivoSelecionado({ ...cultivoSelecionado, ...dadosEdicao });
        setModoEdicao(false);
      } catch (error) {
        console.error('Erro ao salvar cultivo:', error);
        alert('Erro ao salvar cultivo. Tente novamente.');
      }
    }
  };

  const handleInputChange = (campo: string, valor: any) => {
    setDadosEdicao(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const confirmarRemocao = (cultivoId: number) => {
    const cultivo = cultivos.find(c => c.id === cultivoId);
    if (cultivo && window.confirm(`Tem certeza que deseja excluir o cultivo de ${cultivo.tipoCultura}?`)) {
      removerCultivo(cultivoId);
    }
  };

  const handleSalvarCultivo = async (dadosCultivo: Partial<Cultivo>) => {
    try {
      if (cultivoSelecionado) {
        // Editar cultivo existente
        await editarCultivo(cultivoSelecionado.id, dadosCultivo);
      } else {
        // Criar novo cultivo
        const novoCultivo: Cultivo = {
          ...dadosCultivo as Cultivo,
          id: Date.now(),
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        };
        await adicionarCultivo(novoCultivo);
      }
      setModalAberto(false);
      setCultivoSelecionado(null);
    } catch (error) {
      console.error('Erro ao salvar cultivo:', error);
      alert('Erro ao salvar cultivo. Tente novamente.');
    }
  };

  // ========================
  // 🎨 RENDER
  // ========================

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDark ? '#111827' : '#f9fafb',
      color: isDark ? '#f9fafb' : '#111827',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #D2691E 0%, #005F73 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🌱 Gestão de Cultivos
            </h1>
            <p style={{ fontSize: '16px', color: isDark ? '#9ca3af' : '#64748b', marginBottom: '16px' }}>
              Sistema integrado para cultivos de milho e soja com dados reais em tempo real
            </p>
          </div>
          
          {/* Estatísticas rápidas */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: isDark ? '#374151' : '#fff',
              border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
              textAlign: 'center',
              minWidth: '80px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#D2691E' }}>
                {cultivos.filter(c => c.cultura === 'Milho' || c.tipoCultivo?.includes('Milho')).length}
              </div>
              <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b' }}>🌽 Milho</div>
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: isDark ? '#374151' : '#fff',
              border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
              textAlign: 'center',
              minWidth: '80px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#005F73' }}>
                {cultivos.filter(c => c.cultura === 'Soja' || c.tipoCultivo?.includes('Soja')).length}
              </div>
              <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b' }}>🌱 Soja</div>
            </div>
          </div>
        </div>
        
        {/* Tabs de Navegação */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          <button
            onClick={() => setCultivoAtivo('todos')}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: cultivoAtivo === 'todos' ? '#3b82f6' : (isDark ? '#374151' : '#f8fafc'),
              color: cultivoAtivo === 'todos' ? '#fff' : (isDark ? '#f9fafb' : '#475569'),
              transition: 'all 0.2s'
            }}
          >
            <Activity size={16} />
            Todos ({cultivos.length})
          </button>
          <button
            onClick={() => setCultivoAtivo('milho')}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: cultivoAtivo === 'milho' ? '#D2691E' : (isDark ? '#374151' : '#f8fafc'),
              color: cultivoAtivo === 'milho' ? '#fff' : (isDark ? '#f9fafb' : '#475569'),
              transition: 'all 0.2s'
            }}
          >
            <Wheat size={16} />
            🌽 Milho ({cultivos.filter(c => (c.cultura || c.tipoCultura) === 'Milho').length})
          </button>
          <button
            onClick={() => setCultivoAtivo('soja')}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: cultivoAtivo === 'soja' ? '#005F73' : (isDark ? '#374151' : '#f8fafc'),
              color: cultivoAtivo === 'soja' ? '#fff' : (isDark ? '#f9fafb' : '#475569'),
              transition: 'all 0.2s'
            }}
          >
            <Leaf size={16} />
            🌱 Soja ({cultivos.filter(c => (c.cultura || c.tipoCultura) === 'Soja').length})
          </button>
        </div>

        {/* Toggle View Mode */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: viewMode === 'cards' ? '#3b82f6' : (isDark ? '#374151' : '#f3f4f6'),
              color: viewMode === 'cards' ? '#ffffff' : (isDark ? '#f9fafb' : '#374151'),
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Package size={16} />
            � Cards
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <>
          {/* Controles e Filtros */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Pesquisa */}
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isDark ? '#9ca3af' : '#64748b'
              }} />
              <input
                type="text"
                placeholder="Pesquisar cultivos..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                style={{
                  padding: '10px 12px 10px 44px',
                  border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: isDark ? '#374151' : '#ffffff',
                  color: isDark ? '#f9fafb' : '#111827',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
            </div>

            {/* Filtro por Status */}
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
              <option value="todos">Todos os status</option>
              <option value="Plantado">🌱 Plantado</option>
              <option value="Crescimento">🌿 Crescimento</option>
              <option value="Colheita">🚜 Colheita</option>
              <option value="Finalizado">✅ Finalizado</option>
            </select>

            {/* Filtro por Fazenda */}
            <select
              value={filtroFazenda}
              onChange={(e) => setFiltroFazenda(e.target.value)}
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
              {fazendas.map(fazenda => (
                <option key={fazenda.id} value={fazenda.id.toString()}>
                  {fazenda.nome}
                </option>
              ))}
            </select>

            {/* Filtro por Tipo de Cultura */}
            <select
              value={filtroTipoCultura}
              onChange={(e) => setFiltroTipoCultura(e.target.value)}
              style={{
                padding: '10px 12px',
                border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                backgroundColor: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#f9fafb' : '#111827',
                fontSize: '14px'
              }}
            >
              <option value="todas">Todas as culturas</option>
              <option value="Milho">🌽 Milho</option>
              <option value="Soja">🌱 Soja</option>
            </select>

            {/* Botão Novo Cultivo */}
            <button
              onClick={abrirModalNovoCultivo}
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
              Novo Cultivo
            </button>
          </div>

          {/* Lista de Cultivos */}
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '48px',
              color: isDark ? '#9ca3af' : '#64748b'
            }}>
              <Sprout size={24} style={{ marginRight: '12px', opacity: 0.7 }} />
              <span>Carregando cultivos...</span>
            </div>
          ) : cultivosFiltrados.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: isDark ? '#9ca3af' : '#64748b'
            }}>
              <Sprout size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
                {pesquisa || filtroStatus !== 'todos' || filtroFazenda !== 'todas' || filtroTipoCultura !== 'todas'
                  ? 'Nenhum cultivo encontrado'
                  : 'Nenhum cultivo cadastrado'}
              </h3>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                {pesquisa || filtroStatus !== 'todos' || filtroFazenda !== 'todas' || filtroTipoCultura !== 'todas'
                  ? 'Tente ajustar os filtros de pesquisa'
                  : 'Comece cadastrando seu primeiro cultivo de milho ou soja'}
              </p>
              {!pesquisa && filtroStatus === 'todos' && filtroFazenda === 'todas' && filtroTipoCultura === 'todas' && (
                <button
                  onClick={abrirModalNovoCultivo}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: '#10b981',
                    color: '#ffffff'
                  }}
                >
                  Cadastrar Primeiro Cultivo
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '24px'
            }}>
              {cultivosFiltrados.map((cultivo: Cultivo) => (
                <CardCultivo
                  key={cultivo.id}
                  cultivo={cultivo}
                  nomeFazenda={fazendas.find(f => f.id === cultivo.fazendaId)?.nome || 'Fazenda não encontrada'}
                  onRemover={confirmarRemocao}
                  onDetalhes={abrirModalDetalhes}
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Detalhes/Edição */}
      {modalDetalhes && cultivoSelecionado && (
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
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            {/* Header */}
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
                {modoEdicao ? '✏️ Editar Cultivo' : '👁️ Detalhes do Cultivo'}
              </h2>
              <button
                onClick={() => setModalDetalhes(false)}
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

            {/* Conteúdo dos detalhes */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Informações básicas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Fazenda
                  </label>
                  {modoEdicao ? (
                    <select
                      value={dadosEdicao.fazendaId || ''}
                      onChange={(e) => handleInputChange('fazendaId', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '4px',
                        border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        color: isDark ? '#f9fafb' : '#111827',
                        fontSize: '16px'
                      }}
                    >
                      {fazendas.map(fazenda => (
                        <option key={fazenda.id} value={fazenda.id}>{fazenda.nome}</option>
                      ))}
                    </select>
                  ) : (
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>
                      {fazendas.find(f => f.id === cultivoSelecionado.fazendaId)?.nome || 'N/A'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Tipo de Cultura
                  </label>
                  {modoEdicao ? (
                    <select
                      value={dadosEdicao.cultura || dadosEdicao.tipoCultura || ''}
                      onChange={(e) => handleInputChange('cultura', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '4px',
                        border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        color: isDark ? '#f9fafb' : '#111827',
                        fontSize: '16px'
                      }}
                    >
                      <option value="Milho">Milho</option>
                      <option value="Soja">Soja</option>
                    </select>
                  ) : (
                    <p style={{ 
                      fontSize: '16px', 
                      marginTop: '4px',
                      color: (cultivoSelecionado.cultura || cultivoSelecionado.tipoCultura) === 'Milho' ? '#D2691E' : '#005F73'
                    }}>
                      {(cultivoSelecionado.cultura || cultivoSelecionado.tipoCultura) === 'Milho' ? '🌽 Milho' : '🌱 Soja'}
                      {cultivoSelecionado.tipoCultivo && ` - ${cultivoSelecionado.tipoCultivo}`}
                    </p>
                  )}
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Produtividade
                  </label>
                  {modoEdicao ? (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="number"
                        value={dadosEdicao.produtividadeEsperada || ''}
                        onChange={(e) => handleInputChange('produtividadeEsperada', parseInt(e.target.value))}
                        placeholder="Esperada (kg/ha)"
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                          borderRadius: '6px',
                          backgroundColor: isDark ? '#374151' : '#ffffff',
                          color: isDark ? '#f9fafb' : '#111827',
                          fontSize: '14px'
                        }}
                      />
                      <input
                        type="number"
                        value={dadosEdicao.produtividadeReal || ''}
                        onChange={(e) => handleInputChange('produtividadeReal', parseInt(e.target.value))}
                        placeholder="Real (kg/ha)"
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                          borderRadius: '6px',
                          backgroundColor: isDark ? '#374151' : '#ffffff',
                          color: isDark ? '#f9fafb' : '#111827',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  ) : (
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                        {cultivoSelecionado.produtividadeEsperada?.toLocaleString('pt-BR') || 'N/A'} kg/ha
                      </span>
                      {cultivoSelecionado.produtividadeReal && (
                        <span style={{ marginLeft: '8px', color: '#3b82f6' }}>
                          (Real: {cultivoSelecionado.produtividadeReal.toLocaleString('pt-BR')} kg/ha)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Datas e área */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Data de Plantio
                  </label>
                  {modoEdicao ? (
                    <input
                      type="date"
                      value={dadosEdicao.dataPlantio ? new Date(dadosEdicao.dataPlantio).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('dataPlantio', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '4px',
                        border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        color: isDark ? '#f9fafb' : '#111827',
                        fontSize: '14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>
                      {new Date(cultivoSelecionado.dataPlantio).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Colheita Prevista
                  </label>
                  {modoEdicao ? (
                    <input
                      type="date"
                      value={dadosEdicao.dataColheitaPrevista ? new Date(dadosEdicao.dataColheitaPrevista).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('dataColheitaPrevista', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '4px',
                        border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        color: isDark ? '#f9fafb' : '#111827',
                        fontSize: '14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>
                      {cultivoSelecionado.dataColheitaPrevista ? 
                        new Date(cultivoSelecionado.dataColheitaPrevista).toLocaleDateString('pt-BR') :
                        'Não informada'
                      }
                    </p>
                  )}
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Área (hectares)
                  </label>
                  {modoEdicao ? (
                    <input
                      type="number"
                      value={dadosEdicao.areaHectares || ''}
                      onChange={(e) => handleInputChange('areaHectares', parseFloat(e.target.value))}
                      placeholder="Área em hectares"
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '4px',
                        border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        color: isDark ? '#f9fafb' : '#111827',
                        fontSize: '14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>
                      {cultivoSelecionado.areaHectares.toLocaleString('pt-BR')} ha
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                  Status Atual
                </label>
                {modoEdicao ? (
                  <select
                    value={dadosEdicao.status || ''}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '8px',
                      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '6px',
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: '14px'
                    }}
                  >
                    <option value="Plantado">🌱 Plantado</option>
                    <option value="Crescimento">🌿 Crescimento</option>
                    <option value="Floração">🌼 Floração</option>
                    <option value="Maturação">🌾 Maturação</option>
                    <option value="Colhido">🚜 Colhido</option>
                  </select>
                ) : (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      ...(
                        cultivoSelecionado.status === 'Plantado' ? { backgroundColor: '#dbeafe', color: '#1e40af' } :
                        cultivoSelecionado.status === 'Crescimento' ? { backgroundColor: '#dcfce7', color: '#166534' } :
                        cultivoSelecionado.status === 'Floração' ? { backgroundColor: '#fef3c7', color: '#92400e' } :
                        cultivoSelecionado.status === 'Maturação' ? { backgroundColor: '#fed7aa', color: '#c2410c' } :
                        cultivoSelecionado.status === 'Colhido' ? { backgroundColor: '#f3e8ff', color: '#7c3aed' } :
                        { backgroundColor: '#f3f4f6', color: '#374151' }
                      )
                    }}>
                      {cultivoSelecionado.status === 'Plantado' && '🌱 Plantado'}
                      {cultivoSelecionado.status === 'Crescimento' && '🌿 Crescimento'}
                      {cultivoSelecionado.status === 'Floração' && '🌼 Floração'}
                      {cultivoSelecionado.status === 'Maturação' && '🌾 Maturação'}
                      {cultivoSelecionado.status === 'Colhido' && '🚜 Colhido'}
                    </span>
                  </div>
                )}
              </div>

              {/* Adubo/Fertilizante */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Tipo de Fertilizante
                  </label>
                  {modoEdicao ? (
                    <input
                      type="text"
                      value={dadosEdicao.fertilizanteTipo || ''}
                      onChange={(e) => handleInputChange('fertilizanteTipo', e.target.value)}
                      placeholder="Tipo de fertilizante"
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '4px',
                        border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        color: isDark ? '#f9fafb' : '#111827',
                        fontSize: '16px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>
                      {cultivoSelecionado.fertilizanteTipo || 'Não informado'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Quantidade (kg)
                  </label>
                  {modoEdicao ? (
                    <input
                      type="number"
                      value={dadosEdicao.fertilizanteQuantidade || ''}
                      onChange={(e) => handleInputChange('fertilizanteQuantidade', parseInt(e.target.value))}
                      placeholder="Quantidade em kg"
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '4px',
                        border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        color: isDark ? '#f9fafb' : '#111827',
                        fontSize: '16px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>
                      {cultivoSelecionado.fertilizanteQuantidade ? 
                        `${cultivoSelecionado.fertilizanteQuantidade.toLocaleString('pt-BR')} kg` : 
                        'Não informada'
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Adubações Detalhadas */}
              {cultivoSelecionado.adubacoes && cultivoSelecionado.adubacoes.length > 0 && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b', marginBottom: '12px', display: 'block' }}>
                    📦 Histórico de Adubações
                  </label>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {cultivoSelecionado.adubacoes.map((adubacao, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        backgroundColor: isDark ? '#374151' : '#f8fafc',
                        borderRadius: '8px',
                        border: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`,
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr',
                        gap: '8px',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: '500' }}>{adubacao.tipoAdubo}</span>
                        <span style={{ fontSize: '14px', color: '#10b981' }}>{adubacao.quantidadeKgHa} kg/ha</span>
                        <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b' }}>
                          {new Date(adubacao.dataAplicacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Defensivos */}
              {cultivoSelecionado.defensivos && cultivoSelecionado.defensivos.length > 0 && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b', marginBottom: '12px', display: 'block' }}>
                    🛡️ Defensivos Aplicados
                  </label>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {cultivoSelecionado.defensivos.map((defensivo, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        backgroundColor: isDark ? '#374151' : '#f8fafc',
                        borderRadius: '8px',
                        border: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`,
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        gap: '8px',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: '500' }}>{defensivo.produto}</span>
                        <span style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor: 
                            defensivo.tipo === 'Inseticida' ? '#fef3c7' :
                            defensivo.tipo === 'Fungicida' ? '#dbeafe' : '#dcfce7',
                          color:
                            defensivo.tipo === 'Inseticida' ? '#92400e' :
                            defensivo.tipo === 'Fungicida' ? '#1e40af' : '#166534'
                        }}>
                          {defensivo.tipo}
                        </span>
                        <span style={{ fontSize: '14px' }}>{defensivo.dose}</span>
                        <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b' }}>
                          {new Date(defensivo.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações Técnicas Adicionais */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px'
              }}>
                {cultivoSelecionado.talhao && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                      Talhão
                    </label>
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>{cultivoSelecionado.talhao}</p>
                  </div>
                )}
                
                {cultivoSelecionado.responsavelTecnico && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                      Responsável Técnico
                    </label>
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>{cultivoSelecionado.responsavelTecnico}</p>
                  </div>
                )}
                
                {cultivoSelecionado.tipoSolo && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                      Tipo de Solo
                    </label>
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>{cultivoSelecionado.tipoSolo}</p>
                  </div>
                )}
              </div>

              {/* Observações */}
              {(cultivoSelecionado.observacoes || modoEdicao) && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Observações
                  </label>
                  {modoEdicao ? (
                    <textarea
                      value={dadosEdicao.observacoes || ''}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Observações sobre o cultivo..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px',
                        marginTop: '4px',
                        border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '8px',
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        color: isDark ? '#f9fafb' : '#111827',
                        fontSize: '16px',
                        lineHeight: '1.5',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <p style={{ 
                      fontSize: '16px', 
                      marginTop: '4px',
                      padding: '12px',
                      backgroundColor: isDark ? '#374151' : '#f9fafb',
                      borderRadius: '8px',
                      lineHeight: '1.5'
                    }}>
                      {cultivoSelecionado.observacoes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
            }}>
              {modoEdicao ? (
                <>
                  <button
                    onClick={salvarEdicao}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Save size={16} />
                    Salvar
                  </button>
                  
                  <button
                    onClick={() => {
                      setModoEdicao(false);
                      setDadosEdicao({});
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      backgroundColor: '#ef4444',
                      color: '#ffffff'
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={alternarModoEdicao}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Edit size={16} />
                  Editar
                </button>
              )}
              
              <button
                onClick={() => setModalDetalhes(false)}
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
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação/Edição de Cultivo */}
      {modalAberto && (
        <CultivoForm
          cultivoEdit={cultivoSelecionado}
          onSubmit={handleSalvarCultivo}
          onCancel={() => {
            setModalAberto(false);
            setCultivoSelecionado(null);
          }}
          fazendas={fazendas}
        />
      )}
    </div>
  );
};

export default Cultivos;
