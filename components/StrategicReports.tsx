
import React, { useState } from 'react';
import { getStrategicReport } from '../services/geminiService';
import { BrainCircuitIcon } from './icons';

const StrategicReports: React.FC = () => {
  const [query, setQuery] = useState('');
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    if (!query.trim()) {
      setError('Por favor, insira uma pergunta.');
      return;
    }
    setIsLoading(true);
    setError('');
    setReport('');
    try {
      const result = await getStrategicReport(query);
      setReport(result);
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro ao gerar o relatório.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatórios Estratégicos com IA</h2>
          <p className="text-sm text-slate-500">Faça perguntas em linguagem natural sobre seus dados de negócio.</p>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="space-y-4">
            <label htmlFor="report-query" className="block text-sm font-semibold text-slate-700">
              Sua Pergunta:
            </label>
            <div className="flex gap-4">
              <input
                id="report-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Qual produto foi mais rentável no último trimestre?"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
              />
              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-slate-400 transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <BrainCircuitIcon />
                )}
                <span className="ml-2">Gerar Análise</span>
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {(isLoading || report) && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Resultado da Análise</h3>
              <div className="bg-slate-50 p-4 rounded-lg prose prose-sm max-w-none">
                {isLoading ? <p>Analisando os dados...</p> : <div dangerouslySetInnerHTML={{__html: report.replace(/\n/g, '<br />')}}/>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StrategicReports;
