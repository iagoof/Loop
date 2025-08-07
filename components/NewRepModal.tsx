/**
 * @file Modal para Adicionar/Editar Representante
 * @description Este componente fornece um formulário modal que é reutilizado
 * tanto para criar um novo representante quanto para editar um existente.
 * Ele é preenchido com dados iniciais quando em modo de edição.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Representative, UserRole, User } from '../types';
import { XIcon } from './icons';
import { useToast } from '../contexts/ToastContext';
import * as db from '../services/database';

interface NewRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRep: Omit<Representative, 'id' | 'sales' | 'status' | 'goal' | 'points' | 'badges' | 'level'>, id?: number) => void;
  initialData?: Representative | null; // Dados para preencher o formulário em modo de edição
  allReps: Representative[];
}

const NewRepModal: React.FC<NewRepModalProps> = ({ isOpen, onClose, onSave, initialData, allReps }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [role, setRole] = useState<UserRole.Vendedor | UserRole.Supervisor>(UserRole.Vendedor);
  const [supervisorId, setSupervisorId] = useState<string>('');
  const { addToast } = useToast();

  const supervisors = useMemo(() => {
    const users = db.getUsers();
    return allReps.filter(r => {
        const user = users.find(u => u.id === r.userId);
        return user?.role === UserRole.Supervisor;
    })
  }, [allReps]);

  // Efeito para popular ou resetar o formulário quando o modal abre
  useEffect(() => {
      if(isOpen) {
          const users = db.getUsers();
          const user = users.find(u => u.id === initialData?.userId);
          
          if (initialData && user) { // Modo de edição
              setName(initialData.name);
              setEmail(initialData.email);
              setCommissionRate(String(initialData.commissionRate));
              setRole(user.role === UserRole.Supervisor ? UserRole.Supervisor : UserRole.Vendedor);
              setSupervisorId(String(initialData.supervisorId || ''));
          } else { // Modo de adição
              setName('');
              setEmail('');
              setCommissionRate('');
              setRole(UserRole.Vendedor);
              setSupervisorId('');
          }
      }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name || !email || !commissionRate) {
      addToast("Por favor, preencha todos os campos.", "error");
      return;
    }
    if (role === UserRole.Vendedor && !supervisorId) {
        addToast("Por favor, selecione um supervisor para o vendedor.", "error");
        return;
    }

    onSave({
      name,
      email,
      commissionRate: parseFloat(commissionRate),
      supervisorId: role === UserRole.Vendedor ? Number(supervisorId) : undefined,
      // O userId e role são gerenciados na criação/edição do usuário
    }, initialData?.id);
    onClose();
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
            <input type="email" id="rep-email" value={email} onChange={e => setEmail(e.target.value)} disabled={!!initialData} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 dark:disabled:bg-slate-700/50" />
          </div>
           <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Cargo</label>
              <select value={role} onChange={e => setRole(e.target.value as any)} disabled={!!initialData} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg disabled:bg-slate-100 dark:disabled:bg-slate-700/50">
                  <option value={UserRole.Vendedor}>Vendedor</option>
                  <option value={UserRole.Supervisor}>Supervisor</option>
              </select>
          </div>
          {role === UserRole.Vendedor && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Supervisor</label>
                <select value={supervisorId} onChange={e => setSupervisorId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg">
                    <option value="">Selecione um supervisor</option>
                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
          )}
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