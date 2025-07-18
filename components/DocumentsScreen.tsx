/**
 * @file Tela de Documentos
 * @description Permite que o cliente visualize e baixe documentos importantes
 * relacionados ao seu consórcio, como o contrato de adesão e informes.
 * A funcionalidade de download é simulada.
 */
import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons';
import { User, Client } from '../types';
import * as db from '../services/database';
import ContentHeader from './ContentHeader';


const DocumentsScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const clientProfile = db.getClientByUserId(loggedInUser.id);
    setClient(clientProfile || null);
  }, [loggedInUser]);

  // Lista estática de documentos para demonstração
  const documents = [
    { id: 1, name: 'Contrato de Adesão', date: '10/08/2024', type: 'PDF', size: '2.3 MB', available: client && client.plan !== 'Nenhum' },
    { id: 2, name: 'Informe de Rendimentos 2024', date: '28/02/2025', type: 'PDF', size: '150 KB', available: client && client.plan !== 'Nenhum' },
    { id: 3, name: 'Regulamento do Grupo', date: '10/08/2024', type: 'PDF', size: '800 KB', available: client && client.plan !== 'Nenhum' },
    { id: 4, name: 'Comprovante de Contemplação', date: 'N/A', type: 'PDF', size: 'N/A', available: false }, // Funcionalidade futura
  ];

  // Simula o download de um arquivo de texto
  const handleDownload = (docName: string) => {
    const content = `Este é um documento de exemplo para ${docName}, para o cliente ${client?.name}.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!client) {
    return <div className="flex-1 flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="p-4 md:p-6">
        <ContentHeader 
            title="Meus Documentos"
            subtitle="Baixe seu contrato e outros arquivos importantes."
        />
      
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <ul className="divide-y divide-slate-200">
            {documents.map(doc => (
              <li key={doc.id} className="flex items-center justify-between p-6 hover:bg-slate-50">
                <div>
                  <p className={`font-semibold ${!doc.available ? 'text-slate-400' : 'text-slate-800'}`}>{doc.name}</p>
                  <p className="text-sm text-slate-500">
                    Disponibilizado em: {doc.date} | {doc.type} | {doc.size}
                  </p>
                </div>
                <button
                  onClick={() => doc.available && handleDownload(doc.name)}
                  disabled={!doc.available}
                  className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <DownloadIcon />
                  Baixar
                </button>
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
};

export default DocumentsScreen;