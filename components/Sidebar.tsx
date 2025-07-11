
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
  XIcon,
} from './icons';

interface SidebarProps {
  userRole: UserRole;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  onLogout: () => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems: Record<UserRole, NavItem[]> = {
  [UserRole.Admin]: [
    { label: 'Dashboard', icon: <DashboardIcon />, screen: 'admin_dashboard' },
    { label: 'Representantes', icon: <ClientsIcon />, screen: 'representatives' },
    { label: 'Planos', icon: <FileSpreadsheetIcon />, screen: 'plans' },
    { label: 'Contratos', icon: <FileCheck2Icon />, screen: 'contracts' },
    { label: 'Comissões', icon: <PercentIcon />, screen: 'commissions' },
    { label: 'Modelo Contrato', icon: <FileSignatureIcon />, screen: 'contract_template' },
    { label: 'Relatórios IA', icon: <ReportsIcon />, screen: 'reports' },
    { label: 'WhatsApp Bot', icon: <MessageCircleIcon />, screen: 'whatsapp_bot' },
  ],
  [UserRole.Representative]: [
    { label: 'Dashboard', icon: <DashboardIcon />, screen: 'rep_dashboard' },
    { label: 'Clientes', icon: <ClientsIcon />, screen: 'clients' },
    { label: 'Vendas', icon: <SalesIcon />, screen: 'sales' },
    { label: 'Metas', icon: <GoalsIcon />, screen: 'goals' },
  ],
  [UserRole.Client]: [
    { label: 'Dashboard', icon: <DashboardIcon />, screen: 'client_dashboard' },
    { label: 'Extrato', icon: <FilePieChartIcon />, screen: 'statement' },
    { label: 'Documentos', icon: <DownloadCloudIcon />, screen: 'documents' },
    { label: 'Central de Ajuda', icon: <FileSearchIcon />, screen: 'help' },
  ],
};

const SidebarContent: React.FC<Omit<SidebarProps, 'isMobile' | 'isOpen' | 'setIsOpen'>> = ({ userRole, activeScreen, setActiveScreen, onLogout }) => {
  const currentNavItems = navItems[userRole];

  return (
    <>
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <LogoIcon />
          <h1 className="text-xl font-bold text-slate-800">Loop</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
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
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-200">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveScreen('settings');
          }}
          className={`flex items-center w-full px-4 py-2.5 rounded-lg font-semibold transition-colors ${
            activeScreen === 'settings'
              ? 'bg-orange-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
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
            className="flex items-center w-full px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-lg font-semibold"
        >
          <LogoutIcon />
          Sair
        </a>
      </div>
    </>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ userRole, activeScreen, setActiveScreen, onLogout, isMobile, isOpen, setIsOpen }) => {
  const sidebarProps = { userRole, activeScreen, setActiveScreen, onLogout };

  return (
    <>
      {/* Mobile Sidebar */}
      {isMobile && (
        <>
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
          ></div>
          <aside
            className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <SidebarContent {...sidebarProps} />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex-col hidden md:flex">
        <SidebarContent {...sidebarProps} />
      </aside>
    </>
  );
};

export default Sidebar;
