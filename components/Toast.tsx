/**
 * @file Componente de Notificação Toast
 * @description Renderiza uma notificação toast individual com estilo e ícone
 * apropriados para o tipo de mensagem (sucesso, erro, informação).
 * Inclui animações de entrada e saída.
 */
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    style: 'bg-green-50 border-green-200 text-green-800',
  },
  error: {
    icon: <XCircle className="w-6 h-6 text-red-500" />,
    style: 'bg-red-50 border-red-200 text-red-800',
  },
  info: {
    icon: <AlertCircle className="w-6 h-6 text-blue-500" />,
    style: 'bg-blue-50 border-blue-200 text-blue-800',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { icon, style } = toastConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Aguarda a animação de fade-out terminar antes de remover
      setTimeout(() => onRemove(toast.id), 300);
    }, 4700); // Começa a desaparecer um pouco antes de ser removido

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`relative flex items-center w-full max-w-sm p-4 my-2 text-sm font-semibold rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out ${style} ${isFadingOut ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">{icon}</div>
      <div className="flex-1">{toast.message}</div>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-4 p-1 rounded-full hover:bg-black/10"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;