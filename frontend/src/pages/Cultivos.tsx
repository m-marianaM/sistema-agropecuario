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
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      color: isDark ? '#f1f5f9' : '#0f172a',
      padding: '24px'
    }}>
      {/* Header moderno */}
      <div style={{ 
        marginBottom: '32px',
        background: isDark 
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '20px',
        padding: '32px',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        boxShadow: isDark 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '800',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🌱 Gestão de Cultivos
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: isDark ? '#94a3b8' : '#64748b', 
              marginBottom: '0',
              fontWeight: '500'
            }}>
              Sistema unificado para gestão de milho e soja
            </p>
          </div>
          
          {/* Estatísticas modernas */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              minWidth: '100px',
              color: '#ffffff',
              boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800' }}>
                {cultivos.filter(c => c.cultura === 'Milho' || c.tipoCultivo?.includes('Milho')).length}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', opacity: 0.9 }}>🌽 Milho</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              minWidth: '100px',
              color: '#ffffff',
              boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800' }}>
                {cultivos.filter(c => c.cultura === 'Soja' || c.tipoCultivo?.includes('Soja')).length}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', opacity: 0.9 }}>� Soja</div>
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
            � Soja ({cultivos.filter(c => (c.cultura || c.tipoCultura) === 'Soja').length})
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
          {/* Controles e Filtros modernos */}
          <div style={{
            background: isDark 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '32px',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            boxShadow: isDark 
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.2)' 
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              alignItems: 'center'
            }}>
              {/* Pesquisa moderna */}
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{
                  position: 'absolute',
                  left: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#94a3b8' : '#64748b',
                  transition: 'color 0.3s ease'
                }} />
                <input
                  type="text"
                  placeholder="Pesquisar cultivos..."
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  style={{
                    padding: '16px 20px 16px 52px',
                    border: `2px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                    borderRadius: '16px',
                    background: isDark 
                      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
                      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    fontSize: '15px',
                    fontWeight: '500',
                    width: '100%',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxShadow: isDark 
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)'
                  }}
                  onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#3b82f6';
                    target.style.boxShadow = isDark 
                      ? '0 0 0 4px rgba(59, 130, 246, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.4)'
                      : '0 0 0 4px rgba(59, 130, 246, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.15)';
                    target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = isDark ? '#475569' : '#e2e8f0';
                    target.style.boxShadow = isDark 
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
                    target.style.transform = 'translateY(0)';
                  }}
                />
              </div>

              {/* Filtros modernos */}
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: `2px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <option value="todos">Todos os status</option>
                <option value="Plantado">🌱 Plantado</option>
                <option value="Crescimento">🌿 Crescimento</option>
                <option value="Floração">🌻 Floração</option>
                <option value="Maturação">🌾 Maturação</option>
                <option value="Colhido">📦 Colhido</option>
              </select>

              <select
                value={filtroFazenda}
                onChange={(e) => setFiltroFazenda(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: `2px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <option value="todas">Todas as fazendas</option>
                {fazendas.map(fazenda => (
                  <option key={fazenda.id} value={fazenda.id.toString()}>
                    {fazenda.nome}
                  </option>
                ))}
              </select>

              <select
                value={filtroTipoCultura}
                onChange={(e) => setFiltroTipoCultura(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: `2px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <option value="todas">Todas as culturas</option>
                <option value="Milho">🌽 Milho</option>
                <option value="Soja">� Soja</option>
              </select>

              {/* Botão Novo Cultivo moderno */}
              <button
                onClick={abrirModalNovoCultivo}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)',
                  justifySelf: 'end'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(-2px)';
                  target.style.boxShadow = '0 20px 25px -5px rgba(34, 197, 94, 0.4)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 10px 15px -3px rgba(34, 197, 94, 0.3)';
                }}
              >
                <Plus size={20} />
                Novo Cultivo
              </button>
            </div>
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
              padding: '64px 32px',
              background: isDark 
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '24px',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              boxShadow: isDark 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.2)' 
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: isDark 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)'
              }}>
                <Sprout size={36} style={{ color: '#ffffff' }} />
              </div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700',
                marginBottom: '12px',
                color: isDark ? '#f1f5f9' : '#0f172a',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: pesquisa || filtroStatus !== 'todos' || filtroFazenda !== 'todas' || filtroTipoCultura !== 'todas' ? (isDark ? '#f1f5f9' : '#0f172a') : 'transparent',
                backgroundClip: 'text'
              }}>
                {pesquisa || filtroStatus !== 'todos' || filtroFazenda !== 'todas' || filtroTipoCultura !== 'todas'
                  ? 'Nenhum cultivo encontrado'
                  : 'Nenhum cultivo cadastrado'}
              </h3>
              <p style={{ 
                fontSize: '16px', 
                marginBottom: '32px',
                color: isDark ? '#94a3b8' : '#64748b',
                lineHeight: '1.6',
                maxWidth: '400px',
                margin: '0 auto 32px'
              }}>
                {pesquisa || filtroStatus !== 'todos' || filtroFazenda !== 'todas' || filtroTipoCultura !== 'todas'
                  ? 'Tente ajustar os filtros de pesquisa para encontrar o que procura'
                  : 'Comece sua jornada na agricultura digital cadastrando seu primeiro cultivo de milho ou soja'}
              </p>
              {!pesquisa && filtroStatus === 'todos' && filtroFazenda === 'todas' && filtroTipoCultura === 'todas' && (
                <button
                  onClick={abrirModalNovoCultivo}
                  style={{
                    padding: '16px 32px',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'translateY(-3px)';
                    target.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.4)';
                  }}
                >
                  <Plus size={20} />
                  Cadastrar Primeiro Cultivo
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
              padding: '8px'
            }}>
              {cultivosFiltrados.map((cultivo: Cultivo) => (
                <div
                  key={cultivo.id}
                  style={{
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLDivElement;
                    target.style.transform = 'translateY(-8px)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLDivElement;
                    target.style.transform = 'translateY(0)';
                  }}
                >
                  <CardCultivo
                    cultivo={cultivo}
                    nomeFazenda={fazendas.find(f => f.id === cultivo.fazendaId)?.nome || 'Fazenda não encontrada'}
                    onRemover={confirmarRemocao}
                    onEditar={abrirModalEdicao}
                    isDark={isDark}
                  />
                </div>
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
