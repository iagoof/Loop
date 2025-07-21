/**
 * @file Modal para Adicionar/Editar Cliente pelo Administrador
 * @description Este componente fornece um formulário modal para que o administrador
 * possa cadastrar um novo cliente ou editar um existente, incluindo a atribuição de um representante.
 */
import React, { useState, useEffect } from 'react';
import { Client, Plan, Representative } from '../types';
import { XIcon } from './icons';
import * as db from '../services/database';
import { useToast } from '../contexts/ToastContext';

interface AdminNewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id'>, id?: number) => void;
  initialData?: Client | null;
}

const AdminNewClientModal: React.FC<AdminNewClientModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  // Estados para cada campo do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState('Nenhum');
  const [status, setStatus] = useState<'Cliente Ativo' | 'Lead' | 'Inativo'>('Lead');
  const [repId, setRepId] = useState<string>('');
  
  // Estados para dados de selects
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [availableReps, setAvailableReps] = useState<Representative[]>([]);
  
  const { addToast } = useToast();

  // Efeito para carregar os planos e representantes e preencher/resetar o formulário
  useEffect(() => {
    if (isOpen) {
        setAvailablePlans(db.getPlans());
        setAvailableReps(db.getRepresentatives());

        if (initialData) {
            setName(initialData.name);
            setEmail(initialData.email || '');
            setPhone(initialData.phone);
            setDocument(initialData.document || '');
            setAddress(initialData.address || '');
            setPlan(initialData.plan);
            setStatus(initialData.status);
            setRepId(String(initialData.repId || ''));
        } else {
            setName('');
            setEmail('');
            setPhone('');
            setDocument('');
            setAddress('');
            setPlan('Nenhum');
            setStatus('Lead');
            setRepId('');
        }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Validação dos campos obrigatórios
    if (!name || !phone || !status || !repId) {
        addToast("Por favor, preencha Nome, Telefone, Status e Representante.", "error");
        return;
    }
    
    onSave(
        { 
            name, 
            email, 
            phone, 
            document, 
            address, 
            plan, 
            status, 
            repId: Number(repId) 
        }, 
        initialData?.id
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{initialData ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h3>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Fechar modal"><XIcon /></button>
        </div>
        <form className="p-6 space-y-4 max-h-[70vh] overflow-y-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Documento (CPF/CNPJ)</label>
                <input type="text" value={document} onChange={e => setDocument(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg" placeholder="Rua, Número, Bairro, Cidade, Estado" />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Plano de Interesse</label>
                <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg">
                  <option value="Nenhum">Nenhum</option>
                  {availablePlans.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg">
                  <option value="Lead">Lead</option>
                  <option value="Cliente Ativo">Cliente Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
           </div>
           <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Representante Responsável</label>
                <select value={repId} onChange={e => setRepId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg">
                    <option value="">Selecione um representante</option>
                    {availableReps.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
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

export default AdminNewClientModal;
