
import React, { useState } from 'react';
import { Sale, SaleStatus } from '../types';
import { PlusCircleIcon, MoreHorizontalIcon } from './icons';
import NewSaleModal from './NewSaleModal';

const initialSales: Sale[] = [
  { id: 1, clientName: 'João Silva', plan: 'Consórcio de Automóvel', value: 50000, date: '09/07/2025', status: SaleStatus.Approved },
  { id: 2, clientName: 'Carlos Pereira', plan: 'Consórcio de Imóvel', value: 350000, date: '05/07/2025', status: SaleStatus.Pending },
  { id: 3, clientName: 'Beatriz Lima', plan: 'Consórcio de Serviços', value: 15000, date: '02/07/2025', status: SaleStatus.Rejected },
  { id: 4, clientName: 'Ricardo Alves', plan: 'Consórcio de Automóvel', value: 80000, date: '28/06/2025', status: SaleStatus.Approved },
];

const statusColors: Record<SaleStatus, string> = {
  [SaleStatus.Approved]: 'text-green-800 bg-green-100',
  [SaleStatus.Pending]: 'text-yellow-800 bg-yellow-100',
  [SaleStatus.Rejected]: 'text-red-800 bg-red-100',
};

const SaleRow: React.FC<{ sale: Sale }> = ({ sale }) => (
  <tr className="bg-white border-b hover:bg-slate-50">
    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{sale.clientName}</td>
    <td className="px-6 py-4">{sale.plan}</td>
    <td className="px-6 py-4">{`R$ ${sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td>
    <td className="px-6 py-4">{sale.date}</td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[sale.status]}`}>
        {sale.status}
      </span>
    </td>
    <td className="px-6 py-4 text-right">
      <button className="font-medium text-orange-600 hover:underline">
        <MoreHorizontalIcon />
      </button>
    </td>
  </tr>
);


const SalesScreen: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveSale = (newSaleData: Omit<Sale, 'id' | 'status'>) => {
    const newSale: Sale = {
        ...newSaleData,
        id: sales.length + 1,
        status: SaleStatus.Pending, // New sales are always pending
    };
    setSales([newSale, ...sales]);
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Vendas</h2>
            <p className="text-sm text-slate-500">Acompanhe o status dos seus contratos.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2"
            >
              <PlusCircleIcon />
              <span>Registrar Nova Venda</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Contratos Recentes</h3>
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
                    <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => <SaleRow key={sale.id} sale={sale} />)}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <NewSaleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSale}
      />
    </>
  );
};

export default SalesScreen;
