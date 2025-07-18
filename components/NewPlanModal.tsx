/**
 * @file Modal para Adicionar/Editar Plano
 * @description Este componente fornece um formulário modal para criar ou
 * editar um plano de consórcio. Ele gerencia o estado de todos os campos
 * do plano e é preenchido com dados iniciais quando em modo de edição.
 */
import React, { useState, useEffect } from 'react';
import { Plan } from '../types';
import { XIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPlan: Omit<Plan, 'id'>, id?: number) => void;
  initialData?: Plan | null; // Dados para preencher o formulário em modo de edição
}

const NewPlanModal: React.FC<NewPlanModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    // Estados para cada campo do formulário
    const [name, setName] = useState('');
    const [type, setType] = useState<'Imóvel' | 'Automóvel' | 'Serviços'>('Automóvel');
    const [minVal, setMinVal] = useState('');
    const [maxVal, setMaxVal] = useState('');
    const [term, setTerm] = useState('');
    const [adminFee, setAdminFee] = useState('');
    const { addToast } = useToast();

    // Efeito para popular ou resetar o formulário quando o modal abre
    useEffect(() => {
        if (isOpen) {
            if (initialData) { // Modo de edição
                setName(initialData.name);
                setType(initialData.type);
                setMinVal(String(initialData.valueRange[0]));
                setMaxVal(String(initialData.valueRange[1]));
                setTerm(String(initialData.term));
                setAdminFee(String(initialData.adminFee));
            } else { // Modo de adição
                setName('');
                setType('Automóvel');
                setMinVal('');
                setMaxVal('');
                setTerm('');
                setAdminFee('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (name && type && minVal && maxVal && term && adminFee) {
            onSave({
                name,
                type,
                valueRange: [Number(minVal), Number(maxVal)],
                term: Number(term),
                adminFee: Number(adminFee),
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
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{initialData ? 'Editar Plano' : 'Criar Novo Plano'}</h3>
                    <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Fechar modal"><XIcon /></button>
                </div>
                <form className="p-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Plano</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg" placeholder="Ex: Meu Carro Novo" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg">
                            <option>Automóvel</option>
                            <option>Imóvel</option>
                            <option>Serviços</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Crédito Mínimo (R$)</label>
                            <input type="number" value={minVal} onChange={e => setMinVal(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Crédito Máximo (R$)</label>
                            <input type="number" value={maxVal} onChange={e => setMaxVal(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Prazo (meses)</label>
                            <input type="number" value={term} onChange={e => setTerm(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Taxa Adm. (%)</label>
                            <input type="number" value={adminFee} onChange={e => setAdminFee(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg" />
                        </div>
                    </div>
                </form>
                <div className="flex justify-end items-center p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700">
                    <button onClick={onClose} className="text-slate-600 dark:text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 mr-3">Cancelar</button>
                    <button onClick={handleSave} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700">Salvar Plano</button>
                </div>
            </div>
        </div>
    );
};

export default NewPlanModal;