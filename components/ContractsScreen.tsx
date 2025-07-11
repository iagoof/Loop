
import React, { useState, useEffect, useMemo } from 'react';
import { Sale, SaleStatus, Client } from '../types';
import * as db from '../services/database';
import ApprovalModal from './ApprovalModal';

const statusColors: Record<SaleStatus, string> = {
  [SaleStatus.Approved]: 'text-green-800 bg-green-100',
  [SaleStatus.Pending]: 'text-yellow-800 bg-yellow-100',
  [SaleStatus.Rejected]: 'text-red-800 bg-red-100',
};

const ContractsScreen: React.FC = () => {
  const [contracts, setContracts] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState<SaleStatus | 'Todos'>('Todos');
  const [selectedContract, setSelectedContract] = useState<Sale | null>(null);

  const fetchData = () => {
    setContracts(db.getSales());
    setClients(db.getClients());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clientNameMap = useMemo(() => {
    return new Map(clients.map(client => [client.id, client.name]));
  }, [clients]);

  const handleUpdateStatus = (id: number, status: SaleStatus, reason?: string) => {
    db.updateSale(id, { status, rejectionReason: reason });
    fetchData();
  };

  const filteredContracts = contracts.filter(c => filter === 'Todos' || c.status === filter);

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Contratos</h2>
            <p className="text-sm text-slate-500">Visualize, aprove ou recuse contratos pendentes.</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold text-slate-800 flex-shrink-0">Filtro de Status</h3>
              <div className="flex gap-2 flex-wrap">
                {(['Todos', ...Object.values(SaleStatus)]).map(status => (
                  <button 
                    key={status} 
                    onClick={() => setFilter(status as SaleStatus | 'Todos')}
                    className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${filter === status ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Cliente</th>
                    <th scope="col" className="px-6 py-3">Plano</th>
                    <th scope="col" className="px-6 py-3">Valor</th>
                    <th scope="col" className="px-6 py-3">Data</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map(c => (
                    <tr key={c.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{clientNameMap.get(c.clientId) || 'N/A'}</td>
                      <td className="px-6 py-4">{c.plan}</td>
                      <td className="px-6 py-4">R$ {c.value.toLocaleString('pt-BR')}</td>
                      <td className="px-6 py-4">{c.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        
                          <button onClick={() => setSelectedContract(c)} className="font-semibold text-orange-600 hover:underline">
                            {c.status === SaleStatus.Pending ? 'Analisar' : 'Ver Detalhes'}
                          </button>
                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {selectedContract && (
        <ApprovalModal 
            isOpen={!!selectedContract}
            contract={selectedContract} 
            clientName={clientNameMap.get(selectedContract.clientId) || ''}
            onClose={() => setSelectedContract(null)} 
            onUpdate={handleUpdateStatus} 
        />
      )}
    </>
  );
};

export default ContractsScreen;