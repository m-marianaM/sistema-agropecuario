import React, { useState, useEffect } from 'react';
import { Cultivo, Fazenda } from '../context/FazendasContext';

interface CultivoFormProps {
  cultivoEdit?: Cultivo | null;
  fazendas: Fazenda[];
  onSubmit: (dadosCultivo: Partial<Cultivo>) => Promise<void>;
  onCancel: () => void;
  isDark?: boolean;
}

const CultivoFormModerno: React.FC<CultivoFormProps> = ({ 
  cultivoEdit, 
  fazendas, 
  onSubmit, 
  onCancel, 
  isDark = false
}) => {
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
    if (cultivoEdit) {
      setFormData({
        fazendaId: cultivoEdit.fazendaId?.toString() || '',
        cultura: cultivoEdit.cultura || 'Soja',
        produtividadeEsperada: cultivoEdit.produtividadeEsperada?.toString() || '',
        areaHectares: cultivoEdit.areaHectares?.toString() || '',
        dataPlantio: cultivoEdit.dataPlantio 
          ? new Date(cultivoEdit.dataPlantio).toISOString().split('T')[0] 
          : '',
        dataColheitaPrevista: cultivoEdit.dataColheitaPrevista 
          ? new Date(cultivoEdit.dataColheitaPrevista).toISOString().split('T')[0] 
          : '',
        status: cultivoEdit.status || 'Plantado',
        tipoFertilizante: '',
        quantidadeFertilizante: '',
        observacoes: cultivoEdit.observacoes || ''
      });
    }
  }, [cultivoEdit]);

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

    if (cultivoEdit?.id) {
      dadosParaSalvar.id = cultivoEdit.id;
    }

    await onSubmit(dadosParaSalvar);
    onCancel();
  };

  return (
    // Modal backdrop com centralização perfeita
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onCancel}
    >
      {/* Container do modal com design moderno */}
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 relative"
        style={{
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header moderno com gradiente */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 relative">
          <h2 className="text-xl font-semibold text-white flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            {cultivoEdit ? 'Editar Cultivo' : 'Novo Cultivo'}
          </h2>
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-white hover:text-red-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            aria-label="Fechar"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>

        {/* Corpo do formulário com scroll */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <form onSubmit={handleSubmit} className="p-6">
            
            {/* Seção 1: Informações Básicas */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <span>📍</span>
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Fazenda */}
                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🏡</span>
                    Fazenda
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white"
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

                {/* Cultura */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🌾</span>
                    Tipo de Cultura
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white"
                    value={formData.cultura}
                    onChange={(e) => handleChange('cultura', e.target.value)}
                    required
                  >
                    <option value="Soja">� Soja</option>
                    <option value="Milho">🌽 Milho</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>⚡</span>
                    Status Atual
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white"
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
              </div>
            </div>

            {/* Seção 2: Dimensões e Métricas */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <span>📊</span>
                Dimensões e Métricas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Área */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>📐</span>
                    Área (hectares)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white" 
                    placeholder="Ex: 80.5"
                    value={formData.areaHectares}
                    onChange={(e) => handleChange('areaHectares', e.target.value)}
                    required
                  />
                </div>

                {/* Produtividade */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>📈</span>
                    Produtividade Esperada (kg/ha)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white" 
                    placeholder="Ex: 2981"
                    value={formData.produtividadeEsperada}
                    onChange={(e) => handleChange('produtividadeEsperada', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Cronograma */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <span>📅</span>
                Cronograma
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Data de Plantio */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🌱</span>
                    Data de Plantio
                  </label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white"
                    value={formData.dataPlantio}
                    onChange={(e) => handleChange('dataPlantio', e.target.value)}
                    required
                  />
                </div>

                {/* Data de Colheita */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🌾</span>
                    Colheita Prevista
                  </label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white"
                    value={formData.dataColheitaPrevista}
                    onChange={(e) => handleChange('dataColheitaPrevista', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Fertilização */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <span>🧪</span>
                Fertilização
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Tipo de Fertilizante */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🧬</span>
                    Tipo de Fertilizante
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white"
                    value={formData.tipoFertilizante}
                    onChange={(e) => handleChange('tipoFertilizante', e.target.value)}
                  >
                    <option value="">Selecione o fertilizante</option>
                    <option value="NPK 10-10-10">💊 NPK 10-10-10</option>
                    <option value="NPK 20-05-20">💊 NPK 20-05-20</option>
                    <option value="Ureia">🔬 Ureia</option>
                    <option value="MAP">⚗️ MAP</option>
                    <option value="Superfosfato Simples">🧪 Superfosfato Simples</option>
                  </select>
                </div>

                {/* Quantidade */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>⚖️</span>
                    Quantidade (kg)
                  </label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white" 
                    placeholder="Ex: 300"
                    value={formData.quantidadeFertilizante}
                    onChange={(e) => handleChange('quantidadeFertilizante', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Seção 5: Observações */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <span>📝</span>
                Observações
              </h3>
              <textarea
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all bg-gray-50 hover:bg-white"
                rows={4}
                placeholder="Informações adicionais sobre o cultivo, condições do solo, clima, etc..."
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
              />
            </div>

          </form>
        </div>

        {/* Footer com botões modernos */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <span>🚫</span>
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <span>✅</span>
            {cultivoEdit ? 'Salvar Alterações' : 'Criar Cultivo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CultivoFormModerno;
