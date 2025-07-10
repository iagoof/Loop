
import React, { useState, useEffect, useMemo } from 'react';
import { Sale, SaleStatus, User, UserRole, Representative, Client } from '../types';
import { PlusCircleIcon, MoreHorizontalIcon, DownloadIcon } from './icons';
import NewSaleModal from './NewSaleModal';
import * as db from '../services/database';

const statusColors: Record<SaleStatus, string> = {
  [SaleStatus.Approved]: 'text-green-800 bg-green-100',
  [SaleStatus.Pending]: 'text-yellow-800 bg-yellow-100',
  [SaleStatus.Rejected]: 'text-red-800 bg-red-100',
};

const SaleRow: React.FC<{ sale: Sale; clientName: string; onEdit: (sale: Sale) => void; onDownload: (sale: Sale) => void; }> = ({ sale, clientName, onEdit, onDownload }) => (
  <tr className="bg-white border-b hover:bg-slate-50">
    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{clientName}</td>
    <td className="px-6 py-4">{sale.plan}</td>
    <td className="px-6 py-4">{`R$ ${sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td>
    <td className="px-6 py-4">{sale.date}</td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[sale.status]}`}>
        {sale.status}
      </span>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex items-center justify-end space-x-1">
        <button onClick={() => onDownload(sale)} className="font-medium text-blue-600 p-2 rounded-full hover:bg-slate-100" title="Baixar Contrato">
          <DownloadIcon />
        </button>
        <button onClick={() => onEdit(sale)} className="font-medium text-orange-600 p-2 rounded-full hover:bg-slate-100" title="Editar Venda">
          <MoreHorizontalIcon />
        </button>
      </div>
    </td>
  </tr>
);


const SalesScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [currentRep, setCurrentRep] = useState<Representative | null>(null);

  const fetchSales = () => {
     const allSales = db.getSales();
     const allClients = db.getClients();
     setClients(allClients);

     if (loggedInUser.role === UserRole.Representative) {
        const repProfile = db.getRepresentativeByUserId(loggedInUser.id);
        if(repProfile) {
            setCurrentRep(repProfile);
            setSales(allSales.filter(s => s.repId === repProfile.id));
        }
     } else {
        setSales(allSales);
     }
  }

  const clientNameMap = useMemo(() => {
    return new Map(clients.map(client => [client.id, client.name]));
  }, [clients]);

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

  const handleSaveSale = (saleData: Pick<Sale, 'clientId' | 'plan' | 'value' | 'date'>, id?: number) => {
    if (id) { // Editing existing sale
        db.updateSale(id, saleData);
    } else if (currentRep) { // Creating new sale for current rep
        const newSaleData = { ...saleData, repId: currentRep.id };
        db.addSale(newSaleData);
    }
    fetchSales();
  };
  
  const handleDownloadContract = (sale: Sale) => {
    let template = db.getContractTemplate();
    const client = db.getClients().find(c => c.id === sale.clientId);
    const rep = db.getRepresentatives().find(r => r.id === sale.repId);
    
    if (!client) {
        alert('Cliente não encontrado para gerar o contrato.');
        return;
    }

    const replacements: { [key: string]: string } = {
        '{{CLIENT_NAME}}': client.name,
        '{{CLIENT_EMAIL}}': client.email || 'N/A',
        '{{CLIENT_PHONE}}': client.phone,
        '{{CLIENT_DOCUMENT}}': client.document || 'N/A',
        '{{CLIENT_ADDRESS}}': client.address || 'N/A',
        '{{SALE_PLAN_NAME}}': sale.plan,
        '{{SALE_VALUE}}': sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        '{{SALE_DATE}}': sale.date,
        '{{REP_NAME}}': rep ? rep.name : 'N/A',
        '{{TODAY_DATE}}': new Date().toLocaleDateString('pt-BR'),
    };
    
    let contractText = template;
    for (const key in replacements) {
        contractText = contractText.replace(new RegExp(key, 'g'), replacements[key]);
    }

    const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Contrato_${client.name.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const repClients = useMemo(() => {
    if(!currentRep) return [];
    return clients.filter(c => c.repId === currentRep.id);
}, [clients, currentRep]);


  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 sm:py-0 sm:h-16 flex-shrink-0">
          <div className="mb-2 sm:mb-0">
            <h2 className="text-2xl font-bold text-slate-800">Vendas</h2>
            <p className="text-sm text-slate-500">Acompanhe o status dos seus contratos.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleOpenModal()}
              className="bg-orange-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2"
            >
              <PlusCircleIcon />
              <span className="hidden sm:inline">Registrar Nova Venda</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
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
                  {sales.map((sale) => <SaleRow key={sale.id} sale={sale} clientName={clientNameMap.get(sale.clientId) || 'Cliente não encontrado'} onEdit={handleOpenModal} onDownload={handleDownloadContract} />)}
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
        repClients={repClients}
      />
    </>
  );
};

export default SalesScreen;