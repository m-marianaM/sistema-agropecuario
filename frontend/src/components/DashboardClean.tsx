/**
 * Dashboard BI - Sistema Agropecuário
 * Versão completa com CSS inline
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
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Dados simulados para o BI
const biData = {
  resumo: {
    totalFazendas: 12,
    areaTotal: 1850,
    areaPlantada: 1420,
    faturamentoMes: 485000,
    custoMes: 127000,
    lucroMes: 358000,
    produtividade: 94.2,
    alertas: 3
  },
  milho: {
    areaPlantada: 680,
    areaPorFase: {
      plantado: 180,
      crescimento: 320,
      colheita: 180
    },
    producaoEstimada: 3400,
    producaoRealizada: 2890,
    custoTotal: 68000,
    receitaEsperada: 238000,
    margemLucro: 71.4,
    dadosTemporais: [
      { mes: 'Jan', plantio: 120, colheita: 0, receita: 0 },
      { mes: 'Fev', plantio: 180, colheita: 0, receita: 0 },
      { mes: 'Mar', plantio: 220, colheita: 180, receita: 126000 },
      { mes: 'Abr', plantio: 160, colheita: 340, receita: 238000 },
      { mes: 'Mai', plantio: 0, colheita: 160, receita: 112000 },
      { mes: 'Jun', plantio: 0, colheita: 0, receita: 0 }
    ]
  },
  soja: {
    areaPlantada: 740,
    areaPorFase: {
      plantado: 200,
      crescimento: 380,
      colheita: 160
    },
    producaoEstimada: 2220,
    producaoRealizada: 2050,
    custoTotal: 59000,
    receitaEsperada: 267000,
    margemLucro: 77.9,
    dadosTemporais: [
      { mes: 'Jan', plantio: 140, colheita: 0, receita: 0 },
      { mes: 'Fev', plantio: 200, colheita: 0, receita: 0 },
      { mes: 'Mar', plantio: 240, colheita: 160, receita: 192000 },
      { mes: 'Abr', plantio: 160, colheita: 380, receita: 267000 },
      { mes: 'Mai', plantio: 0, colheita: 200, receita: 140000 },
      { mes: 'Jun', plantio: 0, colheita: 0, receita: 0 }
    ]
  },
  vendas: {
    totalMes: 485000,
    metaMes: 450000,
    crescimentoMensal: 12.3,
    principaisCompradores: [
      { nome: 'Cooperativa Central', valor: 185000, participacao: 38.1 },
      { nome: 'Exportadora Brasil', valor: 142000, participacao: 29.3 },
      { nome: 'Indústria Alimentos', valor: 98000, participacao: 20.2 },
      { nome: 'Outros', valor: 60000, participacao: 12.4 }
    ],
    vendaPorCultura: [
      { cultura: 'Milho', valor: 238000, toneladas: 340 },
      { cultura: 'Soja', valor: 247000, toneladas: 190 }
    ]
  },
  adubo: {
    gastosTotal: 127000,
    aplicacoesMes: 24,
    principais: [
      { tipo: 'NPK 20-05-20', gasto: 45000, area: 320 },
      { tipo: 'Ureia', gasto: 32000, area: 280 },
      { tipo: 'Superfosfato', gasto: 28000, area: 220 },
      { tipo: 'Cloreto Potássio', gasto: 22000, area: 180 }
    ]
  },
  estoque: {
    valorTotal: 89000,
    itensTotal: 156,
    principais: [
      { item: 'Ração Bovinos', quantidade: 45, valor: 22500 },
      { item: 'Sementes Milho', quantidade: 120, valor: 18000 },
      { item: 'Sementes Soja', quantidade: 80, valor: 16000 },
      { item: 'Defensivos', quantidade: 32, valor: 15500 }
    ],
    alertas: [
      { item: 'Ração Suínos', status: 'baixo', quantidade: 8 },
      { item: 'Calcário', status: 'crítico', quantidade: 2 }
    ]
  }
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '16px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
      gap: '24px'
    },
    section: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    card: {
      background: '#f8fafc',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    },
    cardTitle: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '8px'
    },
    cardValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1e293b'
    },
    chartContainer: {
      height: '300px',
      marginTop: '16px'
    },
    tableContainer: {
      overflowX: 'auto' as const
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const
    },
    tableHeader: {
      background: '#f1f5f9',
      padding: '12px',
      textAlign: 'left' as const,
      fontWeight: 'bold',
      color: '#374151',
      borderBottom: '1px solid #e2e8f0'
    },
    tableCell: {
      padding: '12px',
      borderBottom: '1px solid #e2e8f0',
      color: '#4b5563'
    },
    alertBadge: {
      background: '#fef2f2',
      color: '#dc2626',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    successBadge: {
      background: '#f0fdf4',
      color: '#16a34a',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  };

  if (loading) {
    return (
      <div style={{
        ...styles.container,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={48} style={{ animation: 'spin 2s linear infinite', color: '#3b82f6' }} />
          <p style={{ marginTop: '16px', color: '#64748b' }}>Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard BI - AgroSystem</h1>
        <p style={styles.subtitle}>
          Visão completa da sua operação agrícola • Atualizado em tempo real
        </p>
      </div>

      {/* Grid de Seções */}
      <div style={styles.grid}>
        
        {/* 1. RESUMO GERAL */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <BarChart3 size={24} color="#3b82f6" />
            Resumo Geral
          </h2>
          
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Total de Fazendas</div>
              <div style={styles.cardValue}>{biData.resumo.totalFazendas}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Área Total (ha)</div>
              <div style={styles.cardValue}>{biData.resumo.areaTotal.toLocaleString()}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Área Plantada (ha)</div>
              <div style={styles.cardValue}>{biData.resumo.areaPlantada.toLocaleString()}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Faturamento Mês</div>
              <div style={styles.cardValue}>R$ {(biData.resumo.faturamentoMes / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Custo Mês</div>
              <div style={styles.cardValue}>R$ {(biData.resumo.custoMes / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Lucro Mês</div>
              <div style={styles.cardValue}>R$ {(biData.resumo.lucroMes / 1000).toFixed(0)}k</div>
            </div>
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { mes: 'Jan', faturamento: 420, custo: 145, lucro: 275 },
                { mes: 'Fev', faturamento: 398, custo: 132, lucro: 266 },
                { mes: 'Mar', faturamento: 456, custo: 156, lucro: 300 },
                { mes: 'Abr', faturamento: 485, custo: 127, lucro: 358 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`R$ ${value}k`, '']} />
                <Legend />
                <Line type="monotone" dataKey="faturamento" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="custo" stroke="#ef4444" strokeWidth={3} />
                <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. CULTURA - MILHO */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Wheat size={24} color="#f59e0b" />
            Cultura - Milho
          </h2>
          
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Área Plantada (ha)</div>
              <div style={styles.cardValue}>{biData.milho.areaPlantada}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Produção Est. (ton)</div>
              <div style={styles.cardValue}>{biData.milho.producaoEstimada.toLocaleString()}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Receita Esperada</div>
              <div style={styles.cardValue}>R$ {(biData.milho.receitaEsperada / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Margem Lucro</div>
              <div style={styles.cardValue}>{biData.milho.margemLucro}%</div>
            </div>
          </div>

          <div style={{...styles.cardGrid, gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌱 Plantado</div>
              <div style={styles.cardValue}>{biData.milho.areaPorFase.plantado} ha</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌿 Crescimento</div>
              <div style={styles.cardValue}>{biData.milho.areaPorFase.crescimento} ha</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌾 Colheita</div>
              <div style={styles.cardValue}>{biData.milho.areaPorFase.colheita} ha</div>
            </div>
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={biData.milho.dadosTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="plantio" stackId="1" stroke="#f59e0b" fill="#fbbf24" />
                <Area type="monotone" dataKey="colheita" stackId="2" stroke="#10b981" fill="#34d399" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. CULTURA - SOJA */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Leaf size={24} color="#10b981" />
            Cultura - Soja
          </h2>
          
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Área Plantada (ha)</div>
              <div style={styles.cardValue}>{biData.soja.areaPlantada}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Produção Est. (ton)</div>
              <div style={styles.cardValue}>{biData.soja.producaoEstimada.toLocaleString()}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Receita Esperada</div>
              <div style={styles.cardValue}>R$ {(biData.soja.receitaEsperada / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Margem Lucro</div>
              <div style={styles.cardValue}>{biData.soja.margemLucro}%</div>
            </div>
          </div>

          <div style={{...styles.cardGrid, gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌱 Plantado</div>
              <div style={styles.cardValue}>{biData.soja.areaPorFase.plantado} ha</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌿 Crescimento</div>
              <div style={styles.cardValue}>{biData.soja.areaPorFase.crescimento} ha</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌾 Colheita</div>
              <div style={styles.cardValue}>{biData.soja.areaPorFase.colheita} ha</div>
            </div>
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={biData.soja.dadosTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="plantio" fill="#10b981" />
                <Bar dataKey="colheita" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. VENDAS, ADUBO E ESTOQUE */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Package size={24} color="#8b5cf6" />
            Vendas, Adubo & Estoque
          </h2>
          
          {/* Vendas */}
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>💰 Vendas Mês</div>
              <div style={styles.cardValue}>R$ {(biData.vendas.totalMes / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🎯 Meta Mês</div>
              <div style={styles.cardValue}>R$ {(biData.vendas.metaMes / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>📈 Crescimento</div>
              <div style={styles.cardValue}>+{biData.vendas.crescimentoMensal}%</div>
            </div>
          </div>

          {/* Tabela Principais Compradores */}
          <div style={styles.tableContainer}>
            <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>Principais Compradores</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Comprador</th>
                  <th style={styles.tableHeader}>Valor</th>
                  <th style={styles.tableHeader}>Participação</th>
                </tr>
              </thead>
              <tbody>
                {biData.vendas.principaisCompradores.map((comprador, index) => (
                  <tr key={index}>
                    <td style={styles.tableCell}>{comprador.nome}</td>
                    <td style={styles.tableCell}>R$ {(comprador.valor / 1000).toFixed(0)}k</td>
                    <td style={styles.tableCell}>{comprador.participacao}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gráfico Vendas por Cultura */}
          <div style={styles.chartContainer}>
            <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>Vendas por Cultura</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={biData.vendas.vendaPorCultura}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                  nameKey="cultura"
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip formatter={(value: number) => [`R$ ${(value / 1000).toFixed(0)}k`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Alertas de Estoque */}
          <div style={{marginTop: '24px'}}>
            <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>Alertas de Estoque</h3>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              {biData.estoque.alertas.map((alerta, index) => (
                <div key={index} style={alerta.status === 'crítico' ? styles.alertBadge : styles.successBadge}>
                  {alerta.item}: {alerta.quantidade} unidades ({alerta.status})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
