/**
 * @file Tela de Clientes
 * @description Permite que o representante de vendas gerencie sua carteira de
 * clientes e leads. Exibe uma lista de clientes, e ao clicar, abre um painel
 * lateral com detalhes e uma análise de perfil gerada por IA.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircleIcon, BrainCircuitIcon, XIcon, PhoneIcon, MailIcon, DownloadIcon, Edit2Icon, Trash2Icon, UsersKpiIcon, ArrowUpDown } from './icons';
import { getClientAnalysis } from '../services/geminiService';
import { Client, User, Representative, Activity, Plan } from '../types';
import * as db from '../services/database';
import NewClientModal from './NewClientModal';
import ContentHeader from './ContentHeader';
import { convertToCSV, downloadCSV } from '../utils/export';
import { useToast } from '../contexts/ToastContext';
import Pagination from './Pagination';
import { Briefcase, Calendar, MessageSquare, MoreVertical, Plus } from 'lucide-react';

// Mapeamento de status para classes de cor
const statusColors = {
  'Cliente Ativo': 'text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50',
  'Lead': 'text-purple-800 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/50',
  'Inativo': 'text-slate-800 bg-slate-200 dark:text-slate-300 dark:bg-slate-600',
};

const activityIcons: Record<Activity['type'], React.ReactNode> = {
    'Ligação': <PhoneIcon />,
    'Email': <MailIcon />,
    'Reunião': <UsersKpiIcon />,
    'Outro': <MoreVertical />,
}

/**
 * Painel lateral que exibe os detalhes de um cliente selecionado.
 * Inclui uma análise de perfil gerada pela API do Gemini.
 */
