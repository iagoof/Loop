
import React, { useState, useEffect } from 'react';
import { Representative } from '../types';
import { XIcon } from './icons';

interface NewRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRep: Omit<Representative, 'id' | 'sales' | 'status'>, id?: number) => void;
  initialData?: Representative | null;
}

const NewRepModal: React.FC<NewRepModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commissionRate, setCommissionRate] = useState('');

  useEffect(() => {
      if(isOpen) {
          if (initialData) {
              setName(initialData.name);
              setEmail(initialData.email);
              setCommissionRate(String(initialData.commissionRate));
          } else {
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
      }, initialData?.id);
      onClose();
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">{initialData ? 'Editar Representante' : 'Adicionar Novo Representante'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <XIcon />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="rep-name" className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
            <input type="text" id="rep-name" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label htmlFor="rep-email" className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input type="email" id="rep-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label htmlFor="rep-commission" className="block text-sm font-semibold text-slate-700 mb-1">Taxa de Comissão (%)</label>
            <input type="number" id="rep-commission" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>
        <div className="flex justify-end items-center p-6 bg-slate-50 border-t">
          <button onClick={onClose} className="text-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 mr-3">Cancelar</button>
          <button onClick={handleSave} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default NewRepModal;