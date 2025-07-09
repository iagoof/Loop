
import React, { useState } from 'react';
import { Sale, SaleStatus } from '../types';
import { XIcon } from './icons';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSale: Omit<Sale, 'id' | 'status'>) => void;
}

const NewSaleModal: React.FC<NewSaleModalProps> = ({ isOpen, onClose, onSave }) => {
  const [clientName, setClientName] = useState('');
  const [plan, setPlan] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  
  if (!isOpen) return null;

  const handleSave = () => {
    if(clientName && plan && value && date){
        onSave({
            clientName,
            plan,
            value: parseFloat(value.replace('.', '').replace(',', '.')),
            date: new Date(date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
        });
        onClose();
    } else {
        alert("Por favor, preencha todos os campos.");
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-transform duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Registrar Nova Venda</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <XIcon />
          </button>
        </div>
        <div className="p-6">
          <form className="space-y-6">
            <div>
              <label htmlFor="client" className="block text-sm font-semibold text-slate-700 mb-1">Cliente</label>
              <select id="client" name="client" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition">
                <option value="">Selecione um cliente</option>
                <option>Maria Oliveira</option>
                <option>João Silva</option>
                <option>Carlos Pereira</option>
                <option>Beatriz Lima</option>
                <option>Ricardo Alves</option>
              </select>
            </div>
            <div>
              <label htmlFor="plan" className="block text-sm font-semibold text-slate-700 mb-1">Plano de Consórcio</label>
              <select id="plan" name="plan" value={plan} onChange={e => setPlan(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition">
                <option value="">Selecione um plano</option>
                <option>Consórcio de Imóvel</option>
                <option>Consórcio de Automóvel</option>
                <option>Consórcio de Serviços</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="value" className="block text-sm font-semibold text-slate-700 mb-1">Valor da Carta (R$)</label>
                <input type="text" id="value" name="value" placeholder="Ex: 50000,00" value={value} onChange={e => setValue(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition" />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-1">Data da Venda</label>
                <input type="date" id="date" name="date" value={date} onChange={e => setDate(e.target.value)} max={today} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition" />
              </div>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-1">Observações</label>
              <textarea id="notes" name="notes" rows={3} placeholder="Adicione detalhes importantes sobre a venda..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"></textarea>
            </div>
          </form>
        </div>
        <div className="flex justify-end items-center p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <button onClick={onClose} className="text-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 mr-3">Cancelar</button>
          <button onClick={handleSave} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105">
            Salvar Venda
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSaleModal;
