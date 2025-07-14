/**
 * � Componente reutilizável CardCultivo
 *
 * 👉 Este componente exibe visualmente os dados de um cultivo (milho ou soja) com base em suas propriedades.
 * 👉 Ao clicar no card ou nos botões de ação, deve abrir um modal que utiliza o mesmo formulário para:
 *    - Criar novo cultivo (modo: criação)
 *    - Editar cultivo existente (modo: edição)
 *
 * Requisitos para integração:
 * - O modal de edição deve receber um objeto `cultivo` (vazio ou preenchido) e um callback `onSave`.
 * - O botão "Editar" e o clique no card devem chamar `onEditar(cultivo)` com os dados do cultivo atual.
 * - O botão "Excluir" deve chamar `onRemover(cultivo.id)` após confirmação.
 * - Estilização responsiva e escura já suportada com `isDark`.
 *
 * @author Sistema Agropecuário
 * @version 2.0
 */

import React from 'react';
import { Calendar, MapPin, Package, Trash2, Eye, Edit } from 'lucide-react';
import { Cultivo } from '../context/FazendasContext';
import styles from './CardCultivo.module.css';

interface CardCultivoProps {
  cultivo: Cultivo;
  nomeFazenda: string;
  onRemover: (id: number) => void;
  onEditar: (cultivo: Cultivo) => void;
  isDark: boolean;
}

