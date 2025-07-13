/**
 * 🌱 Componente CardCultivo
 * 
 * Card para exibir informações de um cultivo in        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: isDark ? '#f9fafb' : '#111827',
            margin: '0 0 4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {getCulturaEmoji(cultivo.tipoCultivo || cultivo.cultura || 'Milho')} {cultivo.cultura || cultivo.tipoCultivo || 'Cultura'}
          </h3>
          <p style={{
            fontSize: '14px',
            color: isDark ? '#9ca3af' : '#6b7280',
            margin: 0,
            fontWeight: '600'
          }}>
            {cultivo.tipoCultivo || cultivo.variedade || 'Tipo não informado'}
          </p>
        </div>tus, área, fertilizante e ações disponíveis
 */

import React from 'react';
import { Calendar, MapPin, Package, Trash2, Eye } from 'lucide-react';
import { Cultivo } from '../context/FazendasContext';

interface CardCultivoProps {
  cultivo: Cultivo;
  nomeFazenda: string;
  onRemover: (id: number) => void;
  onDetalhes: (cultivo: Cultivo) => void;
  isDark: boolean;
}

const CardCultivo: React.FC<CardCultivoProps> = ({
  cultivo,
  nomeFazenda,
  onRemover,
  onDetalhes,
  isDark
}) => {
  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'plantado':
        return { bg: '#ecfdf5', text: '#065f46', border: '#10b981' };
      case 'crescimento':
        return { bg: '#fffbeb', text: '#92400e', border: '#f59e0b' };
      case 'colhido':
        return { bg: '#f0f9ff', text: '#1e40af', border: '#3b82f6' };
      case 'perdido':
        return { bg: '#fef2f2', text: '#991b1b', border: '#ef4444' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#6b7280' };
    }
  };

  // Função para obter emoji do status
  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'plantado': return '🌱';
      case 'crescimento': return '🌿';
      case 'colhido': return '🚜';
      case 'perdido': return '⚠️';
      default: return '❓';
    }
  };

  // Função para obter emoji da cultura
  const getCulturaEmoji = (cultura: string) => {
    switch (cultura) {
      case 'Milho': return '🌽';
      case 'Soja': return '🫘';
      default: return '🌾';
    }
  };

  const statusColors = getStatusColor(cultivo.status);

  return (
    <div
      style={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: isDark 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer'
      }}
      onClick={() => onDetalhes(cultivo)}
    >
      {/* Header com cultura e status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: isDark ? '#f9fafb' : '#111827',
            margin: '0 0 4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {getCulturaEmoji(cultivo.tipoCultura || cultivo.cultura || 'Milho')} {cultivo.tipoCultura || cultivo.cultura}
          </h3>
          <p style={{
            fontSize: '14px',
            color: isDark ? '#9ca3af' : '#6b7280',
            margin: 0
          }}>
            {cultivo.variedade || 'Variedade não informada'}
          </p>
        </div>

        <div
          style={{
            backgroundColor: statusColors.bg,
            color: statusColors.text,
            border: `1px solid ${statusColors.border}`,
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {getStatusEmoji(cultivo.status)} {cultivo.status}
        </div>
      </div>

      {/* Informações principais */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px'
          }}>
            <MapPin size={14} style={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              Fazenda
            </span>
          </div>
          <p style={{
            fontSize: '14px',
            color: isDark ? '#f9fafb' : '#111827',
            margin: 0,
            fontWeight: '500'
          }}>
            {nomeFazenda}
          </p>
        </div>

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              📏 Área
            </span>
          </div>
          <p style={{
            fontSize: '14px',
            color: isDark ? '#f9fafb' : '#111827',
            margin: 0,
            fontWeight: '500'
          }}>
            {cultivo.areaHectares.toLocaleString('pt-BR')} ha
          </p>
        </div>

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px'
          }}>
            <Calendar size={14} style={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              Plantio
            </span>
          </div>
          <p style={{
            fontSize: '14px',
            color: isDark ? '#f9fafb' : '#111827',
            margin: 0,
            fontWeight: '500'
          }}>
            {new Date(cultivo.dataPlantio).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px'
          }}>
            <Calendar size={14} style={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              Colheita
            </span>
          </div>
          <p style={{
            fontSize: '14px',
            color: isDark ? '#f9fafb' : '#111827',
            margin: 0,
            fontWeight: '500'
          }}>
            {cultivo.dataColheitaPrevista 
              ? new Date(cultivo.dataColheitaPrevista).toLocaleDateString('pt-BR')
              : 'Não definida'
            }
          </p>
        </div>
      </div>

      {/* Fertilizante (se informado) */}
      {cultivo.fertilizanteTipo && (
        <div style={{
          backgroundColor: isDark ? '#374151' : '#f9fafb',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px'
          }}>
            <Package size={14} style={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              Fertilizante
            </span>
          </div>
          <p style={{
            fontSize: '14px',
            color: isDark ? '#f9fafb' : '#111827',
            margin: '0 0 4px 0',
            fontWeight: '500'
          }}>
            {cultivo.fertilizanteTipo}
          </p>
          {cultivo.fertilizanteQuantidade && (
            <p style={{
              fontSize: '12px',
              color: isDark ? '#9ca3af' : '#6b7280',
              margin: 0
            }}>
              Quantidade: {cultivo.fertilizanteQuantidade.toLocaleString('pt-BR')} kg
            </p>
          )}
        </div>
      )}

      {/* Produção estimada (se informada) */}
      {cultivo.producaoEstimadaTon && (
        <div style={{
          backgroundColor: isDark ? '#065f46' : '#ecfdf5',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isDark ? '#a7f3d0' : '#065f46'
            }}>
              📈 Produção Estimada
            </span>
          </div>
          <p style={{
            fontSize: '16px',
            color: isDark ? '#d1fae5' : '#047857',
            margin: 0,
            fontWeight: 'bold'
          }}>
            {cultivo.producaoEstimadaTon.toLocaleString('pt-BR')} toneladas
          </p>
        </div>
      )}

      {/* Botões de ação */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        paddingTop: '16px'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetalhes(cultivo);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            backgroundColor: 'transparent',
            border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '6px',
            color: isDark ? '#f9fafb' : '#374151',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Eye size={14} /> Ver
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Confirma a remoção do cultivo de ${cultivo.tipoCultura}?`)) {
              onRemover(cultivo.id);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            backgroundColor: '#ef4444',
            border: 'none',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Trash2 size={14} /> Excluir
        </button>
      </div>
    </div>
  );
};

export default CardCultivo;
