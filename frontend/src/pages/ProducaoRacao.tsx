/**
 * Página de Produção de Ração - Sistema Agropecuário
 * Gestão e controle da produção de ração animal
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Factory, 
  TrendingUp, 
  Package, 
  DollarSign,
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';

interface ProducaoRacao {
  id: string;
  data: string;
  tipo: string;
  quantidade: number; // em kg
  milhoUtilizado: number; // em kg
  custoProducao: number; // em R$
  valorVenda: number; // em R$
  status: 'planejada' | 'em_producao' | 'concluida' | 'vendida';
  fazenda: string;
  observacoes?: string;
}

interface EstoqueInsumo {
  id: string;
  nome: string;
  categoria: 'cereais' | 'minerais' | 'vitaminas' | 'outros';
  quantidade: number;
  unidade: string;
  custoKg: number;
}

const ProducaoRacao: React.FC = () => {
  const { isDark } = useTheme();
  const [producoes, setProducoes] = useState<ProducaoRacao[]>([]);
  const [estoqueInsumos, setEstoqueInsumos] = useState<EstoqueInsumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProducao, setEditingProducao] = useState<ProducaoRacao | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    tipo: '',
    quantidade: '',
    milhoUtilizado: '',
    custoProducao: '',
    valorVenda: '',
    fazenda: '',
    observacoes: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Dados simulados - em produção viria da API
      const producoesSimuladas: ProducaoRacao[] = [
        {
          id: '1',
          data: '2025-07-10',
          tipo: 'Ração Suína Premium',
          quantidade: 1000,
          milhoUtilizado: 600,
          custoProducao: 2800,
          valorVenda: 3500,
          status: 'concluida',
          fazenda: 'Fazenda São João',
          observacoes: 'Produção com alto teor proteico'
        },
        {
          id: '2',
          data: '2025-07-12',
          tipo: 'Ração Bovina Engorda',
          quantidade: 2000,
          milhoUtilizado: 1200,
          custoProducao: 5200,
          valorVenda: 6800,
          status: 'em_producao',
          fazenda: 'Fazenda Três Corações'
        },
        {
          id: '3',
          data: '2025-07-15',
          tipo: 'Ração Avícola Crescimento',
          quantidade: 500,
          milhoUtilizado: 350,
          custoProducao: 1800,
          valorVenda: 2200,
          status: 'planejada',
          fazenda: 'Fazenda Boa Vista'
        }
      ];

      const insumosSimulados: EstoqueInsumo[] = [
        { id: '1', nome: 'Milho', categoria: 'cereais', quantidade: 5000, unidade: 'kg', custoKg: 0.85 },
        { id: '2', nome: 'Soja Farelo', categoria: 'cereais', quantidade: 2000, unidade: 'kg', custoKg: 1.20 },
        { id: '3', nome: 'Sal Mineral', categoria: 'minerais', quantidade: 500, unidade: 'kg', custoKg: 3.50 },
        { id: '4', nome: 'Vitamina C', categoria: 'vitaminas', quantidade: 100, unidade: 'kg', custoKg: 45.00 }
      ];

      setProducoes(producoesSimuladas);
      setEstoqueInsumos(insumosSimulados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas
  const calcularMetricas = () => {
    const totalProducao = producoes.reduce((acc, p) => acc + p.quantidade, 0);
    const totalCusto = producoes.reduce((acc, p) => acc + p.custoProducao, 0);
    const totalReceita = producoes.reduce((acc, p) => acc + p.valorVenda, 0);
    const margem = totalCusto > 0 ? ((totalReceita - totalCusto) / totalCusto * 100) : 0;
    const milhoTotal = producoes.reduce((acc, p) => acc + p.milhoUtilizado, 0);

    return {
      totalProducao,
      totalCusto,
      totalReceita,
      margem,
      milhoTotal,
      producoesConcluidas: producoes.filter(p => p.status === 'concluida').length,
      producoesAndamento: producoes.filter(p => p.status === 'em_producao').length
    };
  };

  const metricas = calcularMetricas();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejada': return '#FCD34D';
      case 'em_producao': return '#60A5FA';
      case 'concluida': return '#34D399';
      case 'vendida': return '#22c55e';
      default: return '#9CA3AF';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planejada': return 'Planejada';
      case 'em_producao': return 'Em Produção';
      case 'concluida': return 'Concluída';
      case 'vendida': return 'Vendida';
      default: return status;
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' 
        : '#F2F2F2',
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '32px',
      textAlign: 'center' as const
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#005F73',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '16px',
      color: isDark ? '#9ca3af' : '#4F4F4F',
      marginBottom: '24px'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    metricCard: {
      background: isDark ? '#1f2937' : '#FFFFFF',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`
    },
    metricTitle: {
      fontSize: '14px',
      color: isDark ? '#9ca3af' : '#4F4F4F',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    metricValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#005F73'
    },
    section: {
      background: isDark ? '#1f2937' : '#FFFFFF',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#005F73',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#005F73',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      fontWeight: '500'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const
    },
    tableHeader: {
      background: isDark ? '#374151' : '#f8fafc',
      padding: '12px',
      textAlign: 'left' as const,
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#005F73',
      borderBottom: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`
    },
    tableCell: {
      padding: '12px',
      borderBottom: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
      color: isDark ? '#d1d5db' : '#4F4F4F'
    },
    statusBadge: (status: string) => ({
      padding: '4px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'white',
      backgroundColor: getStatusColor(status)
    })
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <Factory size={48} style={{ 
              animation: 'spin 2s linear infinite', 
              color: '#005F73',
              marginBottom: '16px'
            }} />
            <p style={{ color: isDark ? '#9ca3af' : '#4F4F4F' }}>
              Carregando dados de produção...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Factory size={36} color="#005F73" />
          Produção de Ração
        </h1>
        <p style={styles.subtitle}>
          Controle e gestão da produção de ração animal
        </p>
      </div>

      {/* Métricas */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>
            <Scale size={16} />
            Produção Total (kg)
          </div>
          <div style={styles.metricValue}>
            {metricas.totalProducao.toLocaleString()}
          </div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>
            <DollarSign size={16} />
            Receita Total
          </div>
          <div style={styles.metricValue}>
            R$ {metricas.totalReceita.toLocaleString()}
          </div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>
            <TrendingUp size={16} />
            Margem de Lucro
          </div>
          <div style={styles.metricValue}>
            {metricas.margem.toFixed(1)}%
          </div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>
            <Package size={16} />
            Milho Utilizado (kg)
          </div>
          <div style={styles.metricValue}>
            {metricas.milhoTotal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Lista de Produções */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <BarChart3 size={20} />
            Histórico de Produções
          </h2>
          <button 
            style={styles.button}
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} />
            Nova Produção
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Data</th>
                <th style={styles.tableHeader}>Tipo de Ração</th>
                <th style={styles.tableHeader}>Quantidade (kg)</th>
                <th style={styles.tableHeader}>Milho (kg)</th>
                <th style={styles.tableHeader}>Custo</th>
                <th style={styles.tableHeader}>Valor Venda</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Fazenda</th>
                <th style={styles.tableHeader}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {producoes.map((producao) => (
                <tr key={producao.id}>
                  <td style={styles.tableCell}>
                    {new Date(producao.data).toLocaleDateString()}
                  </td>
                  <td style={styles.tableCell}>{producao.tipo}</td>
                  <td style={styles.tableCell}>
                    {producao.quantidade.toLocaleString()}
                  </td>
                  <td style={styles.tableCell}>
                    {producao.milhoUtilizado.toLocaleString()}
                  </td>
                  <td style={styles.tableCell}>
                    R$ {producao.custoProducao.toLocaleString()}
                  </td>
                  <td style={styles.tableCell}>
                    R$ {producao.valorVenda.toLocaleString()}
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.statusBadge(producao.status)}>
                      {getStatusLabel(producao.status)}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{producao.fazenda}</td>
                  <td style={styles.tableCell}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#60A5FA',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setEditingProducao(producao)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#EF4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Estoque de Insumos */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <Package size={20} />
            Estoque de Insumos
          </h2>
        </div>

        <div style={styles.metricsGrid}>
          {estoqueInsumos.map((insumo) => (
            <div key={insumo.id} style={styles.metricCard}>
              <div style={styles.metricTitle}>
                {insumo.nome} ({insumo.categoria})
              </div>
              <div style={styles.metricValue}>
                {insumo.quantidade.toLocaleString()} {insumo.unidade}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: isDark ? '#9ca3af' : '#4F4F4F',
                marginTop: '4px'
              }}>
                R$ {insumo.custoKg.toFixed(2)}/{insumo.unidade}
              </div>
              {insumo.quantidade < 200 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '8px',
                  color: '#EF4444',
                  fontSize: '12px'
                }}>
                  <AlertTriangle size={14} />
                  Estoque baixo
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Animação de loading */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ProducaoRacao;
