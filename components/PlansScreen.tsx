
import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, Edit2Icon, Trash2Icon } from './icons';
import { Plan } from '../types';
import * as db from '../services/database';
import NewPlanModal from './NewPlanModal';

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

const PlanCard: React.FC<{ plan: Plan, onEdit: (plan: Plan) => void, onDelete: (id: number) => void }> = ({ plan, onEdit, onDelete }) => (
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
        <button onClick={() => onEdit(plan)} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-slate-100 rounded-lg"><Edit2Icon /></button>
        <button onClick={() => onDelete(plan.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2Icon /></button>
    </div>
  </div>
);

const PlansScreen: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const fetchPlans = () => {
    setPlans(db.getPlans());
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan: Plan | null = null) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingPlan(null);
    setIsModalOpen(false);
  };

  const handleSavePlan = (planData: Omit<Plan, 'id'>, id?: number) => {
    if (id) {
        db.updatePlan(id, planData);
    } else {
        db.addPlan(planData);
    }
    fetchPlans();
  };
  
  const handleDeletePlan = (id: number) => {
      if (window.confirm("Tem certeza que deseja excluir este plano?")) {
          db.deletePlan(id);
          fetchPlans();
      }
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Planos</h2>
            <p className="text-sm text-slate-500">Crie e gerencie os planos de consórcio disponíveis.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2"
          >
            <PlusCircleIcon />
            <span>Criar Novo Plano</span>
          </button>
        </header>
        <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => <PlanCard key={plan.id} plan={plan} onEdit={handleOpenModal} onDelete={handleDeletePlan} />)}
          </div>
        </main>
      </div>
      <NewPlanModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePlan}
        initialData={editingPlan}
      />
    </>
  );
};

export default PlansScreen;