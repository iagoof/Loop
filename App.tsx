
import React, { useState, ReactNode, useEffect } from 'react';
import { UserRole, User } from './types';
import Sidebar from './components/Sidebar';
import SalesScreen from './components/SalesScreen';
import ClientDashboard from './components/ClientDashboard';
import StrategicReports from './components/StrategicReports';
import PlaceholderScreen from './components/PlaceholderScreen';
import AdminDashboard from './components/AdminDashboard';
import RepresentativesScreen from './components/RepresentativesScreen';
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
import { seedDatabase } from './services/database';
import WhatsAppBotScreen from './components/WhatsAppBotScreen';
import ContractTemplateScreen from './components/ContractTemplateScreen';
import { MenuIcon, LogoIcon } from './components/icons';

const App: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [activeScreen, setActiveScreen] = useState<string>('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    useEffect(() => {
        seedDatabase();
    }, []);

    // Effect to handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsSidebarOpen(false); // Close sidebar when switching to desktop view
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (loggedInUser) {
            setActiveScreen(getDefaultScreen(loggedInUser.role));
        }
    }, [loggedInUser]);
    
    // Effect to close sidebar when screen changes on mobile
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [activeScreen, isMobile]);

    function getDefaultScreen(role: UserRole): string {
        switch (role) {
            case UserRole.Admin: return 'admin_dashboard';
            case UserRole.Representative: return 'rep_dashboard';
            case UserRole.Client: return 'client_dashboard';
            default: return 'login';
        }
    }

    const screens: Record<string, ReactNode> = {
        // Admin
        admin_dashboard: <AdminDashboard setActiveScreen={setActiveScreen} />,
        representatives: <RepresentativesScreen />,
        plans: <PlansScreen />,
        contracts: <ContractsScreen />,
        commissions: <CommissionsScreen />,
        contract_template: <ContractTemplateScreen />,
        reports: <StrategicReports />,
        whatsapp_bot: <WhatsAppBotScreen />,

        // Representative - Pass loggedInUser to scope data
        rep_dashboard: loggedInUser && <RepDashboardScreen loggedInUser={loggedInUser} />,
        clients: loggedInUser && <ClientsScreen loggedInUser={loggedInUser} />,
        sales: loggedInUser && <SalesScreen loggedInUser={loggedInUser} />,
        goals: loggedInUser && <GoalsScreen loggedInUser={loggedInUser} />,

        // Client - Pass loggedInUser to scope data
        client_dashboard: loggedInUser && <ClientDashboard loggedInUser={loggedInUser} />,
        statement: loggedInUser && <StatementScreen loggedInUser={loggedInUser} />,
        documents: loggedInUser && <DocumentsScreen loggedInUser={loggedInUser} />,
        help: loggedInUser && <HelpCenterScreen setActiveScreen={setActiveScreen} loggedInUser={loggedInUser}/>,

        // General
        settings: loggedInUser && <SettingsScreen loggedInUser={loggedInUser} />,
    };

    const handleLogin = (user: User) => {
        setLoggedInUser(user);
    };

    const handleLogout = () => {
        setLoggedInUser(null);
        setActiveScreen('login');
    };
    
    const handleContinueFromSplash = () => {
        setShowSplash(false);
    };

    if (showSplash) {
        return <SplashScreen onContinue={handleContinueFromSplash} />;
    }

    if (!loggedInUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const MobileHeader = () => (
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 p-2 -ml-2">
                <MenuIcon />
            </button>
            <div className="flex items-center space-x-2">
                <LogoIcon />
                <h1 className="text-xl font-bold text-slate-800">Loop</h1>
            </div>
             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 uppercase">
                {loggedInUser.name.charAt(0)}
            </div>
        </header>
    );

    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar 
                userRole={loggedInUser.role} 
                activeScreen={activeScreen} 
                setActiveScreen={setActiveScreen} 
                onLogout={handleLogout}
                isMobile={isMobile}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                {isMobile && <MobileHeader />}
                {screens[activeScreen] || <PlaceholderScreen title="Página não encontrada" message="A tela que você buscou não existe." />}
            </main>
        </div>
    );
};

export default App;