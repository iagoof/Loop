/**
 * @file Modal para Registro de Nova Venda
 * @description Este componente fornece um formulário modal para criar uma nova venda
 * ou editar uma existente. Ele busca dinamicamente os clientes do representante e os
 * planos disponíveis para preencher os seletores, garantindo a integridade dos dados.
 */
import React, { useState, useEffect } from 'react';
import { Sale, Client, Plan } from '../types';
import { XIcon } from './icons';
import * as db from '../services/database';
import { useToast } from '../contexts/ToastContext';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: Pick<Sale, 'clientId' | 'plan' | 'value' | 'date'>, id?: number) => void;
  initialData?: Sale | null; // Dados da venda para edição
  repClients?: Client[]; // Lista de clientes do representante logado
  allClients?: Client[]; // Lista de todos os clientes (para Admin)
}

const NewSaleModal: React.FC<NewSaleModalProps> = ({ isOpen, onClose, onSave, initialData, repClients, allClients }) => {
  // Estados para cada campo do formulário
  const [clientId, setClientId] = useState<string>('');
  const [plan, setPlan] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const { addToast } = useToast();
  
  // Efeito para inicializar o formulário quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
        // Carrega os planos disponíveis do banco de dados simulado
        setAvailablePlans(db.getPlans());
        
        if (initialData) { // Se for modo de edição, preenche os campos com dados existentes
            setClientId(String(initialData.clientId));
            setPlan(initialData.plan);
            setValue(initialData.value.toLocaleString('pt-BR')); // Formata o valor para exibição
            // Ajusta a data do formato 'DD/MM/YYYY' para 'YYYY-MM-DD' para o input type="date"
            setDate(initialData.date.split('/').reverse().join('-'));
        } else {
            // Se for nova venda, reseta o formulário
            setClientId('');
            setPlan('');
            setValue('');
            setDate(new Date().toISOString().split('T')[0]); // Define a data de hoje como padrão
        }
    }
  }, [isOpen, initialData]);
  
  if (!isOpen) return null;

  const handleSave = () => {
    if(clientId && plan && value && date){
        onSave(
          {
            clientId: Number(clientId),
            plan,
            // Converte o valor de volta para um número float
            value: parseFloat(value.replace(/\./g, '').replace(',', '.')),
            // Converte a data de volta para o formato 'DD/MM/YYYY'
            date: new Date(date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
          }, 
          initialData?.id // Passa o ID se estiver editando
        );
        onClose(); // Fecha o modal após salvar
    } else {
        addToast("Por favor, preencha todos os campos.", "error");
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const clientList = allClients || repClients || [];

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl transform transition-transform duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{initialData ? 'Editar Venda' : 'Registrar Nova Venda'}</h3>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Fechar modal">
            <XIcon />
          </button>
        </div>
        <div className="p-6">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
             <div>
                <label htmlFor="client" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
                <select id="client" name="client" value={clientId} onChange={e => setClientId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200">
                    <option value="">Selecione um cliente</option>
                    {clientList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
            <div>
              <label htmlFor="plan" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Plano de Consórcio</label>
              <select id="plan" name="plan" value={plan} onChange={e => setPlan(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200">
                <option value="">Selecione um plano</option>
                {availablePlans.map(p => (
                    <option key={p.id} value={p.name}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="value" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor da Carta (R$)</label>
                <input type="text" id="value" name="value" placeholder="Ex: 50.000,00" value={value} onChange={e => setValue(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200" />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Data da Venda</label>
                <input type="date" id="date" name="date" value={date} onChange={e => setDate(e.target.value)} max={today} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200" />
              </div>
            </div>
          </form>
        </div>
        <div className="flex justify-end items-center p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
          <button onClick={onClose} className="text-slate-600 dark:text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 mr-3">Cancelar</button>
          <button onClick={handleSave} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105">
            Salvar Venda
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSaleModal;