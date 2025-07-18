/**
 * @file Modal para Definir Meta
 * @description Este componente fornece um formulário modal para que o administrador
 * possa definir ou atualizar a meta de vendas de um representante específico.
 */
import React, { useState, useEffect } from 'react';
import { Representative } from '../types';
import { XIcon } from './icons';

interface SetGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (repId: number, goal: number) => void;
  representative: Representative;
}

const SetGoalModal: React.FC<SetGoalModalProps> = ({ isOpen, onClose, onSave, representative }) => {
  const [goal, setGoal] = useState('');

  // Efeito para popular o campo com a meta atual do representante
  useEffect(() => {
    if (isOpen) {
      setGoal(representative.goal ? String(representative.goal) : '');
    }
  }, [isOpen, representative]);

  if (!isOpen) return null;

  const handleSave = () => {
    const numericGoal = parseFloat(goal);
    if (!isNaN(numericGoal) && numericGoal >= 0) {
      onSave(representative.id, numericGoal);
      onClose();
    } else {
      alert("Por favor, insira um valor de meta válido.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Definir Meta para {representative.name}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Fechar modal"><XIcon /></button>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label htmlFor="goal-value" className="block text-sm font-semibold text-slate-700 mb-1">Valor da Meta Mensal (R$)</label>
                <input 
                    type="number" 
                    id="goal-value" 
                    value={goal} 
                    onChange={e => setGoal(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="Ex: 200000"
                />
            </div>
        </div>
        <div className="flex justify-end items-center p-6 bg-slate-50 border-t">
          <button onClick={onClose} className="text-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 mr-3">Cancelar</button>
          <button onClick={handleSave} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700">Salvar Meta</button>
        </div>
      </div>
    </div>
  );
};

export default SetGoalModal;