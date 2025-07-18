/**
 * @file Contexto para Notificações Toast
 * @description Fornece um contexto e um provedor para gerenciar o estado
 * das notificações (toasts) em toda a aplicação. Permite que qualquer
 * componente filho chame o hook `useToast` para exibir mensagens.
 */
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ToastMessage, ToastType } from '../components/Toast';

type ToastContextType = {
  addToast: (message: string, type?: ToastType) => void;
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    // Limita o número de toasts na tela para não sobrecarregar a UI
    setToasts(prev => [...prev, { id, message, type }].slice(-5));
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
