/**
 * @file Componente Principal da Aplicação (App)
 * @description Este é o componente raiz que gerencia o estado global da aplicação,
 * como o usuário logado, a tela ativa e a responsividade. Ele atua como um roteador,
 * renderizando a tela apropriada com base no estado atual.
 */
import React, { useState, ReactNode, useEffect } from 'react';
import { UserRole, User, Notification as NotificationType, UserSettings } from './types';
import Sidebar from './components/Sidebar';
import SalesScreen from './components/SalesScreen';
import ClientDashboard from './components/ClientDashboard';
import StrategicReports from './components/StrategicReports';
import PlaceholderScreen from './components/PlaceholderScreen';
import AdminDashboard from './components/AdminDashboard';
import RepresentativesScreen from './components/RepresentativesScreen';
import AdminClientsScreen from './components/AdminClientsScreen';
import PlansScreen from './components/PlansScreen';
import ContractsScreen from './components/ContractsScreen';
import CommissionsScreen from './components/CommissionsScreen';
import { RepDashboardScreen } from './components/RepDashboardScreen';
import ClientsScreen from './components/ClientsScreen';
import GoalsScreen from './components/GoalsScreen';
import { StatementScreen } from './components/StatementScreen';
import DocumentsScreen from './components/DocumentsScreen';
import HelpCenterScreen from './components/HelpCenterScreen';
import SettingsScreen from './components/SettingsScreen';
import LoginScreen from './components/LoginScreen';
import SplashScreen from './components/SplashScreen';
import * as db from './services/database';
import WhatsAppBotScreen from './components/WhatsAppBotScreen';
import ContractTemplateScreen from './components/ContractTemplateScreen';
import Header from './components/Header';
import NotificationsPanel from './components/NotificationsPanel';
import { ToastProvider, useToast } from './contexts/ToastContext';
import Toast from './components/Toast';

type ActiveScreen = string | { screen: string, params: any };

// Componente ToastContainer para renderizar as notificações
const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-20 right-4 z-[100] w-full max-w-sm">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
};


