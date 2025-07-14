// Componente EditCultivoModal
// Este modal é utilizado para editar informações de um cultivo (soja ou milho) dentro do sistema agro.
// Ele é responsivo, centralizado e usa ícones para cada campo, com suporte a edição dos dados do cultivo.
// Os dados podem ser integrados com um context ou API para salvamento posterior.

import React, { useState, useEffect } from 'react';
import { Cultivo, Fazenda } from '../context/FazendasContext';

interface EditCultivoModalProps {
  onClose: () => void;
  onSubmit: (dadosCultivo: Partial<Cultivo>) => Promise<void>;
  cultivoSelecionado?: Cultivo | null;
  fazendas: Fazenda[];
}

export default function EditCultivoModal({ 
  onClose, 
  onSubmit, 
  cultivoSelecionado, 
  fazendas 
}: EditCultivoModalProps) {
  const [formData, setFormData] = useState({
    fazendaId: '',
    cultura: 'Soja' as 'Soja' | 'Milho',
    produtividadeEsperada: '',
    areaHectares: '',
    dataPlantio: '',
    dataColheitaPrevista: '',
    status: 'Plantado' as 'Plantado' | 'Crescimento' | 'Floração' | 'Maturação' | 'Colhido',
    tipoFertilizante: '',
    quantidadeFertilizante: '',
    observacoes: ''
  });

  useEffect(() => {
    if (cultivoSelecionado) {
      setFormData({
        fazendaId: cultivoSelecionado.fazendaId?.toString() || '',
        cultura: cultivoSelecionado.cultura || 'Soja',
        produtividadeEsperada: cultivoSelecionado.produtividadeEsperada?.toString() || '',
        areaHectares: cultivoSelecionado.areaHectares?.toString() || '',
        dataPlantio: cultivoSelecionado.dataPlantio 
          ? new Date(cultivoSelecionado.dataPlantio).toISOString().split('T')[0] 
          : '',
        dataColheitaPrevista: cultivoSelecionado.dataColheitaPrevista 
          ? new Date(cultivoSelecionado.dataColheitaPrevista).toISOString().split('T')[0] 
          : '',
        status: cultivoSelecionado.status || 'Plantado',
        tipoFertilizante: '',
        quantidadeFertilizante: '',
        observacoes: cultivoSelecionado.observacoes || ''
      });
    }
  }, [cultivoSelecionado]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dadosParaSalvar: Partial<Cultivo> = {
      cultura: formData.cultura,
      fazendaId: parseInt(formData.fazendaId),
      areaHectares: parseFloat(formData.areaHectares),
      dataPlantio: formData.dataPlantio,
      dataColheitaPrevista: formData.dataColheitaPrevista,
      status: formData.status,
      observacoes: formData.observacoes,
      produtividadeEsperada: parseFloat(formData.produtividadeEsperada) || 0,
      adubacoes: [],
      defensivos: []
    };

    if (cultivoSelecionado?.id) {
      dadosParaSalvar.id = cultivoSelecionado.id;
    }

    await onSubmit(dadosParaSalvar);
    onClose();
  };

  return (
    // Modal de fundo escuro e centralização
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
      onClick={onClose}
    >
      {/* Container do formulário */}
      <div 
        className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Botão de fechar o modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-lg transition-colors"
          aria-label="Fechar"
        >
          ❌
        </button>

        {/* Título com ícone */}
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          🌱 {cultivoSelecionado ? 'Editar Cultivo' : 'Novo Cultivo'}
        </h2>

        {/* Formulário do cultivo */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          
          {/* Seleção de fazenda */}
          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium mb-1">📍 Fazenda</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.fazendaId}
              onChange={(e) => handleChange('fazendaId', e.target.value)}
              required
            >
              <option value="">Selecione a fazenda</option>
              {fazendas.map((fazenda) => (
                <option key={fazenda.id} value={fazenda.id}>
                  {fazenda.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de cultura (Soja ou Milho) */}
          <div>
            <label className="block font-medium mb-1">🌾 Tipo de Cultura</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.cultura}
              onChange={(e) => handleChange('cultura', e.target.value)}
              required
            >
              <option value="Soja">� Soja</option>
              <option value="Milho">🌽 Milho</option>
            </select>
          </div>

          {/* Produtividade esperada */}
          <div>
            <label className="block font-medium mb-1">📊 Produtividade Esperada (kg/ha)</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
              placeholder="2981"
              value={formData.produtividadeEsperada}
              onChange={(e) => handleChange('produtividadeEsperada', e.target.value)}
              required
            />
          </div>

          {/* Área */}
          <div>
            <label className="block font-medium mb-1">📐 Área (hectares)</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
              placeholder="80.5"
              value={formData.areaHectares}
              onChange={(e) => handleChange('areaHectares', e.target.value)}
              required
            />
          </div>

          {/* Datas de plantio e colheita */}
          <div>
            <label className="block font-medium mb-1">📅 Data de Plantio</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.dataPlantio}
              onChange={(e) => handleChange('dataPlantio', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">🌿 Colheita Prevista</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.dataColheitaPrevista}
              onChange={(e) => handleChange('dataColheitaPrevista', e.target.value)}
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-medium mb-1">⚡ Status Atual</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="Plantado">🌱 Plantado</option>
              <option value="Crescimento">🌿 Crescimento</option>
              <option value="Floração">🌻 Floração</option>
              <option value="Maturação">🌾 Maturação</option>
              <option value="Colhido">📦 Colhido</option>
            </select>
          </div>

          {/* Tipo de fertilizante */}
          <div>
            <label className="block font-medium mb-1">🧪 Tipo de Fertilizante</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.tipoFertilizante}
              onChange={(e) => handleChange('tipoFertilizante', e.target.value)}
            >
              <option value="">Selecione o fertilizante</option>
              <option value="NPK 10-10-10">🧪 NPK 10-10-10</option>
              <option value="NPK 20-05-20">🧪 NPK 20-05-20</option>
              <option value="Ureia">🧪 Ureia</option>
              <option value="MAP">🧪 MAP</option>
              <option value="Superfosfato Simples">🧪 Superfosfato Simples</option>
            </select>
          </div>

          {/* Quantidade aplicada */}
          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium mb-1">⚖️ Quantidade (kg)</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
              placeholder="Ex: 300"
              value={formData.quantidadeFertilizante}
              onChange={(e) => handleChange('quantidadeFertilizante', e.target.value)}
            />
          </div>

          {/* Observações gerais */}
          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium mb-1">📝 Observações</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              rows={3}
              placeholder="Primeira safra da temporada"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
            />
          </div>

          {/* Botões de ação */}
          <div className="col-span-1 md:col-span-2 mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-6 py-2 rounded-lg transition-colors"
            >
              🚫 Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-2 rounded-lg transition-colors"
            >
              ✅ {cultivoSelecionado ? 'Salvar Alterações' : 'Criar Cultivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
