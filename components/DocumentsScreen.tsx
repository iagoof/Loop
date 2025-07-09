
import React from 'react';
import { DownloadIcon } from './icons';

const documents = [
  { id: 1, name: 'Contrato de Adesão', date: '10/08/2024', type: 'PDF', size: '2.3 MB' },
  { id: 2, name: 'Informe de Rendimentos 2024', date: '28/02/2025', type: 'PDF', size: '150 KB' },
  { id: 3, name: 'Regulamento do Grupo', date: '10/08/2024', type: 'PDF', size: '800 KB' },
  { id: 4, name: 'Comprovante de Contemplação', date: 'N/A', type: 'PDF', size: 'N/A', disabled: true },
];

const DocumentsScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meus Documentos</h2>
          <p className="text-sm text-slate-500">Baixe seu contrato e outros arquivos importantes.</p>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <ul className="divide-y divide-slate-200">
            {documents.map(doc => (
              <li key={doc.id} className="flex items-center justify-between p-6 hover:bg-slate-50">
                <div>
                  <p className={`font-semibold ${doc.disabled ? 'text-slate-400' : 'text-slate-800'}`}>{doc.name}</p>
                  <p className="text-sm text-slate-500">
                    Disponibilizado em: {doc.date} | {doc.type} | {doc.size}
                  </p>
                </div>
                <button
                  disabled={doc.disabled}
                  className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <DownloadIcon />
                  Baixar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default DocumentsScreen;
