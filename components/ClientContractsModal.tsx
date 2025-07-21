import React from 'react';
import { Client, Sale, SaleStatus } from '../types';
import { XIcon } from './icons';

interface ClientContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  contracts: Sale[];
  repName: string;
}

const statusColors: Record<SaleStatus, string> = {
  [SaleStatus.Approved]: 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/50',
  [SaleStatus.Pending]: 'text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50',
  [SaleStatus.Rejected]: 'text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900/50',
};

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const ClientContractsModal: React.FC<ClientContractsModalProps> = ({ isOpen, onClose, client, contracts, repName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Contratos de {client.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Representante: {repName}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Fechar modal">
            <XIcon />
          </button>
        </header>
        <main className="p-6 overflow-y-auto">
          {contracts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Plano</th>
                    <th scope="col" className="px-6 py-3">Valor</th>
                    <th scope="col" className="px-6 py-3">Data</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(contract => (
                    <tr key={contract.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{contract.plan}</td>
                      <td className="px-6 py-4">{formatCurrency(contract.value)}</td>
                      <td className="px-6 py-4">{contract.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[contract.status]}`}>
                          {contract.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-10 text-slate-500 dark:text-slate-400">Este cliente não possui contratos.</p>
          )}
        </main>
        <footer className="flex justify-end items-center p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <button onClick={onClose} className="text-slate-600 dark:text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">Fechar</button>
        </footer>
      </div>
    </div>
  );
};

export default ClientContractsModal;
