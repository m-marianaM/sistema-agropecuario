/**
 * Componente de teste para verificar integração entre Fazendas e Dashboard
 */

import React, { useState } from 'react';
import { useFazendas } from '../context/FazendasContext';

const TesteFazenda: React.FC = () => {
  const { adicionarFazenda, fazendas } = useFazendas();
  const [loading, setLoading] = useState(false);

  const adicionarFazendaTeste = async () => {
    setLoading(true);
    
    const novaFazenda = {
      id: Date.now(),
      nome: `Fazenda Teste ${fazendas.length + 1}`,
      proprietario: 'Maria Fernandes',
      area: 150 + Math.random() * 100,
      endereco: {
        rua: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      },
      telefone: '(11) 98765-4321',
      email: 'teste@fazenda.com',
      realizaRacao: true,
      realizaNutricao: true,
      status: 'ativa' as const,
      cultivos: ['Milho', 'Soja'],
      funcionarios: [],
      dataAquisicao: new Date().toISOString(),
      valorCompra: 500000,
      producaoAnual: 300,
      custoOperacional: 50000
    };

    try {
      await adicionarFazenda(novaFazenda);
      console.log('✅ Fazenda de teste adicionada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao adicionar fazenda de teste:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-blue-700 dark:text-white">
        🧪 Teste de Integração
      </h3>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-500 dark:text-gray-300">
          <p><strong className="text-blue-700 dark:text-white">Total de fazendas:</strong> {fazendas.length}</p>
          <p><strong className="text-blue-700 dark:text-white">Última atualização:</strong> {new Date().toLocaleTimeString()}</p>
        </div>
        
        <button
          onClick={adicionarFazendaTeste}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 
                     text-white px-4 py-2 rounded-lg transition-colors
                     disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {loading ? '⏳ Adicionando...' : '➕ Adicionar Fazenda Teste'}
        </button>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Este botão adiciona uma fazenda de teste para verificar se o dashboard atualiza automaticamente.
          Abra o console (F12) para ver os logs detalhados.
        </div>
      </div>
    </div>
  );
};

export default TesteFazenda;
