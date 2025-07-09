
import React, { useState } from 'react';
import { DollarSignKpiIcon, CheckCircleIcon } from './icons';

interface Commission {
  id: number;
  repName: string;
  period: string;
  salesValue: number;
  commissionRate: number;
  commissionValue: number;
  status: 'Pendente' | 'Paga';
}

const initialCommissions: Commission[] = [
  { id: 1, repName: 'Carlos Andrade', period: 'Jun/2025', salesValue: 1250000, commissionRate: 5, commissionValue: 62500, status: 'Paga' },
  { id: 2, repName: 'Sofia Ribeiro', period: 'Jun/2025', salesValue: 980000, commissionRate: 5, commissionValue: 49000, status: 'Paga' },
  { id: 3, repName: 'Juliana Paes', period: 'Jun/2025', salesValue: 850000, commissionRate: 4.5, commissionValue: 38250, status: 'Pendente' },
  { id: 4, repName: 'Mariana Lima', period: 'Jun/2025', salesValue: 1540000, commissionRate: 5.5, commissionValue: 84700, status: 'Pendente' },
  { id: 5, repName: 'Carlos Andrade', period: 'Mai/2025', salesValue: 1100000, commissionRate: 5, commissionValue: 55000, status: 'Paga' },
];

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const statusColors = {
  'Paga': 'text-green-800 bg-green-100',
  'Pendente': 'text-yellow-800 bg-yellow-100',
};

const CommissionsScreen: React.FC = () => {
  const [commissions, setCommissions] = useState(initialCommissions);

  const totalPending = commissions
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + c.commissionValue, 0);

  const totalPaid = commissions
    .filter(c => c.status === 'Paga')
    .reduce((sum, c) => sum + c.commissionValue, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Comissões</h2>
          <p className="text-sm text-slate-500">Calcule e pague as comissões dos representantes.</p>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start">
                <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <DollarSignKpiIcon />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-500">Total Pendente</p>
                    <p className="text-3xl font-bold text-slate-800">{formatCurrency(totalPending)}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start">
                <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <DollarSignKpiIcon />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-500">Total Pago (últ. 3m)</p>
                    <p className="text-3xl font-bold text-slate-800">{formatCurrency(totalPaid)}</p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Representante</th>
                  <th scope="col" className="px-6 py-3">Período</th>
                  <th scope="col" className="px-6 py-3">Valor de Vendas</th>
                  <th scope="col" className="px-6 py-3">Comissão</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map(c => (
                  <tr key={c.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{c.repName}</td>
                    <td className="px-6 py-4">{c.period}</td>
                    <td className="px-6 py-4">{formatCurrency(c.salesValue)}</td>
                    <td className="px-6 py-4 font-bold">{formatCurrency(c.commissionValue)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.status === 'Pendente' && (
                        <button className="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-800">
                          <CheckCircleIcon /> Marcar como paga
                        </button>
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
  );
};

export default CommissionsScreen;
