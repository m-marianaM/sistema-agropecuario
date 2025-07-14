/**
 * 🌱 Página de Gestão de Cultivos - Versão Clean e Unificada
 * 
 * ✅ ARQUITETURA 100% UNIFICADA - SISTEMA FINALIZADO:
 * - Botão "Novo Cultivo" → CultivoForm (cultivoEdit = null)
 * - Botão "Editar" → MESMO CultivoForm (cultivoEdit = objeto)
 * - Interface idêntica conforme solicitado pelo usuário
 * - Zero duplicação de código ou modais
 * 
 * Funcionalidades:
 * - Separação visual entre Milho 🌽 e Soja 🌱 com cores específicas
 * - Cards modernos com dados técnicos completos
 * - Formulário único e unificado para criar e editar
 * - Dashboard integrado com dados reais do banco
 * - Status coloridos e produtividade em tempo real
 * - Sistema completamente limpo sem código legacy
 */

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Sprout, Calendar, MapPin, Package, TrendingUp, Eye, Edit, Trash2, X, Wheat, Leaf, Activity, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFazendas, Cultivo, Fazenda } from '../context/FazendasContext';
import CultivoForm from '../components/CultivoForm';
import CardCultivo from '../components/CardCultivo';

const CultivosClean: React.FC = () => {
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

  // Estados locais - UNIFICADOS
  const [modalAberto, setModalAberto] = useState(false);
  const [cultivoSelecionado, setCultivoSelecionado] = useState<Cultivo | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroFazenda, setFiltroFazenda] = useState<string>('todas');
  const [filtroTipoCultura, setFiltroTipoCultura] = useState<string>('todas');
  const [pesquisa, setPesquisa] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'milho' | 'soja'>('cards');
  const [cultivoAtivo, setCultivoAtivo] = useState<'todos' | 'milho' | 'soja'>('todos');

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
  // 🔧 FUNÇÕES UNIFICADAS
  // ========================

  const abrirModalNovoCultivo = () => {
    setCultivoSelecionado(null); // null = modo criação
    setModalAberto(true); // Abre CultivoForm
  };

  const abrirModalEdicao = (cultivo: Cultivo) => {
    setCultivoSelecionado(cultivo); // objeto = modo edição
    setModalAberto(true); // Abre MESMO CultivoForm
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
              🌱 Gestão de Cultivos - Sistema Unificado
            </h1>
            <p style={{ fontSize: '16px', color: isDark ? '#9ca3af' : '#64748b', marginBottom: '16px' }}>
              ✅ Edit e Novo Cultivo usam exatamente o mesmo CultivoForm - Arquitetura 100% unificada
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
            Cards
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
              gap: '20px'
            }}>
              {cultivosFiltrados.map((cultivo: Cultivo) => (
                <CardCultivo
                  key={cultivo.id}
                  cultivo={cultivo}
                  nomeFazenda={fazendas.find(f => f.id === cultivo.fazendaId)?.nome || 'Fazenda não encontrada'}
                  onRemover={confirmarRemocao}
                  onEditar={abrirModalEdicao}
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Unificado de Criação/Edição */}
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

export default CultivosClean;
