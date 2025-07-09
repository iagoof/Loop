
import React, { useState } from 'react';
import { Sale, SaleStatus } from '../types';
import { MoreHorizontalIcon, XIcon, CheckCircleIcon, XCircleIcon } from './icons';

const initialContracts: Sale[] = [
  { id: 1, clientName: 'Fernanda Lima', plan: 'Consórcio de Imóvel', value: 450000, date: '15/07/2025', status: SaleStatus.Pending },
  { id: 2, clientName: 'Roberto Dias', plan: 'Consórcio de Automóvel', value: 95000, date: '14/07/2025', status: SaleStatus.Approved },
  { id: 3, clientName: 'Lucas Martins', plan: 'Consórcio de Serviços', value: 25000, date: '12/07/2025', status: SaleStatus.Approved },
  { id: 4, clientName: 'Vanessa Costa', plan: 'Consórcio de Imóvel', value: 600000, date: '11/07/2025', status: SaleStatus.Pending },
  { id: 5, clientName: 'Gabriel Rocha', plan: 'Consórcio de Automóvel', value: 120000, date: '10/07/2025', status: SaleStatus.Rejected },
  { id: 6, clientName: 'Mariana Azevedo', plan: 'Consórcio de Imóvel', value: 280000, date: '08/07/2025', status: SaleStatus.Pending },
];

const statusColors: Record<SaleStatus, string> = {
  [SaleStatus.Approved]: 'text-green-800 bg-green-100',
  [SaleStatus.Pending]: 'text-yellow-800 bg-yellow-100',
  [SaleStatus.Rejected]: 'text-red-800 bg-red-100',
};

const ApprovalModal: React.FC<{ contract: Sale, onClose: () => void, onUpdate: (id: number, status: SaleStatus) => void }> = ({ contract, onClose, onUpdate }) => {
    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">Analisar Contrato</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p><strong>Cliente:</strong> {contract.clientName}</p>
                    <p><strong>Plano:</strong> {contract.plan}</p>
                    <p><strong>Valor:</strong> R$ {contract.value.toLocaleString('pt-BR')}</p>
                    <p><strong>Data da Venda:</strong> {contract.date}</p>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-1">Observações para a recusa (opcional)</label>
                        <textarea id="notes" rows={3} placeholder="Ex: Documentação pendente." className="w-full p-2 border rounded-lg"></textarea>
                    </div>
                </div>
                <div className="flex justify-end items-center p-6 bg-slate-50 border-t gap-4">
                    <button onClick={() => { onUpdate(contract.id, SaleStatus.Rejected); onClose(); }} className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700">
                        <XCircleIcon /> Recusar
                    </button>
                    <button onClick={() => { onUpdate(contract.id, SaleStatus.Approved); onClose(); }} className="flex items-center gap-2 text-white font-semibold px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700">
                        <CheckCircleIcon /> Aprovar
                    </button>
                </div>
            </div>
        </div>
    );
};


const ContractsScreen: React.FC = () => {
  const [contracts, setContracts] = useState(initialContracts);
  const [filter, setFilter] = useState<SaleStatus | 'Todos'>('Todos');
  const [selectedContract, setSelectedContract] = useState<Sale | null>(null);

  const handleUpdateStatus = (id: number, status: SaleStatus) => {
    setContracts(contracts.map(c => c.id === id ? { ...c, status } : c));
  };

  const filteredContracts = contracts.filter(c => filter === 'Todos' || c.status === filter);

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Contratos</h2>
            <p className="text-sm text-slate-500">Visualize, aprove ou recuse contratos pendentes.</p>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-4">
              <h3 className="text-lg font-bold text-slate-800">Filtro de Status</h3>
              <div className="flex gap-2">
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
                      <td className="px-6 py-4 font-medium text-slate-900">{c.clientName}</td>
                      <td className="px-6 py-4">{c.plan}</td>
                      <td className="px-6 py-4">R$ {c.value.toLocaleString('pt-BR')}</td>
                      <td className="px-6 py-4">{c.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        {c.status === SaleStatus.Pending && (
                          <button onClick={() => setSelectedContract(c)} className="font-semibold text-orange-600 hover:underline">Analisar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {selectedContract && <ApprovalModal contract={selectedContract} onClose={() => setSelectedContract(null)} onUpdate={handleUpdateStatus} />}
    </>
  );
};

export default ContractsScreen;