const CardCultivo: React.FC<CardCultivoProps> = ({
  cultivo,
  nomeFazenda,
  onRemover,
  onEditar,
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
    switch (status.toLowerCase()) {
      case 'plantado': return '🌱';
      case 'crescimento': return '🌿';
      case 'colhido': return '🚜';
      case 'perdido': return '⚠️';
      default: return '🌱';
    }
  };

  // Função para obter emoji da cultura
  const getCulturaEmoji = (cultura: string) => {
    const culturaLower = cultura?.toLowerCase() || '';
    if (culturaLower.includes('milho')) return '🌽';
    if (culturaLower.includes('soja')) return '🌿';
    return '🌾';
  };

  // const statusColors = getStatusColor(cultivo.status);

  return (
    <div
      className={styles.cardCultivo}
      style={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '20px',
        padding: '0',
        boxShadow: isDark 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)' 
          : '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        background: isDark 
          ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
      onClick={() => onEditar(cultivo)}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        target.style.transform = 'translateY(-8px) scale(1.02)';
        target.style.boxShadow = isDark 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 20px 25px -5px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        target.style.transform = 'translateY(0) scale(1)';
        target.style.boxShadow = isDark 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)' 
          : '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Header colorido moderno com cultura */}
      <div 
        className={cultivo.cultura === 'Milho' || cultivo.tipoCultura === 'Milho' ? styles.headerMilho : styles.headerSoja}
        style={{
          padding: '24px 28px 20px 28px',
          borderRadius: '20px 20px 0 0',
          position: 'relative',
          background: cultivo.cultura === 'Milho' || cultivo.tipoCultura === 'Milho' 
            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)' 
            : 'linear-gradient(135deg, #10b981 0%, #059669 40%, #047857 100%)',
          backgroundSize: '200% 200%',
          backgroundPosition: '0% 50%',
          transition: 'background-position 0.5s ease',
        }}
        onMouseEnter={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.backgroundPosition = '100% 50%';
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.backgroundPosition = '0% 50%';
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#ffffff',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
              letterSpacing: '-0.025em'
            }}>
              <span style={{ fontSize: '24px' }}>
                {getCulturaEmoji(cultivo.tipoCultivo || cultivo.cultura || 'Milho')}
              </span>
              {cultivo.tipoCultivo || cultivo.cultura || 'Cultura'}
            </h3>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.95)',
              margin: 0,
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              {cultivo.variedade || 'Variedade não informada'}
            </p>
          </div>

          <div
            className={styles.statusBadge}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.35)';
              target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              target.style.transform = 'scale(1)';
            }}
          >
            {getStatusEmoji(cultivo.status)} {cultivo.status}
          </div>
        </div>
      </div>

      {/* Conteúdo principal moderno */}
      <div style={{ padding: '28px 28px 24px 28px' }}>
        {/* Informações principais em grid moderno */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Fazenda */}
          <div 
            className={styles.infoCard}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)' 
                : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              borderRadius: '16px',
              padding: '16px',
              border: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`,
              boxShadow: isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.transform = 'translateY(-2px)';
              target.style.boxShadow = isDark 
                ? '0 8px 12px -1px rgba(0, 0, 0, 0.3)' 
                : '0 8px 12px -1px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <MapPin size={18} style={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: isDark ? '#60a5fa' : '#3b82f6',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                Fazenda
              </span>
            </div>
            <p style={{
              fontSize: '16px',
              color: isDark ? '#f9fafb' : '#1e293b',
              margin: 0,
              fontWeight: '700'
            }}>
              {nomeFazenda}
            </p>
          </div>

          {/* Área */}
          <div 
            className={styles.infoCard}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)' 
                : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              borderRadius: '16px',
              padding: '16px',
              border: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`,
              boxShadow: isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.transform = 'translateY(-2px)';
              target.style.boxShadow = isDark 
                ? '0 8px 12px -1px rgba(0, 0, 0, 0.3)' 
                : '0 8px 12px -1px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '18px'
              }}>📏</span>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: isDark ? '#fbbf24' : '#f59e0b',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                Área
              </span>
            </div>
            <p style={{
              fontSize: '16px',
              color: isDark ? '#f9fafb' : '#1e293b',
              margin: 0,
              fontWeight: '700'
            }}>
              {cultivo.areaHectares.toLocaleString('pt-BR')} ha
            </p>
          </div>

          {/* Data Plantio */}
          <div 
            className={styles.infoCard}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)' 
                : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              borderRadius: '16px',
              padding: '16px',
              border: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`,
              boxShadow: isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.transform = 'translateY(-2px)';
              target.style.boxShadow = isDark 
                ? '0 8px 12px -1px rgba(0, 0, 0, 0.3)' 
                : '0 8px 12px -1px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <Calendar size={18} style={{ color: isDark ? '#34d399' : '#10b981' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: isDark ? '#34d399' : '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                Plantio
              </span>
            </div>
            <p style={{
              fontSize: '16px',
              color: isDark ? '#f9fafb' : '#1e293b',
              margin: 0,
              fontWeight: '700'
            }}>
              {new Date(cultivo.dataPlantio).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Data Colheita */}
          <div 
            className={styles.infoCard}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)' 
                : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              borderRadius: '16px',
              padding: '16px',
              border: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`,
              boxShadow: isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.transform = 'translateY(-2px)';
              target.style.boxShadow = isDark 
                ? '0 8px 12px -1px rgba(0, 0, 0, 0.3)' 
                : '0 8px 12px -1px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <Calendar size={18} style={{ color: isDark ? '#a78bfa' : '#8b5cf6' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: isDark ? '#a78bfa' : '#8b5cf6',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                Colheita
              </span>
            </div>
            <p style={{
              fontSize: '16px',
              color: isDark ? '#f9fafb' : '#1e293b',
              margin: 0,
              fontWeight: '700'
            }}>
              {cultivo.dataColheitaPrevista 
                ? new Date(cultivo.dataColheitaPrevista).toLocaleDateString('pt-BR')
                : 'Não definida'
              }
            </p>
          </div>
        </div>

        {/* Seções especiais em layout horizontal */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* Fertilizante (se informado) */}
          {cultivo.fertilizanteTipo && (
            <div 
              className={styles.fertilizanteCard}
              style={{
                borderRadius: '12px',
                padding: '14px',
                flex: '1'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Package size={16} style={{ color: isDark ? '#93c5fd' : '#1e40af' }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDark ? '#93c5fd' : '#1e40af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Fertilizante
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: isDark ? '#dbeafe' : '#1e40af',
                margin: '0 0 4px 0',
                fontWeight: '600'
              }}>
                {cultivo.fertilizanteTipo}
              </p>
              {cultivo.fertilizanteQuantidade && (
                <p style={{
                  fontSize: '12px',
                  color: isDark ? '#93c5fd' : '#3730a3',
                  margin: 0
                }}>
                  {cultivo.fertilizanteQuantidade.toLocaleString('pt-BR')} kg
                </p>
              )}
            </div>
          )}

          {/* Produção estimada (se informada) */}
          {cultivo.producaoEstimadaTon && (
            <div 
              className={styles.producaoCard}
              style={{
                borderRadius: '12px',
                padding: '14px',
                flex: '1'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '16px'
                }}>📈</span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDark ? '#6ee7b7' : '#065f46',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Produção
                </span>
              </div>
              <p style={{
                fontSize: '16px',
                color: isDark ? '#d1fae5' : '#047857',
                margin: 0,
                fontWeight: 'bold'
              }}>
                {cultivo.producaoEstimadaTon.toLocaleString('pt-BR')} ton
              </p>
            </div>
          )}
        </div>

        {/* Botões de ação modernizados */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          paddingTop: '20px'
        }}>
          <button
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              onEditar(cultivo);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              backgroundColor: 'transparent',
              border: `2px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '12px',
              color: isDark ? '#f9fafb' : '#374151',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.backgroundColor = isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.8)';
              target.style.borderColor = isDark ? '#6b7280' : '#9ca3af';
              target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.backgroundColor = 'transparent';
              target.style.borderColor = isDark ? '#4b5563' : '#d1d5db';
              target.style.transform = 'translateY(0)';
            }}
          >
            <Eye size={16} /> Ver Detalhes
          </button>

          <button
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              onEditar(cultivo);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
              target.style.transform = 'translateY(-2px)';
              target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
          >
            <Edit size={16} /> Editar
          </button>

          <button
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Confirma a remoção do cultivo de ${cultivo.tipoCultivo || cultivo.cultura}?`)) {
                onRemover(cultivo.id);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
              target.style.transform = 'translateY(-2px)';
              target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.6)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
          >
            <Trash2 size={16} /> Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCultivo;
