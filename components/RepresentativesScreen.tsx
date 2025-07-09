
import React, { useState } from 'react';
import { PlusCircleIcon, MoreHorizontalIcon, Edit2Icon, UserCheckIcon, UserXIcon } from './icons';

interface Representative {
  id: number;
  name: string;
  email: string;
  sales: number;
  commissionRate: number;
  status: 'Ativo' | 'Inativo';
}

const initialReps: Representative[] = [
  { id: 1, name: 'Carlos Andrade', email: 'carlos.a@example.com', sales: 12, commissionRate: 5, status: 'Ativo' },
  { id: 2, name: 'Sofia Ribeiro', email: 'sofia.r@example.com', sales: 9, commissionRate: 5, status: 'Ativo' },
  { id: 3, name: 'Juliana Paes', email: 'juliana.p@example.com', sales: 7, commissionRate: 4.5, status: 'Ativo' },
  { id: 4, name: 'Pedro Mendes', email: 'pedro.m@example.com', sales: 5, commissionRate: 4.5, status: 'Inativo' },
  { id: 5, name: 'Mariana Lima', email: 'mariana.l@example.com', sales: 15, commissionRate: 5.5, status: 'Ativo' },
];

const statusColors = {
  'Ativo': 'text-green-800 bg-green-100',
  'Inativo': 'text-slate-800 bg-slate-200',
};

const RepresentativesScreen: React.FC = () => {
  const [reps, setReps] = useState(initialReps);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReps = reps.filter(rep =>
    rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Representantes</h2>
          <p className="text-sm text-slate-500">Adicione, edite e gerencie seus representantes.</p>
        </div>
        <button className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2">
          <PlusCircleIcon />
          <span>Adicionar Representante</span>
        </button>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
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
                         <button className="p-2 text-slate-500 hover:text-orange-600 hover:bg-slate-100 rounded-lg"><Edit2Icon /></button>
                         {rep.status === 'Ativo' ? 
                           <button className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><UserXIcon /></button> :
                           <button className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg"><UserCheckIcon /></button>
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
  );
};

export default RepresentativesScreen;
