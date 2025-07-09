
import React from 'react';
import { Layers } from 'lucide-react';

interface PlaceholderScreenProps {
  title: string;
  message: string;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, message }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </header>
      <main className="flex-1 p-6 flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <Layers className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-semibold text-slate-800">Página em Construção</h3>
            <p className="mt-1 text-sm text-slate-500">Esta funcionalidade estará disponível em breve.</p>
        </div>
      </main>
    </div>
  );
};

export default PlaceholderScreen;
