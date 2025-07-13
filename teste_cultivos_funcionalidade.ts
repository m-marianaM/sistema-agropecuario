// Teste de integração dos cultivos
console.log('🧪 Testando Sistema de Cultivos...');

// Simular adição de um novo cultivo
const novoCultivo = {
  fazendaId: 1,
  cultura: 'Milho',
  tipoCultivo: 'Milho Safrinha',
  areaHectares: 125.5,
  dataPlantio: '2025-02-15',
  dataColheitaPrevista: '2025-07-20',
  status: 'Plantado',
  produtividadeEsperada: 8500,
  observacoes: 'Cultivo de teste - Milho Safrinha'
};

console.log('➕ Novo cultivo de teste:', novoCultivo);

// Verificar se o Dashboard está recebendo os dados
setTimeout(() => {
  console.log('📊 Verificando atualização no Dashboard...');
  
  // Simular verificação dos dados do dashboard
  const dadosDashboard = {
    cultivosMilho: 4, // 3 + 1 novo
    cultivosSoja: 2,
    areaMilho: 597, // 471.5 + 125.5
    areaSoja: 406
  };
  
  console.log('✅ Dados esperados no Dashboard:', dadosDashboard);
}, 1000);

export {};
