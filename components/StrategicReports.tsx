/**
 * @file Tela de Relatórios Estratégicos com IA
 * @description Permite que administradores façam perguntas em linguagem natural
 * para obter análises e relatórios sobre dados de negócio (simulados).
 * Utiliza o Gemini para processar a pergunta e gerar uma resposta textual.
 */
import React, { useState } from 'react';
import { getStrategicReport } from '../services/geminiService';
import { BrainCircuitIcon } from './icons';
import ContentHeader from './ContentHeader';

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
      // Sanitize the response to prevent unwanted HTML/styles from the AI
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = result;
      const sanitizedText = tempDiv.textContent || tempDiv.innerText || "";
      setReport(sanitizedText);
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro ao gerar o relatório.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <ContentHeader 
        title="Relatórios Estratégicos com IA"
        subtitle="Faça perguntas em linguagem natural sobre seus dados de negócio."
      />
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="space-y-4">
          <label htmlFor="report-query" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Sua Pergunta:
          </label>
          <div className="flex gap-4">
            <input
              id="report-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Qual produto foi mais rentável no último trimestre?"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
            />
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-slate-400 disabled:text-slate-600 transition-colors flex items-center justify-center"
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

        {/* Exibe a área de resultado apenas se estiver carregando ou se houver um relatório */}
        {(isLoading || report) && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Resultado da Análise</h3>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-slate-800 dark:text-slate-200">
              {isLoading ? <p>Analisando os dados...</p> : <p className="whitespace-pre-wrap">{report}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategicReports;