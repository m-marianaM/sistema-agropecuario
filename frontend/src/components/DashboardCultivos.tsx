/**
 * 📊 Componente DashboardCultivos
 * 
 * Dashboard com métricas e gráficos para cultivos de milho e soja
 * Dividido por cultura com estatísticas e visualizações
 */

import React, { useMemo } from 'react';
import { TrendingUp, Sprout, MapPin, Package, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Cultivo, Fazenda } from '../context/FazendasContext';

interface DashboardCultivosProps {
  cultivos: Cultivo[];
  fazendas: Fazenda[];
}

interface MetricasCultura {
  tipo: 'Milho' | 'Soja';
  totalArea: number;
  cultivosAtivos: number;
  producaoEstimada: number;
  statusDistribution: { [key: string]: number };
  evolucaoMensal: { mes: string; area: number }[];
}

const DashboardCultivos: React.FC<DashboardCultivosProps> = ({ cultivos, fazendas }) => {
  
  // ========================
  // 📊 CÁLCULOS DE MÉTRICAS
  // ========================

  const metricas = useMemo((): { milho: MetricasCultura; soja: MetricasCultura } => {
    // Produtividade média por hectare (kg/ha)
    const produtividades = {
      Milho: 8000,  // 8 toneladas por hectare
      Soja: 3200    // 3.2 toneladas por hectare
    };

    const calcularMetricas = (tipoCultura: 'Milho' | 'Soja'): MetricasCultura => {
      const cultivosTipo = cultivos.filter(c => c.tipoCultura === tipoCultura);
      
      // Total de área
      const totalArea = cultivosTipo.reduce((sum, c) => sum + c.areaHectares, 0);
      
      // Cultivos ativos (não finalizados)
      const cultivosAtivos = cultivosTipo.filter(c => c.status !== 'Colhido').length;
      
      // Produção estimada
      const producaoEstimada = totalArea * produtividades[tipoCultura];
      
      // Distribuição por status
      const statusDistribution: { [key: string]: number } = {};
      cultivosTipo.forEach(c => {
        statusDistribution[c.status] = (statusDistribution[c.status] || 0) + 1;
      });
      
      // Evolução mensal da área plantada (últimos 12 meses)
      const evolucaoMensal: { mes: string; area: number }[] = [];
      const hoje = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mes = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        const areaNoMes = cultivosTipo
          .filter(c => {
            const dataPlantio = new Date(c.dataPlantio);
            return dataPlantio.getFullYear() === data.getFullYear() && 
                   dataPlantio.getMonth() === data.getMonth();
          })
          .reduce((sum, c) => sum + c.areaHectares, 0);
        
        evolucaoMensal.push({ mes, area: areaNoMes });
      }
      
      return {
        tipo: tipoCultura,
        totalArea,
        cultivosAtivos,
        producaoEstimada,
        statusDistribution,
        evolucaoMensal
      };
    };

    return {
      milho: calcularMetricas('Milho'),
      soja: calcularMetricas('Soja')
    };
  }, [cultivos]);

  // Dados para gráfico de pizza do status geral
  const dadosStatusGeral = useMemo(() => {
    const statusCount: { [key: string]: number } = {};
    
    cultivos.forEach(c => {
      statusCount[c.status] = (statusCount[c.status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
      color: 
        status === 'Plantado' ? '#3b82f6' :
        status === 'Crescimento' ? '#10b981' :
        status === 'Colheita' ? '#f59e0b' :
        '#6b7280'
    }));
  }, [cultivos]);

  // Dados para gráfico de barras por fazenda
  const dadosPorFazenda = useMemo((): Array<{fazenda: string; milho: number; soja: number; total: number}> => {
    const fazendaData = fazendas.map(fazenda => {
      const cultivosFazenda = cultivos.filter(c => c.fazendaId === fazenda.id);
      const areaMilho = cultivosFazenda
        .filter(c => c.tipoCultura === 'Milho')
        .reduce((sum, c) => sum + c.areaHectares, 0);
      const areaSoja = cultivosFazenda
        .filter(c => c.tipoCultura === 'Soja')
        .reduce((sum, c) => sum + c.areaHectares, 0);
      
      return {
        fazenda: fazenda.nome.substring(0, 15) + (fazenda.nome.length > 15 ? '...' : ''),
        milho: areaMilho,
        soja: areaSoja,
        total: areaMilho + areaSoja
      };
    }).filter(f => f.total > 0); // Só mostrar fazendas com cultivos
    
    return dadosPorFazenda;
  }, [cultivos, fazendas]);

  // ========================
  // 🎨 COMPONENTES DE CARD
  // ========================

  const CardMetrica = ({ 
    titulo, 
    valor, 
    unidade, 
    icone, 
    cor, 
    destaque = false 
  }: {
    titulo: string;
    valor: string | number;
    unidade: string;
    icone: React.ReactNode;
    cor: string;
    destaque?: boolean;
  }) => (
    <div style={{
      backgroundColor: destaque ? cor + '15' : '#ffffff',
      border: `1px solid ${destaque ? cor : '#e5e7eb'}`,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{ color: cor, display: 'flex' }}>
          {icone}
        </div>
        <span style={{ 
          fontSize: '14px', 
          fontWeight: 'bold', 
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {titulo}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: destaque ? cor : '#111827'
        }}>
          {typeof valor === 'number' ? valor.toLocaleString('pt-BR') : valor}
        </span>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          {unidade}
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '0', display: 'grid', gap: '32px' }}>
      
      {/* Resumo Geral */}
      <div>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#111827'
        }}>
          📊 Resumo Geral de Cultivos
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <CardMetrica
            titulo="Total de Cultivos"
            valor={cultivos.length}
            unidade="cultivos"
            icone={<Sprout size={24} />}
            cor="#10b981"
            destaque
          />
          
          <CardMetrica
            titulo="Área Total"
            valor={(metricas.milho.totalArea + metricas.soja.totalArea).toFixed(1)}
            unidade="hectares"
            icone={<MapPin size={24} />}
            cor="#3b82f6"
          />
          
          <CardMetrica
            titulo="Produção Estimada"
            valor={Math.round((metricas.milho.producaoEstimada + metricas.soja.producaoEstimada) / 1000)}
            unidade="toneladas"
            icone={<TrendingUp size={24} />}
            cor="#f59e0b"
          />
          
          <CardMetrica
            titulo="Cultivos Ativos"
            valor={metricas.milho.cultivosAtivos + metricas.soja.cultivosAtivos}
            unidade="em andamento"
            icone={<Package size={24} />}
            cor="#8b5cf6"
          />
        </div>
      </div>

      {/* Gráficos Gerais */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        
        {/* Status Distribution */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            color: '#111827'
          }}>
            📈 Distribuição por Status
          </h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dadosStatusGeral}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {dadosStatusGeral.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cultivos por Fazenda */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            color: '#111827'
          }}>
            🏡 Área por Fazenda
          </h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosPorFazenda}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fazenda" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value, name) => [`${value} ha`, name === 'milho' ? 'Milho' : 'Soja']}
                labelFormatter={(label) => `Fazenda: ${label}`}
              />
              <Bar dataKey="milho" fill="#fbbf24" name="milho" />
              <Bar dataKey="soja" fill="#10b981" name="soja" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seções por Cultura */}
      <div style={{ display: 'grid', gap: '40px' }}>
        
        {/* Milho */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>🌽</span>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#f59e0b',
              margin: 0
            }}>
              Cultivos de Milho
            </h2>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <CardMetrica
              titulo="Área Plantada"
              valor={metricas.milho.totalArea.toFixed(1)}
              unidade="hectares"
              icone={<MapPin size={20} />}
              cor="#f59e0b"
              destaque
            />
            
            <CardMetrica
              titulo="Cultivos Ativos"
              valor={metricas.milho.cultivosAtivos}
              unidade="em andamento"
              icone={<Sprout size={20} />}
              cor="#f59e0b"
            />
            
            <CardMetrica
              titulo="Produção Estimada"
              valor={Math.round(metricas.milho.producaoEstimada / 1000)}
              unidade="toneladas"
              icone={<TrendingUp size={20} />}
              cor="#f59e0b"
            />
          </div>

          {/* Gráfico de Evolução do Milho */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              color: '#111827'
            }}>
              📈 Evolução da Área Plantada - Milho
            </h3>
            
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metricas.milho.evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`${value} ha`, 'Área Plantada']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="area" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Soja */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>🌱</span>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#10b981',
              margin: 0
            }}>
              Cultivos de Soja
            </h2>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <CardMetrica
              titulo="Área Plantada"
              valor={metricas.soja.totalArea.toFixed(1)}
              unidade="hectares"
              icone={<MapPin size={20} />}
              cor="#10b981"
              destaque
            />
            
            <CardMetrica
              titulo="Cultivos Ativos"
              valor={metricas.soja.cultivosAtivos}
              unidade="em andamento"
              icone={<Sprout size={20} />}
              cor="#10b981"
            />
            
            <CardMetrica
              titulo="Produção Estimada"
              valor={Math.round(metricas.soja.producaoEstimada / 1000)}
              unidade="toneladas"
              icone={<TrendingUp size={20} />}
              cor="#10b981"
            />
          </div>

          {/* Gráfico de Evolução da Soja */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              color: '#111827'
            }}>
              📈 Evolução da Área Plantada - Soja
            </h3>
            
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metricas.soja.evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`${value} ha`, 'Área Plantada']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="area" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footer do Dashboard */}
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <BarChart3 size={20} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#6b7280' }}>
            SISTEMA AGROPECUÁRIO - DASHBOARD DE CULTIVOS
          </span>
        </div>
        <p style={{ 
          fontSize: '12px', 
          color: '#9ca3af', 
          margin: 0,
          fontStyle: 'italic'
        }}>
          Dados atualizados em tempo real • Produtividade baseada em médias regionais
        </p>
      </div>
    </div>
  );
};

export default DashboardCultivos;