const AppContent: React.FC = () => {
    // Estado para controlar a exibição da tela de splash inicial
    const [showSplash, setShowSplash] = useState(true);
    // Estado para armazenar os dados do usuário logado
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    // Estado para controlar qual tela está sendo exibida (pode ser string ou objeto com params)
    const [activeScreen, setActiveScreen] = useState<ActiveScreen>('');
    // Estado para o menu da barra lateral em modo mobile (aberto/fechado)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Estado para detectar se a tela está em modo mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    // Estado para notificações
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
    // Estado para as configurações do usuário, incluindo tema
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
    const { addToast } = useToast();
    
    // Efeito para popular o banco de dados simulado na primeira inicialização
    useEffect(() => {
        db.seedDatabase();
    }, []);

    // Busca notificações e configurações do usuário quando ele loga e escuta por atualizações
    useEffect(() => {
        if (loggedInUser) {
            // Busca inicial de dados
            const userNotifications = db.getNotificationsForUser(loggedInUser.id);
            setNotifications(userNotifications);
            setUnreadCount(userNotifications.filter(n => !n.isRead).length);
            setUserSettings(db.getUserSettings(loggedInUser.id));

            // Listener para novas notificações em tempo real
            const handleNewNotification = (notification: NotificationType) => {
                if (notification.userId === loggedInUser.id) {
                    setNotifications(prev => [notification, ...prev]);
                    if (!isNotificationsPanelOpen) {
                        setUnreadCount(prev => prev + 1);
                    }
                    addToast(notification.message, 'info');
                }
            };
            
            const unsubscribe = db.realtimeService.on('new-notification', handleNewNotification);

            return () => unsubscribe();
        }
    }, [loggedInUser, addToast, isNotificationsPanelOpen]);

    // Efeito para gerenciar o tema da aplicação (claro/escuro)
    useEffect(() => {
        if (!userSettings) return;

        const root = window.document.documentElement;
        const applyTheme = (theme: 'light' | 'dark') => {
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
        };
        
        if (userSettings.theme === 'dark') {
            applyTheme('dark');
        } else if (userSettings.theme === 'light') {
            applyTheme('light');
        } else { // System
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches ? 'dark' : 'light');
            
            const handleChange = (e: MediaQueryListEvent) => {
                if (db.getUserSettings(loggedInUser!.id).theme === 'system') {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [userSettings, loggedInUser]);

    // Efeito para detectar redimensionamento da janela e ajustar o modo mobile
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsSidebarOpen(false); // Fecha a sidebar ao mudar para a visão de desktop
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Efeito para definir a tela padrão quando o usuário faz login
    useEffect(() => {
        if (loggedInUser) {
            setActiveScreen(getDefaultScreen(loggedInUser.role));
        }
    }, [loggedInUser]);
    
    // Efeito para fechar a sidebar em modo mobile sempre que a tela ativa mudar
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [activeScreen, isMobile]);

    /**
     * Retorna a tela inicial padrão com base no papel (role) do usuário.
     * @param role O papel do usuário (Admin, Representante, Cliente).
     * @returns A string chave da tela padrão.
     */
    function getDefaultScreen(role: UserRole): string {
        switch (role) {
            case UserRole.Admin: return 'admin_dashboard';
            case UserRole.Representative: return 'rep_dashboard';
            case UserRole.Client: return 'client_dashboard';
            default: return 'login';
        }
    }
    
     const screenTitles: Record<string, string> = {
        admin_dashboard: 'Dashboard do Administrador',
        representatives: 'Gestão de Representantes',
        admin_clients: 'Gestão de Clientes',
        plans: 'Gestão de Planos',
        contracts: 'Gestão de Contratos',
        commissions: 'Gestão de Comissões',
        contract_template: 'Modelo de Contrato',
        reports: 'Relatórios Estratégicos com IA',
        whatsapp_bot: 'WhatsApp Bot',
        rep_dashboard: 'Meu Dashboard',
        clients: 'Clientes',
        sales: 'Vendas',
        goals: 'Metas',
        client_dashboard: 'Meu Painel',
        statement: 'Extrato Detalhado',
        documents: 'Meus Documentos',
        help: 'Central de Ajuda',
        settings: 'Configurações',
    };

    const handleSettingsSaved = () => {
        if (loggedInUser) {
            const newSettings = db.getUserSettings(loggedInUser.id);
            setUserSettings(newSettings);
            addToast('Configurações salvas com sucesso!', 'success');
        }
    };

    const currentScreenName = typeof activeScreen === 'string' ? activeScreen : activeScreen.screen;
    const screenParams = typeof activeScreen === 'object' ? activeScreen.params : {};

    // Mapeamento de chaves de tela para os componentes React correspondentes
    const screens: Record<string, ReactNode> = {
        // Telas de Administrador
        admin_dashboard: <AdminDashboard setActiveScreen={setActiveScreen} />,
        representatives: <RepresentativesScreen />,
        admin_clients: <AdminClientsScreen />,
        plans: <PlansScreen />,
        contracts: <ContractsScreen initialFilter={screenParams.filter || 'Todos'} />,
        commissions: <CommissionsScreen />,
        contract_template: <ContractTemplateScreen />,
        reports: <StrategicReports />,
        whatsapp_bot: <WhatsAppBotScreen />,

        // Telas de Representante (passando o usuário logado para filtrar dados)
        rep_dashboard: loggedInUser && <RepDashboardScreen loggedInUser={loggedInUser} />,
        clients: loggedInUser && <ClientsScreen loggedInUser={loggedInUser} />,
        sales: loggedInUser && <SalesScreen loggedInUser={loggedInUser} />,
        goals: loggedInUser && <GoalsScreen loggedInUser={loggedInUser} />,

        // Telas de Cliente (passando o usuário logado para filtrar dados)
        client_dashboard: loggedInUser && <ClientDashboard loggedInUser={loggedInUser} />,
        statement: loggedInUser && <StatementScreen loggedInUser={loggedInUser} />,
        documents: loggedInUser && <DocumentsScreen loggedInUser={loggedInUser} />,
        help: loggedInUser && <HelpCenterScreen setActiveScreen={setActiveScreen} loggedInUser={loggedInUser}/>,

        // Telas Gerais
        settings: loggedInUser && <SettingsScreen loggedInUser={loggedInUser} onSettingsSave={handleSettingsSaved} />,
    };

    const handleLogin = (user: User) => {
        setLoggedInUser(user);
    };

    const handleLogout = () => {
        setLoggedInUser(null);
        setActiveScreen('login');
        // Ao deslogar, reverte para o tema claro padrão
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    };
    
    const handleContinueFromSplash = () => {
        setShowSplash(false);
    };

    const handleToggleNotifications = () => {
        if (!isNotificationsPanelOpen && unreadCount > 0 && loggedInUser) {
            db.markNotificationsAsRead(loggedInUser.id);
            setUnreadCount(0); // Otimização da UI, a busca de fundo corrigirá
        }
        setIsNotificationsPanelOpen(prev => !prev);
    };

    // Renderiza a tela de splash até o usuário clicar em continuar
    if (showSplash) {
        return <SplashScreen onContinue={handleContinueFromSplash} />;
    }

    // Se não houver usuário logado, renderiza a tela de login
    if (!loggedInUser || !userSettings) {
        return <LoginScreen onLogin={handleLogin} />;
    }
    
    return (
        <div className="fixed inset-0 flex bg-slate-50 dark:bg-slate-900">
            <Sidebar 
                userRole={loggedInUser.role} 
                activeScreen={currentScreenName} 
                setActiveScreen={setActiveScreen} 
                onLogout={handleLogout}
                isMobile={isMobile}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    isMobile={isMobile}
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                    user={loggedInUser}
                    title={screenTitles[currentScreenName] || 'Loop'}
                    unreadCount={unreadCount}
                    onToggleNotifications={handleToggleNotifications}
                    onLogout={handleLogout}
                    onNavigate={setActiveScreen}
                    avatarUrl={userSettings.profile.avatar}
                />
                 {isNotificationsPanelOpen && (
                    <NotificationsPanel
                        notifications={notifications}
                        onClose={() => setIsNotificationsPanelOpen(false)}
                        onNavigate={(screen) => {
                            setActiveScreen(screen);
                            setIsNotificationsPanelOpen(false);
                        }}
                    />
                )}
                 <ToastContainer />
                <main className="flex-1 overflow-y-auto">
                    {screens[currentScreenName] || <PlaceholderScreen title="Página não encontrada" message="A tela que você buscou não existe." />}
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
);


export default App;