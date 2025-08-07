/**
 * @file Serviço de Banco de Dados Simulado
 * @description Este arquivo simula um banco de dados utilizando o `localStorage` do navegador.
 * Ele é responsável por popular os dados iniciais (seeding), fornecer funções de acesso (getters)
 * e modificação (setters) para todas as entidades do sistema (Usuários, Vendas, Clientes, etc.).
 * É uma solução robusta para demonstração e desenvolvimento frontend sem a necessidade de um backend real.
 */
import { Sale, SaleStatus, Client, Representative, Plan, Commission, User, UserRole, WhatsAppChat, WhatsAppMessage, Notification, UserSettings, Activity, Badge } from '../types';

// --- SERVIÇO DE TEMPO REAL (SIMULAÇÃO) ---
// Em uma aplicação real, isto se conectaria a um servidor WebSocket.
// Para esta simulação, usamos um padrão de "event emitter" para replicar
// o comportamento de push de dados do servidor para o cliente.
type EventCallback = (data: any) => void;
const listeners: { [key: string]: EventCallback[] } = {};

export const realtimeService = {
    /**
     * Inscreve-se para ouvir um evento em tempo real.
     * @param eventName Nome do evento (ex: 'new-notification').
     * @param callback Função a ser chamada quando o evento é emitido.
     * @returns Uma função para cancelar a inscrição.
     */
    on: (eventName: string, callback: EventCallback) => {
        if (!listeners[eventName]) {
            listeners[eventName] = [];
        }
        listeners[eventName].push(callback);
        
        return () => {
            listeners[eventName] = listeners[eventName].filter(l => l !== callback);
        };
    },
    /**
     * Emite um evento para todos os ouvintes inscritos.
     * Simula uma mensagem push do servidor.
     * @param eventName Nome do evento.
     * @param data Dados a serem enviados com o evento.
     */
    emit: (eventName: string, data: any) => {
        // Simula uma latência de rede para realismo
        setTimeout(() => {
            if (listeners[eventName]) {
                listeners[eventName].forEach(callback => callback(data));
            }
        }, 50 + Math.random() * 200);
    }
};


// --- NOTA DE SEGURANÇA DOS DADOS ---
// Em uma aplicação real, NUNCA armazene senhas em texto plano.
// Este é um exemplo simplificado. Estamos armazenando um "password_hash" para simular isso.
// Uma implementação real usaria uma biblioteca como o bcrypt.js para fazer o hash das senhas.
const simpleHash = (s: string) => `hashed_${s}`;


// --- CONFIGURAÇÃO DE GAMIFICAÇÃO ---
export const LEVELS = [
    { name: 'Iniciante', icon: '🔰', minPoints: 0 },
    { name: 'Bronze', icon: '🥉', minPoints: 1000 },
    { name: 'Prata', icon: '🥈', minPoints: 5000 },
    { name: 'Ouro', icon: '🥇', minPoints: 15000 },
    { name: 'Platina', icon: '💎', minPoints: 50000 },
    { name: 'Diamante', icon: '👑', minPoints: 100000 },
];

export const ALL_BADGES: Badge[] = [
    { id: 'primeira-venda', name: 'Primeira Venda', description: 'Realizou sua primeira venda aprovada.', icon: '🎉', condition: (rep, sales) => sales.filter(s => s.status === SaleStatus.Approved).length >= 1 },
    { id: 'vendedor-imobiliario', name: 'Especialista Imobiliário', description: 'Vendeu seu primeiro plano de imóvel.', icon: '🏡', condition: (rep, sales) => sales.some(s => s.status === SaleStatus.Approved && s.plan.includes('Imóvel')) },
    { id: 'mestre-dos-carros', name: 'Mestre dos Carros', description: 'Vendeu 5 planos de automóveis.', icon: '🚗', condition: (rep, sales) => sales.filter(s => s.status === SaleStatus.Approved && s.plan.includes('Automóvel')).length >= 5 },
    { id: 'grande-contrato', name: 'O Tubarão', description: 'Fechou um contrato de mais de R$ 500.000.', icon: '🦈', condition: (rep, sales) => sales.some(s => s.status === SaleStatus.Approved && s.value >= 500000) },
    { id: 'dedicacao', name: 'Carteira Cheia', description: 'Alcançou 10 clientes ativos.', icon: '💼', condition: (rep, sales, clients) => clients.filter(c => c.repId === rep.id && c.status === 'Cliente Ativo').length >= 10 },
    { id: 'consistencia', name: 'Consistência', description: 'Realizou vendas em 3 meses diferentes.', icon: '🎯', condition: (rep, sales) => {
        const months = new Set(sales.filter(s => s.status === SaleStatus.Approved).map(s => s.date.substring(3))); // "MM/YYYY"
        return months.size >= 3;
    }},
];

