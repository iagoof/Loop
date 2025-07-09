import React, { useState, ReactNode } from 'react';
import { UserRole } from './types';
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
import RepDashboardScreen from './components/RepDashboardScreen';
import ClientsScreen from './components/ClientsScreen';
import GoalsScreen from './components/GoalsScreen';
import StatementScreen from './components/StatementScreen';
import DocumentsScreen from './components/DocumentsScreen';
import HelpCenterScreen from './components/HelpCenterScreen';
import SettingsScreen from './components/SettingsScreen';
import LoginScreen from './components/LoginScreen';

const screens: Record<string, ReactNode> = {
    // Admin
    admin_dashboard: <AdminDashboard />,
    representatives: <RepresentativesScreen />,
    plans: <PlansScreen />,
    contracts: <ContractsScreen />,
    commissions: <CommissionsScreen />,
    reports: <StrategicReports />,

    // Representative
    rep_dashboard: <RepDashboardScreen />,
    clients: <ClientsScreen />,
    sales: <SalesScreen />,
    goals: <GoalsScreen />,

    // Client
    client_dashboard: <ClientDashboard />,
    statement: <StatementScreen />,
    documents: <DocumentsScreen />,
    help: <HelpCenterScreen />,

    // General
    settings: <SettingsScreen />,
};

const getDefaultScreen = (role: UserRole): string => {
    switch (role) {
        case UserRole.Admin: return 'admin_dashboard';
        case UserRole.Representative: return 'rep_dashboard';
        case UserRole.Client: return 'client_dashboard';
        default: return 'rep_dashboard';
    }
}

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>(UserRole.Admin);
    const [activeScreen, setActiveScreen] = useState<string>(getDefaultScreen(userRole));

    const handleRoleChange = (newRole: UserRole) => {
        setUserRole(newRole);
        setActiveScreen(getDefaultScreen(newRole));
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <>
            {/* --- Role switcher for demo purposes --- */}
            <div className="absolute top-2 right-4 z-50 bg-white p-2 rounded-lg shadow-lg border border-slate-200">
                <select 
                    value={userRole} 
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="text-sm font-semibold text-slate-700 border-slate-300 rounded focus:ring-orange-500"
                >
                    <option value={UserRole.Admin}>Perfil: Administrador</option>
                    <option value={UserRole.Representative}>Perfil: Representante</option>
                    <option value={UserRole.Client}>Perfil: Cliente</option>
                </select>
            </div>

            <div className="flex h-screen bg-slate-100">
                <Sidebar userRole={userRole} activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
                {screens[activeScreen] || <PlaceholderScreen title="Página não encontrada" message="A tela que você buscou não existe." />}
            </div>
        </>
    );
};

export default App;