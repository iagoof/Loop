/**
 * @file Tela de Vendas (Contratos)
 * @description Esta tela permite que os representantes de vendas gerenciem seus
 * contratos (vendas). Eles podem visualizar, registrar novas vendas, editar
 * vendas pendentes e baixar uma cópia do contrato preenchido.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Sale, SaleStatus, User, UserRole, Representative, Client } from '../types';
import { PlusCircleIcon, MoreHorizontalIcon, DownloadIcon } from './icons';
import NewSaleModal from './NewSaleModal';
import * as db from '../services/database';
import ContentHeader from './ContentHeader';
import { convertToCSV, downloadCSV } from '../utils/export';
import { useToast } from '../contexts/ToastContext';

// Mapeamento de status para classes de cor do Tailwind CSS para estilização
const statusColors: Record<SaleStatus, string> = {
  [SaleStatus.Approved]: 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/50',
  [SaleStatus.Pending]: 'text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50',
  [SaleStatus.Rejected]: 'text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900/50',
};

/**
 * Componente para uma única linha na tabela de vendas.
 */
const SaleRow: React.FC<{ sale: Sale; clientName: string; onEdit: (sale: Sale) => void; onDownload: (sale: Sale) => void; }> = ({ sale, clientName, onEdit, onDownload }) => (
  <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{clientName}</td>
    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{sale.plan}</td>
    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{`R$ ${sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td>
    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{sale.date}</td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[sale.status]}`}>
        {sale.status}
      </span>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex items-center justify-end space-x-1">
        <button onClick={() => onDownload(sale)} className="font-medium text-blue-600 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Baixar Contrato">
          <DownloadIcon />
        </button>
        <button onClick={() => onEdit(sale)} className="font-medium text-orange-600 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Editar Venda">
          <MoreHorizontalIcon />
        </button>
      </div>
    </td>
  </tr>
);

/**
 * Converte uma string Markdown para uma representação de texto plano legível.
 * @param markdown A string Markdown a ser convertida.
 * @returns O texto plano formatado.
 */
const markdownToPlainText = (markdown: string): string => {
    let text = markdown;
    
    // Títulos (ex: # Título -> TÍTULO)
    text = text.replace(/^# (.*$)/gim, (_, p1) => p1.toUpperCase() + '\n' + '-'.repeat(p1.length));
    text = text.replace(/^## (.*$)/gim, (_, p1) => p1 + '\n' + '-'.repeat(p1.length));
    
    // Negrito (**texto** ou __texto__)
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    text = text.replace(/__(.*?)__/g, '$1');

    // Itálico (*texto* ou _texto_)
    text = text.replace(/\*(.*?)\*/g, '$1');
    text = text.replace(/_(.*?)_/g, '$1');
    
    // Sublinhado (<u>texto</u>)
    text = text.replace(/<u>(.*?)<\/u>/g, '$1');

    // Remove quebras de linha múltiplas
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
};


const SalesScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [currentRep, setCurrentRep] = useState<Representative | null>(null);
  const { addToast } = useToast();

  // Função para buscar os dados do banco de dados simulado
  const fetchSales = () => {
     const allSales = db.getSales();
     const allClients = db.getClients();
     setClients(allClients);

     // Filtra as vendas para mostrar apenas as do representante logado
     if (loggedInUser.role === UserRole.Representative) {
        const repProfile = db.getRepresentativeByUserId(loggedInUser.id);
        if(repProfile) {
            setCurrentRep(repProfile);
            setSales(allSales.filter(s => s.repId === repProfile.id));
        }
     } else { // Administradores veem todas as vendas
        setSales(allSales);
     }
  }

  // Mapeamento de ID do cliente para nome para evitar buscas repetidas
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
    if (id) { // Editando uma venda existente
        db.updateSale(id, saleData);
        addToast('Venda atualizada com sucesso!', 'success');
    } else if (currentRep) { // Criando uma nova venda para o representante atual
        const newSaleData = { ...saleData, repId: currentRep.id };
        db.addSale(newSaleData);
        addToast('Nova venda registrada com sucesso!', 'success');
    }
    fetchSales(); // Atualiza a lista de vendas
  };
  
  // Lógica para gerar e baixar o contrato
  const handleDownloadContract = (sale: Sale) => {
    let template = db.getContractTemplate();
    const client = db.getClients().find(c => c.id === sale.clientId);
    const rep = db.getRepresentatives().find(r => r.id === sale.repId);
    
    if (!client) {
        addToast('Cliente não encontrado para gerar o contrato.', 'error');
        return;
    }

    // Objeto com as variáveis a serem substituídas no template
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
    
    // Substitui cada placeholder no template
    let contractText = template;
    for (const key in replacements) {
        contractText = contractText.replace(new RegExp(key, 'g'), replacements[key]);
    }

    // Converte o texto final de Markdown para texto plano antes de criar o arquivo
    const plainTextContract = markdownToPlainText(contractText);

    // Cria um arquivo de texto e inicia o download
    const blob = new Blob([plainTextContract], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Contrato_${client.name.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Filtra a lista de clientes para passar apenas os do representante para o modal
const repClients = useMemo(() => {
    if(!currentRep) return [];
    return clients.filter(c => c.repId === currentRep.id);
}, [clients, currentRep]);

const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `minhas_vendas_${date}.csv`;

    const dataToExport = sales.map(sale => ({
        id: sale.id,
        clientName: clientNameMap.get(sale.clientId) || 'Cliente não encontrado',
        plan: sale.plan,
        value: sale.value,
        date: sale.date,
        status: sale.status,
    }));
    
    const headers = {
        id: 'ID Venda',
        clientName: 'Cliente',
        plan: 'Plano',
        value: 'Valor (R$)',
        date: 'Data',
        status: 'Status',
    };

    const csvString = convertToCSV(dataToExport, headers);
    downloadCSV(csvString, filename);
};


  return (
    <>
      <div className="p-4 md:p-6">
        <ContentHeader 
          title="Vendas"
          subtitle="Acompanhe o status dos seus contratos."
        >
          <button
            onClick={handleExport}
            className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-orange-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2"
          >
            <PlusCircleIcon />
            <span className="hidden sm:inline">Registrar Nova Venda</span>
          </button>
        </ContentHeader>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Contratos Recentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
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