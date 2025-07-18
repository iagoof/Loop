/**
 * @file Tela de Clientes
 * @description Permite que o representante de vendas gerencie sua carteira de
 * clientes e leads. Exibe uma lista de clientes, e ao clicar, abre um painel
 * lateral com detalhes e uma análise de perfil gerada por IA.
 */
import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, BrainCircuitIcon, XIcon, PhoneIcon, MailIcon, DownloadIcon } from './icons';
import { getClientAnalysis } from '../services/geminiService';
import { Client, User, Representative } from '../types';
import * as db from '../services/database';
import NewClientModal from './NewClientModal';
import ContentHeader from './ContentHeader';
import { convertToCSV, downloadCSV } from '../utils/export';

// Mapeamento de status para classes de cor
const statusColors = {
  'Cliente Ativo': 'text-blue-800 bg-blue-100',
  'Lead': 'text-purple-800 bg-purple-100',
  'Inativo': 'text-slate-800 bg-slate-200',
};

/**
 * Painel lateral que exibe os detalhes de um cliente selecionado.
 * Inclui uma análise de perfil gerada pela API do Gemini.
 */
const ClientDetailPanel: React.FC<{ client: Client, onClose: () => void }> = ({ client, onClose }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setIsLoading(true);
            // Simula um histórico para fins de demonstração
            const history = `Cliente ${client.name} demonstrou interesse em consórcios de automóveis de luxo. Último contato há 2 semanas. Perguntou sobre prazos de pagamento flexíveis.`;
            try {
                const result = await getClientAnalysis(history);
                // Higieniza a resposta para prevenir HTML/estilos indesejados da IA
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = result;
                const sanitizedText = tempDiv.textContent || tempDiv.innerText || "";
                setAnalysis(sanitizedText);
            } catch (e) {
                console.error("Erro ao buscar análise do cliente:", e);
                setAnalysis("Não foi possível gerar a análise do cliente no momento.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [client]);

    const handleRegisterActivity = () => {
        alert(`Atividade para ${client.name} registrada com sucesso! (O histórico de atividades é uma funcionalidade futura.)`);
    }

    return (
        <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out" style={{ transform: 'translateX(0%)' }}>
            <div className="flex flex-col h-full">
                <header className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">{client.name}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
                </header>
                <main className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Status</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[client.status]}`}>{client.status}</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Email</p>
                            <p className="text-slate-700 flex items-center"><MailIcon /> {client.email || 'Não informado'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Telefone</p>
                            <p className="text-slate-700 flex items-center"><PhoneIcon /> {client.phone}</p>
                        </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-500">Documento (CPF/CNPJ)</p>
                            <p className="text-slate-700">{client.document || 'Não informado'}</p>
                        </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-500">Endereço</p>
                            <p className="text-slate-700">{client.address || 'Não informado'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Plano Atual</p>
                            <p className="text-slate-700">{client.plan}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                             <h4 className="text-md font-bold text-slate-800 mb-2 flex items-center"><BrainCircuitIcon /> Análise com IA</h4>
                             <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700">
                                {isLoading ? <p>Analisando perfil do cliente...</p> : <p className="whitespace-pre-wrap">{analysis}</p>}
                             </div>
                        </div>
                    </div>
                </main>
                <footer className="p-6 border-t bg-slate-50">
                    <button onClick={handleRegisterActivity} className="w-full bg-orange-600 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-700">Registrar Atividade</button>
                </footer>
            </div>
        </div>
    );
}

const ClientsScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRep, setCurrentRep] = useState<Representative | null>(null);

  // Busca e filtra os clientes para o representante logado
  const fetchClients = () => {
    const allClients = db.getClients();
    const repProfile = db.getRepresentativeByUserId(loggedInUser.id);
    if(repProfile) {
        setCurrentRep(repProfile);
        setClients(allClients.filter(c => c.repId === repProfile.id));
    }
  }

  useEffect(() => {
    fetchClients();
  }, [loggedInUser]);

  // Salva um novo cliente
  const handleSaveClient = (newClientData: Omit<Client, 'id'>) => {
    // Associa o cliente ao representante atual
    const dataToSave = { ...newClientData, repId: currentRep?.id };
    db.addClient(dataToSave);
    fetchClients(); // Atualiza a lista
  }

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `meus_clientes_${date}.csv`;

    const headers = {
        id: 'ID',
        name: 'Nome',
        email: 'Email',
        phone: 'Telefone',
        document: 'Documento',
        address: 'Endereço',
        plan: 'Plano',
        status: 'Status',
    };
    
    const csvString = convertToCSV(clients, headers);
    downloadCSV(csvString, filename);
  };

  return (
    <>
      <div className="p-4 md:p-6">
        <ContentHeader 
          title="Clientes"
          subtitle="Sua carteira de clientes e leads."
        >
          <button
            onClick={handleExport}
            className="bg-slate-100 text-slate-700 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center space-x-2"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2">
            <PlusCircleIcon />
            <span className="hidden sm:inline">Adicionar Cliente/Lead</span>
          </button>
        </ContentHeader>

        <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Nome</th>
                  <th scope="col" className="px-6 py-3">Plano</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{client.name}</td>
                    <td className="px-6 py-4">{client.plan}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[client.status]}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedClient(client)} className="font-semibold text-orange-600 hover:underline">
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Overlay escuro quando o painel de detalhes está aberto */}
      {selectedClient && <div className="fixed inset-0 bg-black bg-opacity-30 z-30" onClick={() => setSelectedClient(null)}></div>}
      {selectedClient && <ClientDetailPanel client={selectedClient} onClose={() => setSelectedClient(null)} />}
      <NewClientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
      />
    </>
  );
};

export default ClientsScreen;