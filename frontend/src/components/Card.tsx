/**
 * Componente Card reutilizável para o Sistema Agropecuário
 * Usado em dashboards e seções de dados
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className = '',
  children,
  onClick
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
        p-6 transition-all duration-200 hover:shadow-md
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header do card */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {Icon && (
            <div className="p-2 bg-amber-50 dark:bg-green-900 rounded-lg">
              <Icon className="w-5 h-5 text-amber-600 dark:text-green-400" />
            </div>
          )}
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </h3>
        </div>
        
        {/* Indicador de tendência */}
        {trend && (
          <div className={`flex items-center text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-500'
          }`}>
            <span className="font-medium">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <svg
              className={`w-4 h-4 ml-1 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-blue-700 dark:text-white">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Conteúdo adicional */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}

      {/* Label da tendência */}
      {trend && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {trend.label}
        </p>
      )}
    </div>
  );
};

// Componente especializado para métricas simples
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  color?: 'green' | 'blue' | 'yellow' | 'red';
  className?: string;
}> = ({ title, value, unit, icon: Icon, color = 'green', className = '' }) => {
  const colorClasses = {
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-white">
            {value} {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de card para fazendas
export const FarmCard: React.FC<{
  name: string;
  owner: string;
  hectares: number;
  location: string;
  crops: number;
  onClick?: () => void;
}> = ({ name, owner, hectares, location, crops, onClick }) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-700 dark:text-white">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {owner}
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
          Ativa
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Área</p>
          <p className="font-medium text-blue-700 dark:text-white">{hectares} ha</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Localização</p>
          <p className="font-medium text-blue-700 dark:text-white">{location}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {crops} cultivos ativos
        </p>
      </div>
    </div>
  );
};

export default Card;
