
import React, { useState } from 'react';
import { PlusCircleIcon, Edit2Icon, Trash2Icon } from './icons';

interface Plan {
  id: number;
  name: string;
  type: 'Imóvel' | 'Automóvel' | 'Serviços';
  valueRange: [number, number];
  term: number; // in months
  adminFee: number; // percentage
}

const initialPlans: Plan[] = [
  { id: 1, name: 'Meu Apê', type: 'Imóvel', valueRange: [150000, 500000], term: 180, adminFee: 18 },
  { id: 2, name: 'Carro Novo', type: 'Automóvel', valueRange: [40000, 120000], term: 80, adminFee: 15 },
  { id: 3, name: 'Sua Viagem', type: 'Serviços', valueRange: [10000, 30000], term: 36, adminFee: 22 },
  { id: 4, name: 'Casa na Praia', type: 'Imóvel', valueRange: [300000, 1000000], term: 200, adminFee: 17 },
  { id: 5, name: 'Moto Zera', type: 'Automóvel', valueRange: [15000, 40000], term: 60, adminFee: 16 },
];

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-6 hover:shadow-lg transition-shadow">
    <div className="flex-grow">
      <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
      <p className="text-sm font-semibold text-orange-600 mb-4">{plan.type}</p>
      <div className="space-y-2 text-slate-600 text-sm">
        <p><strong>Crédito:</strong> {formatCurrency(plan.valueRange[0])} a {formatCurrency(plan.valueRange[1])}</p>
        <p><strong>Prazo:</strong> Até {plan.term} meses</p>
        <p><strong>Taxa Adm.:</strong> {plan.adminFee}%</p>
      </div>
    </div>
    <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
        <button className="p-2 text-slate-500 hover:text-orange-600 hover:bg-slate-100 rounded-lg"><Edit2Icon /></button>
        <button className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2Icon /></button>
    </div>
  </div>
);

const PlansScreen: React.FC = () => {
  const [plans, setPlans] = useState(initialPlans);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Planos</h2>
          <p className="text-sm text-slate-500">Crie e gerencie os planos de consórcio disponíveis.</p>
        </div>
        <button className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2">
          <PlusCircleIcon />
          <span>Criar Novo Plano</span>
        </button>
      </header>
      <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      </main>
    </div>
  );
};

export default PlansScreen;
