import React, { useState, useEffect } from 'react';
import { Sale, SaleStatus, User, UserRole, Representative } from '../types';
import { PlusCircleIcon, MoreHorizontalIcon } from './icons';
import NewSaleModal from './NewSaleModal';
import * as db from '../services/database';

const statusColors: Record<SaleStatus, string> = {
  [SaleStatus.Approved]: 'text-green-800 bg-green-100',
  [SaleStatus.Pending]: 'text-yellow-800 bg-yellow-100',
  [SaleStatus.Rejected]: 'text-red-800 bg-red-100',
};

const SaleRow: React.FC<{ sale: Sale; onEdit: (sale: Sale) => void }> = ({ sale, onEdit }) => (
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
      <button onClick={() => onEdit(sale)} className="font-medium text-orange-600 hover:underline p-2 rounded-full hover:bg-slate-100">
        <MoreHorizontalIcon />
      </button>
    </td>
  </tr>
);


const SalesScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [currentRep, setCurrentRep] = useState<Representative | null>(null);

  const fetchSales = () => {
     const allSales = db.getSales();
     if (loggedInUser.role === UserRole.Representative) {
        // Representatives see only their sales
        const repProfile = db.getRepresentativeByUserId(loggedInUser.id);
        if(repProfile) {
            setCurrentRep(repProfile);
            setSales(allSales.filter(s => s.repId === repProfile.id));
        }
     } else {
        // Admins see all sales
        setSales(allSales);
     }
  }

  useEffect(() => {
    fetchSales();
  }, [loggedInUser]);

  const handleOpenModal = (sale: Sale | null = null) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingSale(null);
    setIsModalOpen(false);
  }

  const handleSaveSale = (saleData: Pick<Sale, 'clientName' | 'plan' | 'value' | 'date'>, id?: number) => {
    if (id) { // Editing existing sale
        db.updateSale(id, saleData);
    } else if (currentRep) { // Creating new sale for current rep
        const newSaleData = { ...saleData, repId: currentRep.id };
        db.addSale(newSaleData);
    }
    fetchSales();
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
              onClick={() => handleOpenModal()}
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
                  {sales.map((sale) => <SaleRow key={sale.id} sale={sale} onEdit={handleOpenModal} />)}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <NewSaleModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSale}
        initialData={editingSale}
      />
    </>
  );
};

export default SalesScreen;
