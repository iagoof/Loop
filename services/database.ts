import { Sale, SaleStatus, Client, Representative, Plan, Commission, User, UserRole, WhatsAppChat, WhatsAppMessage } from '../types';

// --- DATA SECURITY NOTE ---
// In a real application, NEVER store plain text passwords.
// This is a simplified example. We are storing a "password_hash" to simulate this.
// A real implementation would use a library like bcrypt.js to hash passwords.
const simpleHash = (s: string) => `hashed_${s}`;


// --- INITIAL MOCK DATA (SEED) ---
const initialUsers: User[] = [
  { id: 101, name: 'Admin', email: 'admin@loop.com', password_hash: simpleHash('password123'), role: UserRole.Admin },
  { id: 1, name: 'Carlos Andrade', email: 'carlos.a@example.com', password_hash: simpleHash('password123'), role: UserRole.Representative },
  { id: 2, name: 'Sofia Ribeiro', email: 'sofia.r@example.com', password_hash: simpleHash('password123'), role: UserRole.Representative },
  { id: 3, name: 'Juliana Paes', email: 'juliana.p@example.com', password_hash: simpleHash('password123'), role: UserRole.Representative },
  { id: 4, name: 'Pedro Mendes', email: 'pedro.m@example.com', password_hash: simpleHash('password123'), role: UserRole.Representative },
  { id: 5, name: 'Mariana Lima', email: 'mariana.l@example.com', password_hash: simpleHash('password123'), role: UserRole.Representative },
  { id: 12, name: 'Ana Costa', email: 'ana.c@example.com', password_hash: simpleHash('password123'), role: UserRole.Client },
  { id: 1, name: 'Maria Oliveira', email: 'maria.o@example.com', password_hash: simpleHash('password123'), role: UserRole.Client },
];

const initialReps: Representative[] = [
  { id: 1, userId: 1, name: 'Carlos Andrade', email: 'carlos.a@example.com', sales: 12, commissionRate: 5, status: 'Ativo' },
  { id: 2, userId: 2, name: 'Sofia Ribeiro', email: 'sofia.r@example.com', sales: 9, commissionRate: 5, status: 'Ativo' },
  { id: 3, userId: 3, name: 'Juliana Paes', email: 'juliana.p@example.com', sales: 7, commissionRate: 4.5, status: 'Ativo' },
  { id: 4, userId: 4, name: 'Pedro Mendes', email: 'pedro.m@example.com', sales: 5, commissionRate: 4.5, status: 'Inativo' },
  { id: 5, userId: 5, name: 'Mariana Lima', email: 'mariana.l@example.com', sales: 15, commissionRate: 5.5, status: 'Ativo' },
];

