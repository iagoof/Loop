import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, BrainCircuitIcon, XIcon, PhoneIcon } from './icons';
import { getClientAnalysis } from '../services/geminiService';
import { Client, User, Representative } from '../types';
import * as db from '../services/database';
import NewClientModal from './NewClientModal';


const statusColors = {
  'Cliente Ativo': 'text-blue-800 bg-blue-100',
  'Lead': 'text-purple-800 bg-purple-100',
  'Inativo': 'text-slate-800 bg-slate-200',
};

const ClientDetailPanel: React.FC<{ client: Client, onClose: () => void }> = ({ client, onClose }) => {
    const [analysis, setAnalysis] = useState('Gerando análise...');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setIsLoading(true);
            // Mock history for demonstration
            const history = `Cliente ${client.name} demonstrou interesse em consórcios de automóveis de luxo. Último contato há 2 semanas. Perguntou sobre prazos de pagamento flexíveis.`;
            const result = await getClientAnalysis(history);
            setAnalysis(result);
            setIsLoading(false);
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
                            <p className="text-sm font-semibold text-slate-500">Telefone</p>
                            <p className="text-slate-700 flex items-center"><PhoneIcon /> {client.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Plano Atual</p>
                            <p className="text-slate-700">{client.plan}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                             <h4 className="text-md font-bold text-slate-800 mb-2 flex items-center"><BrainCircuitIcon /> Análise com IA</h4>
                             <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700">
                                {isLoading ? 'Analisando perfil do cliente...' : analysis}
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

  const handleSaveClient = (newClientData: Omit<Client, 'id'>) => {
    // Assign the client to the current representative
    const dataToSave = { ...newClientData, repId: currentRep?.id };
    db.addClient(dataToSave);
    fetchClients();
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
            <p className="text-sm text-slate-500">Sua carteira de clientes e leads.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2">
            <PlusCircleIcon />
            <span>Adicionar Cliente/Lead</span>
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
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
        </main>
      </div>
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