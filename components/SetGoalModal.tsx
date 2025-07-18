/**
 * @file Modal para Definir Meta
 * @description Este componente fornece um formulário modal para que o administrador
 * possa definir ou atualizar a meta de vendas de um representante específico.
 */
import React, { useState, useEffect } from 'react';
import { Representative } from '../types';
import { XIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

interface SetGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (repId: number, goal: number) => void;
  representative: Representative;
}

const SetGoalModal: React.FC<SetGoalModalProps> = ({ isOpen, onClose, onSave, representative }) => {
  const [goal, setGoal] = useState('');
  const { addToast } = useToast();

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
      addToast("Por favor, insira um valor de meta válido.", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Definir Meta para {representative.name}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Fechar modal"><XIcon /></button>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label htmlFor="goal-value" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor da Meta Mensal (R$)</label>
                <input 
                    type="number" 
                    id="goal-value" 
                    value={goal} 
                    onChange={e => setGoal(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                    placeholder="Ex: 200000"
                />
            </div>
        </div>
        <div className="flex justify-end items-center p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="text-slate-600 dark:text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 mr-3">Cancelar</button>
          <button onClick={handleSave} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700">Salvar Meta</button>
        </div>
      </div>
    </div>
  );
};

export default SetGoalModal;