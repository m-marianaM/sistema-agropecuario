import React, { useState } from 'react';
import { Cultivo, Fazenda } from '../context/FazendasContext';

interface CultivoFormProps {
  onSubmit: (cultivo: Partial<Cultivo>) => void;
  onCancel: () => void;
  fazendas: Fazenda[];
  cultivoEdit?: Cultivo | null;
}

const CultivoForm: React.FC<CultivoFormProps> = ({ 
  onSubmit, 
  onCancel, 
  fazendas, 
  cultivoEdit 
}) => {
  const [formData, setFormData] = useState({
    fazendaId: cultivoEdit?.fazendaId || '',
    cultura: cultivoEdit?.cultura || 'Milho' as const,
    areaHectares: cultivoEdit?.areaHectares || '',
    dataPlantio: cultivoEdit?.dataPlantio || '',
    dataColheitaPrevista: cultivoEdit?.dataColheitaPrevista || '',
    status: cultivoEdit?.status || 'Plantado' as const,
    observacoes: cultivoEdit?.observacoes || '',
    tipoCultivo: cultivoEdit?.tipoCultivo || 'Milho Verão' as const,
    produtividadeEsperada: cultivoEdit?.produtividadeEsperada || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      fazendaId: typeof formData.fazendaId === 'string' ? parseInt(formData.fazendaId) : formData.fazendaId,
      cultura: formData.cultura,
      tipoCultivo: formData.tipoCultivo,
      areaHectares: typeof formData.areaHectares === 'string' ? parseFloat(formData.areaHectares) : formData.areaHectares,
      dataPlantio: formData.dataPlantio,
      dataColheitaPrevista: formData.dataColheitaPrevista,
      status: formData.status,
      observacoes: formData.observacoes,
      produtividadeEsperada: typeof formData.produtividadeEsperada === 'string' ? parseFloat(formData.produtividadeEsperada) : formData.produtividadeEsperada,
      adubacoes: [],
      defensivos: []
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Se mudou a cultura, atualizar automaticamente o tipoCultivo
    if (name === 'cultura') {
      const novoTipoCultivo = value === 'Milho' ? 'Milho Verão' : 'Soja Precoce';
      setFormData(prev => ({
        ...prev,
        cultura: value as 'Milho' | 'Soja',
        tipoCultivo: novoTipoCultivo as 'Milho Verão' | 'Milho Safrinha' | 'Soja Precoce' | 'Soja Tardia'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="fazendaId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fazenda
          </label>
          <select
            id="fazendaId"
            name="fazendaId"
            value={formData.fazendaId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Selecione uma fazenda</option>
            {fazendas.map((fazenda) => (
              <option key={fazenda.id} value={fazenda.id}>
                {fazenda.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cultura" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cultura
          </label>
          <select
            id="cultura"
            name="cultura"
            value={formData.cultura}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="Milho">Milho</option>
            <option value="Soja">Soja</option>
          </select>
        </div>

        <div>
          <label htmlFor="tipoCultivo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de Cultivo
          </label>
          <select
            id="tipoCultivo"
            name="tipoCultivo"
            value={formData.tipoCultivo}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            {formData.cultura === 'Milho' ? (
              <>
                <option value="Milho Verão">Milho Verão</option>
                <option value="Milho Safrinha">Milho Safrinha</option>
              </>
            ) : (
              <>
                <option value="Soja Precoce">Soja Precoce</option>
                <option value="Soja Tardia">Soja Tardia</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="areaHectares" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Área (hectares)
          </label>
          <input
            type="number"
            id="areaHectares"
            name="areaHectares"
            value={formData.areaHectares}
            onChange={handleInputChange}
            required
            min="0.1"
            step="0.1"
            placeholder="0.0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="Plantado">Plantado</option>
            <option value="Crescimento">Crescimento</option>
            <option value="Floração">Floração</option>
            <option value="Maturação">Maturação</option>
            <option value="Colhido">Colhido</option>
          </select>
        </div>

        <div>
          <label htmlFor="produtividadeEsperada" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Produtividade Esperada (kg/ha)
          </label>
          <input
            type="number"
            id="produtividadeEsperada"
            name="produtividadeEsperada"
            value={formData.produtividadeEsperada}
            onChange={handleInputChange}
            required
            min="0"
            step="0.1"
            placeholder="0.0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="dataPlantio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data de Plantio
          </label>
          <input
            type="date"
            id="dataPlantio"
            name="dataPlantio"
            value={formData.dataPlantio}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="dataColheitaPrevista" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data de Colheita Prevista
          </label>
          <input
            type="date"
            id="dataColheitaPrevista"
            name="dataColheitaPrevista"
            value={formData.dataColheitaPrevista}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleInputChange}
          rows={3}
          placeholder="Observações sobre o cultivo..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {cultivoEdit ? 'Atualizar' : 'Cadastrar'} Cultivo
        </button>
      </div>
    </form>
  );
};

export default CultivoForm;
