/**
 * Dashboard BI - Sistema Agropecuário
 * Versão sem TailwindCSS usando CSS inline
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sprout, 
  DollarSign, 
  Package, 
  MapPin,
  Calendar,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Wheat,
  Leaf,
  ShoppingCart,
  Factory,
  RefreshCw,
  Download
} from 'lucide-react';

// Dados BI para gestão agropecuária
const biData = {
  resumoGeral: {
    totalFazendas: 8,
    areaTotal: 1850.5,
    receitaTotal: 2450000,
    lucroMensal: 185000,
    crescimentoAnual: 18.5,
    cultivosAtivos: 24,
    produtividade: 92.3,
    eficienciaOperacional: 87.8
  },
  milho: {
    areaPlantada: 680.2,
    producaoReal: 3890,
    margem: 51.5,
    precoMedio: 189.0,
    qualidade: 94.2,
    faseCrescimento: {
      plantado: 15,
      crescimento: 45,
      florescimento: 25,
      maturacao: 15
    }
  },
  soja: {
    areaPlantada: 920.8,
    producaoReal: 2945,
    margem: 44.2,
    precoMedio: 401.0,
    qualidade: 96.8
  },
  vendas: {
    vendasMes: 425000,
    metaMensal: 380000,
    crescimentoVendas: 11.8
  },
  adubo: {
    estoqueTotal: 245.8,
    valorEstoque: 128500
  },
  estoque: {
    valorTotal: 385000,
    itensTotal: 156,
    alertas: 8
  }
};

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ fontSize: '18px', fontWeight: '500', color: '#6b7280' }}>
          Carregando dados agropecuários...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    padding: '24px',
    marginBottom: '24px'
  };

  const kpiCardStyle = {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
    textAlign: 'center' as const,
    marginBottom: '16px'
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '0 8px'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
      padding: '24px' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              background: 'linear-gradient(to right, #059669, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              Dashboard Agropecuário BI
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Análise completa da produção • Última atualização: {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}
            >
              <option value="semanal">Visão Semanal</option>
              <option value="mensal">Visão Mensal</option>
              <option value="trimestral">Visão Trimestral</option>
              <option value="anual">Visão Anual</option>
            </select>
            
            <button style={buttonStyle}>
              <RefreshCw size={16} style={{ marginRight: '8px' }} />
              Atualizar
            </button>
            
            <button style={{...buttonStyle, backgroundColor: '#2563eb'}}>
              <Download size={16} style={{ marginRight: '8px' }} />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '32px' 
      }}>
        
        {/* Seção 1: Resumo Geral */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center' }}>
                <BarChart3 size={24} style={{ marginRight: '12px', color: '#059669' }} />
                Resumo Geral
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Visão consolidada das operações</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Produtividade</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {biData.resumoGeral.produtividade}%
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{...kpiCardStyle, background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderColor: '#86efac'}}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#059669', textTransform: 'uppercase' }}>Fazendas</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#047857' }}>{biData.resumoGeral.totalFazendas}</p>
                </div>
                <MapPin size={32} style={{ color: '#10b981' }} />
              </div>
            </div>

            <div style={{...kpiCardStyle, background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderColor: '#93c5fd'}}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#2563eb', textTransform: 'uppercase' }}>Área Total</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1d4ed8' }}>
                    {biData.resumoGeral.areaTotal.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ha
                  </p>
                </div>
                <TrendingUp size={32} style={{ color: '#3b82f6' }} />
              </div>
            </div>

            <div style={{...kpiCardStyle, background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', borderColor: '#fcd34d'}}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#d97706', textTransform: 'uppercase' }}>Receita</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#b45309' }}>
                    R$ {(biData.resumoGeral.receitaTotal / 1000000).toFixed(1)}M
                  </p>
                </div>
                <DollarSign size={32} style={{ color: '#f59e0b' }} />
              </div>
            </div>

            <div style={{...kpiCardStyle, background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', borderColor: '#c4b5fd'}}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#7c3aed', textTransform: 'uppercase' }}>Cultivos</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6d28d9' }}>{biData.resumoGeral.cultivosAtivos}</p>
                </div>
                <Sprout size={32} style={{ color: '#8b5cf6' }} />
              </div>
            </div>
          </div>

          {/* Performance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <Activity size={16} style={{ marginRight: '8px' }} />
                Performance Operacional
              </h4>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Eficiência</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {biData.resumoGeral.eficienciaOperacional}%
                  </span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                  <div 
                    style={{ 
                      width: `${biData.resumoGeral.eficienciaOperacional}%`, 
                      backgroundColor: '#10b981', 
                      height: '8px', 
                      borderRadius: '4px' 
                    }}
                  ></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Crescimento Anual</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669', display: 'flex', alignItems: 'center' }}>
                  <TrendingUp size={12} style={{ marginRight: '4px' }} />
                  +{biData.resumoGeral.crescimentoAnual}%
                </span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <AlertCircle size={16} style={{ marginRight: '8px' }} />
                Status Atual
              </h4>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px', 
                  backgroundColor: '#f0fdf4', 
                  borderRadius: '8px', 
                  border: '1px solid #bbf7d0',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle size={16} style={{ color: '#10b981', marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', color: '#047857' }}>Plantio em dia</span>
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    backgroundColor: '#dcfce7', 
                    color: '#047857', 
                    padding: '4px 8px', 
                    borderRadius: '4px' 
                  }}>OK</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px', 
                  backgroundColor: '#fffbeb', 
                  borderRadius: '8px', 
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ color: '#f59e0b', marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', color: '#b45309' }}>Estoque baixo</span>
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    backgroundColor: '#fef3c7', 
                    color: '#b45309', 
                    padding: '4px 8px', 
                    borderRadius: '4px' 
                  }}>3 itens</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2: Cultura - Milho */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center' }}>
                <Wheat size={24} style={{ marginRight: '12px', color: '#d97706' }} />
                Cultura: Milho
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Análise detalhada da produção de milho</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Margem</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>
                {biData.milho.margem}%
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{...kpiCardStyle, background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', borderColor: '#fcd34d'}}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#d97706', textTransform: 'uppercase' }}>Área Plantada</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#b45309' }}>{biData.milho.areaPlantada} ha</p>
              <p style={{ fontSize: '12px', color: '#d97706', marginTop: '4px' }}>37% da área total</p>
            </div>
            <div style={{...kpiCardStyle, background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderColor: '#86efac'}}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#059669', textTransform: 'uppercase' }}>Produção</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#047857' }}>{biData.milho.producaoReal}t</p>
              <p style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>95% da meta</p>
            </div>
            <div style={{...kpiCardStyle, background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderColor: '#93c5fd'}}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#2563eb', textTransform: 'uppercase' }}>Preço Médio</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1d4ed8' }}>R$ {biData.milho.precoMedio}/t</p>
              <p style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px' }}>Acima do mercado</p>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <Sprout size={16} style={{ marginRight: '8px' }} />
              Fases de Crescimento
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px' }}>
              {Object.entries(biData.milho.faseCrescimento).map(([fase, percentual]) => (
                <div key={fase} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>{percentual}%</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>
                    {fase.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '6px', marginTop: '4px' }}>
                    <div 
                      style={{ 
                        width: `${percentual * 4}%`, 
                        backgroundColor: '#f59e0b', 
                        height: '6px', 
                        borderRadius: '4px' 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seção 3: Cultura - Soja */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center' }}>
                <Leaf size={24} style={{ marginRight: '12px', color: '#059669' }} />
                Cultura: Soja
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Análise detalhada da produção de soja</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Qualidade</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {biData.soja.qualidade}%
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{...kpiCardStyle, background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderColor: '#86efac'}}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#059669', textTransform: 'uppercase' }}>Área Plantada</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#047857' }}>{biData.soja.areaPlantada} ha</p>
              <p style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>50% da área total</p>
            </div>
            <div style={{...kpiCardStyle, background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', borderColor: '#6ee7b7'}}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#047857', textTransform: 'uppercase' }}>Produção</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#065f46' }}>{biData.soja.producaoReal}t</p>
              <p style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>107% da meta</p>
            </div>
            <div style={{...kpiCardStyle, background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', borderColor: '#5eead4'}}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#0f766e', textTransform: 'uppercase' }}>Preço Médio</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#134e4a' }}>R$ {biData.soja.precoMedio}/t</p>
              <p style={{ fontSize: '12px', color: '#0f766e', marginTop: '4px' }}>Premium quality</p>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Performance vs Meta</h4>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Produção Realizada</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>+6.6%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                <div 
                  style={{ 
                    width: '107%', 
                    backgroundColor: '#10b981', 
                    height: '8px', 
                    borderRadius: '4px' 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Margem de Lucro</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{biData.soja.margem}%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                <div 
                  style={{ 
                    width: `${biData.soja.margem}%`, 
                    backgroundColor: '#3b82f6', 
                    height: '8px', 
                    borderRadius: '4px' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 4: Vendas, Adubo e Estoque */}
        <div style={{...cardStyle, gridColumn: '1 / -1'}}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center' }}>
                <ShoppingCart size={24} style={{ marginRight: '12px', color: '#7c3aed' }} />
                Vendas, Adubo & Estoque
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Controle financeiro e operacional completo</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Meta Mensal</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#7c3aed' }}>
                {((biData.vendas.vendasMes / biData.vendas.metaMensal) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            
            {/* Vendas */}
            <div style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #c4b5fd'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#6d28d9', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <DollarSign size={20} style={{ marginRight: '8px' }} />
                Vendas
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#7c3aed' }}>Vendas do Mês</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#6d28d9' }}>
                    R$ {(biData.vendas.vendasMes / 1000).toFixed(0)}k
                  </span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#ddd6fe', borderRadius: '4px', height: '8px' }}>
                  <div 
                    style={{ 
                      width: `${(biData.vendas.vendasMes / biData.vendas.metaMensal) * 100}%`, 
                      backgroundColor: '#7c3aed', 
                      height: '8px', 
                      borderRadius: '4px' 
                    }}
                  ></div>
                </div>
                <div style={{ fontSize: '12px', color: '#7c3aed', marginTop: '4px' }}>
                  Meta: R$ {(biData.vendas.metaMensal / 1000).toFixed(0)}k
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} style={{ marginRight: '4px' }} />
                  +{biData.vendas.crescimentoVendas}% Crescimento
                </div>
              </div>
            </div>

            {/* Adubo */}
            <div style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #fdba74'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#c2410c', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <Factory size={20} style={{ marginRight: '8px' }} />
                Fertilizantes
              </h3>
              
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c2410c' }}>{biData.adubo.estoqueTotal}t</div>
                <div style={{ fontSize: '12px', color: '#ea580c' }}>Estoque Total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ea580c' }}>
                  R$ {(biData.adubo.valorEstoque / 1000).toFixed(0)}k
                </div>
                <div style={{ fontSize: '12px', color: '#fb923c' }}>Valor do Estoque</div>
              </div>
            </div>

            {/* Estoque */}
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #93c5fd'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1d4ed8', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <Package size={20} style={{ marginRight: '8px' }} />
                Estoque Geral
              </h3>
              
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8' }}>{biData.estoque.itensTotal}</div>
                <div style={{ fontSize: '12px', color: '#2563eb' }}>Itens Totais</div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2563eb' }}>
                  R$ {(biData.estoque.valorTotal / 1000).toFixed(0)}k
                </div>
                <div style={{ fontSize: '12px', color: '#3b82f6' }}>Valor Total</div>
              </div>

              {biData.estoque.alertas > 0 && (
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: '#fef2f2', 
                  borderRadius: '6px', 
                  border: '1px solid #fecaca' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#dc2626' }}>
                    <AlertCircle size={12} style={{ marginRight: '4px' }} />
                    {biData.estoque.alertas} alertas de estoque
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé - Quick Actions */}
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button style={buttonStyle}>
          <BarChart3 size={20} style={{ marginRight: '8px' }} />
          Relatório Completo
        </button>
        <button style={{...buttonStyle, backgroundColor: '#2563eb'}}>
          <Calendar size={20} style={{ marginRight: '8px' }} />
          Programar Plantio
        </button>
        <button style={{...buttonStyle, backgroundColor: '#f59e0b'}}>
          <Package size={20} style={{ marginRight: '8px' }} />
          Gerenciar Estoque
        </button>
        <button style={{...buttonStyle, backgroundColor: '#7c3aed'}}>
          <DollarSign size={20} style={{ marginRight: '8px' }} />
          Registrar Venda
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
