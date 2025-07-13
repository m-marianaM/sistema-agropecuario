import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Package, FileText } from 'lucide-react';
import { Cultivo, Fazenda } from '../context/FazendasContext';

interface CultivoFormProps {
  cultivo?: Cultivo | null;
  fazendas: Fazenda[];
  onSave: (dadosCultivo: Partial<Cultivo>) => void;
  onClose: () => void;
  isDark: boolean;
}

const CultivoForm: React.FC<CultivoFormProps> = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '600px'
      }}>
        <h2>Formulário de Cultivo</h2>
        <p>Componente em desenvolvimento...</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default CultivoForm;