// --- DADOS INICIAIS (SEED) ---
const initialUsers: User[] = [
  { id: 101, name: 'Admin', email: 'admin@loop.com', password_hash: simpleHash('password123'), role: UserRole.Admin },
  { id: 1, name: 'Carlos Andrade', email: 'carlos.a@example.com', password_hash: simpleHash('password123'), role: UserRole.Supervisor },
  { id: 2, name: 'Sofia Ribeiro', email: 'sofia.r@example.com', password_hash: simpleHash('password123'), role: UserRole.Vendedor },
  { id: 3, name: 'Juliana Paes', email: 'juliana.p@example.com', password_hash: simpleHash('password123'), role: UserRole.Vendedor },
  { id: 4, name: 'Pedro Mendes', email: 'pedro.m@example.com', password_hash: simpleHash('password123'), role: UserRole.Vendedor },
  { id: 5, name: 'Mariana Lima', email: 'mariana.l@example.com', password_hash: simpleHash('password123'), role: UserRole.Supervisor },
  { id: 12, name: 'Ana Costa', email: 'ana.c@example.com', password_hash: simpleHash('password123'), role: UserRole.Client },
  { id: 13, name: 'Maria Oliveira', email: 'maria.o@example.com', password_hash: simpleHash('password123'), role: UserRole.Client },
];

const initialReps: Representative[] = [
  { id: 1, userId: 1, name: 'Carlos Andrade', email: 'carlos.a@example.com', sales: 12, commissionRate: 5, goal: 200000, status: 'Ativo', points: 1250, badges: [], level: LEVELS[1] },
  { id: 2, userId: 2, supervisorId: 1, name: 'Sofia Ribeiro', email: 'sofia.r@example.com', sales: 9, commissionRate: 5, goal: 150000, status: 'Ativo', points: 980, badges: [], level: LEVELS[0] },
  { id: 3, userId: 3, supervisorId: 5, name: 'Juliana Paes', email: 'juliana.p@example.com', sales: 7, commissionRate: 4.5, goal: 120000, status: 'Ativo', points: 720, badges: [], level: LEVELS[0] },
  { id: 4, userId: 4, supervisorId: 1, name: 'Pedro Mendes', email: 'pedro.m@example.com', sales: 5, commissionRate: 4.5, goal: 100000, status: 'Inativo', points: 450, badges: [], level: LEVELS[0] },
  { id: 5, userId: 5, name: 'Mariana Lima', email: 'mariana.l@example.com', sales: 15, commissionRate: 5.5, goal: 250000, status: 'Ativo', points: 1800, badges: [], level: LEVELS[1] },
];

