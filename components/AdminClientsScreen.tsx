import React, { useState, useEffect, useMemo } from 'react';
import { Client, Representative, Sale } from '../types';
import * as db from '../services/database';
import ContentHeader from './ContentHeader';
import { DownloadIcon, ArrowUpDown, PlusCircleIcon, Edit2Icon, Trash2Icon } from './icons';
import { convertToCSV, downloadCSV } from '../utils/export';
import Pagination from './Pagination';
import ClientContractsModal from './ClientContractsModal';
import AdminNewClientModal from './AdminNewClientModal';
import { useToast } from '../contexts/ToastContext';
import { getLeadScore } from '../services/geminiService';
import LeadScoreIndicator from './LeadScoreIndicator';

// Styles for client status
const statusColors: Record<Client['status'], string> = {
  'Cliente Ativo': 'text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50',
  'Lead': 'text-purple-800 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/50',
  'Inativo': 'text-slate-800 bg-slate-200 dark:text-slate-300 dark:bg-slate-600',
};

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

// Define a type for the combined data structure used in the table
type ClientRowData = Client & {
    repName: string;
    contractCount: number;
    totalValue: number;
};

type SortKey = keyof ClientRowData;
type SortOrder = 'asc' | 'desc';

const AdminClientsScreen: React.FC = () => {
    // Raw data state
    const [clients, setClients] = useState<Client[]>([]);
    const [reps, setReps] = useState<Representative[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    
    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewingClient, setViewingClient] = useState<Client | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const { addToast } = useToast();

    const ITEMS_PER_PAGE = 10;

    // Fetch all data
    const fetchData = () => {
        setClients(db.getClients());
        setReps(db.getRepresentatives());
        setSales(db.getSales());
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Memoize maps for performance
    const repMap = useMemo(() => new Map(reps.map(r => [r.id, r.name])), [reps]);

    // Combine data for the table
    const processedClients = useMemo<ClientRowData[]>(() => {
        return clients.map(client => {
            const clientSales = sales.filter(s => s.clientId === client.id);
            return {
                ...client,
                repName: client.repId ? repMap.get(client.repId) || 'N/A' : 'N/A',
                contractCount: clientSales.length,
                totalValue: clientSales.reduce((sum, s) => sum + s.value, 0),
            };
        });
    }, [clients, sales, repMap]);

    // Filter and sort the final list
    const sortedAndFilteredClients = useMemo(() => {
        return processedClients
            .filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                client.repName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                let valA: any = a[sortKey as keyof ClientRowData];
                let valB: any = b[sortKey as keyof ClientRowData];
                
                if (sortKey === 'leadScore') {
                    valA = a.leadScore ?? -1;
                    valB = b.leadScore ?? -1;
                }

                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
    }, [processedClients, searchTerm, sortKey, sortOrder]);

    // Pagination logic
    const totalPages = Math.ceil(sortedAndFilteredClients.length / ITEMS_PER_PAGE);
    const paginatedClients = sortedAndFilteredClients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Handlers
    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        else {
            setSortKey(key);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };
    
    const handleOpenModal = (client: Client | null = null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingClient(null);
        setIsModalOpen(false);
    };
    
    const handleSaveClient = async (clientData: Omit<Client, 'id'>, id?: number) => {
        if (id) {
            db.updateClient(id, clientData);
            addToast('Cliente atualizado com sucesso!', 'success');
            fetchData();
        } else {
            const newClient = db.addClient(clientData);
            addToast('Cliente adicionado com sucesso!', 'success');
            fetchData(); // Update list to show new client

            if (newClient.status === 'Lead') {
                addToast('Analisando potencial do lead com IA...', 'info');
                try {
                    const { score, justification } = await getLeadScore(newClient);
                    db.updateClient(newClient.id, { leadScore: score, leadJustification: justification });
                    addToast(`Lead ${newClient.name} pontuado com ${score}!`, 'success');
                    fetchData(); // Fetch again to show score
                } catch (error) {
                    addToast('Não foi possível analisar o lead.', 'error');
                }
            }
        }
        handleCloseModal();
    };

    const handleDeleteClient = (client: Client) => {
        if (window.confirm(`Tem certeza que deseja excluir ${client.name}? Esta ação removerá também seus contratos e histórico de atividades.`)) {
            db.deleteClient(client.id);
            addToast('Cliente excluído com sucesso!', 'success');
            fetchData();
        }
    };

    const handleExport = () => {
        const date = new Date().toISOString().slice(0, 10);
        const filename = `todos_clientes_${date}.csv`;
        const headers = {
            id: 'ID Cliente', name: 'Nome', email: 'Email', phone: 'Telefone',
            status: 'Status', repName: 'Representante', contractCount: 'Nº Contratos',
            totalValue: 'Valor Total (R$)',
        };
        const csvString = convertToCSV(sortedAndFilteredClients, headers);
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
                    title="Gestão de Clientes"
                    subtitle="Adicione, edite e gerencie todos os clientes do sistema."
                >
                     <button
                        onClick={() => handleOpenModal()}
                        className="bg-orange-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2"
                    >
                        <PlusCircleIcon />
                        <span className="hidden sm:inline">Adicionar Cliente</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2"
                    >
                        <DownloadIcon />
                        <span className="hidden sm:inline">Exportar CSV</span>
                    </button>
                </ContentHeader>

                <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou representante..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full max-w-md px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                            aria-label="Buscar clientes"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <SortableHeader headerKey="name" title="Cliente" />
                                    <SortableHeader headerKey="status" title="Status" />
                                    <SortableHeader headerKey="repName" title="Representante" />
                                    <SortableHeader headerKey="leadScore" title="Potencial" />
                                    <SortableHeader headerKey="contractCount" title="Contratos" />
                                    <SortableHeader headerKey="totalValue" title="Valor Total" />
                                    <th scope="col" className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedClients.length > 0 ? paginatedClients.map(client => (
                                    <tr key={client.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            <div>{client.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{client.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[client.status]}`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{client.repName}</td>
                                        <td className="px-6 py-4">
                                            <LeadScoreIndicator score={client.leadScore} justification={client.leadJustification} />
                                        </td>
                                        <td className="px-6 py-4 text-center">{client.contractCount}</td>
                                        <td className="px-6 py-4">{formatCurrency(client.totalValue)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button onClick={() => setViewingClient(client)} className="font-semibold text-sm text-blue-600 hover:underline dark:text-blue-500 px-2 py-1">
                                                    Ver Contratos
                                                </button>
                                                <button onClick={() => handleOpenModal(client)} className="p-2 text-slate-500 hover:text-orange-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Editar"><Edit2Icon /></button>
                                                <button onClick={() => handleDeleteClient(client)} className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50" title="Excluir"><Trash2Icon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                            Nenhum cliente encontrado.
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
                        totalItems={sortedAndFilteredClients.length}
                    />
                </div>
            </div>
            {viewingClient && (
                <ClientContractsModal
                    isOpen={!!viewingClient}
                    onClose={() => setViewingClient(null)}
                    client={viewingClient}
                    contracts={sales.filter(s => s.clientId === viewingClient.id)}
                    repName={viewingClient.repId ? repMap.get(viewingClient.repId) || 'N/A' : 'N/A'}
                />
            )}
            {isModalOpen && (
                <AdminNewClientModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveClient}
                    initialData={editingClient}
                />
            )}
        </>
    );
};

export default AdminClientsScreen;