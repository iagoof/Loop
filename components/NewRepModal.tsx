/**
 * @file Modal para Adicionar/Editar Representante
 * @description Este componente fornece um formulário modal que é reutilizado
 * tanto para criar um novo representante quanto para editar um existente.
 * Ele é preenchido com dados iniciais quando em modo de edição.
 */
import React, { useState, useEffect } from 'react';
import { Representative } from '../types';
import { XIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

interface NewRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRep: Omit<Representative, 'id' | 'sales' | 'status'>, id?: number) => void;
  initialData?: Representative | null; // Dados para preencher o formulário em modo de edição
}

const NewRepModal: React.FC<NewRepModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const { addToast } = useToast();

  // Efeito para popular ou resetar o formulário quando o modal abre
  useEffect(() => {
      if(isOpen) {
          if (initialData) { // Modo de edição
              setName(initialData.name);
              setEmail(initialData.email);
              setCommissionRate(String(initialData.commissionRate));
          } else { // Modo de adição
              setName('');
              setEmail('');
              setCommissionRate('');
          }
      }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name && email && commissionRate) {
      onSave({
        name,
        email,
        commissionRate: parseFloat(commissionRate),
      }, initialData?.id); // Passa o ID se estiver editando
      onClose();
    } else {
      addToast("Por favor, preencha todos os campos.", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{initialData ? 'Editar Representante' : 'Adicionar Novo Representante'}</h3>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Fechar modal">
            <XIcon />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="rep-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
            <input type="text" id="rep-name" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label htmlFor="rep-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input type="email" id="rep-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label htmlFor="rep-commission" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Taxa de Comissão (%)</label>
            <input type="number" id="rep-commission" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500" />
          </div>
        </form>
        <div className="flex justify-end items-center p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700">
          <button onClick={onClose} className="text-slate-600 dark:text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 mr-3">Cancelar</button>
          <button onClick={handleSave} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default NewRepModal;