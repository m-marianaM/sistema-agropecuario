/**
 * Dashboard BI - Sistema Agropecuário
 * Dashboard estilo Business Intelligence para gestão completa de fazendas
 * Estrutura: 4 seções principais com analytics avançados
 */

import React, { useState, useEffect } from 'react';
import { useFazendas } from '../context/FazendasContext';
import { 
  TrendingUp, 
  Sprout, 
  DollarSign, 
  Package, 
  MapPin,
  Calendar,
  Users,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Wheat,
  Leaf,
  ShoppingCart,
  Factory,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

// Dados BI para gestão agropecuária (em produção, virão da API)
const biData = {
  // 📊 SEÇÃO 1: Resumo Geral
  resumoGeral: {
    totalFazendas: 8,
    areaTotal: 1850.5,
    receitaTotal: 2450000,
    lucroMensal: 185000,
    crescimentoAnual: 18.5,
    cultivosAtivos: 24,
    produtividade: 92.3, // percentual
    eficienciaOperacional: 87.8
  },

  // 🌽 SEÇÃO 2: Cultura - Milho
  milho: {
    areaPlantada: 680.2,
    producaoEstimada: 4082, // toneladas
    producaoReal: 3890,
    custoProducao: 485000,
    receitaEstimada: 735000,
    margem: 51.5, // percentual
    faseCrescimento: {
      plantado: 15,
      crescimento: 45,
      florescimento: 25,
      maturacao: 15
    },
    precoMedio: 189.0, // por tonelada
    qualidade: 94.2,
    dadosClimaticos: {
      chuva: 145, // mm
      temperatura: 28.5,
      umidade: 72
    }
  },

  // 🌱 SEÇÃO 3: Cultura - Soja
  soja: {
    areaPlantada: 920.8,
    producaoEstimada: 2762,
    producaoReal: 2945,
    custoProducao: 658000,
    receitaEstimada: 1180000,
    margem: 44.2,
    faseCrescimento: {
      plantado: 5,
      crescimento: 35,
      florescimento: 40,
      maturacao: 20
    },
    precoMedio: 401.0,
    qualidade: 96.8,
    dadosClimaticos: {
      chuva: 128,
      temperatura: 26.8,
      umidade: 68
    }
  },

  // 💰 SEÇÃO 4: Vendas, Adubo e Estoque
  vendas: {
    vendasMes: 425000,
    metaMensal: 380000,
    crescimentoVendas: 11.8,
    principais: [
      { produto: 'Soja Premium', quantidade: 850, valor: 341850 },
      { produto: 'Milho Grão', quantidade: 1200, valor: 226800 },
      { produto: 'Farelo Soja', quantidade: 650, valor: 97500 }
    ]
  },
  adubo: {
    estoqueTotal: 245.8, // toneladas
    valorEstoque: 128500,
    consumoMensal: 45.2,
    proximaCompra: '2024-08-15',
    tipos: [
      { nome: 'NPK 20-05-20', estoque: 89.5, status: 'adequado' },
      { nome: 'Ureia', estoque: 156.3, status: 'alto' },
      { nome: 'Superfosfato', estoque: 12.8, status: 'baixo' }
    ]
  },
  estoque: {
    valorTotal: 385000,
    itensTotal: 156,
    rotatividade: 8.2, // vezes por ano
    alertas: 8,
    categorias: [
      { nome: 'Fertilizantes', valor: 128500, percentual: 33.4 },
      { nome: 'Sementes', valor: 95000, percentual: 24.7 },
      { nome: 'Defensivos', valor: 85000, percentual: 22.1 },
      { nome: 'Equipamentos', valor: 76500, percentual: 19.8 }
    ]
  }
};

const DashboardBI: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const { fazendas, cultivos, loading, recarregarFazendas, recarregarCultivos } = useFazendas();

  // Função para atualizar dados
  const handleAtualizarDados = async () => {
    await Promise.all([recarregarFazendas(), recarregarCultivos()]);
  };

  // Recarregar dados quando o componente for montado
  useEffect(() => {
    handleAtualizarDados();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calcular dados dinâmicos baseados nos dados reais
  const calculateDashboardData = () => {
    const totalFazendas = fazendas.length;
    const areaTotal = fazendas.reduce((total, fazenda) => total + fazenda.area, 0);
    const cultivosAtivos = cultivos.length;
    
    // Separar cultivos por tipo
    const cultivosMilho = cultivos.filter(c => c.cultura === 'Milho' || c.tipoCultivo?.includes('Milho'));
    const cultivosSoja = cultivos.filter(c => c.cultura === 'Soja' || c.tipoCultivo?.includes('Soja'));
    
    const areaMilho = cultivosMilho.reduce((total, c) => total + c.areaHectares, 0);
    const areaSoja = cultivosSoja.reduce((total, c) => total + c.areaHectares, 0);
    
    const produtividadeMilho = cultivosMilho.reduce((total, c) => total + c.produtividadeEsperada, 0);
    const produtividadeSoja = cultivosSoja.reduce((total, c) => total + c.produtividadeEsperada, 0);

    return {
      totalFazendas,
      areaTotal,
      cultivosAtivos,
      areaMilho,
      areaSoja,
      produtividadeMilho,
      produtividadeSoja,
      receitaTotal: areaTotal * 1200, // Estimativa baseada na área
      cultivosMilho: cultivosMilho.length,
      cultivosSoja: cultivosSoja.length
    };
  };

  const dashboardData = calculateDashboardData();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Carregando dados agropecuários...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 lg:p-6">
      {/* 🎯 HEADER BI - Controles e Filtros */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard Agropecuário BI
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Análise completa da produção • Última atualização: {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
          
          {/* Controles do Dashboard */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="semanal">Visão Semanal</option>
              <option value="mensal">Visão Mensal</option>
              <option value="trimestral">Visão Trimestral</option>
              <option value="anual">Visão Anual</option>
            </select>
            
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="todas">Todas as Fazendas</option>
              {fazendas.map(fazenda => (
                <option key={fazenda.id} value={fazenda.id}>{fazenda.nome}</option>
              ))}
            </select>
            
            <button 
              onClick={handleAtualizarDados}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </button>
            
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* 🧱 GRID PRINCIPAL - 4 SEÇÕES BI */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        
        {/* 📊 SEÇÃO 1: RESUMO GERAL */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
                Resumo Geral
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Visão consolidada das operações</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Produtividade</div>
              <div className="text-2xl font-bold text-green-600">92.3%</div>
            </div>
          </div>

          {/* KPIs Principais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Fazendas</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{dashboardData.totalFazendas}</p>
                </div>
                <MapPin className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Área Total</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{dashboardData.areaTotal.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ha</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Receita</p>
                  <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">R$ {(dashboardData.receitaTotal / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Cultivos</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{dashboardData.cultivosAtivos}</p>
                </div>
                <Sprout className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Métricas de Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Performance Operacional
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Eficiência</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${biData.resumoGeral.eficienciaOperacional}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{biData.resumoGeral.eficienciaOperacional}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Crescimento Anual</span>
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{biData.resumoGeral.crescimentoAnual}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Lucro Mensal</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">R$ {(biData.resumoGeral.lucroMensal / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Status Atual
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-700 dark:text-green-300">Plantio em dia</span>
                  </div>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">OK</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">Estoque baixo</span>
                  </div>
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">3 itens</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🌽 SEÇÃO 2: CULTURA - MILHO */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Wheat className="w-6 h-6 mr-3 text-yellow-600" />
                Cultura: Milho
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Análise detalhada da produção de milho</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Margem</div>
              <div className="text-2xl font-bold text-yellow-600">{biData.milho.margem}%</div>
            </div>
          </div>

          {/* Métricas do Milho */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Área Plantada</p>
              <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{dashboardData.areaMilho.toFixed(1)} ha</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{((dashboardData.areaMilho / dashboardData.areaTotal) * 100).toFixed(0)}% da área total</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Cultivos</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">{dashboardData.cultivosMilho}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">ativos</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 col-span-2 lg:col-span-1">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Produtividade</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{(dashboardData.produtividadeMilho / 1000).toFixed(1)}t/ha</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">esperada</p>
            </div>
          </div>

          {/* Fases de Crescimento */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Sprout className="w-4 h-4 mr-2" />
              Fases de Crescimento
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(biData.milho.faseCrescimento).map(([fase, percentual]) => (
                <div key={fase} className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{percentual}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{fase.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${percentual * 4}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores Climáticos */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Condições Climáticas</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-blue-600 dark:text-blue-400">Chuva</div>
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{biData.milho.dadosClimaticos.chuva}mm</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-sm text-orange-600 dark:text-orange-400">Temp.</div>
                <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{biData.milho.dadosClimaticos.temperatura}°C</div>
              </div>
              <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <div className="text-sm text-cyan-600 dark:text-cyan-400">Umidade</div>
                <div className="text-lg font-bold text-cyan-700 dark:text-cyan-300">{biData.milho.dadosClimaticos.umidade}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* 🌱 SEÇÃO 3: CULTURA - SOJA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Leaf className="w-6 h-6 mr-3 text-green-600" />
                Cultura: Soja
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Análise detalhada da produção de soja</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Qualidade</div>
              <div className="text-2xl font-bold text-green-600">{biData.soja.qualidade}%</div>
            </div>
          </div>

          {/* Métricas da Soja */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Área Plantada</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">{dashboardData.areaSoja.toFixed(1)} ha</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">{((dashboardData.areaSoja / dashboardData.areaTotal) * 100).toFixed(0)}% da área total</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Cultivos</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{dashboardData.cultivosSoja}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">ativos</p>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-200 dark:border-teal-800 col-span-2 lg:col-span-1">
              <p className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide">Produtividade</p>
              <p className="text-xl font-bold text-teal-700 dark:text-teal-300">{(dashboardData.produtividadeSoja / 1000).toFixed(1)}t/ha</p>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">esperada</p>
            </div>
          </div>

          {/* Comparativo Soja vs Meta */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Performance vs Meta</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Produção Realizada</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(biData.soja.producaoReal / biData.soja.producaoEstimada) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-green-600">+6.6%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Margem de Lucro</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${biData.soja.margem}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{biData.soja.margem}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fases de Crescimento Soja */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Distribuição das Fases
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(biData.soja.faseCrescimento).map(([fase, percentual]) => (
                <div key={fase} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{percentual}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">{fase.replace(/([A-Z])/g, ' $1')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 💰 SEÇÃO 4: VENDAS, ADUBO E ESTOQUE */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <ShoppingCart className="w-6 h-6 mr-3 text-purple-600" />
                Vendas, Adubo & Estoque
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Controle financeiro e operacional completo</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Meta Mensal</div>
              <div className="text-xl font-bold text-purple-600">{((biData.vendas.vendasMes / biData.vendas.metaMensal) * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* Grid interno: 3 sub-seções */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sub-seção: Vendas */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Vendas
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-600 dark:text-purple-400">Vendas do Mês</span>
                  <span className="text-lg font-bold text-purple-700 dark:text-purple-300">R$ {(biData.vendas.vendasMes / 1000).toFixed(0)}k</span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(biData.vendas.vendasMes / biData.vendas.metaMensal) * 100}%` }}></div>
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Meta: R$ {(biData.vendas.metaMensal / 1000).toFixed(0)}k</div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300">Principais Produtos</h4>
                {biData.vendas.principais.slice(0, 3).map((produto, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-purple-600 dark:text-purple-400">{produto.produto}</span>
                    <span className="font-medium text-purple-700 dark:text-purple-300">R$ {(produto.valor / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-seção: Adubo */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-5 rounded-xl border border-orange-200 dark:border-orange-800">
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-4 flex items-center">
                <Factory className="w-5 h-5 mr-2" />
                Fertilizantes
              </h3>
              
              <div className="mb-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{biData.adubo.estoqueTotal}t</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">Estoque Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">R$ {(biData.adubo.valorEstoque / 1000).toFixed(0)}k</div>
                  <div className="text-xs text-orange-500 dark:text-orange-500">Valor do Estoque</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300">Status por Tipo</h4>
                {biData.adubo.tipos.map((tipo, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs text-orange-600 dark:text-orange-400">{tipo.nome}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      tipo.status === 'adequado' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      tipo.status === 'alto' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {tipo.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-seção: Estoque */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Estoque Geral
              </h3>
              
              <div className="mb-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{biData.estoque.itensTotal}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Itens Totais</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">R$ {(biData.estoque.valorTotal / 1000).toFixed(0)}k</div>
                  <div className="text-xs text-blue-500 dark:text-blue-500">Valor Total</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Por Categoria</h4>
                {biData.estoque.categorias.slice(0, 4).map((categoria, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs text-blue-600 dark:text-blue-400">{categoria.nome}</span>
                    <div className="text-right">
                      <div className="text-xs font-medium text-blue-700 dark:text-blue-300">{categoria.percentual}%</div>
                      <div className="w-16 bg-blue-200 dark:bg-blue-800 rounded-full h-1">
                        <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${categoria.percentual}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {biData.estoque.alertas > 0 && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <div className="flex items-center text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {biData.estoque.alertas} alertas de estoque
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rodapé da Seção 4: Resumo Executivo */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">+{biData.vendas.crescimentoVendas}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Crescimento Vendas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{biData.adubo.consumoMensal}t</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Consumo Mensal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{biData.estoque.rotatividade}x</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Rotatividade/Ano</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{((biData.vendas.vendasMes / biData.vendas.metaMensal) * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Meta Alcançada</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 RODAPÉ: Quick Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg">
          <Eye className="w-5 h-5 mr-2" />
          Relatório Completo
        </button>
        <button className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg">
          <Calendar className="w-5 h-5 mr-2" />
          Programar Plantio
        </button>
        <button className="flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg">
          <Package className="w-5 h-5 mr-2" />
          Gerenciar Estoque
        </button>
        <button className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg">
          <DollarSign className="w-5 h-5 mr-2" />
          Registrar Venda
        </button>
      </div>
    </div>
  );
};

export default DashboardBI;
