/**
 * @file Tela de Gestão de Contratos
 * @description Permite que o administrador visualize todos os contratos (vendas) do sistema,
 * filtre-os por status (Pendente, Aprovada, Recusada) e analise os detalhes de
 * cada um para aprovação ou recusa.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Sale, SaleStatus, Client, Representative, Plan } from '../types';
import * as db from '../services/database';
import ApprovalModal from './ApprovalModal';
import ContentHeader from './ContentHeader';
import { DownloadIcon, Edit2Icon, ArrowUpDown } from './icons';
import { convertToCSV, downloadCSV } from '../utils/export';
import Pagination from './Pagination';
import NewSaleModal from './NewSaleModal';
import { useToast } from '../contexts/ToastContext';

// Mapeamento de status para classes de cor
const statusColors: Record<SaleStatus, string> = {
  [SaleStatus.Approved]: 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/50',
  [SaleStatus.Pending]: 'text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50',
  [SaleStatus.Rejected]: 'text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900/50',
};

type SortKey = keyof Sale | 'clientName' | 'repName';
type SortOrder = 'asc' | 'desc';

const ContractsScreen: React.FC<{ initialFilter?: string }> = ({ initialFilter }) => {
  const [contracts, setContracts] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reps, setReps] = useState<Representative[]>([]);
  const [filter, setFilter] = useState<SaleStatus | 'Todos' | string>(initialFilter || 'Todos');
  const [selectedContract, setSelectedContract] = useState<Sale | null>(null);
  const [editingContract, setEditingContract] = useState<Sale | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Estados para filtros e paginação
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { addToast } = useToast();

  const fetchData = () => {
    setContracts(db.getSales());
    setClients(db.getClients());
    setReps(db.getRepresentatives());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);
  const repMap = useMemo(() => new Map(reps.map(r => [r.id, r.name])), [reps]);

  const handleUpdateStatus = (id: number, status: SaleStatus, reason?: string) => {
    db.updateSale(id, { status, rejectionReason: reason });
    fetchData();
  };

  const handleSaveSale = (saleData: Pick<Sale, 'clientId' | 'plan' | 'value' | 'date'>, id?: number) => {
    if (id) {
        db.updateSale(id, saleData);
        addToast('Contrato atualizado com sucesso!', 'success');
    }
    fetchData();
    setIsEditModalOpen(false);
    setEditingContract(null);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const filteredAndSortedContracts = useMemo(() => {
    const isPlanFilter = !Object.values(SaleStatus).includes(filter as SaleStatus) && filter !== 'Todos';

    return contracts
      .filter(c => {
        if (isPlanFilter) return c.plan === filter;
        if (filter !== 'Todos' && c.status !== filter) return false;
        
        const contractDate = new Date(c.date.split('/').reverse().join('-'));
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && contractDate < start) return false;
        if (end && contractDate > end) return false;
        
        return true;
      })
      .sort((a, b) => {
        let valA, valB;
        if (sortKey === 'clientName') {
          valA = clientMap.get(a.clientId) || '';
          valB = clientMap.get(b.clientId) || '';
        } else if (sortKey === 'repName') {
            valA = repMap.get(a.repId) || '';
            valB = repMap.get(b.repId) || '';
        } else {
            valA = a[sortKey as keyof Sale];
            valB = b[sortKey as keyof Sale];
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [contracts, filter, startDate, endDate, sortKey, sortOrder, clientMap, repMap]);

  const totalPages = Math.ceil(filteredAndSortedContracts.length / ITEMS_PER_PAGE);
  const paginatedContracts = filteredAndSortedContracts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `contratos_${filter}_${date}.csv`;
    const dataToExport = filteredAndSortedContracts.map(c => ({
        id: c.id,
        clientName: clientMap.get(c.clientId) || 'N/A',
        repName: repMap.get(c.repId) || 'N/A',
        plan: c.plan,
        value: c.value,
        date: c.date,
        status: c.status,
        rejectionReason: c.rejectionReason || '',
    }));
    const headers = { id: 'ID Contrato', clientName: 'Cliente', repName: 'Representante', plan: 'Plano', value: 'Valor (R$)', date: 'Data', status: 'Status', rejectionReason: 'Motivo da Recusa' };
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
          title="Gestão de Contratos"
          subtitle="Visualize, aprove ou recuse contratos pendentes."
        >
          <button 
              onClick={handleExport}
              className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2"
          >
              <DownloadIcon />
              <span className="hidden sm:inline">Exportar</span>
          </button>
        </ContentHeader>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {(['Todos', ...Object.values(SaleStatus)]).map(status => (
                <button 
                  key={status} 
                  onClick={() => setFilter(status as SaleStatus | 'Todos')}
                  className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${filter === status ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="flex gap-4 items-center flex-wrap md:ml-auto">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"/>
                <span className="text-slate-500">até</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <SortableHeader headerKey="clientName" title="Cliente" />
                  <SortableHeader headerKey="repName" title="Representante" />
                  <SortableHeader headerKey="plan" title="Plano" />
                  <SortableHeader headerKey="value" title="Valor" />
                  <SortableHeader headerKey="date" title="Data" />
                  <SortableHeader headerKey="status" title="Status" />
                  <th scope="col" className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContracts.length > 0 ? paginatedContracts.map(c => (
                  <tr key={c.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{clientMap.get(c.clientId) || 'N/A'}</td>
                    <td className="px-6 py-4">{repMap.get(c.repId) || 'N/A'}</td>
                    <td className="px-6 py-4">{c.plan}</td>
                    <td className="px-6 py-4">R$ {c.value.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4">{c.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedContract(c)} className="font-semibold text-orange-600 hover:underline dark:text-orange-500 dark:hover:text-orange-400">
                          {c.status === SaleStatus.Pending ? 'Analisar' : 'Ver'}
                        </button>
                        {c.status === SaleStatus.Pending && (
                             <button onClick={() => { setEditingContract(c); setIsEditModalOpen(true); }} className="p-1 text-slate-500 hover:text-blue-600" title="Editar Contrato"><Edit2Icon /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400">
                      Nenhum contrato encontrado com os filtros atuais.
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
            totalItems={filteredAndSortedContracts.length}
          />
        </div>
      </div>
      {selectedContract && (
        <ApprovalModal 
            isOpen={!!selectedContract}
            contract={selectedContract} 
            client={clients.find(c => c.id === selectedContract.clientId)}
            rep={reps.find(r => r.id === selectedContract.repId)}
            onClose={() => setSelectedContract(null)} 
            onUpdate={handleUpdateStatus} 
        />
      )}
      {editingContract && (
        <NewSaleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveSale}
          initialData={editingContract}
          allClients={clients}
        />
      )}
    </>
  );
};

export default ContractsScreen;