const ClientDetailPanel: React.FC<{ client: Client, repId: number, onClose: () => void, onEdit: (client: Client) => void, onDelete: (client: Client) => void, onRefresh: () => void }> = ({ client, repId, onClose, onEdit, onDelete, onRefresh }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [newActivityNotes, setNewActivityNotes] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const clientActivities = db.getActivitiesForClient(client.id);
            setActivities(clientActivities);
            try {
                const result = await getClientAnalysis(client, clientActivities);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = result;
                setAnalysis(tempDiv.textContent || tempDiv.innerText || "");
            } catch (e) {
                setAnalysis("Não foi possível gerar a análise do cliente no momento.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [client]);

    const handleRegisterActivity = () => {
        if (!newActivityNotes.trim()) {
            addToast("As notas da atividade não podem estar vazias.", "error");
            return;
        }
        db.addActivity({
            clientId: client.id,
            repId: repId,
            type: 'Outro', // Simplificado para este exemplo
            notes: newActivityNotes,
            timestamp: new Date().toISOString()
        });
        addToast("Atividade registrada com sucesso!", "success");
        setNewActivityNotes('');
        onRefresh(); // Atualiza a lista de clientes e o painel
    };

    return (
        <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out" style={{ transform: 'translateX(0%)' }}>
            <div className="flex flex-col h-full">
                <header className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{client.name}</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(client)} className="p-2 text-slate-500 hover:text-orange-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><Edit2Icon /></button>
                        <button onClick={() => onDelete(client)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><Trash2Icon /></button>
                        <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XIcon /></button>
                    </div>
                </header>
                <main className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Detalhes do Cliente */}
                    <div className="space-y-4">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Status: <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[client.status]}`}>{client.status}</span></p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"><MailIcon /> {client.email || 'Não informado'}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"><PhoneIcon /> {client.phone}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"><Briefcase /> Plano: {client.plan}</p>
                    </div>
                     {/* Análise com IA */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                         <h4 className="text-md font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center"><BrainCircuitIcon /> Análise com IA</h4>
                         <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-200">
                            {isLoading ? <p>Analisando perfil do cliente...</p> : <p className="whitespace-pre-wrap">{analysis}</p>}
                         </div>
                    </div>
                    {/* Histórico de Atividades */}
                     <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                         <h4 className="text-md font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center"><MessageSquare size={16} className="mr-2" /> Histórico de Atividades</h4>
                         <div className="space-y-3">
                             {activities.map(act => (
                                 <div key={act.id} className="text-sm">
                                     <p className="font-semibold text-slate-600 dark:text-slate-300">{new Date(act.timestamp).toLocaleString('pt-BR')}</p>
                                     <p className="text-slate-500 dark:text-slate-400">{act.notes}</p>
                                 </div>
                             ))}
                             {activities.length === 0 && <p className="text-sm text-slate-400">Nenhuma atividade registrada.</p>}
                         </div>
                    </div>
                </main>
                {/* Registrar Atividade */}
                <footer className="p-6 border-t bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 space-y-2">
                    <textarea value={newActivityNotes} onChange={e => setNewActivityNotes(e.target.value)} placeholder="Adicione uma nota sobre sua interação..." rows={2} className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"></textarea>
                    <button onClick={handleRegisterActivity} className="w-full bg-orange-600 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"><Plus size={16}/> Registrar Atividade</button>
                </footer>
            </div>
        </div>
    );
}

type SortKey = keyof Client;
type SortOrder = 'asc' | 'desc';

const ClientsScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [currentRep, setCurrentRep] = useState<Representative | null>(null);
  const { addToast } = useToast();

  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchClients = () => {
    const repProfile = db.getRepresentativeByUserId(loggedInUser.id);
    if(repProfile) {
        setCurrentRep(repProfile);
        setClients(db.getClients().filter(c => c.repId === repProfile.id));
    }
    // Se um cliente está selecionado, atualiza seus dados
    if (selectedClient) {
        setSelectedClient(db.getClients().find(c => c.id === selectedClient.id) || null);
    }
  }

  useEffect(() => {
    fetchClients();
  }, [loggedInUser]);
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedClients = useMemo(() => {
      return [...clients].sort((a,b) => {
          const valA = a[sortKey];
          const valB = b[sortKey];
          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
      });
  }, [clients, sortKey, sortOrder]);
  
  const paginatedClients = sortedClients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);

  const handleSaveClient = (clientData: Omit<Client, 'id' | 'repId'>, id?: number) => {
    if(id) {
        db.updateClient(id, clientData);
        addToast('Cliente atualizado com sucesso!', 'success');
    } else {
        const dataToSave = { ...clientData, repId: currentRep?.id };
        db.addClient(dataToSave);
        addToast('Cliente adicionado com sucesso!', 'success');
    }
    fetchClients();
    setIsModalOpen(false);
    setEditingClient(null);
  }
  
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
    setSelectedClient(null);
  }

  const handleDeleteClient = (client: Client) => {
      if(window.confirm(`Tem certeza que deseja excluir ${client.name}? Esta ação também removerá o histórico de atividades.`)) {
          db.deleteClient(client.id);
          addToast('Cliente excluído com sucesso.', 'info');
          setSelectedClient(null);
          fetchClients();
      }
  }

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `meus_clientes_${date}.csv`;
    const headers = { id: 'ID', name: 'Nome', email: 'Email', phone: 'Telefone', document: 'Documento', address: 'Endereço', plan: 'Plano', status: 'Status' };
    const csvString = convertToCSV(clients, headers);
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
          title="Clientes"
          subtitle="Sua carteira de clientes e leads."
        >
          <button onClick={handleExport} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2"><DownloadIcon /><span className="hidden sm:inline">Exportar</span></button>
          <button onClick={() => { setEditingClient(null); setIsModalOpen(true); }} className="bg-orange-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2"><PlusCircleIcon /><span className="hidden sm:inline">Adicionar Cliente</span></button>
        </ContentHeader>

        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <SortableHeader headerKey="name" title="Nome" />
                  <SortableHeader headerKey="plan" title="Plano" />
                  <SortableHeader headerKey="status" title="Status" />
                  <th scope="col" className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.length > 0 ? paginatedClients.map(client => (
                  <tr key={client.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{client.name}</td>
                    <td className="px-6 py-4">{client.plan}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[client.status]}`}>{client.status}</span></td>
                    <td className="px-6 py-4"><button onClick={() => setSelectedClient(client)} className="font-semibold text-orange-600 hover:underline dark:text-orange-500 dark:hover:text-orange-400">Ver Detalhes</button></td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={4} className="text-center py-10 text-slate-500 dark:text-slate-400">Nenhum cliente cadastrado.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={ITEMS_PER_PAGE} totalItems={clients.length} />
        </div>
      </div>
      {selectedClient && <div className="fixed inset-0 bg-black bg-opacity-30 z-30" onClick={() => setSelectedClient(null)}></div>}
      {selectedClient && currentRep && <ClientDetailPanel client={selectedClient} repId={currentRep.id} onClose={() => setSelectedClient(null)} onEdit={handleEditClient} onDelete={handleDeleteClient} onRefresh={fetchClients} />}
      <NewClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveClient} initialData={editingClient} />
    </>
  );
};

export default ClientsScreen;