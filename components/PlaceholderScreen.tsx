/**
 * @file Tela de Placeholder (Em Construção)
 * @description Este é um componente genérico usado para preencher o espaço de telas
 * que ainda não foram desenvolvidas. Ele exibe uma mensagem padrão de "Página em Construção".
 */
import React from 'react';
import { Layers } from 'lucide-react';
import ContentHeader from './ContentHeader';

interface PlaceholderScreenProps {
  title: string;
  message: string;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, message }) => {
  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <ContentHeader 
        title={title}
        subtitle={message}
      />
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="text-center">
            <Layers className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Página em Construção</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Esta funcionalidade estará disponível em breve.</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderScreen;