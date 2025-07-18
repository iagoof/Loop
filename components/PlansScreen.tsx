/**
 * @file Tela de Gestão de Planos
 * @description Permite que o administrador crie, visualize, edite e exclua
 * os planos de consórcio oferecidos pela empresa. Os planos são exibidos
 * em um layout de cartões.
 */
import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, Edit2Icon, Trash2Icon } from './icons';
import { Plan } from '../types';
import * as db from '../services/database';
import NewPlanModal from './NewPlanModal';
import ContentHeader from './ContentHeader';
import { useToast } from '../contexts/ToastContext';

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

/**
 * Componente para exibir um único cartão de plano.
 */
const PlanCard: React.FC<{ plan: Plan, onEdit: (plan: Plan) => void, onDelete: (id: number) => void }> = ({ plan, onEdit, onDelete }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col p-6 hover:shadow-lg transition-shadow dark:hover:border-slate-600">
    <div className="flex-grow">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{plan.name}</h3>
      <p className="text-sm font-semibold text-orange-600 dark:text-orange-500 mb-4">{plan.type}</p>
      <div className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
        <p><strong>Crédito:</strong> {formatCurrency(plan.valueRange[0])} a {formatCurrency(plan.valueRange[1])}</p>
        <p><strong>Prazo:</strong> Até {plan.term} meses</p>
        <p><strong>Taxa Adm.:</strong> {plan.adminFee}%</p>
      </div>
    </div>
    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end space-x-2">
        <button onClick={() => onEdit(plan)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Editar Plano"><Edit2Icon /></button>
        <button onClick={() => onDelete(plan.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg" title="Excluir Plano"><Trash2Icon /></button>
    </div>
  </div>
);

const PlansScreen: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const { addToast } = useToast();

  // Busca e atualiza a lista de planos
  const fetchPlans = () => {
    setPlans(db.getPlans());
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Abre o modal, opcionalmente com dados de um plano para edição
  const handleOpenModal = (plan: Plan | null = null) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingPlan(null);
    setIsModalOpen(false);
  };

  // Salva um plano (novo ou editado)
  const handleSavePlan = (planData: Omit<Plan, 'id'>, id?: number) => {
    if (id) {
        db.updatePlan(id, planData);
        addToast('Plano atualizado com sucesso!', 'success');
    } else {
        db.addPlan(planData);
        addToast('Plano criado com sucesso!', 'success');
    }
    fetchPlans(); // Atualiza a lista após salvar
  };
  
  // Exclui um plano após confirmação
  const handleDeletePlan = (id: number) => {
      if (window.confirm("Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.")) {
          db.deletePlan(id);
          addToast('Plano excluído com sucesso.', 'info');
          fetchPlans();
      }
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <ContentHeader
          title="Gestão de Planos"
          subtitle="Crie e gerencie os planos de consórcio disponíveis."
        >
          <button 
            onClick={() => handleOpenModal()}
            className="bg-orange-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2"
          >
            <PlusCircleIcon />
            <span className="hidden sm:inline">Criar Novo Plano</span>
          </button>
        </ContentHeader>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map(plan => <PlanCard key={plan.id} plan={plan} onEdit={handleOpenModal} onDelete={handleDeletePlan} />)}
        </div>
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