const initialClients: Client[] = [
  { id: 1, userId: 1, repId: 2, name: 'Maria Oliveira', email: 'maria.o@example.com', phone: '(11) 98765-4321', document: '123.456.789-10', address: 'Rua das Flores, 123, São Paulo, SP', plan: 'Consórcio de Imóvel', status: 'Cliente Ativo', nextPayment: '20/08/2025' },
  { id: 2, repId: 1, name: 'João Silva', email: 'joao.s@example.com', phone: '(21) 91234-5678', document: '234.567.890-11', address: 'Avenida Copacabana, 456, Rio de Janeiro, RJ', plan: 'Consórcio de Automóvel', status: 'Cliente Ativo', nextPayment: '25/08/2025' },
  { id: 3, repId: 2, name: 'Carlos Pereira', email: 'carlos.p@example.com', phone: '(31) 95555-8888', document: '345.678.901-22', address: 'Rua da Bahia, 789, Belo Horizonte, MG', plan: 'Consórcio de Imóvel', status: 'Inativo' },
  { id: 4, repId: 3, name: 'Beatriz Lima', email: 'beatriz.l@example.com', phone: '(41) 99999-1111', document: '456.789.012-33', address: 'Rua das Araucárias, 101, Curitiba, PR', plan: 'Consórcio de Serviços', status: 'Cliente Ativo', nextPayment: '10/09/2025' },
  { id: 5, repId: 1, name: 'Ricardo Alves', email: 'ricardo.a@example.com', phone: '(51) 98888-2222', document: '567.890.123-44', address: 'Avenida Ipiranga, 202, Porto Alegre, RS', plan: 'Consórcio de Automóvel', status: 'Lead' },
  { id: 6, repId: 1, name: 'Fernanda Lima', email: 'fernanda.l@example.com', phone: '(61) 97777-3333', document: '678.901.234-55', address: 'Eixo Monumental, 303, Brasília, DF', plan: 'Nenhum', status: 'Lead' },
  { id: 7, repId: 5, name: 'Roberto Dias', email: 'roberto.d@example.com', phone: '(71) 97777-3334', document: '789.012.345-66', address: 'Avenida Oceânica, 404, Salvador, BA', plan: 'Consórcio de Automóvel', status: 'Cliente Ativo', nextPayment: '05/09/2025' },
  { id: 8, repId: 3, name: 'Lucas Martins', email: 'lucas.m@example.com', phone: '(81) 97777-3335', document: '890.123.456-77', address: 'Rua da Moeda, 505, Recife, PE', plan: 'Consórcio de Serviços', status: 'Cliente Ativo', nextPayment: '08/09/2025' },
  { id: 9, repId: 2, name: 'Vanessa Costa', email: 'vanessa.c@example.com', phone: '(85) 97777-3336', document: '901.234.567-88', address: 'Avenida Beira Mar, 606, Fortaleza, CE', plan: 'Consórcio de Imóvel', status: 'Cliente Ativo', nextPayment: '12/09/2025' },
  { id: 10, repId: 4, name: 'Gabriel Rocha', email: 'gabriel.r@example.com', phone: '(92) 97777-3337', document: '012.345.678-99', address: 'Rua do Comércio, 707, Manaus, AM', plan: 'Consórcio de Automóvel', status: 'Inativo' },
  { id: 11, repId: 5, name: 'Mariana Azevedo', email: 'mariana.az@example.com', phone: '(48) 97777-3338', document: '111.222.333-44', address: 'Avenida Beira Mar Norte, 808, Florianópolis, SC', plan: 'Consórcio de Imóvel', status: 'Cliente Ativo', nextPayment: '18/09/2025' },
  { id: 12, userId: 12, repId: 1, name: 'Ana Costa', email: 'ana.c@example.com', phone: '(11) 98765-1111', document: '555.666.777-88', address: 'Avenida Paulista, 909, São Paulo, SP', plan: 'Consórcio de Automóvel - R$ 80.000,00', status: 'Cliente Ativo', nextPayment: '15/08/2025' },
];

const initialSales: Sale[] = [
  { id: 1, repId: 1, clientName: 'João Silva', plan: 'Consórcio de Automóvel', value: 50000, date: '09/07/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 2, repId: 2, clientName: 'Carlos Pereira', plan: 'Consórcio de Imóvel', value: 350000, date: '05/07/2025', status: SaleStatus.Pending, commissionPaid: false },
  { id: 3, repId: 3, clientName: 'Beatriz Lima', plan: 'Consórcio de Serviços', value: 15000, date: '02/07/2025', status: SaleStatus.Rejected, commissionPaid: false, rejectionReason: 'Score de crédito insuficiente.' },
  { id: 4, repId: 4, clientName: 'Ricardo Alves', plan: 'Consórcio de Automóvel', value: 80000, date: '28/06/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 5, repId: 1, clientName: 'Fernanda Lima', plan: 'Consórcio de Imóvel', value: 450000, date: '15/07/2025', status: SaleStatus.Pending, commissionPaid: false },
  { id: 6, repId: 2, clientName: 'Roberto Dias', plan: 'Consórcio de Automóvel', value: 95000, date: '14/07/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 7, repId: 3, clientName: 'Lucas Martins', plan: 'Consórcio de Serviços', value: 25000, date: '12/07/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 8, repId: 1, clientName: 'Vanessa Costa', plan: 'Consórcio de Imóvel', value: 600000, date: '11/07/2025', status: SaleStatus.Pending, commissionPaid: false },
  { id: 9, repId: 4, clientName: 'Gabriel Rocha', plan: 'Consórcio de Automóvel', value: 120000, date: '10/07/2025', status: SaleStatus.Rejected, commissionPaid: false, rejectionReason: 'Documentação incompleta.' },
  { id: 10, repId: 5, clientName: 'Mariana Azevedo', plan: 'Consórcio de Imóvel', value: 280000, date: '08/07/2025', status: SaleStatus.Pending, commissionPaid: false },
];

const initialPlans: Plan[] = [
  { id: 1, name: 'Meu Apê', type: 'Imóvel', valueRange: [150000, 500000], term: 180, adminFee: 18 },
  { id: 2, name: 'Carro Novo', type: 'Automóvel', valueRange: [40000, 120000], term: 80, adminFee: 15 },
  { id: 3, name: 'Sua Viagem', type: 'Serviços', valueRange: [10000, 30000], term: 36, adminFee: 22 },
  { id: 4, name: 'Casa na Praia', type: 'Imóvel', valueRange: [300000, 1000000], term: 200, adminFee: 17 },
  { id: 5, name: 'Moto Zera', type: 'Automóvel', valueRange: [15000, 40000], term: 60, adminFee: 16 },
];

const initialWhatsAppChats: WhatsAppChat[] = [
    {
        id: 1,
        clientId: 2,
        clientName: 'João Silva',
        clientPhone: '(21) 91234-5678',
        lastMessageTimestamp: new Date().toISOString(),
        messages: [
            { id: 1, sender: 'client', text: 'Olá, gostaria de saber o status do meu consórcio.', timestamp: new Date().toISOString() },
            { id: 2, sender: 'bot', text: 'Olá, João! Seu consórcio de Automóvel está ativo e com os pagamentos em dia. O próximo vencimento é em 25/08/2025. Posso ajudar em algo mais?', timestamp: new Date().toISOString() },
        ]
    }
];

const DEFAULT_CONTRACT_TEMPLATE = `CONTRATO DE ADESÃO A GRUPO DE CONSÓRCIO

CONTRATANTE:
Nome: {{CLIENT_NAME}}
CPF/CNPJ: {{CLIENT_DOCUMENT}}
Endereço: {{CLIENT_ADDRESS}}
Email: {{CLIENT_EMAIL}}
Telefone: {{CLIENT_PHONE}}

REPRESENTANTE: {{REP_NAME}}

----------------------------------------------------

Pelo presente instrumento, a CONTRATANTE adere ao grupo de consórcio para aquisição do seguinte bem ou serviço, sob as condições abaixo:

PLANO: {{SALE_PLAN_NAME}}
VALOR DO CRÉDITO: R$ {{SALE_VALUE}}
DATA DA VENDA: {{SALE_DATE}}

Este contrato é regido pelas cláusulas e condições gerais do regulamento do grupo de consórcio, que a CONTRATANTE declara ter lido e concordado na íntegra.

A contemplação ocorrerá por sorteio ou lance, conforme as regras da administradora.

Local e Data: São Paulo, {{TODAY_DATE}}.


________________________________________
{{CLIENT_NAME}}
(Contratante)

________________________________________
Loop Soluções Financeiras
(Administradora)
`;


// --- DB HELPER FUNCTIONS ---
const get = <T>(key: string, defaultValue: T): T => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.error(`Error reading from localStorage key “${key}”:`, e);
        return defaultValue;
    }
};

const set = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error writing to localStorage key “${key}”:`, e);
    }
};

const getNextId = <T extends {id: number}>(items: T[]): number => {
    if (!items || items.length === 0) return 1;
    return items.reduce((maxId, item) => Math.max(item.id, maxId), 0) + 1;
};

// --- DATABASE SEEDING ---
export const seedDatabase = () => {
    if (!localStorage.getItem('seeded_v4')) { // Bump version to re-seed with new data structure
        set('users', initialUsers);
        set('sales', initialSales);
        set('clients', initialClients);
        set('representatives', initialReps);
        set('plans', initialPlans);
        set('whatsapp_chats', initialWhatsAppChats);
        set('contract_template', DEFAULT_CONTRACT_TEMPLATE);
        localStorage.setItem('seeded_v4', 'true');
    }
};

// --- AUTHENTICATION API ---
export const getUsers = (): User[] => get('users', []);
export const findUserByEmail = (email: string): User | undefined => {
    return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const registerUser = (data: Omit<User, 'id' | 'password_hash'> & { password_plaintext: string }): User | { error: string } => {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { error: 'Este email já está em uso.' };
    }
    const newUser: User = {
        id: getNextId(users),
        name: data.name,
        email: data.email,
        password_hash: simpleHash(data.password_plaintext),
        role: data.role
    };
    
    set('users', [...users, newUser]);

    // If a new client or rep is registered, create a corresponding profile
    if(newUser.role === UserRole.Client) {
        addClient({ name: newUser.name, email: newUser.email, phone: '', document: '', address: '', plan: 'Nenhum', status: 'Lead', userId: newUser.id });
    } else if (newUser.role === UserRole.Representative) {
        addRepresentative({ name: newUser.name, email: newUser.email, commissionRate: 4, userId: newUser.id });
    }
    
    return newUser;
};

// Sales
export const getSales = (): Sale[] => get('sales', []);
export const addSale = (newSaleData: Omit<Sale, 'id'|'status'|'commissionPaid'|'rejectionReason'>): Sale => {
    const sales = getSales();
    const newSale: Sale = {
        ...newSaleData,
        id: getNextId(sales),
        status: SaleStatus.Pending,
        commissionPaid: false
    };
    set('sales', [newSale, ...sales]);
    return newSale;
};
export const updateSale = (id: number, updates: Partial<Sale>): Sale | undefined => {
    const sales = getSales();
    let updatedSale: Sale | undefined;
    const newSales = sales.map(sale => {
        if (sale.id === id) {
            updatedSale = { ...sale, ...updates };
            return updatedSale;
        }
        return sale;
    });
    if (updatedSale) {
        set('sales', newSales);
    }
    return updatedSale;
};

// Representatives
export const getRepresentatives = (): Representative[] => get('representatives', []);
export const addRepresentative = (data: Omit<Representative, 'id'|'sales'|'status'>): Representative => {
    const reps = getRepresentatives();
    const newRep: Representative = {
        ...data,
        id: getNextId(reps),
        sales: 0,
        status: 'Ativo'
    };
    set('representatives', [...reps, newRep]);
    return newRep;
};
export const updateRepresentative = (id: number, updates: Partial<Representative>): Representative | undefined => {
    const reps = getRepresentatives();
    let updatedRep: Representative | undefined;
    const newReps = reps.map(r => {
        if (r.id === id) {
            updatedRep = { ...r, ...updates };
            return updatedRep;
        }
        return r;
    });
    if(updatedRep) {
        set('representatives', newReps);
    }
    return updatedRep;
};
export const getRepresentativeByUserId = (userId: number): Representative | undefined => {
    return getRepresentatives().find(r => r.userId === userId);
};

// Plans
export const getPlans = (): Plan[] => get('plans', []);
export const addPlan = (data: Omit<Plan, 'id'>): Plan => {
    const plans = getPlans();
    const newPlan: Plan = { ...data, id: getNextId(plans) };
    set('plans', [...plans, newPlan]);
    return newPlan;
};
export const updatePlan = (id: number, updates: Partial<Omit<Plan, 'id'>>): Plan | undefined => {
    const plans = getPlans();
    let updatedPlan: Plan | undefined;
    const newPlans = plans.map(p => {
        if (p.id === id) {
            updatedPlan = { ...p, ...updates };
            return updatedPlan;
        }
        return p;
    });
    if (updatedPlan) {
        set('plans', newPlans);
    }
    return updatedPlan;
};
export const deletePlan = (id: number): void => {
    const plans = getPlans();
    set('plans', plans.filter(p => p.id !== id));
};

// Clients
export const getClients = (): Client[] => get('clients', []);
export const addClient = (data: Omit<Client, 'id'>): Client => {
    const clients = getClients();
    const newClient: Client = { ...data, id: getNextId(clients) };
    set('clients', [newClient, ...clients]);
    return newClient;
};
export const getClientByUserId = (userId: number): Client | undefined => {
    return getClients().find(c => c.userId === userId);
}


// Commissions
export const getCommissions = (): Commission[] => {
    const sales = getSales().filter(s => s.status === SaleStatus.Approved);
    const reps = getRepresentatives();
    
    const commissions: Commission[] = sales.map(sale => {
        const rep = reps.find(r => r.id === sale.repId);
        const commissionValue = rep ? (sale.value * (rep.commissionRate / 100)) : 0;
        return {
            id: sale.id,
            repName: rep ? rep.name : 'N/A',
            period: new Date(sale.date.split('/').reverse().join('-')).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
            salesValue: sale.value,
            commissionRate: rep ? rep.commissionRate : 0,
            commissionValue,
            status: sale.commissionPaid ? 'Paga' : 'Pendente'
        };
    });
    
    return commissions;
};

export const markCommissionAsPaid = (saleId: number): void => {
    updateSale(saleId, { commissionPaid: true });
};


// --- WHATSAPP BOT ---

export const getWhatsAppChats = (): WhatsAppChat[] => {
    const chats = get<WhatsAppChat[]>('whatsapp_chats', []);
    return chats.sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
};

export const addWhatsAppMessage = (chatId: number, message: Omit<WhatsAppMessage, 'id'|'timestamp'>): WhatsAppChat | undefined => {
    const chats = getWhatsAppChats();
    let updatedChat: WhatsAppChat | undefined;
    const newTimestamp = new Date().toISOString();

    const newChats = chats.map(chat => {
        if (chat.id === chatId) {
            const newMessage: WhatsAppMessage = {
                ...message,
                id: getNextId(chat.messages),
                timestamp: newTimestamp
            };
            updatedChat = { 
                ...chat, 
                messages: [...chat.messages, newMessage],
                lastMessageTimestamp: newTimestamp
            };
            return updatedChat;
        }
        return chat;
    });

    if (updatedChat) {
        set('whatsapp_chats', newChats);
    }
    return updatedChat;
};

export const simulateIncomingWhatsAppMessage = (): { chat: WhatsAppChat, newMessage: WhatsAppMessage } | null => {
    const clients = getClients().filter(c => c.status === 'Cliente Ativo');
    if(clients.length === 0) return null;

    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const queries = [
        `Olá, qual o status do meu plano ${randomClient.plan}?`,
        `Quando vence minha próxima parcela?`,
        `Gostaria de saber o saldo devedor do meu consórcio.`,
        `Como faço para ofertar um lance?`,
        `Perdi a data de pagamento, e agora?`,
    ];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];

    let chats = getWhatsAppChats();
    let chat = chats.find(c => c.clientId === randomClient.id);
    const newTimestamp = new Date().toISOString();

    if (!chat) {
        chat = {
            id: getNextId(chats),
            clientId: randomClient.id,
            clientName: randomClient.name,
            clientPhone: randomClient.phone,
            messages: [],
            lastMessageTimestamp: newTimestamp
        };
        chats = [chat, ...chats];
    }

    const newMessage: WhatsAppMessage = {
        id: getNextId(chat.messages),
        sender: 'client',
        text: randomQuery,
        timestamp: newTimestamp
    };

    chat.messages.push(newMessage);
    chat.lastMessageTimestamp = newTimestamp;
    
    set('whatsapp_chats', chats);

    return { chat, newMessage };
};

// --- CONTRACT TEMPLATE ---
export const getContractTemplate = (): string => get('contract_template', DEFAULT_CONTRACT_TEMPLATE);
export const setContractTemplate = (template: string): void => set('contract_template', template);