const initialClients: Client[] = [
  { id: 1, userId: 13, repId: 2, name: 'Maria Oliveira', email: 'maria.o@example.com', phone: '(11) 98765-4321', document: '123.456.789-10', address: 'Rua das Flores, 123, São Paulo, SP', plan: 'Casa na Praia', status: 'Cliente Ativo', nextPayment: '20/08/2025' },
  { id: 2, repId: 1, name: 'João Silva', email: 'joao.s@example.com', phone: '(21) 91234-5678', document: '234.567.890-11', address: 'Avenida Copacabana, 456, Rio de Janeiro, RJ', plan: 'Carro Novo', status: 'Cliente Ativo', nextPayment: '25/08/2025' },
  { id: 3, repId: 2, name: 'Carlos Pereira', email: 'carlos.p@example.com', phone: '(31) 95555-8888', document: '345.678.901-22', address: 'Rua da Bahia, 789, Belo Horizonte, MG', plan: 'Meu Apê', status: 'Inativo' },
  { id: 4, repId: 3, name: 'Beatriz Lima', email: 'beatriz.l@example.com', phone: '(41) 99999-1111', document: '456.789.012-33', address: 'Rua das Araucárias, 101, Curitiba, PR', plan: 'Sua Viagem', status: 'Cliente Ativo', nextPayment: '10/09/2025' },
  { id: 5, repId: 1, name: 'Ricardo Alves', email: 'ricardo.a@example.com', phone: '(51) 98888-2222', document: '567.890.123-44', address: 'Avenida Ipiranga, 202, Porto Alegre, RS', plan: 'Carro Novo', status: 'Lead' },
  { id: 6, repId: 1, name: 'Fernanda Lima', email: 'fernanda.l@example.com', phone: '(61) 97777-3333', document: '678.901.234-55', address: 'Eixo Monumental, 303, Brasília, DF', plan: 'Nenhum', status: 'Lead' },
  { id: 7, repId: 5, name: 'Roberto Dias', email: 'roberto.d@example.com', phone: '(71) 97777-3334', document: '789.012.345-66', address: 'Avenida Oceânica, 404, Salvador, BA', plan: 'Carro Novo', status: 'Cliente Ativo', nextPayment: '05/09/2025' },
  { id: 8, repId: 3, name: 'Lucas Martins', email: 'lucas.m@example.com', phone: '(81) 97777-3335', document: '890.123.456-77', address: 'Rua da Moeda, 505, Recife, PE', plan: 'Sua Viagem', status: 'Cliente Ativo', nextPayment: '08/09/2025' },
  { id: 9, repId: 2, name: 'Vanessa Costa', email: 'vanessa.c@example.com', phone: '(85) 97777-3336', document: '901.234.567-88', address: 'Avenida Beira Mar, 606, Fortaleza, CE', plan: 'Casa na Praia', status: 'Cliente Ativo', nextPayment: '12/09/2025' },
  { id: 10, repId: 4, name: 'Gabriel Rocha', email: 'gabriel.r@example.com', phone: '(92) 97777-3337', document: '012.345.678-99', address: 'Rua do Comércio, 707, Manaus, AM', plan: 'Moto Zera', status: 'Inativo' },
  { id: 11, repId: 5, name: 'Mariana Azevedo', email: 'mariana.az@example.com', phone: '(48) 97777-3338', document: '111.222.333-44', address: 'Avenida Beira Mar Norte, 808, Florianópolis, SC', plan: 'Meu Apê', status: 'Cliente Ativo', nextPayment: '18/09/2025' },
  { id: 12, userId: 12, repId: 1, name: 'Ana Costa', email: 'ana.c@example.com', phone: '(11) 98765-1111', document: '555.666.777-88', address: 'Avenida Paulista, 909, São Paulo, SP', plan: 'Carro Novo', status: 'Cliente Ativo', contractStartDate: '2024-03-15' },
];

