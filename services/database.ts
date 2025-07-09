import { Sale, SaleStatus, Client, Representative, Plan, Commission, User, UserRole } from '../types';

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
  { id: 1, userId: 1, repId: 2, name: 'Maria Oliveira', phone: '(11) 98765-4321', plan: 'Consórcio de Imóvel', status: 'Cliente Ativo', nextPayment: '20/08/2025' },
  { id: 2, repId: 1, name: 'João Silva', phone: '(21) 91234-5678', plan: 'Consórcio de Automóvel', status: 'Cliente Ativo', nextPayment: '25/08/2025' },
  { id: 3, repId: 2, name: 'Carlos Pereira', phone: '(31) 95555-8888', plan: 'Consórcio de Imóvel', status: 'Inativo' },
  { id: 4, repId: 3, name: 'Beatriz Lima', phone: '(41) 99999-1111', plan: 'Consórcio de Serviços', status: 'Cliente Ativo', nextPayment: '10/09/2025' },
  { id: 5, repId: 1, name: 'Ricardo Alves', phone: '(51) 98888-2222', plan: 'Consórcio de Automóvel', status: 'Lead' },
  { id: 6, repId: 1, name: 'Fernanda Lima', phone: '(61) 97777-3333', plan: 'Nenhum', status: 'Lead' },
  { id: 7, repId: 5, name: 'Roberto Dias', phone: '(61) 97777-3334', plan: 'Consórcio de Automóvel', status: 'Cliente Ativo', nextPayment: '05/09/2025' },
  { id: 8, repId: 3, name: 'Lucas Martins', phone: '(61) 97777-3335', plan: 'Consórcio de Serviços', status: 'Cliente Ativo', nextPayment: '08/09/2025' },
  { id: 9, repId: 2, name: 'Vanessa Costa', phone: '(61) 97777-3336', plan: 'Consórcio de Imóvel', status: 'Cliente Ativo', nextPayment: '12/09/2025' },
  { id: 10, repId: 4, name: 'Gabriel Rocha', phone: '(61) 97777-3337', plan: 'Consórcio de Automóvel', status: 'Inativo' },
  { id: 11, repId: 5, name: 'Mariana Azevedo', phone: '(61) 97777-3338', plan: 'Consórcio de Imóvel', status: 'Cliente Ativo', nextPayment: '18/09/2025' },
  { id: 12, userId: 12, repId: 1, name: 'Ana Costa', phone: '(11) 98765-1111', plan: 'Consórcio de Automóvel - R$ 80.000,00', status: 'Cliente Ativo', nextPayment: '15/08/2025' },
];

const initialSales: Sale[] = [
  { id: 1, repId: 1, clientName: 'João Silva', plan: 'Consórcio de Automóvel', value: 50000, date: '09/07/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 2, repId: 2, clientName: 'Carlos Pereira', plan: 'Consórcio de Imóvel', value: 350000, date: '05/07/2025', status: SaleStatus.Pending, commissionPaid: false },
  { id: 3, repId: 3, clientName: 'Beatriz Lima', plan: 'Consórcio de Serviços', value: 15000, date: '02/07/2025', status: SaleStatus.Rejected, commissionPaid: false },
  { id: 4, repId: 4, clientName: 'Ricardo Alves', plan: 'Consórcio de Automóvel', value: 80000, date: '28/06/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 5, repId: 1, clientName: 'Fernanda Lima', plan: 'Consórcio de Imóvel', value: 450000, date: '15/07/2025', status: SaleStatus.Pending, commissionPaid: false },
  { id: 6, repId: 2, clientName: 'Roberto Dias', plan: 'Consórcio de Automóvel', value: 95000, date: '14/07/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 7, repId: 3, clientName: 'Lucas Martins', plan: 'Consórcio de Serviços', value: 25000, date: '12/07/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 8, repId: 1, clientName: 'Vanessa Costa', plan: 'Consórcio de Imóvel', value: 600000, date: '11/07/2025', status: SaleStatus.Pending, commissionPaid: false },
  { id: 9, repId: 4, clientName: 'Gabriel Rocha', plan: 'Consórcio de Automóvel', value: 120000, date: '10/07/2025', status: SaleStatus.Rejected, commissionPaid: false },
  { id: 10, repId: 5, clientName: 'Mariana Azevedo', plan: 'Consórcio de Imóvel', value: 280000, date: '08/07/2025', status: SaleStatus.Pending, commissionPaid: false },
];

const initialPlans: Plan[] = [
  { id: 1, name: 'Meu Apê', type: 'Imóvel', valueRange: [150000, 500000], term: 180, adminFee: 18 },
  { id: 2, name: 'Carro Novo', type: 'Automóvel', valueRange: [40000, 120000], term: 80, adminFee: 15 },
  { id: 3, name: 'Sua Viagem', type: 'Serviços', valueRange: [10000, 30000], term: 36, adminFee: 22 },
  { id: 4, name: 'Casa na Praia', type: 'Imóvel', valueRange: [300000, 1000000], term: 200, adminFee: 17 },
  { id: 5, name: 'Moto Zera', type: 'Automóvel', valueRange: [15000, 40000], term: 60, adminFee: 16 },
];


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
    return items.reduce((maxId, item) => Math.max(item.id, maxId), 0) + 1;
};

// --- DATABASE SEEDING ---
export const seedDatabase = () => {
    if (!localStorage.getItem('seeded_v2')) {
        set('users', initialUsers);
        set('sales', initialSales);
        set('clients', initialClients);
        set('representatives', initialReps);
        set('plans', initialPlans);
        localStorage.setItem('seeded_v2', 'true');
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
        addClient({ name: newUser.name, phone: '', plan: 'Nenhum', status: 'Lead', userId: newUser.id });
    } else if (newUser.role === UserRole.Representative) {
        addRepresentative({ name: newUser.name, email: newUser.email, commissionRate: 4, userId: newUser.id });
    }
    
    return newUser;
};

// Sales
export const getSales = (): Sale[] => get('sales', []);
export const addSale = (newSaleData: Omit<Sale, 'id'|'status'|'commissionPaid'>): Sale => {
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
