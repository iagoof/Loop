/**
 * @file Tela de Gestão de Comissões
 * @description Esta tela é destinada ao administrador para visualizar e gerenciar
 * as comissões dos representantes. Ela calcula as comissões com base nas vendas
 * aprovadas e permite marcar as comissões pendentes como "Pagas".
 */
import React, { useState, useEffect, useMemo } from 'react';
import { DollarSignKpiIcon, CheckCircleIcon, DownloadIcon } from './icons';
import { Commission } from '../types';
import * as db from '../services/database';
import ContentHeader from './ContentHeader';
import { convertToCSV, downloadCSV } from '../utils/export';
import { useToast } from '../contexts/ToastContext';

// Função para formatar números como moeda brasileira (R$)
const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

// Mapeamento de status para classes de cor do Tailwind CSS
const statusColors = {
  'Paga': 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/50',
  'Pendente': 'text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50',
};

const CommissionsScreen: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const { addToast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('todos');

  // Função para buscar e atualizar a lista de comissões
  const fetchCommissions = () => {
      // As comissões são calculadas dinamicamente a partir das vendas
      setCommissions(db.getCommissions());
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const availablePeriods = useMemo(() => {
    const periods = new Set(commissions.map(c => c.period));
    return ['todos', ...Array.from(periods)];
  }, [commissions]);

  // Lida com a ação de marcar uma comissão como paga
  const handleMarkAsPaid = (commission: Commission) => {
      // A "comissão" aqui usa o ID da venda original
      db.markCommissionAsPaid(commission.id);
      addToast(`Comissão de ${commission.repName} paga.`, 'success');
      fetchCommissions(); // Recarrega os dados para refletir a mudança
  };
  
  const filteredCommissions = useMemo(() => {
      if (selectedPeriod === 'todos') {
          return commissions;
      }
      return commissions.filter(c => c.period === selectedPeriod);
  }, [commissions, selectedPeriod]);

  // Calcula o valor total de comissões pendentes
  const totalPending = commissions
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + c.commissionValue, 0);

  // Calcula o valor total de comissões já pagas
  const totalPaid = commissions
    .filter(c => c.status === 'Paga')
    .reduce((sum, c) => sum + c.commissionValue, 0);

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `relatorio_comissoes_${selectedPeriod}_${date}.csv`;

    const headers = {
        id: 'ID Venda',
        repName: 'Representante',
        period: 'Período',
        salesValue: 'Valor da Venda (R$)',
        commissionValue: 'Comissão (R$)',
        status: 'Status',
    };

    const csvString = convertToCSV(filteredCommissions, headers);
    downloadCSV(csvString, filename);
    addToast('Relatório de comissões exportado!', 'success');
  };

  return (
    <div className="p-4 md:p-6">
      <ContentHeader 
        title="Gestão de Comissões"
        subtitle="Calcule e pague as comissões dos representantes."
      >
        <div className="flex items-center gap-4">
            <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
                {availablePeriods.map(p => (
                    <option key={p} value={p}>{p === 'todos' ? 'Todos os Períodos' : p.toUpperCase()}</option>
                ))}
            </select>
            <button 
              onClick={handleExport}
              className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2"
            >
              <DownloadIcon />
              <span className="hidden sm:inline">Exportar Relatório</span>
            </button>
        </div>
      </ContentHeader>

      {/* KPIs de Comissões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start">
              <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                  <DollarSignKpiIcon />
              </div>
              <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Pendente</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalPending)}</p>
              </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                  <DollarSignKpiIcon />
              </div>
              <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Pago (geral)</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalPaid)}</p>
              </div>
          </div>
      </div>

      {/* Tabela de Comissões */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-3">Representante</th>
                <th scope="col" className="px-6 py-3">Período</th>
                <th scope="col" className="px-6 py-3">Valor da Venda</th>
                <th scope="col" className="px-6 py-3">Comissão</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.map(c => (
                <tr key={c.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{c.repName}</td>
                  <td className="px-6 py-4">{c.period.toUpperCase()}</td>
                  <td className="px-6 py-4">{formatCurrency(c.salesValue)}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{formatCurrency(c.commissionValue)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'Pendente' && (
                      <button 
                        onClick={() => handleMarkAsPaid(c)}
                        className="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400"
                      >
                        <CheckCircleIcon /> Marcar como paga
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommissionsScreen;