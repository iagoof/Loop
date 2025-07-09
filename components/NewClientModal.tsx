
import React, { useState } from 'react';
import { Client } from '../types';
import { XIcon } from './icons';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newClient: Omit<Client, 'id'>) => void;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('Nenhum');
  const [status, setStatus] = useState<'Cliente Ativo' | 'Lead' | 'Inativo'>('Lead');

  if (!isOpen) return null;

  const handleSave = () => {
    if (name && phone && status) {
      onSave({ name, phone, plan, status });
      onClose();
    } else {
      alert("Por favor, preencha nome, telefone e status.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Adicionar Cliente ou Lead</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status Inicial</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="Lead">Lead</option>
              <option value="Cliente Ativo">Cliente Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
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

export default NewClientModal;
