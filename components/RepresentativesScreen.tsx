/**
 * @file Tela de Gestão de Representantes
 * @description Permite que o administrador visualize, adicione, edite,
 * ative e desative os representantes de vendas. Inclui uma funcionalidade
 * de busca para filtrar a lista.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircleIcon, Edit2Icon, UserCheckIcon, UserXIcon, TargetIconAction, DownloadIcon, Trash2Icon, ArrowUpDown } from './icons';
import { Representative } from '../types';
import * as db from '../services/database';
import NewRepModal from './NewRepModal';
import SetGoalModal from './SetGoalModal';
import ContentHeader from './ContentHeader';
import { convertToCSV, downloadCSV } from '../utils/export';
import { useToast } from '../contexts/ToastContext';
import Pagination from './Pagination';

// Mapeamento de status para classes de cor
const statusColors = {
  'Ativo': 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/50',
  'Inativo': 'text-slate-800 bg-slate-200 dark:text-slate-300 dark:bg-slate-600',
};

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

type SortKey = keyof Representative | 'sales';
type SortOrder = 'asc' | 'desc';

const RepresentativesScreen: React.FC = () => {
  const [reps, setReps] = useState<Representative[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState<Representative | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [repForGoal, setRepForGoal] = useState<Representative | null>(null);
  const { addToast } = useToast();
  
  // Estados para ordenação e paginação
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Função para buscar e atualizar a lista de representantes
  const fetchReps = () => {
    setReps(db.getRepresentatives());
  };

  useEffect(() => {
    fetchReps();
  }, []);
  
  // Abre o modal de edição, opcionalmente com dados de um representante
  const handleOpenModal = (rep: Representative | null = null) => {
    setEditingRep(rep);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingRep(null);
    setIsModalOpen(false);
  };

  // Abre o modal de definição de meta
  const handleOpenGoalModal = (rep: Representative) => {
    setRepForGoal(rep);
    setIsGoalModalOpen(true);
  };

  const handleCloseGoalModal = () => {
    setRepForGoal(null);
    setIsGoalModalOpen(false);
  };

  // Salva um representante (novo ou editado)
  const handleSaveRep = (repData: Omit<Representative, 'id' | 'sales' | 'status' | 'goal'>, id?: number) => {
    if (id) {
        db.updateRepresentative(id, repData);
        addToast('Representante atualizado com sucesso!', 'success');
    } else {
        db.addRepresentative(repData);
        addToast('Representante adicionado com sucesso!', 'success');
    }
    fetchReps(); // Atualiza a lista após salvar
  };

  // Salva a meta de um representante
  const handleSaveGoal = (repId: number, goal: number) => {
    db.updateRepresentative(repId, { goal });
    addToast('Meta do representante atualizada!', 'success');
    fetchReps();
  };

  // Alterna o status de um representante (Ativo/Inativo)
  const handleToggleStatus = (rep: Representative) => {
    const newStatus = rep.status === 'Ativo' ? 'Inativo' : 'Ativo';
    db.updateRepresentative(rep.id, { status: newStatus });
    addToast(`Status de ${rep.name} alterado para ${newStatus}.`, 'info');
    fetchReps();
  };

  // Deleta um representante
  const handleDeleteRep = (rep: Representative) => {
      if (window.confirm(`Tem certeza que deseja excluir o representante ${rep.name}? Esta ação não pode ser desfeita.`)) {
          db.deleteRepresentative(rep.id);
          addToast('Representante excluído com sucesso.', 'success');
          fetchReps();
      }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredReps = useMemo(() => {
    return reps
      .filter(rep =>
        rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const valA = a[sortKey as keyof Representative] ?? 0;
        const valB = b[sortKey as keyof Representative] ?? 0;

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [reps, searchTerm, sortKey, sortOrder]);

  const totalPages = Math.ceil(sortedAndFilteredReps.length / ITEMS_PER_PAGE);
  const paginatedReps = sortedAndFilteredReps.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `representantes_${date}.csv`;

    const headers = {
        id: 'ID',
        name: 'Nome',
        email: 'Email',
        sales: 'Vendas (30d)',
        commissionRate: 'Comissão (%)',
        goal: 'Meta de Vendas (R$)',
        status: 'Status',
    };

    const dataToExport = sortedAndFilteredReps.map(r => ({
      ...r,
      goal: r.goal || 0,
    }));

    const csvString = convertToCSV(dataToExport, headers);
    downloadCSV(csvString, filename);
  };
  
  const SortableHeader: React.FC<{ headerKey: SortKey, title: string }> = ({ headerKey, title }) => (
    <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort(headerKey)}>
      <div className="flex items-center">
        {title}
        {sortKey === headerKey && <ArrowUpDown className="w-4 h-4 ml-2" />}
      </div>
    </th>
  );


  return (
    <>
      <div className="p-4 md:p-6">
        <ContentHeader 
          title="Gestão de Representantes"
          subtitle="Adicione, edite e gerencie seus representantes."
        >
          <button
            onClick={handleExport}
            className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">Exportar para CSV</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-orange-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2"
          >
            <PlusCircleIcon />
            <span className="hidden sm:inline">Adicionar Representante</span>
          </button>
        </ContentHeader>
        
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full max-w-sm px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
              aria-label="Buscar representante"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <SortableHeader headerKey="name" title="Nome" />
                  <SortableHeader headerKey="sales" title="Vendas (30d)" />
                  <SortableHeader headerKey="commissionRate" title="Comissão (%)" />
                  <SortableHeader headerKey="goal" title="Meta de Vendas" />
                  <SortableHeader headerKey="status" title="Status" />
                  <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {paginatedReps.length > 0 ? paginatedReps.map(rep => (
                  <tr key={rep.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      <div>{rep.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{rep.email}</div>
                    </td>
                    <td className="px-6 py-4">{rep.sales}</td>
                    <td className="px-6 py-4">{rep.commissionRate}%</td>
                    <td className="px-6 py-4">{rep.goal ? formatCurrency(rep.goal) : 'Não definida'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[rep.status]}`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                         <button onClick={() => handleOpenGoalModal(rep)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg" title="Definir Meta"><TargetIconAction /></button>
                         <button onClick={() => handleOpenModal(rep)} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Editar"><Edit2Icon /></button>
                         {rep.status === 'Ativo' ? 
                           <button onClick={() => handleToggleStatus(rep)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg" title="Desativar"><UserXIcon /></button> :
                           <button onClick={() => handleToggleStatus(rep)} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-lg" title="Ativar"><UserCheckIcon /></button>
                         }
                         <button onClick={() => handleDeleteRep(rep)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg" title="Excluir"><Trash2Icon /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">
                      Nenhum representante encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={sortedAndFilteredReps.length}
          />
        </div>
      </div>
      <NewRepModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRep}
        initialData={editingRep}
      />
      {repForGoal && <SetGoalModal
        isOpen={isGoalModalOpen}
        onClose={handleCloseGoalModal}
        onSave={handleSaveGoal}
        representative={repForGoal}
      />}
    </>
  );
};

export default RepresentativesScreen;