
import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, Edit2Icon, UserCheckIcon, UserXIcon } from './icons';
import { Representative } from '../types';
import * as db from '../services/database';
import NewRepModal from './NewRepModal';

const statusColors = {
  'Ativo': 'text-green-800 bg-green-100',
  'Inativo': 'text-slate-800 bg-slate-200',
};

const RepresentativesScreen: React.FC = () => {
  const [reps, setReps] = useState<Representative[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState<Representative | null>(null);

  const fetchReps = () => {
    setReps(db.getRepresentatives());
  };

  useEffect(() => {
    fetchReps();
  }, []);
  
  const handleOpenModal = (rep: Representative | null = null) => {
    setEditingRep(rep);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingRep(null);
    setIsModalOpen(false);
  };

  const handleSaveRep = (repData: Omit<Representative, 'id' | 'sales' | 'status'>, id?: number) => {
    if (id) {
        db.updateRepresentative(id, repData);
    } else {
        db.addRepresentative(repData);
    }
    fetchReps();
  };

  const handleToggleStatus = (rep: Representative) => {
    const newStatus = rep.status === 'Ativo' ? 'Inativo' : 'Ativo';
    db.updateRepresentative(rep.id, { status: newStatus });
    fetchReps();
  };

  const filteredReps = reps.filter(rep =>
    rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 sm:py-0 sm:h-20 flex-shrink-0">
          <div className="mb-2 sm:mb-0">
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Representantes</h2>
            <p className="text-sm text-slate-500">Adicione, edite e gerencie seus representantes.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-orange-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2"
          >
            <PlusCircleIcon />
            <span className="hidden sm:inline">Adicionar Representante</span>
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Nome</th>
                    <th scope="col" className="px-6 py-3">Vendas (Últimos 30d)</th>
                    <th scope="col" className="px-6 py-3">Comissão (%)</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReps.map(rep => (
                    <tr key={rep.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div>{rep.name}</div>
                        <div className="text-xs text-slate-500">{rep.email}</div>
                      </td>
                      <td className="px-6 py-4">{rep.sales}</td>
                      <td className="px-6 py-4">{rep.commissionRate}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[rep.status]}`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                           <button onClick={() => handleOpenModal(rep)} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-slate-100 rounded-lg" title="Editar"><Edit2Icon /></button>
                           {rep.status === 'Ativo' ? 
                             <button onClick={() => handleToggleStatus(rep)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Desativar"><UserXIcon /></button> :
                             <button onClick={() => handleToggleStatus(rep)} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Ativar"><UserCheckIcon /></button>
                           }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <NewRepModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRep}
        initialData={editingRep}
      />
    </>
  );
};

export default RepresentativesScreen;