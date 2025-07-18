/**
 * @file Tela de Gestão de Contratos
 * @description Permite que o administrador visualize todos os contratos (vendas) do sistema,
 * filtre-os por status (Pendente, Aprovada, Recusada) e analise os detalhes de
 * cada um para aprovação ou recusa.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Sale, SaleStatus, Client, Representative } from '../types';
import * as db from '../services/database';
import ApprovalModal from './ApprovalModal';
import ContentHeader from './ContentHeader';
import { DownloadIcon } from './icons';
import { convertToCSV, downloadCSV } from '../utils/export';

// Mapeamento de status para classes de cor
const statusColors: Record<SaleStatus, string> = {
  [SaleStatus.Approved]: 'text-green-800 bg-green-100',
  [SaleStatus.Pending]: 'text-yellow-800 bg-yellow-100',
  [SaleStatus.Rejected]: 'text-red-800 bg-red-100',
};

const ContractsScreen: React.FC = () => {
  const [contracts, setContracts] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reps, setReps] = useState<Representative[]>([]);
  const [filter, setFilter] = useState<SaleStatus | 'Todos'>('Todos');
  const [selectedContract, setSelectedContract] = useState<Sale | null>(null);

  // Busca os dados necessários do banco de dados simulado
  const fetchData = () => {
    setContracts(db.getSales());
    setClients(db.getClients());
    setReps(db.getRepresentatives());
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Memoiza os mapas de clientes e representantes para otimizar a busca
  const clientMap = useMemo(() => {
    return new Map(clients.map(client => [client.id, client]));
  }, [clients]);

  const repMap = useMemo(() => {
    return new Map(reps.map(rep => [rep.id, rep]));
  }, [reps]);


  // Atualiza o status de um contrato e recarrega os dados
  const handleUpdateStatus = (id: number, status: SaleStatus, reason?: string) => {
    db.updateSale(id, { status, rejectionReason: reason });
    fetchData();
  };

  // Filtra os contratos com base no status selecionado
  const filteredContracts = contracts.filter(c => filter === 'Todos' || c.status === filter);

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `contratos_${filter}_${date}.csv`;

    const dataToExport = filteredContracts.map(c => ({
        id: c.id,
        clientName: clientMap.get(c.clientId)?.name || 'N/A',
        repName: repMap.get(c.repId)?.name || 'N/A',
        plan: c.plan,
        value: c.value,
        date: c.date,
        status: c.status,
        rejectionReason: c.rejectionReason || '',
    }));

    const headers = {
        id: 'ID Contrato',
        clientName: 'Cliente',
        repName: 'Representante',
        plan: 'Plano',
        value: 'Valor (R$)',
        date: 'Data',
        status: 'Status',
        rejectionReason: 'Motivo da Recusa',
    };

    const csvString = convertToCSV(dataToExport, headers);
    downloadCSV(csvString, filename);
  };

  return (
    <>
      <div className="p-4 md:p-6">
        <ContentHeader 
          title="Gestão de Contratos"
          subtitle="Visualize, aprove ou recuse contratos pendentes."
        >
          <button 
              onClick={handleExport}
              className="bg-slate-100 text-slate-700 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center space-x-2"
          >
              <DownloadIcon />
              <span className="hidden sm:inline">Exportar para CSV</span>
          </button>
        </ContentHeader>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-6">
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
                    <td className="px-6 py-4 font-medium text-slate-900">{clientMap.get(c.clientId)?.name || 'N/A'}</td>
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
      </div>
      {/* Renderiza o modal de aprovação quando um contrato é selecionado */}
      {selectedContract && (
        <ApprovalModal 
            isOpen={!!selectedContract}
            contract={selectedContract} 
            client={clientMap.get(selectedContract.clientId)}
            rep={repMap.get(selectedContract.repId)}
            onClose={() => setSelectedContract(null)} 
            onUpdate={handleUpdateStatus} 
        />
      )}
    </>
  );
};

export default ContractsScreen;