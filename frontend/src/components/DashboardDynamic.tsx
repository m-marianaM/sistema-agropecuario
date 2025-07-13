/**
 * Dashboard BI Dinâmico - Sistema Agropecuário
 * Atualiza automaticamente com dados reais das fazendas
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
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
  Download,
  Settings,
  Users
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

// Interfaces para dados dinâmicos
interface Fazenda {
  id: number;
  nome: string;
  area: number;
  status: string;
  cultivos: string[];
  endereco: { cidade: string; estado: string; cep: string; rua?: string };
  proprietario: string;
  dataAquisicao: string;
  valorCompra: number;
  producaoAnual: number;
  custoOperacional: number;
  funcionarios: any[];
  telefone?: string;
  email?: string;
  realizaRacao?: boolean;
  realizaNutricao?: boolean;
}

interface Cultivo {
  id: number;
  fazendaId: number;
  cultura: string;
  area: number;
  dataPlantio: string;
  dataColheita?: string;
  status: 'plantado' | 'crescimento' | 'colhido' | 'perdido';
  producaoEstimada: number;
  producaoReal?: number;
  custoTotal: number;
}

interface Adubo {
  id: number;
  fazendaId: number;
  tipo: string;
  quantidade: number;
  area: number;
  custo: number;
  dataAplicacao: string;
}

interface Venda {
  id: number;
  fazendaId: number;
  produto: string;
  quantidade: number;
  valor: number;
  comprador: string;
  dataVenda: string;
  status: 'pendente' | 'confirmada' | 'entregue';
}

interface Estoque {
  id: number;
  fazendaId: number;
  item: string;
  categoria: 'ração' | 'fertilizante' | 'sementes' | 'defensivo';
  quantidade: number;
  valor: number;
  dataEntrada: string;
}

interface DashboardProps {
  fazendas?: Fazenda[];
  cultivos?: Cultivo[];
  adubos?: Adubo[];
  vendas?: Venda[];
  estoque?: Estoque[];
}

// Função para calcular dados dinâmicos do BI
const calcularDadosBI = (
  fazendas: Fazenda[] = [],
  cultivos: Cultivo[] = [],
  adubos: Adubo[] = [],
  vendas: Venda[] = [],
  estoque: Estoque[] = []
) => {
  // Data atual para filtros de mês
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth();
  const anoAtual = dataAtual.getFullYear();

  // Calcular resumo geral
  const totalFazendas = fazendas.length;
  const areaTotal = fazendas.reduce((total, fazenda) => total + fazenda.area, 0);
  const areaPlantada = cultivos.reduce((total, cultivo) => total + cultivo.area, 0);
  const fazendasAtivas = fazendas.filter(f => f.status === 'ativa').length;
  const totalFuncionarios = fazendas.reduce((total, fazenda) => total + fazenda.funcionarios.length, 0);

  // Calcular vendas do mês
  const vendasMes = vendas.filter(venda => {
    const dataVenda = new Date(venda.dataVenda);
    return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
  });
  const faturamentoMes = vendasMes.reduce((total, venda) => total + venda.valor, 0);

  // Calcular custos do mês (adubo + operacional)
  const adubosmes = adubos.filter(adubo => {
    const dataAplicacao = new Date(adubo.dataAplicacao);
    return dataAplicacao.getMonth() === mesAtual && dataAplicacao.getFullYear() === anoAtual;
  });
  const custoAduboMes = adubosmes.reduce((total, adubo) => total + adubo.custo, 0);
  const custoOperacionalMes = fazendas.reduce((total, fazenda) => total + fazenda.custoOperacional / 12, 0);
  const custoMes = custoAduboMes + custoOperacionalMes;
  const lucroMes = faturamentoMes - custoMes;

  // Calcular produtividade média
  const cultivosComProducao = cultivos.filter(c => c.producaoReal && c.producaoReal > 0);
  const produtividade = cultivosComProducao.length > 0 
    ? cultivosComProducao.reduce((total, cultivo) => 
        total + ((cultivo.producaoReal || 0) / cultivo.producaoEstimada * 100), 0) / cultivosComProducao.length
    : 0;

  // Alertas (estoque baixo, cultivos atrasados, etc.)
  const estoqueAlerta = estoque.filter(item => item.quantidade < 10).length;
  const cultivosAtrasados = cultivos.filter(cultivo => {
    if (!cultivo.dataColheita) return false;
    const dataColheita = new Date(cultivo.dataColheita);
    return dataColheita < dataAtual && cultivo.status !== 'colhido';
  }).length;
  const alertas = estoqueAlerta + cultivosAtrasados;

  // Dados por cultura
  const cultivosPorTipo = cultivos.reduce((acc, cultivo) => {
    if (!acc[cultivo.cultura]) {
      acc[cultivo.cultura] = {
        areaPlantada: 0,
        areaPorFase: { plantado: 0, crescimento: 0, colheita: 0, colhido: 0 },
        producaoEstimada: 0,
        producaoRealizada: 0,
        custoTotal: 0
      };
    }
    
    acc[cultivo.cultura].areaPlantada += cultivo.area;
    acc[cultivo.cultura].areaPorFase[cultivo.status] += cultivo.area;
    acc[cultivo.cultura].producaoEstimada += cultivo.producaoEstimada;
    acc[cultivo.cultura].producaoRealizada += cultivo.producaoReal || 0;
    acc[cultivo.cultura].custoTotal += cultivo.custoTotal;
    
    return acc;
  }, {} as any);

  // Vendas por comprador
  const vendedoresAgrupados = vendasMes.reduce((acc, venda) => {
    if (!acc[venda.comprador]) {
      acc[venda.comprador] = { valor: 0, participacao: 0 };
    }
    acc[venda.comprador].valor += venda.valor;
    return acc;
  }, {} as any);

  const principaisCompradores = Object.entries(vendedoresAgrupados)
    .map(([nome, dados]: [string, any]) => ({
      nome,
      valor: dados.valor,
      participacao: faturamentoMes > 0 ? (dados.valor / faturamentoMes * 100) : 0
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 4);

  // Vendas por cultura
  const vendaPorCultura = Object.entries(
    vendasMes.reduce((acc, venda) => {
      if (!acc[venda.produto]) {
        acc[venda.produto] = { valor: 0, quantidade: 0 };
      }
      acc[venda.produto].valor += venda.valor;
      acc[venda.produto].quantidade += venda.quantidade;
      return acc;
    }, {} as any)
  ).map(([cultura, dados]: [string, any]) => ({
    cultura,
    valor: dados.valor,
    toneladas: dados.quantidade
  }));

  // Principais tipos de adubo
  const adubosPorTipo = adubosmes.reduce((acc, adubo) => {
    if (!acc[adubo.tipo]) {
      acc[adubo.tipo] = { gasto: 0, area: 0 };
    }
    acc[adubo.tipo].gasto += adubo.custo;
    acc[adubo.tipo].area += adubo.area;
    return acc;
  }, {} as any);

  const principaisAdubos = Object.entries(adubosPorTipo)
    .map(([tipo, dados]: [string, any]) => ({
      tipo,
      gasto: dados.gasto,
      area: dados.area
    }))
    .sort((a, b) => b.gasto - a.gasto)
    .slice(0, 4);

  // Dados de ração (se alguma fazenda produz ração)
  const fazendasComRacao = fazendas.filter(f => f.realizaRacao);
  const producaoRacao = fazendasComRacao.length * 15; // Estimativa baseada no número de fazendas
  const valorRacao = producaoRacao * 630; // Preço médio por tonelada

  // Principais itens do estoque
  const principaisEstoque = estoque
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 4)
    .map(item => ({
      item: item.item,
      quantidade: item.quantidade,
      valor: item.valor
    }));

  // Alertas de estoque
  const alertasEstoque = estoque
    .filter(item => item.quantidade < 10)
    .map(item => ({
      item: item.item,
      status: item.quantidade < 5 ? 'crítico' : 'baixo',
      quantidade: item.quantidade
    }));

  return {
    resumo: {
      totalFazendas,
      areaTotal,
      areaPlantada,
      fazendasAtivas,
      totalFuncionarios,
      faturamentoMes,
      custoMes,
      lucroMes,
      produtividade,
      alertas
    },
    cultivos: cultivosPorTipo,
    vendas: {
      totalMes: faturamentoMes,
      metaMes: faturamentoMes * 0.9, // Meta é 90% do realizado
      crescimentoMensal: 12.3, // Seria calculado comparando com mês anterior
      principaisCompradores,
      vendaPorCultura
    },
    adubo: {
      gastosTotal: custoAduboMes,
      aplicacoesMes: adubosmes.length,
      principais: principaisAdubos
    },
    racao: {
      producaoMensal: producaoRacao,
      valorVenda: valorRacao,
      fazendas: fazendasComRacao.length
    },
    estoque: {
      valorTotal: estoque.reduce((total, item) => total + item.valor, 0),
      itensTotal: estoque.length,
      principais: principaisEstoque,
      alertas: alertasEstoque
    }
  };
};

const DashboardDynamic: React.FC<DashboardProps> = ({ 
  fazendas = [], 
  cultivos = [], 
  adubos = [], 
  vendas = [], 
  estoque = [] 
}) => {
  const { isDark } = useTheme();
  const [filtroTempo, setFiltroTempo] = useState('mes');
  const [culturaFiltro, setCulturaFiltro] = useState('todas');

  // Calcular dados dinâmicos do BI
  const biData = calcularDadosBI(fazendas, cultivos, adubos, vendas, estoque);

  // Cores para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const styles = {
    container: {
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' 
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      flexWrap: 'wrap' as const,
      gap: '16px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#111827',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: isDark ? '#9ca3af' : '#64748b'
    },
    controls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    select: {
      background: isDark ? '#374151' : 'white',
      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '14px',
      color: isDark ? '#f9fafb' : '#111827',
      outline: 'none'
    },
    button: {
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    metricCard: {
      background: isDark ? '#1f2937' : 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
      transition: 'transform 0.2s ease',
      cursor: 'pointer'
    },
    metricHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    metricTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: isDark ? '#9ca3af' : '#64748b'
    },
    metricValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#111827',
      marginBottom: '8px'
    },
    metricChange: {
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    chartCard: {
      background: isDark ? '#1f2937' : 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#111827',
      marginBottom: '20px'
    },
    alertsSection: {
      background: isDark ? '#1f2937' : 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`
    },
    alertItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    alertCritico: {
      background: isDark ? '#7f1d1d' : '#fef2f2',
      border: `1px solid ${isDark ? '#dc2626' : '#fecaca'}`
    },
    alertBaixo: {
      background: isDark ? '#7c2d12' : '#fff7ed',
      border: `1px solid ${isDark ? '#ea580c' : '#fed7aa'}`
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard BI - AgroSystem</h1>
          <p style={styles.subtitle}>
            Dados atualizados em tempo real • {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div style={styles.controls}>
          <select
            style={styles.select}
            value={filtroTempo}
            onChange={(e) => setFiltroTempo(e.target.value)}
          >
            <option value="mes">Este mês</option>
            <option value="trimestre">Trimestre</option>
            <option value="ano">Ano</option>
          </select>
          <button style={styles.button}>
            <RefreshCw size={16} />
            Atualizar
          </button>
          <button style={styles.button}>
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricTitle}>Total de Fazendas</span>
            <MapPin size={20} color="#3b82f6" />
          </div>
          <div style={styles.metricValue}>{biData.resumo.totalFazendas}</div>
          <div style={{...styles.metricChange, color: '#10b981'}}>
            <TrendingUp size={16} />
            {biData.resumo.fazendasAtivas} ativas
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricTitle}>Área Total</span>
            <Sprout size={20} color="#10b981" />
          </div>
          <div style={styles.metricValue}>{biData.resumo.areaTotal.toLocaleString()} ha</div>
          <div style={{...styles.metricChange, color: '#10b981'}}>
            <TrendingUp size={16} />
            {biData.resumo.areaPlantada.toLocaleString()} ha plantados
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricTitle}>Faturamento Mensal</span>
            <DollarSign size={20} color="#f59e0b" />
          </div>
          <div style={styles.metricValue}>R$ {(biData.resumo.faturamentoMes / 1000).toFixed(0)}k</div>
          <div style={{...styles.metricChange, color: biData.resumo.lucroMes > 0 ? '#10b981' : '#ef4444'}}>
            <TrendingUp size={16} />
            Lucro: R$ {(biData.resumo.lucroMes / 1000).toFixed(0)}k
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricTitle}>Funcionários</span>
            <Users size={20} color="#8b5cf6" />
          </div>
          <div style={styles.metricValue}>{biData.resumo.totalFuncionarios}</div>
          <div style={{...styles.metricChange, color: '#10b981'}}>
            <CheckCircle size={16} />
            Distribuídos nas fazendas
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricTitle}>Produtividade</span>
            <Activity size={20} color="#06b6d4" />
          </div>
          <div style={styles.metricValue}>{biData.resumo.produtividade.toFixed(1)}%</div>
          <div style={{...styles.metricChange, color: biData.resumo.produtividade > 80 ? '#10b981' : '#f59e0b'}}>
            <BarChart3 size={16} />
            Eficiência geral
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricTitle}>Alertas</span>
            <AlertCircle size={20} color="#ef4444" />
          </div>
          <div style={styles.metricValue}>{biData.resumo.alertas}</div>
          <div style={{...styles.metricChange, color: biData.resumo.alertas > 0 ? '#ef4444' : '#10b981'}}>
            {biData.resumo.alertas > 0 ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {biData.resumo.alertas > 0 ? 'Requer atenção' : 'Tudo ok'}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={styles.chartsGrid}>
        {/* Vendas por Comprador */}
        {biData.vendas.principaisCompradores.length > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Principais Compradores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={biData.vendas.principaisCompradores}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                  label={({nome, participacao}) => `${nome}: ${participacao.toFixed(1)}%`}
                >
                  {biData.vendas.principaisCompradores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`R$ ${(value / 1000).toFixed(0)}k`, 'Valor']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Vendas por Cultura */}
        {biData.vendas.vendaPorCultura.length > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Vendas por Cultura</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={biData.vendas.vendaPorCultura}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cultura" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'valor' ? `R$ ${(value / 1000).toFixed(0)}k` : `${value} ton`,
                    name === 'valor' ? 'Valor' : 'Quantidade'
                  ]}
                />
                <Bar dataKey="valor" fill="#3b82f6" />
                <Bar dataKey="toneladas" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Seção de Alertas */}
      {biData.estoque.alertas.length > 0 && (
        <div style={styles.alertsSection}>
          <h3 style={styles.chartTitle}>Alertas de Estoque</h3>
          {biData.estoque.alertas.map((alerta, index) => (
            <div 
              key={index}
              style={{
                ...styles.alertItem,
                ...(alerta.status === 'crítico' ? styles.alertCritico : styles.alertBaixo)
              }}
            >
              <AlertCircle size={16} color={alerta.status === 'crítico' ? '#dc2626' : '#ea580c'} />
              <div>
                <strong>{alerta.item}</strong> - Estoque {alerta.status}
                <br />
                <span style={{fontSize: '14px', opacity: 0.8}}>
                  Quantidade atual: {alerta.quantidade} unidades
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informações Adicionais */}
      <div style={styles.chartsGrid}>
        {/* Informações de Ração */}
        {biData.racao.fazendas > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Produção de Ração</h3>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px'}}>
                {biData.racao.producaoMensal} ton/mês
              </div>
              <div style={{fontSize: '16px', color: isDark ? '#9ca3af' : '#64748b', marginBottom: '16px'}}>
                {biData.racao.fazendas} fazenda(s) produzindo ração
              </div>
              <div style={{fontSize: '18px', fontWeight: 'bold', color: '#3b82f6'}}>
                Valor: R$ {(biData.racao.valorVenda / 1000).toFixed(0)}k/mês
              </div>
            </div>
          </div>
        )}

        {/* Resumo de Estoque */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Resumo do Estoque</h3>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px'}}>
              R$ {(biData.estoque.valorTotal / 1000).toFixed(0)}k
            </div>
            <div style={{fontSize: '16px', color: isDark ? '#9ca3af' : '#64748b', marginBottom: '16px'}}>
              {biData.estoque.itensTotal} itens em estoque
            </div>
            {biData.estoque.principais.slice(0, 3).map((item, index) => (
              <div key={index} style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0',
                borderBottom: index < 2 ? `1px solid ${isDark ? '#374151' : '#e2e8f0'}` : 'none'
              }}>
                <span>{item.item}</span>
                <span style={{fontWeight: 'bold'}}>R$ {(item.valor / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDynamic;
