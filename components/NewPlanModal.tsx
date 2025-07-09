
import React, { useState, useEffect } from 'react';
import { Plan } from '../types';
import { XIcon } from './icons';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPlan: Omit<Plan, 'id'>, id?: number) => void;
  initialData?: Plan | null;
}

const NewPlanModal: React.FC<NewPlanModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'Imóvel' | 'Automóvel' | 'Serviços'>('Automóvel');
    const [minVal, setMinVal] = useState('');
    const [maxVal, setMaxVal] = useState('');
    const [term, setTerm] = useState('');
    const [adminFee, setAdminFee] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setType(initialData.type);
                setMinVal(String(initialData.valueRange[0]));
                setMaxVal(String(initialData.valueRange[1]));
                setTerm(String(initialData.term));
                setAdminFee(String(initialData.adminFee));
            } else {
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
                    <h3 className="text-xl font-bold text-slate-800">{initialData ? 'Editar Plano' : 'Criar Novo Plano'}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
                </div>
                <form className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Plano</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Ex: Meu Carro Novo" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                            <option>Automóvel</option>
                            <option>Imóvel</option>
                            <option>Serviços</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Crédito Mínimo (R$)</label>
                            <input type="number" value={minVal} onChange={e => setMinVal(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Crédito Máximo (R$)</label>
                            <input type="number" value={maxVal} onChange={e => setMaxVal(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Prazo (meses)</label>
                            <input type="number" value={term} onChange={e => setTerm(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Taxa Adm. (%)</label>
                            <input type="number" value={adminFee} onChange={e => setAdminFee(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                        </div>
                    </div>
                </form>
                <div className="flex justify-end items-center p-6 bg-slate-50 border-t">
                    <button onClick={onClose} className="text-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 mr-3">Cancelar</button>
                    <button onClick={handleSave} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700">Salvar Plano</button>
                </div>
            </div>
        </div>
    );
};

export default NewPlanModal;