const initialSales: Sale[] = [
  { id: 1, repId: 1, clientId: 2, plan: 'Carro Novo', value: 50000, date: '09/07/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 2, repId: 2, clientId: 3, plan: 'Meu Apê', value: 350000, date: '05/07/2025', status: SaleStatus.Pending, commissionPaid: false },
  { id: 3, repId: 3, clientId: 4, plan: 'Sua Viagem', value: 15000, date: '02/07/2025', status: SaleStatus.Rejected, commissionPaid: false, rejectionReason: 'Score de crédito insuficiente.' },
  { id: 4, repId: 4, clientId: 5, plan: 'Carro Novo', value: 80000, date: '28/06/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 5, repId: 1, clientId: 6, plan: 'Casa na Praia', value: 450000, date: '15/07/2025', status: SaleStatus.Pending, commissionPaid: false },
  { id: 6, repId: 2, clientId: 7, plan: 'Carro Novo', value: 95000, date: '14/07/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 7, repId: 3, clientId: 8, plan: 'Sua Viagem', value: 25000, date: '12/07/2025', status: SaleStatus.Approved, commissionPaid: true },
  { id: 8, repId: 1, clientId: 9, plan: 'Casa na Praia', value: 600000, date: '11/07/2025', status: SaleStatus.Pending, commissionPaid: false },
  { id: 9, repId: 4, clientId: 10, plan: 'Moto Zera', value: 22000, date: '10/07/2025', status: SaleStatus.Rejected, commissionPaid: false, rejectionReason: 'Documentação incompleta.' },
  { id: 10, repId: 5, clientId: 11, plan: 'Meu Apê', value: 280000, date: '08/07/2025', status: SaleStatus.Pending, commissionPaid: false },
  { id: 11, repId: 1, clientId: 12, plan: 'Carro Novo', value: 80000, date: '15/03/2024', status: SaleStatus.Approved, commissionPaid: true },
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

const initialActivities: Activity[] = [
    { id: 1, clientId: 1, repId: 2, type: 'Ligação', notes: 'Cliente confirmou interesse no plano Casa na Praia. Agendamos uma nova conversa para a próxima semana.', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 2, clientId: 2, repId: 1, type: 'Email', notes: 'Enviei a documentação inicial para o cliente. Ele informou que irá analisar durante o fim de semana.', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 3, clientId: 1, repId: 2, type: 'Reunião', notes: 'Reunião inicial para apresentação dos planos. Cliente pareceu muito interessado.', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
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


// --- FUNÇÕES AUXILIARES DO BANCO DE DADOS (localStorage) ---
/**
 * Lê um valor do localStorage.
 * @param key A chave do item.
 * @param defaultValue O valor padrão a ser retornado se a chave não existir.
 * @returns O valor parseado ou o valor padrão.
 */
const get = <T>(key: string, defaultValue: T): T => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.error(`Erro ao ler a chave “${key}” do localStorage:`, e);
        return defaultValue;
    }
};

/**
 * Escreve um valor no localStorage.
 * @param key A chave do item.
 * @param value O valor a ser armazenado (será convertido para JSON).
 */
const set = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Erro ao escrever na chave “${key}” do localStorage:`, e);
    }
};

/**
 * Gera o próximo ID para uma lista de itens.
 * @param items Uma lista de objetos que possuem uma propriedade `id`.
 * @returns O maior ID da lista + 1.
 */
const getNextId = <T extends {id: number}>(items: T[]): number => {
    if (!items || items.length === 0) return 1;
    return items.reduce((maxId, item) => Math.max(item.id, maxId), 0) + 1;
};

// --- POPULAÇÃO INICIAL DO BANCO DE DADOS (SEEDING) ---
/**
 * Popula o localStorage com dados iniciais se ainda não tiver sido feito.
 * Utiliza uma flag com versionamento para permitir repopular com novos dados no futuro.
 */
export const seedDatabase = () => {
    if (!localStorage.getItem('seeded_v9')) { // Altere a versão para forçar a repopulação
        set('users', initialUsers);
        set('sales', initialSales);
        set('clients', initialClients);
        set('representatives', initialReps);
        set('plans', initialPlans);
        set('whatsapp_chats', initialWhatsAppChats);
        set('contract_template', DEFAULT_CONTRACT_TEMPLATE);
        set('notifications', []); // Inicializa as notificações
        set('activities', initialActivities); // Adiciona atividades iniciais
        localStorage.setItem('seeded_v9', 'true');
    }
};

// --- API DE AUTENTICAÇÃO ---
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

    // Se um novo cliente ou representante é registrado, cria um perfil correspondente
    if(newUser.role === UserRole.Client) {
        addClient({ name: newUser.name, email: newUser.email, phone: '', document: '', address: '', plan: 'Nenhum', status: 'Lead', userId: newUser.id });
    } else if (newUser.role === UserRole.Vendedor || newUser.role === UserRole.Supervisor) {
        addRepresentative({ name: newUser.name, email: newUser.email, commissionRate: 4, userId: newUser.id });
    }
    
    return newUser;
};

/**
 * Atualiza a senha de um usuário.
 * @param userId O ID do usuário.
 * @param currentPassword_plaintext A senha atual em texto plano.
 * @param newPassword_plaintext A nova senha em texto plano.
 * @returns Um objeto com sucesso ou erro.
 */
export const updatePassword = (userId: number, currentPassword_plaintext: string, newPassword_plaintext: string): { success: boolean, error?: string } => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, error: 'Usuário não encontrado.' };
    }

    const user = users[userIndex];
    const currentPassword_hash = simpleHash(currentPassword_plaintext);

    if (user.password_hash !== currentPassword_hash) {
        return { success: false, error: 'A senha atual está incorreta.' };
    }

    const newPassword_hash = simpleHash(newPassword_plaintext);
    users[userIndex] = { ...user, password_hash: newPassword_hash };
    
    set('users', users);
    
    return { success: true };
};


// --- API DE NOTIFICAÇÕES E CONFIGURAÇÕES ---
export const getUserSettings = (userId: number): UserSettings => {
  const allSettings = get<Record<number, UserSettings>>('user_settings', {});
  const user = getUsers().find(u => u.id === userId);
  
  const defaultSettings: UserSettings = {
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      avatar: `https://i.pravatar.cc/150?u=${user?.email}`
    },
    notifications: {
      emailNews: true,
      emailSales: user?.role === UserRole.Vendedor || user?.role === UserRole.Supervisor,
      appUpdates: true,
    },
    theme: 'system'
  };
  
  return allSettings[userId] || defaultSettings;
};

export const saveUserSettings = (userId: number, settings: UserSettings): void => {
  const allSettings = get<Record<number, UserSettings>>('user_settings', {});
  allSettings[userId] = settings;
  set('user_settings', allSettings);
};

export const getNotificationsForUser = (userId: number): Notification[] => {
    const notifications = get<Notification[]>('notifications', []);
    return notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addNotification = (notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): void => {
  const notifications = get<Notification[]>('notifications', []);
  const newNotification: Notification = {
    ...notificationData,
    id: getNextId(notifications),
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  const userSettings = getUserSettings(notificationData.userId);
  const user = getUsers().find(u => u.id === notificationData.userId);

  if (userSettings.notifications.appUpdates) {
    set('notifications', [newNotification, ...notifications]);
    // Emite o evento em tempo real para clientes ativos
    realtimeService.emit('new-notification', newNotification);
  }

  // Simula envio de e-mail se a configuração estiver ativa
  if (user && (user.role === UserRole.Vendedor || user.role === UserRole.Supervisor) && userSettings.notifications.emailSales) {
      console.log(`[SIMULAÇÃO DE EMAIL] Enviando notificação para ${user.email}: "${notificationData.message}"`);
  }
};

export const markNotificationsAsRead = (userId: number): void => {
  const notifications = get<Notification[]>('notifications', []);
  const updatedNotifications = notifications.map(n => 
    (n.userId === userId && !n.isRead) ? { ...n, isRead: true } : n
  );
  set('notifications', updatedNotifications);
};

// --- Funções de Gamificação ---
const calculatePointsForSale = (sale: Sale): number => {
    // Ex: 1 ponto para cada R$1000 do valor do crédito
    return Math.floor(sale.value / 1000);
};

const checkAndAwardBadges = (repId: number) => {
    const rep = getRepresentatives().find(r => r.id === repId);
    if (!rep) return;
    
    const repSales = getSales().filter(s => s.repId === repId);
    const repClients = getClients(); // Passar todos para a condição avaliar
    const currentBadgeIds = new Set(rep.badges.map(b => b.id));

    ALL_BADGES.forEach(badge => {
        if (!currentBadgeIds.has(badge.id) && badge.condition(rep, repSales, repClients)) {
            rep.badges.push(badge);
            addNotification({
                userId: rep.userId!,
                message: `Nova conquista desbloqueada: ${badge.name}!`,
                link: 'gamification'
            });
        }
    });

    return rep.badges;
};

const updateRepLevel = (rep: Representative): Representative['level'] => {
    const newLevel = [...LEVELS].reverse().find(level => rep.points >= level.minPoints);
    if (newLevel && newLevel.name !== rep.level.name) {
        addNotification({
            userId: rep.userId!,
            message: `Você subiu para o nível ${newLevel.name}!`,
            link: 'gamification'
        });
        return newLevel;
    }
    return rep.level;
};


// --- API de Vendas ---
export const getSales = (): Sale[] => get('sales', []);
export const addSale = (newSaleData: Omit<Sale, 'id'|'status'|'commissionPaid'|'rejectionReason'>): Sale => {
    const sales = getSales();
    const newSale: Sale = {
        ...newSaleData,
        id: getNextId(sales),
        status: SaleStatus.Pending, // Novas vendas sempre começam como pendentes
        commissionPaid: false
    };
    set('sales', [newSale, ...sales]);
    
    // Notifica o administrador sobre o novo contrato
    const admin = getUsers().find(u => u.role === UserRole.Admin);
    if (admin) {
        const client = getClients().find(c => c.id === newSaleData.clientId);
        addNotification({
            userId: admin.id,
            message: `Novo contrato de ${client?.name || 'cliente desconhecido'} aguardando sua análise.`,
            link: 'contracts'
        });
    }

    return newSale;
};
export const updateSale = (id: number, updates: Partial<Sale>): Sale | undefined => {
    const sales = getSales();
    let updatedSale: Sale | undefined;
    const originalSale = sales.find(s => s.id === id);

    const newSales = sales.map(sale => {
        if (sale.id === id) {
            updatedSale = { ...sale, ...updates };
            return updatedSale;
        }
        return sale;
    });

    if (updatedSale) {
        set('sales', newSales);
        
        // --- LÓGICA DE GAMIFICAÇÃO ---
        // Se a venda foi aprovada e antes não era
        if (updatedSale.status === SaleStatus.Approved && originalSale?.status !== SaleStatus.Approved) {
            const rep = getRepresentatives().find(r => r.id === updatedSale!.repId);
            if (rep) {
                const pointsGained = calculatePointsForSale(updatedSale);
                rep.points += pointsGained;
                rep.badges = checkAndAwardBadges(rep.id);
                rep.level = updateRepLevel(rep);
                updateRepresentative(rep.id, { points: rep.points, badges: rep.badges, level: rep.level });

                addNotification({
                    userId: rep.userId!,
                    message: `+${pointsGained} pontos pela venda para ${getClientBySaleId(id)?.name}!`,
                    link: 'gamification'
                });
            }
        }
        // --- FIM DA LÓGICA DE GAMIFICAÇÃO ---

        // Notifica o representante se o status mudou
        if (originalSale && updates.status && originalSale.status !== updates.status) {
            const client = getClients().find(c => c.id === updatedSale!.clientId);
            const rep = getRepresentatives().find(r => r.id === updatedSale!.repId);
            if(rep && rep.userId) {
                const message = updates.status === SaleStatus.Approved
                    ? `Sua venda para ${client?.name} foi APROVADA!`
                    : `Sua venda para ${client?.name} foi RECUSADA.`;
                addNotification({
                    userId: rep.userId,
                    message: message,
                    link: 'sales'
                });
            }
        }
    }
    return updatedSale;
};

const getClientBySaleId = (saleId: number): Client | undefined => {
    const sale = getSales().find(s => s.id === saleId);
    return sale ? getClients().find(c => c.id === sale.clientId) : undefined;
};


// --- API de Representantes ---
export const getRepresentatives = (): Representative[] => get('representatives', []);
export const addRepresentative = (data: Omit<Representative, 'id'|'sales'|'status'|'goal'|'points'|'badges'|'level'>): Representative => {
    const reps = getRepresentatives();
    const newRep: Representative = {
        ...data,
        id: getNextId(reps),
        sales: 0,
        status: 'Ativo',
        points: 0,
        badges: [],
        level: LEVELS[0],
        // A meta será 'undefined' por padrão e deverá ser definida pelo admin.
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
export const deleteRepresentative = (id: number): void => {
    const reps = getRepresentatives();
    set('representatives', reps.filter(r => r.id !== id));
};
export const getRepresentativeByUserId = (userId: number): Representative | undefined => {
    return getRepresentatives().find(r => r.userId === userId);
};

// --- API de Planos ---
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

// --- API de Clientes ---
export const getClients = (): Client[] => get('clients', []);
export const addClient = (data: Omit<Client, 'id'>): Client => {
    const clients = getClients();
    const newClient: Client = { ...data, id: getNextId(clients) };
    set('clients', [newClient, ...clients]);
    return newClient;
};
export const updateClient = (id: number, updates: Partial<Client>): Client | undefined => {
    const clients = getClients();
    let updatedClient: Client | undefined;
    const newClients = clients.map(c => {
        if (c.id === id) {
            updatedClient = { ...c, ...updates };
            return updatedClient;
        }
        return c;
    });
    if (updatedClient) {
        set('clients', newClients);
    }
    return updatedClient;
};
export const deleteClient = (id: number): void => {
    // Remove o cliente
    const clients = getClients();
    set('clients', clients.filter(c => c.id !== id));
    
    // Remove as atividades associadas
    const activities = getActivities();
    set('activities', activities.filter(a => a.clientId !== id));

    // Remove os chats associados
    const chats = get<WhatsAppChat[]>('whatsapp_chats', []);
    set('whatsapp_chats', chats.filter(chat => chat.clientId !== id));

    // Remove as vendas/contratos associados
    const sales = getSales();
    set('sales', sales.filter(s => s.clientId !== id));

    // Nota: O login de usuário associado (`User`) não é removido para evitar a exclusão acidental de contas.
    // O cliente pode se registrar novamente ou ser reassociado a um novo perfil de cliente.
};
export const getClientByUserId = (userId: number): Client | undefined => {
    return getClients().find(c => c.userId === userId);
}


// --- API de Comissões ---
/**
 * Calcula e retorna a lista de comissões com base nas vendas aprovadas.
 * Esta é uma função computada, não armazena comissões separadamente.
 * @returns Uma lista de objetos de comissão.
 */
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
            commissionValue,
            status: sale.commissionPaid ? 'Paga' : 'Pendente'
        };
    });
    
    return commissions;
};

/**
 * Marca a comissão de uma venda como paga, atualizando o registro da venda.
 * @param saleId O ID da venda cuja comissão foi paga.
 */
export const markCommissionAsPaid = (saleId: number): void => {
    updateSale(saleId, { commissionPaid: true });
};


// --- API do BOT DO WHATSAPP ---

export const getWhatsAppChats = (): WhatsAppChat[] => {
    const chats = get<WhatsAppChat[]>('whatsapp_chats', []);
    // Ordena os chats pela mensagem mais recente
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
                lastMessageTimestamp: newTimestamp // Atualiza o timestamp do chat
            };
            return updatedChat;
        }
        return chat;
    });

    if (updatedChat) {
        set('whatsapp_chats', newChats);
        realtimeService.emit('whatsapp-update', { chatId: updatedChat.id });
    }
    return updatedChat;
};

/**
 * Simula a chegada de uma nova mensagem de um cliente aleatório.
 * @returns O chat atualizado e a nova mensagem, ou nulo se não houver clientes.
 */
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

    // Se não existir um chat para este cliente, cria um novo
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
    realtimeService.emit('whatsapp-update', { chatId: chat.id });

    return { chat, newMessage };
};

// --- API DO MODELO DE CONTRATO ---
export const getContractTemplate = (): string => get('contract_template', DEFAULT_CONTRACT_TEMPLATE);
export const setContractTemplate = (template: string): void => set('contract_template', template);

// --- API de Atividades ---
export const getActivities = (): Activity[] => get('activities', []);
export const getActivitiesForClient = (clientId: number): Activity[] => {
    return getActivities()
        .filter(a => a.clientId === clientId)
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
export const addActivity = (data: Omit<Activity, 'id'>): Activity => {
    const activities = getActivities();
    const newActivity: Activity = {
        ...data,
        id: getNextId(activities),
        timestamp: new Date().toISOString()
    };
    set('activities', [newActivity, ...activities]);
    return newActivity;
};