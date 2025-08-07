/**
 * @file Componente da Barra de Navegação Lateral (Sidebar)
 * @description Renderiza a navegação principal da aplicação. É responsivo,
 * adaptando-se para um menu fixo em desktops e um menu sobreposto (overlay)
 * em dispositivos móveis. O conteúdo exibido é dinâmico, baseado no papel
 * (role) do usuário logado.
 */
import React from 'react';
import { NavItem, UserRole } from '../types';
import {
  LogoIcon,
  DashboardIcon,
  ClientsIcon,
  SalesIcon,
  GoalsIcon,
  ReportsIcon,
  SettingsIcon,
  LogoutIcon,
  FileSearchIcon,
  FileSpreadsheetIcon,
  FileCheck2Icon,
  PercentIcon,
  FilePieChartIcon,
  DownloadCloudIcon,
  MessageCircleIcon,
  FileSignatureIcon,
  TrophyIcon,
} from './icons';

interface SidebarProps {
  userRole: UserRole;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  onLogout: () => void;
  isMobile: boolean; // Indica se a visualização é para dispositivos móveis
  isOpen: boolean;   // Controla a visibilidade do menu em modo mobile
  setIsOpen: (open: boolean) => void;
}

// Mapeia os itens de navegação para cada papel de usuário
const navItems: Record<UserRole, NavItem[]> = {
  [UserRole.Admin]: [
    { label: 'Dashboard', icon: <DashboardIcon />, screen: 'admin_dashboard' },
    { label: 'Representantes', icon: <ClientsIcon />, screen: 'representatives' },
    { label: 'Clientes', icon: <ClientsIcon />, screen: 'admin_clients' },
    { label: 'Planos', icon: <FileSpreadsheetIcon />, screen: 'plans' },
    { label: 'Contratos', icon: <FileCheck2Icon />, screen: 'contracts' },
    { label: 'Comissões', icon: <PercentIcon />, screen: 'commissions' },
    { label: 'Modelo Contrato', icon: <FileSignatureIcon />, screen: 'contract_template' },
    { label: 'Gamificação', icon: <TrophyIcon />, screen: 'gamification' },
    { label: 'Relatórios IA', icon: <ReportsIcon />, screen: 'reports' },
    { label: 'WhatsApp Bot', icon: <MessageCircleIcon />, screen: 'whatsapp_bot' },
  ],
  [UserRole.Supervisor]: [
    { label: 'Dashboard Pessoal', icon: <DashboardIcon />, screen: 'personal_dashboard' },
    { label: 'Dashboard Equipe', icon: <ReportsIcon />, screen: 'supervisor_dashboard' },
    { label: 'Minha Equipe', icon: <ClientsIcon />, screen: 'my_team' },
    { label: 'Vendas Pessoais', icon: <SalesIcon />, screen: 'sales' },
    { label: 'Metas', icon: <GoalsIcon />, screen: 'goals' },
    { label: 'Gamificação', icon: <TrophyIcon />, screen: 'gamification' },
  ],
  [UserRole.Vendedor]: [
    { label: 'Dashboard', icon: <DashboardIcon />, screen: 'personal_dashboard' },
    { label: 'Clientes', icon: <ClientsIcon />, screen: 'clients' },
    { label: 'Vendas', icon: <SalesIcon />, screen: 'sales' },
    { label: 'Metas', icon: <GoalsIcon />, screen: 'goals' },
    { label: 'Gamificação', icon: <TrophyIcon />, screen: 'gamification' },
  ],
  [UserRole.Client]: [
    { label: 'Dashboard', icon: <DashboardIcon />, screen: 'client_dashboard' },
    { label: 'Extrato', icon: <FilePieChartIcon />, screen: 'statement' },
    { label: 'Documentos', icon: <DownloadCloudIcon />, screen: 'documents' },
    { label: 'Central de Ajuda', icon: <FileSearchIcon />, screen: 'help' },
  ],
};

/**
 * Conteúdo interno da Sidebar, reutilizado nas versões desktop e mobile.
 */
const SidebarContent: React.FC<Omit<SidebarProps, 'isMobile' | 'isOpen' | 'setIsOpen'>> = ({ userRole, activeScreen, setActiveScreen, onLogout }) => {
  const currentNavItems = navItems[userRole] || [];

  return (
    <>
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <LogoIcon />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Loop</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {currentNavItems.map((item) => (
          <a
            key={item.screen}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveScreen(item.screen);
            }}
            className={`flex items-center px-4 py-2.5 rounded-lg font-semibold transition-colors ${
              activeScreen === item.screen
                ? 'bg-orange-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>

      {/* Seção inferior com Configurações e Sair */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveScreen('settings');
          }}
          className={`flex items-center w-full px-4 py-2.5 rounded-lg font-semibold transition-colors ${
            activeScreen === 'settings'
              ? 'bg-orange-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <SettingsIcon />
          Configurações
        </a>
        <a 
            href="#" 
            onClick={(e) => {
                e.preventDefault();
                onLogout();
            }}
            className="flex items-center w-full px-4 py-2.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg font-semibold"
        >
          <LogoutIcon />
          Sair
        </a>
      </div>
    </>
  );
};


/**
 * Componente principal da Sidebar que gerencia a renderização para mobile e desktop.
 */
const Sidebar: React.FC<SidebarProps> = ({ userRole, activeScreen, setActiveScreen, onLogout, isMobile, isOpen, setIsOpen }) => {
  const sidebarProps = { userRole, activeScreen, setActiveScreen, onLogout };

  // Em modo mobile, a sidebar é um overlay que não faz parte do fluxo principal do layout
  if (isMobile) {
    return (
        <>
            <div
              className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            ></div>
            <aside
              className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
              aria-label="Menu principal"
            >
              <SidebarContent {...sidebarProps} />
            </aside>
        </>
    );
  }
  
  // Em modo desktop, a sidebar é um elemento fixo na lateral e faz parte do layout flex
  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <SidebarContent {...sidebarProps} />
    </aside>
  );
};

export default Sidebar;