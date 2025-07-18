/**
 * @file Painel de Notificações
 * @description Este componente renderiza um painel suspenso que exibe
 * as notificações do usuário. Notificações não lidas são destacadas.
 * Clicar em uma notificação navega para a tela correspondente.
 */
import React from 'react';
import { Notification } from '../types';
import { BellIcon, XIcon } from './icons';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "a";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min";
    return "agora";
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, onNavigate }) => {
  return (
    <div className="absolute top-16 right-4 w-80 max-w-sm bg-white rounded-lg shadow-2xl border border-slate-200 z-50 animate-fade-in-down">
      <div className="flex justify-between items-center p-4 border-b border-slate-200">
        <h3 className="font-bold text-slate-800">Notificações</h3>
        <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
          <XIcon />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((n) => (
              <li key={n.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (n.link) onNavigate(n.link);
                  }}
                  className={`flex items-start p-4 hover:bg-slate-50 ${n.link ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {!n.isRead && <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>}
                  <div className={`flex-1 ${n.isRead ? 'pl-5' : ''}`}>
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{timeSince(n.createdAt)}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center p-8 text-slate-500">
            <BellIcon />
            <p className="mt-2 text-sm">Nenhuma notificação nova.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;