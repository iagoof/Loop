/**
 * @file Cabeçalho Global (Header)
 * @description Componente de cabeçalho unificado para toda a aplicação.
 * É responsivo, mostrando o botão de menu em mobile e os controles de
 * usuário e notificações.
 */
import React, { useState } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { MenuIcon, BellIcon } from './icons';
import { User } from '../types';

interface HeaderProps {
  isMobile: boolean;
  onToggleSidebar: () => void;
  user: User;
  title: string;
  unreadCount: number;
  onToggleNotifications: () => void;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
  avatarUrl: string;
}

interface UserMenuProps {
    user: User;
    onLogout: () => void;
    onNavigate: (screen: string) => void;
    avatarUrl: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onNavigate, avatarUrl }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(prev => !prev)} className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 uppercase ring-2 ring-offset-2 ring-transparent hover:ring-orange-500 transition-all overflow-hidden">
                 {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar do usuário" className="w-full h-full object-cover" />
                ) : (
                    user.name.charAt(0)
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-200 animate-fade-in-down">
                    <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('settings'); setIsOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                        <Settings size={16} className="mr-2" /> Configurações
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setIsOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={16} className="mr-2" /> Sair
                    </a>
                </div>
            )}
        </div>
    );
}

const NotificationBell: React.FC<{ unreadCount: number, onClick: () => void }> = ({ unreadCount, onClick }) => (
    <button onClick={onClick} className="relative text-slate-500 p-2 rounded-full hover:bg-slate-100 hover:text-slate-800">
        <BellIcon />
        {unreadCount > 0 && (
            <span className="absolute top-1 right-1 block w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
    </button>
);

const Header: React.FC<HeaderProps> = ({ isMobile, onToggleSidebar, user, title, unreadCount, onToggleNotifications, onLogout, onNavigate, avatarUrl }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
        <div className="flex items-center">
            {isMobile && (
                <button onClick={onToggleSidebar} className="text-slate-600 p-2 -ml-2 mr-2" aria-label="Abrir menu">
                    <MenuIcon />
                </button>
            )}
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
            <NotificationBell unreadCount={unreadCount} onClick={onToggleNotifications} />
            <UserMenu user={user} onLogout={onLogout} onNavigate={onNavigate} avatarUrl={avatarUrl} />
        </div>
    </header>
  );
};

export default Header;