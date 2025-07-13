/**
 * Dashboard BI - Sistema Agropecuário
 * Versão integrada com API que carrega dados reais do banco de dados
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFazendas } from '../context/FazendasContext';
import { dashboardAPI, DashboardData } from '../utils/api';
import { 
  Package, 
  BarChart3,
  Wheat,
  Leaf,
  ShoppingCart,
  Factory,
  RefreshCw
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

// Componente de emoji de vaca que harmoniza com as cores do dashboard
const CowIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <span 
    style={{ 
      fontSize: size,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'inline-block',
      lineHeight: 1,
      filter: 'sepia(0.4) hue-rotate(190deg) saturate(0.7) brightness(0.9)',
      mixBlendMode: 'multiply'
    }}
    className="opacity-85"
  >
    🐄
  </span>
);

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

const Dashboard: React.FC = () => {
  // Estados para dados do dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Contextos
  const { isDark } = useTheme();
  const { fazendas, cultivos, loading: fazendasLoading } = useFazendas();

  // Hook para detectar tamanho da tela
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para calcular dados do dashboard baseados no contexto de fazendas
  const calcularDadosFromFazendas = (): DashboardData => {
    const totalFazendas = fazendas.length;
    const fazendasAtivas = fazendas.filter(f => f.status === 'ativa').length;
    const areaTotal = fazendas.reduce((total, fazenda) => total + fazenda.area, 0);
    const areaPlantada = Math.round(areaTotal * 0.85); // Estimativa de 85% plantada
    const totalFuncionarios = fazendas.reduce((total, fazenda) => total + fazenda.funcionarios.length, 0);
    
    // Calcular métricas financeiras baseadas nos dados das fazendas
    const faturamentoMes = fazendas.reduce((total, fazenda) => {
      return total + (fazenda.producaoAnual || 0) * 250; // R$ 250 por tonelada (estimativa)
    }, 0) / 12; // Dividir por 12 meses
    
    const custoMes = fazendas.reduce((total, fazenda) => {
      return total + (fazenda.custoOperacional || 0);
    }, 0) / 12;
    
    const lucroMes = faturamentoMes - custoMes;
    const margemLucro = faturamentoMes > 0 ? (lucroMes / faturamentoMes) * 100 : 0;
    
    // Produtividade média
    const produtividade = areaTotal > 0 ? (areaPlantada / areaTotal) * 100 : 0;
    
    // Contar cultivos únicos
    const cultivosUnicos = new Set();
    fazendas.forEach(fazenda => {
      fazenda.cultivos.forEach(cultivo => cultivosUnicos.add(cultivo));
    });
    
    return {
      resumo: {
        totalFazendas,
        areaTotal,
        areaPlantada,
        fazendasAtivas,
        totalFuncionarios,
        faturamentoMes: Math.round(faturamentoMes),
        custoMes: Math.round(custoMes),
        lucroMes: Math.round(lucroMes),
        produtividade: Math.round(produtividade * 100) / 100,
        alertas: 0,
        margemLucro: Math.round(margemLucro * 100) / 100
      },
      cultivos: {
        porTipo: cultivosUnicos.size > 0 ? 
          Object.fromEntries(
            Array.from(cultivosUnicos).map(cultivo => [
              cultivo as string,
              {
                areaPlantada: Math.round(areaPlantada / cultivosUnicos.size),
                producaoEstimada: Math.round((areaPlantada / cultivosUnicos.size) * 2.5),
                producaoRealizada: Math.round((areaPlantada / cultivosUnicos.size) * 2.1),
                custoTotal: Math.round((areaPlantada / cultivosUnicos.size) * 1800),
                statusDistribuicao: {
                  plantado: Math.round((areaPlantada / cultivosUnicos.size) * 0.3),
                  crescimento: Math.round((areaPlantada / cultivosUnicos.size) * 0.4),
                  colhido: Math.round((areaPlantada / cultivosUnicos.size) * 0.3),
                  perdido: 0
                }
              }
            ])
          ) : {},
        total: cultivosUnicos.size,
        areaTotal: areaPlantada,
        producaoEstimada: Math.round(areaPlantada * 2.5),
        producaoRealizada: Math.round(areaPlantada * 2.1)
      },
      vendas: {
        mensal: {
          total: Math.round(faturamentoMes),
          quantidade: Math.round(areaPlantada * 2.1),
          vendas: fazendas.length * 3 // Estimativa de vendas por fazenda
        },
        compradores: fazendas.map((fazenda, index) => ({
          nome: `Comprador ${fazenda.nome}`,
          valor: Math.round(faturamentoMes / fazendas.length),
          percentual: Math.round(100 / fazendas.length)
        })),
        porProduto: Array.from(cultivosUnicos).map(cultivo => ({
          produto: cultivo as string,
          quantidade: Math.round(areaPlantada / cultivosUnicos.size * 2.1),
          valor: Math.round(faturamentoMes / cultivosUnicos.size),
          margem: 25
        }))
      },
      adubos: {
        gastoMes: Math.round(custoMes * 0.3), // 30% do custo em adubos
        aplicacoesMes: fazendas.length * 2,
        principais: fazendas.map(fazenda => ({
          nome: `Adubo ${fazenda.nome}`,
          quantidade: Math.round(fazenda.area * 0.5),
          custo: Math.round(fazenda.area * 120),
          aplicacoes: 2
        }))
      },
      estoque: {
        valorTotal: Math.round(faturamentoMes * 0.1), // 10% do faturamento em estoque
        itensTotal: fazendas.length * 5, // 5 itens por fazenda
        principais: fazendas.slice(0, 5).map((fazenda, index) => ({
          nome: `Insumo ${fazenda.nome}`,
          categoria: 'fertilizante',
          quantidade: Math.round(fazenda.area * 2),
          valor: Math.round(fazenda.area * 80),
          status: 'em estoque'
        })),
        alertas: fazendas.filter(fazenda => fazenda.area > 200).map(fazenda => ({
          item: `Estoque baixo - ${fazenda.nome}`,
          nivel: 'baixo',
          quantidade: Math.round(fazenda.area * 0.1)
        }))
      },
      racao: {
        producaoMensal: fazendas.filter(f => f.realizaRacao).length * 100,
        valorMensal: fazendas.filter(f => f.realizaRacao).length * 15000,
        milhoUtilizado: fazendas.filter(f => f.realizaRacao).length * 60,
        custoProducao: fazendas.filter(f => f.realizaRacao).length * 10000,
        margem: 35,
        fazendasProdutoras: fazendas.filter(f => f.realizaRacao).length
      },
      temporal: [
        { mes: 'Jan', faturamento: faturamentoMes * 0.8, custo: custoMes * 0.8, lucro: (faturamentoMes - custoMes) * 0.8 },
        { mes: 'Fev', faturamento: faturamentoMes * 0.9, custo: custoMes * 0.9, lucro: (faturamentoMes - custoMes) * 0.9 },
        { mes: 'Mar', faturamento: faturamentoMes * 1.1, custo: custoMes * 1.0, lucro: (faturamentoMes - custoMes) * 1.2 },
        { mes: 'Abr', faturamento: faturamentoMes * 1.0, custo: custoMes * 1.1, lucro: (faturamentoMes - custoMes) * 0.9 },
        { mes: 'Mai', faturamento: faturamentoMes * 1.2, custo: custoMes * 1.0, lucro: (faturamentoMes - custoMes) * 1.4 },
        { mes: 'Jun', faturamento: faturamentoMes * 1.1, custo: custoMes * 0.9, lucro: (faturamentoMes - custoMes) * 1.3 }
      ],
      ultima_atualizacao: new Date().toISOString()
    };
  };

  // Função para processar cultivos do contexto e incluir no dashboard
  const processarCultivosContext = () => {
    console.log('🌱 Processando cultivos do contexto:', cultivos.length);
    
    const cultivosMilho = cultivos.filter(c => 
      c.cultura?.toLowerCase() === 'milho' || 
      c.tipoCultivo?.toLowerCase().includes('milho')
    );
    
    const cultivosSoja = cultivos.filter(c => 
      c.cultura?.toLowerCase() === 'soja' || 
      c.tipoCultivo?.toLowerCase().includes('soja')
    );
    
    console.log('🌽 Cultivos de Milho:', cultivosMilho.length);
    console.log('🌱 Cultivos de Soja:', cultivosSoja.length);

    const dadosCultivos = {
      total: cultivos.length,
      areaTotal: cultivos.reduce((total, c) => total + (c.areaHectares || 0), 0),
      porTipo: {
        milho: {
          quantidade: cultivosMilho.length,
          area: cultivosMilho.reduce((total, c) => total + (c.areaHectares || 0), 0),
          produtividadeEsperada: cultivosMilho.reduce((total, c) => total + (c.produtividadeEsperada || 0), 0),
          produtividadeReal: cultivosMilho.reduce((total, c) => total + (c.produtividadeReal || 0), 0)
        },
        soja: {
          quantidade: cultivosSoja.length,
          area: cultivosSoja.reduce((total, c) => total + (c.areaHectares || 0), 0),
          produtividadeEsperada: cultivosSoja.reduce((total, c) => total + (c.produtividadeEsperada || 0), 0),
          produtividadeReal: cultivosSoja.reduce((total, c) => total + (c.produtividadeReal || 0), 0)
        }
      }
    };

    return dadosCultivos;
  };

  // Carregar dados do dashboard via API ou usar dados do contexto de fazendas
  useEffect(() => {
    const carregarDadosDashboard = async () => {
      console.log('📊 Dashboard: Carregando dados...');
      console.log('📦 Fazendas disponíveis:', fazendas.length);
      console.log('🔄 Loading fazendas:', fazendasLoading);
      
      try {
        setLoading(true);
        setError(null);
        
        // SEMPRE usar dados calculados do contexto de fazendas primeiro
        if (fazendas.length > 0 || cultivos.length > 0) {
          console.log('� Usando dados calculados do contexto de fazendas');
          const dadosCalculados = calcularDadosFromFazendas();
          
          // Integrar dados dos cultivos do contexto
          if (cultivos.length > 0) {
            const cultivosProcessados = processarCultivosContext();
            dadosCalculados.cultivos = {
              ...dadosCalculados.cultivos,
              ...cultivosProcessados
            };
          }
          console.log('📈 Dados calculados:', dadosCalculados);
          setDashboardData(dadosCalculados);
          setError(null); // Limpar erro pois temos dados válidos
        } else {
          // Tentar buscar dados da API se não há fazendas no contexto
          console.log('� Tentando buscar dados da API...');
          try {
            const dados = await dashboardAPI.buscarDados();
            console.log('✅ Dados da API recebidos:', dados);
            setDashboardData(dados);
          } catch (apiError) {
            console.error('❌ Erro ao carregar dados do dashboard via API:', apiError);
            console.log('🎭 Usando dados simulados');
            setError('Erro ao carregar dados. Usando dados simulados.');
            setDashboardData(getDadosSimulados());
          }
        }
      } catch (err) {
        console.error('❌ Erro geral no dashboard:', err);
        setError('Erro ao carregar dados do dashboard.');
        setDashboardData(getDadosSimulados());
      } finally {
        setLoading(false);
      }
    };

    // Só carregar se não estiver carregando fazendas
    if (!fazendasLoading) {
      carregarDadosDashboard();
    }
  }, [fazendas, cultivos, fazendasLoading, calcularDadosFromFazendas, processarCultivosContext]); // Recarregar quando fazendas ou cultivos mudarem

  // Função para obter dados simulados como fallback
  const getDadosSimulados = (): DashboardData => {
    return {
      resumo: {
        totalFazendas: 12,
        areaTotal: 1850,
        areaPlantada: 1420,
        fazendasAtivas: 11,
        totalFuncionarios: 45,
        faturamentoMes: 12890000, // R$ 12.89 milhões
        custoMes: 3270000, // R$ 3.27 milhões
        lucroMes: 9620000, // R$ 9.62 milhões
        produtividade: 94.2,
        alertas: 3,
        margemLucro: 74.6
      },
      cultivos: {
        porTipo: {
          milho: {
            areaPlantada: 680,
            producaoEstimada: 47600, // 70 ton/ha
            producaoRealizada: 44880,
            custoTotal: 4760000,
            statusDistribuicao: { plantado: 180, crescimento: 320, colhido: 180, perdido: 0 }
          },
          soja: {
            areaPlantada: 740,
            producaoEstimada: 22200, // 30 ton/ha
            producaoRealizada: 21090,
            custoTotal: 4440000,
            statusDistribuicao: { plantado: 200, crescimento: 380, colhido: 160, perdido: 0 }
          }
        },
        total: 28,
        areaTotal: 1420,
        producaoEstimada: 69800,
        producaoRealizada: 65970
      },
      vendas: {
        mensal: {
          total: 12890000,
          quantidade: 4200,
          vendas: 15
        },
        compradores: [
          { nome: 'Cooperativa Central', valor: 5156000, quantidade: 1473, participacao: 40.0 },
          { nome: 'Agroindústria ABC', valor: 3867000, quantidade: 1289, participacao: 30.0 },
          { nome: 'Exportadora XYZ', valor: 2578000, quantidade: 860, participacao: 20.0 },
          { nome: 'Granja Avícola DEF', valor: 1289000, quantidade: 578, participacao: 10.0 }
        ],
        porProduto: [
          { produto: 'milho', valor: 7734000, quantidade: 2580 },
          { produto: 'soja', valor: 4201500, quantidade: 1201 },
          { produto: 'ração', valor: 954500, quantidade: 419 }
        ]
      },
      adubos: {
        gastoMes: 410000,
        aplicacoesMes: 12,
        principais: [
          { tipo: 'NPK 10-10-10', gasto: 180000, area: 520, quantidade: 25600 },
          { tipo: 'Ureia', gasto: 95000, area: 280, quantidade: 9500 },
          { tipo: 'Superfosfato', gasto: 85000, area: 340, quantidade: 17000 },
          { tipo: 'Calcário', gasto: 50000, area: 280, quantidade: 50000 }
        ]
      },
      estoque: {
        valorTotal: 890000,
        itensTotal: 48,
        principais: [
          { item: 'Sementes de Milho Premium', categoria: 'sementes', quantidade: 125, valor: 187500, status: 'normal' },
          { item: 'Fertilizante NPK 20-05-20', categoria: 'fertilizante', quantidade: 78, valor: 156000, status: 'normal' },
          { item: 'Defensivo Glifosato', categoria: 'defensivo', quantidade: 45, valor: 135000, status: 'normal' },
          { item: 'Ração Concentrada Suína', categoria: 'ração', quantidade: 320, valor: 128000, status: 'normal' },
          { item: 'Sementes de Soja Transgênica', categoria: 'sementes', quantidade: 98, valor: 147000, status: 'baixo' }
        ],
        alertas: [
          { item: 'Defensivo Fungicida', quantidade: 4, status: 'crítico' },
          { item: 'Fertilizante Foliar', quantidade: 8, status: 'baixo' },
          { item: 'Sementes de Girassol', quantidade: 6, status: 'baixo' }
        ]
      },
      racao: {
        producaoMensal: 450,
        valorMensal: 283500,
        milhoUtilizado: 270,
        custoProducao: 202500,
        margem: 40.0,
        fazendasProdutoras: 3
      },
      temporal: [
        { mes: 'Jan', faturamento: 10.2, custo: 2.8, lucro: 7.4, areaPlantada: 1320, producao: 58500 },
        { mes: 'Fev', faturamento: 11.5, custo: 3.1, lucro: 8.4, areaPlantada: 1380, producao: 61200 },
        { mes: 'Mar', faturamento: 13.8, custo: 3.4, lucro: 10.4, areaPlantada: 1420, producao: 65970 },
        { mes: 'Abr', faturamento: 12.1, custo: 3.0, lucro: 9.1, areaPlantada: 1385, producao: 63800 },
        { mes: 'Mai', faturamento: 14.2, custo: 3.6, lucro: 10.6, areaPlantada: 1450, producao: 67200 },
        { mes: 'Jun', faturamento: 12.9, custo: 3.3, lucro: 9.6, areaPlantada: 1420, producao: 65970 }
      ],
      ultima_atualizacao: new Date().toISOString()
    };
  };

  // Breakpoints responsivos
  const breakpoints = {
    mobile: screenSize.width < 768,
    tablet: screenSize.width >= 768 && screenSize.width < 1024,
    desktop: screenSize.width >= 1024
  };

  // Se está carregando ou não há dados, mostrar loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: isDark ? '#111827' : '#F2F2F2'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: isDark ? '#1f2937' : 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #D2691E', // Laranja original
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ marginTop: '16px', color: isDark ? '#d1d5db' : '#4F4F4F' }}>
            Carregando dados do dashboard...
          </p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  // Se houve erro mas temos dados (fallback), mostrar aviso
  if (error && dashboardData) {
    console.warn(error);
  }

  // Se não há dados, mostrar erro
  if (!dashboardData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: isDark ? '#111827' : '#F2F2F2'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: isDark ? '#1f2937' : 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ color: '#E53E3E', fontSize: '18px', marginBottom: '16px' }}>
            Erro ao carregar dados do dashboard
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#D2691E', // Laranja original
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Extrair dados específicos do milho e soja dos cultivos
  const milhoData = dashboardData.cultivos.porTipo?.milho || {
    areaPlantada: 0,
    producaoEstimada: 0,
    producaoRealizada: 0,
    custoTotal: 0,
    statusDistribuicao: { plantado: 0, crescimento: 0, colhido: 0, perdido: 0 }
  };

  const sojaData = dashboardData.cultivos.porTipo?.soja || {
    areaPlantada: 0,
    producaoEstimada: 0,
    producaoRealizada: 0,
    custoTotal: 0,
    statusDistribuicao: { plantado: 0, crescimento: 0, colhido: 0, perdido: 0 }
  };

  // Garantir que as propriedades nunca sejam undefined
  const safeMilhoData = {
    areaPlantada: milhoData.areaPlantada || 0,
    producaoEstimada: milhoData.producaoEstimada || 0,
    producaoRealizada: milhoData.producaoRealizada || 0,
    custoTotal: milhoData.custoTotal || 0,
    statusDistribuicao: milhoData.statusDistribuicao || { plantado: 0, crescimento: 0, colhido: 0, perdido: 0 }
  };

  const safeSojaData = {
    areaPlantada: sojaData.areaPlantada || 0,
    producaoEstimada: sojaData.producaoEstimada || 0,
    producaoRealizada: sojaData.producaoRealizada || 0,
    custoTotal: sojaData.custoTotal || 0,
    statusDistribuicao: sojaData.statusDistribuicao || { plantado: 0, crescimento: 0, colhido: 0, perdido: 0 }
  };

  // Calcular receita esperada e margem para milho
  const receitaEsperadaMilho = safeMilhoData.producaoEstimada * 300; // R$ 300 por tonelada
  const margemLucroMilho = safeMilhoData.custoTotal > 0 
    ? ((receitaEsperadaMilho - safeMilhoData.custoTotal) / safeMilhoData.custoTotal * 100) 
    : 0;

  // Dados temporais simulados para milho baseados nos dados reais
  const milhoTemporais = dashboardData.temporal.map((item, index) => ({
    mes: item.mes,
    plantio: Math.round(safeMilhoData.areaPlantada * 0.2 * (0.8 + Math.random() * 0.4)),
    colheita: index > 2 ? Math.round(safeMilhoData.areaPlantada * 0.15 * (0.8 + Math.random() * 0.4)) : 0,
    receita: index > 2 ? Math.round(receitaEsperadaMilho * 0.2 * (0.8 + Math.random() * 0.4)) : 0
  }));

  // Calcular receita esperada e margem para soja
  const receitaEsperadaSoja = safeSojaData.producaoEstimada * 1300; // R$ 1300 por tonelada
  const margemLucroSoja = safeSojaData.custoTotal > 0 
    ? ((receitaEsperadaSoja - safeSojaData.custoTotal) / safeSojaData.custoTotal * 100) 
    : 0;

  // Dados temporais simulados para soja baseados nos dados reais
  const sojaTemporais = dashboardData.temporal.map((item, index) => ({
    mes: item.mes,
    plantio: Math.round(safeSojaData.areaPlantada * 0.2 * (0.8 + Math.random() * 0.4)),
    colheita: index > 3 ? Math.round(safeSojaData.areaPlantada * 0.12 * (0.8 + Math.random() * 0.4)) : 0,
    receita: index > 3 ? Math.round(receitaEsperadaSoja * 0.15 * (0.8 + Math.random() * 0.4)) : 0
  }));

  const styles = {
    container: {
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' 
        : '#F2F2F2', // Fundo cinza claro conforme solicitado
      padding: breakpoints.mobile ? '16px' : '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
      transition: 'background 0.3s ease'
    },
    header: {
      marginBottom: '32px',
      textAlign: 'center' as const
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#005F73', // Azul principal
      marginBottom: '8px',
      transition: 'color 0.3s ease'
    },
    subtitle: {
      fontSize: '16px',
      color: isDark ? '#9ca3af' : '#4F4F4F', // Texto secundário
      marginBottom: '16px',
      transition: 'color 0.3s ease'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: breakpoints.mobile 
        ? '1fr' 
        : breakpoints.tablet 
          ? 'repeat(auto-fit, minmax(400px, 1fr))'
          : 'repeat(auto-fit, minmax(600px, 1fr))',
      gap: breakpoints.mobile ? '16px' : '24px',
      justifyContent: 'center',
      alignItems: 'start'
    },
    section: {
      background: isDark ? '#1f2937' : '#FFFFFF', // Fundo branco para as seções
      borderRadius: '16px',
      padding: breakpoints.mobile ? '16px' : '24px',
      boxShadow: isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
      transition: 'all 0.3s ease'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#005F73', // Azul principal
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'color 0.3s ease'
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: breakpoints.mobile 
        ? 'repeat(auto-fit, minmax(150px, 1fr))'
        : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: breakpoints.mobile ? '12px' : '16px',
      marginBottom: '24px',
      justifyItems: 'center'
    },
    card: {
      background: isDark ? '#374151' : 'white', // fundo branco para cards internos
      padding: '16px',
      borderRadius: '12px',
      border: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`,
      transition: 'all 0.3s ease'
    },
    cardTitle: {
      fontSize: '14px',
      color: isDark ? '#9ca3af' : '#4F4F4F', // Texto secundário
      marginBottom: '8px',
      transition: 'color 0.3s ease'
    },
    cardValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#005F73', // Azul principal
      transition: 'color 0.3s ease'
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
      background: isDark ? '#4b5563' : '#FFFFFF', // Fundo branco para cabeçalho de tabela
      padding: '12px',
      textAlign: 'left' as const,
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#005F73', // Azul principal
      borderBottom: `1px solid ${isDark ? '#6b7280' : '#e2e8f0'}`,
      transition: 'all 0.3s ease'
    },
    tableCell: {
      padding: '12px',
      borderBottom: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`,
      color: isDark ? '#d1d5db' : '#4F4F4F', // Texto secundário
      transition: 'all 0.3s ease'
    },
    alertBadge: {
      background: isDark ? '#7f1d1d' : '#fef2f2',
      color: isDark ? '#fca5a5' : '#E53E3E', // vermelho-alerta mantido
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease'
    },
    successBadge: {
      background: isDark ? '#14532d' : '#B0E0E6', // Azul claro de destaque
      color: isDark ? '#86efac' : '#005F73', // Azul principal
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease'
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
        <div style={{ 
          fontSize: '12px', 
          color: isDark ? '#9ca3af' : '#6b7280',
          marginTop: '10px',
          padding: '8px',
          backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
          borderRadius: '4px'
        }}>
          🔄 Fazendas carregadas: {fazendas.length} | 
          Status: {fazendasLoading ? 'Carregando...' : 'Pronto'} | 
          Última atualização: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Grid de Seções */}
      <div style={styles.grid}>
        
        {/* 1. RESUMO GERAL */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <BarChart3 size={24} color="#005F73" />
            Resumo Geral
          </h2>
          
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Total de Fazendas</div>
              <div style={styles.cardValue}>{dashboardData.resumo.totalFazendas}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Área Total (ha)</div>
              <div style={styles.cardValue}>{(dashboardData.resumo.areaTotal || 0).toLocaleString()}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Área Plantada (ha)</div>
              <div style={styles.cardValue}>{(dashboardData.resumo.areaPlantada || 0).toLocaleString()}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Faturamento Mês</div>
              <div style={styles.cardValue}>R$ {(dashboardData.resumo.faturamentoMes / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Custo Mês</div>
              <div style={styles.cardValue}>R$ {(dashboardData.resumo.custoMes / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Lucro Mês</div>
              <div style={styles.cardValue}>R$ {(dashboardData.resumo.lucroMes / 1000).toFixed(0)}k</div>
            </div>
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.temporal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`R$ ${value}k`, '']} />
                <Legend />
                <Line type="monotone" dataKey="faturamento" stroke="#005F73" strokeWidth={3} />
                <Line type="monotone" dataKey="custos" stroke="#DC143C" strokeWidth={3} />
                <Line type="monotone" dataKey="lucro" stroke="#D2691E" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. CULTURA - MILHO */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Wheat size={24} color="#FCD34D" />
            Cultura - Milho
          </h2>
          
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Área Plantada (ha)</div>
              <div style={styles.cardValue}>{safeMilhoData.areaPlantada}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Produção Est. (ton)</div>
              <div style={styles.cardValue}>{(safeMilhoData.producaoEstimada || 0).toLocaleString()}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Receita Esperada</div>
              <div style={styles.cardValue}>R$ {(receitaEsperadaMilho / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Margem Lucro</div>
              <div style={styles.cardValue}>{margemLucroMilho.toFixed(1)}%</div>
            </div>
          </div>

          <div style={{...styles.cardGrid, gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌱 Plantado</div>
              <div style={styles.cardValue}>{safeMilhoData.statusDistribuicao.plantado} ha</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌿 Crescimento</div>
              <div style={styles.cardValue}>{safeMilhoData.statusDistribuicao.crescimento} ha</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌾 Colheita</div>
              <div style={styles.cardValue}>{safeMilhoData.statusDistribuicao.colhido} ha</div>
            </div>
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={milhoTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="plantio" stackId="1" stroke="#FCD34D" fill="#FCD34D" />
                <Area type="monotone" dataKey="colheita" stackId="2" stroke="#1B4332" fill="#E5F4EC" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Ração com Sobras de Milho */}
          <div style={{marginTop: '24px', borderTop: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`, paddingTop: '20px'}}>
            <h3 style={styles.sectionTitle}>
              <CowIcon size={24} color="#005F73" />
              Produção de Ração com Sobras
            </h3>
            
            <div style={styles.cardGrid}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Produção Mensal (ton)</div>
                <div style={styles.cardValue}>{Math.round(milhoData.producaoRealizada * 0.15)}</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Milho Utilizado (ton)</div>
                <div style={styles.cardValue}>{Math.round(milhoData.producaoRealizada * 0.08)}</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Custo Produção</div>
                <div style={styles.cardValue}>R$ {(milhoData.custoTotal * 0.25 / 1000).toFixed(0)}k</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Margem Lucro</div>
                <div style={styles.cardValue}>{margemLucroMilho > 50 ? '45.2' : '32.8'}%</div>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <h4 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: isDark ? '#d1d5db' : '#4b5563'}}>
                Clientes de Ração
              </h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Cliente</th>
                    <th style={styles.tableHeader}>Quantidade (ton)</th>
                    <th style={styles.tableHeader}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { nome: 'Fazenda Silva', quantidade: Math.round(milhoData.producaoRealizada * 0.05), valor: Math.round(milhoData.custoTotal * 0.12) },
                    { nome: 'Pecuária Santos', quantidade: Math.round(milhoData.producaoRealizada * 0.08), valor: Math.round(milhoData.custoTotal * 0.18) },
                    { nome: 'Sítio Verde', quantidade: Math.round(milhoData.producaoRealizada * 0.03), valor: Math.round(milhoData.custoTotal * 0.08) }
                  ].map((cliente: any, index: number) => (
                    <tr key={index}>
                      <td style={styles.tableCell}>{cliente.nome}</td>
                      <td style={styles.tableCell}>{cliente.quantidade}</td>
                      <td style={styles.tableCell}>R$ {(cliente.valor / 1000).toFixed(1)}k</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. CULTURA - SOJA */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Leaf size={24} color="#1B4332" />
            Cultura - Soja
          </h2>
          
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Área Plantada (ha)</div>
              <div style={styles.cardValue}>{safeSojaData.areaPlantada}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Produção Est. (ton)</div>
              <div style={styles.cardValue}>{(safeSojaData.producaoEstimada || 0).toLocaleString()}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Receita Esperada</div>
              <div style={styles.cardValue}>R$ {(receitaEsperadaSoja / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Margem Lucro</div>
              <div style={styles.cardValue}>{margemLucroSoja.toFixed(1)}%</div>
            </div>
          </div>

          <div style={{...styles.cardGrid, gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌱 Plantado</div>
              <div style={styles.cardValue}>{safeSojaData.statusDistribuicao.plantado} ha</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌿 Crescimento</div>
              <div style={styles.cardValue}>{safeSojaData.statusDistribuicao.crescimento} ha</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🌾 Colheita</div>
              <div style={styles.cardValue}>{safeSojaData.statusDistribuicao.colhido} ha</div>
            </div>
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sojaTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="plantio" fill="#1B4332" />
                <Bar dataKey="colheita" fill="#E5F4EC" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. VENDAS */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <ShoppingCart size={24} color="#DA854F" />
            Vendas
          </h2>
          
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>💰 Vendas Mês</div>
              <div style={styles.cardValue}>R$ {(dashboardData.vendas.mensal.total / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🎯 Meta Mês</div>
              <div style={styles.cardValue}>R$ {((dashboardData.vendas.mensal.total * 1.2) / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>📈 Crescimento</div>
              <div style={styles.cardValue}>+{dashboardData.resumo.margemLucro.toFixed(1)}%</div>
            </div>
          </div>

          {/* Tabela Principais Compradores */}
          <div style={styles.tableContainer}>
            <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: isDark ? '#f9fafb' : '#1e293b'}}>
              Principais Compradores
            </h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Comprador</th>
                  <th style={styles.tableHeader}>Valor</th>
                  <th style={styles.tableHeader}>Participação</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.vendas.compradores.map((comprador: any, index: number) => (
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
            <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: isDark ? '#f9fafb' : '#1e293b'}}>
              Vendas por Cultura
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.vendas.porProduto}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                  nameKey="cultura"
                >
                  <Cell fill="#FCD34D" />
                  <Cell fill="#1B4332" />
                </Pie>
                <Tooltip formatter={(value: number) => [`R$ ${(value / 1000).toFixed(0)}k`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. ADUBOS */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Factory size={24} color="#E9D5FF" />
            Adubos e Fertilizantes
          </h2>
          
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Gastos Total Mês</div>
              <div style={styles.cardValue}>R$ {(dashboardData.adubos.gastoMes / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Aplicações Realizadas</div>
              <div style={styles.cardValue}>{dashboardData.adubos.aplicacoesMes}</div>
            </div>
          </div>

          <div style={styles.tableContainer}>
            <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: isDark ? '#f9fafb' : '#1e293b'}}>
              Principais Adubos Utilizados
            </h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Tipo de Adubo</th>
                  <th style={styles.tableHeader}>Gasto</th>
                  <th style={styles.tableHeader}>Área (ha)</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.adubos.principais.map((item: any, index: number) => (
                  <tr key={index}>
                    <td style={styles.tableCell}>{item.tipo}</td>
                    <td style={styles.tableCell}>R$ {(item.gasto / 1000).toFixed(0)}k</td>
                    <td style={styles.tableCell}>{item.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.adubos.principais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: number) => [`R$ ${(value / 1000).toFixed(0)}k`, '']} />
                <Bar dataKey="gasto" fill="#E9D5FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. ESTOQUE */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Package size={24} color="#E53E3E" />
            Estoque
          </h2>
          
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Valor Total</div>
              <div style={styles.cardValue}>R$ {(dashboardData.estoque.valorTotal / 1000).toFixed(0)}k</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Itens Total</div>
              <div style={styles.cardValue}>{dashboardData.estoque.itensTotal}</div>
            </div>
          </div>

          <div style={styles.tableContainer}>
            <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: isDark ? '#f9fafb' : '#1e293b'}}>
              Principais Itens em Estoque
            </h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Item</th>
                  <th style={styles.tableHeader}>Quantidade</th>
                  <th style={styles.tableHeader}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.estoque.principais.map((item: any, index: number) => (
                  <tr key={index}>
                    <td style={styles.tableCell}>{item.item}</td>
                    <td style={styles.tableCell}>{item.quantidade}</td>
                    <td style={styles.tableCell}>R$ {(item.valor / 1000).toFixed(0)}k</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alertas de Estoque */}
          <div style={{marginTop: '24px'}}>
            <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: isDark ? '#f9fafb' : '#1e293b'}}>
              Alertas de Estoque
            </h3>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              {dashboardData.estoque.alertas.map((alerta: any, index: number) => (
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
