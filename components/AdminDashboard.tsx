/**
 * @file Dashboard do Administrador
 * @description Esta tela fornece uma visão geral completa da operação para o administrador.
 * Inclui KPIs (Indicadores Chave de Desempenho), gráficos de vendas, uma lista de
 * contratos recentes para análise e um ranking de representantes.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSignKpiIcon, FileClockKpiIcon, MoreHorizontalIcon, ScaleKpiIcon, PercentKpiIcon, FilterXIcon, XIcon } from './icons';
import * as db from '../services/database';
import { Sale, Representative, SaleStatus, Client } from '../types';
import ApprovalModal from './ApprovalModal';
import ContentHeader from './ContentHeader';

// Funções de formatação para moeda e números
const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const formatCurrencyShort = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
    return `R$ ${value}`;
};
const formatNumber = (value: number) => value.toLocaleString('pt-BR');

/**
 * Componente reutilizável para exibir um cartão de KPI.
 */
const KPICard: React.FC<{ icon: React.ReactNode; title: string; value: string; description: string }> = ({ icon, title, value, description }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start">
        <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{description}</p>
        </div>
    </div>
);

// Mapeamento de status para classes de cor para estilização
const statusColors: { [key: string]: string } = {
  'Aprovada': 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/50',
  'Pendente': 'text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50',
  'Recusada': 'text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900/50',
};


const AdminDashboard: React.FC<{setActiveScreen: (screen: any) => void}> = ({setActiveScreen}) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [reps, setReps] = useState<Representative[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedContract, setSelectedContract] = useState<Sale | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        time: 'all' as 'month' | '3-months' | 'year' | 'all',
        plan: null as string | null,
        month: null as string | null,
    });

    const fetchData = () => {
        setSales(db.getSales());
        setReps(db.getRepresentatives());
        setClients(db.getClients());
    }

    useEffect(() => {
        fetchData();
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        return () => observer.disconnect();
    }, []);

    const clientMap = useMemo(() => new Map(clients.map(client => [client.id, client])), [clients]);
    const repMap = useMemo(() => new Map(reps.map(rep => [rep.id, rep])), [reps]);

    const handleUpdateStatus = (id: number, status: SaleStatus, reason?: string) => {
        db.updateSale(id, { status, rejectionReason: reason });
        fetchData(); 
    };

    const handleClearFilters = () => {
        setActiveFilters({ time: 'all', plan: null, month: null });
    };

    // --- Lógica de Filtragem e Cálculo de Dados ---
    const filteredData = useMemo(() => {
        const { time, plan, month } = activeFilters;
        let filteredSales = sales;

        // 1. Filtro de Tempo
        const now = new Date();
        if (time === 'month') {
            filteredSales = filteredSales.filter(s => {
                const saleDate = new Date(s.date.split('/').reverse().join('-'));
                return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
            });
        } else if (time === '3-months') {
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            filteredSales = filteredSales.filter(s => new Date(s.date.split('/').reverse().join('-')) >= threeMonthsAgo);
        } else if (time === 'year') {
            filteredSales = filteredSales.filter(s => new Date(s.date.split('/').reverse().join('-')).getFullYear() === now.getFullYear());
        }

        // 2. Filtro de Plano (interação do gráfico)
        if (plan) {
            filteredSales = filteredSales.filter(s => s.plan === plan);
        }

        // 3. Filtro de Mês (interação do gráfico)
        if (month) {
            filteredSales = filteredSales.filter(s => {
                const saleDate = new Date(s.date.split('/').reverse().join('-'));
                const saleMonth = saleDate.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' });
                return saleMonth.toLowerCase() === month.toLowerCase();
            });
        }

        // --- Cálculos de KPIs a partir dos dados filtrados ---
        const approvedSales = filteredSales.filter(s => s.status === SaleStatus.Approved);
        const approvedValue = approvedSales.reduce((sum, sale) => sum + sale.value, 0);
        const pendingContracts = filteredSales.filter(s => s.status === SaleStatus.Pending).length;
        const approvalRate = filteredSales.length > 0 ? (approvedSales.length / filteredSales.length) * 100 : 0;
        const averageTicket = approvedSales.length > 0 ? approvedValue / approvedSales.length : 0;

        // --- Dados para Gráficos ---
        const salesByPlanData = filteredSales.reduce((acc, sale) => {
            const planNameShort = sale.plan.replace('Consórcio de ', '');
            const existing = acc.find(item => item.name === planNameShort);
            if (existing) {
                existing.Vendas += sale.value;
            } else {
                acc.push({ name: planNameShort, Vendas: sale.value, originalName: sale.plan });
            }
            return acc;
        }, [] as { name: string; Vendas: number, originalName: string }[]);
        
        const salesOverTimeData = sales.reduce((acc, sale) => { // O gráfico de tempo sempre mostra a tendência geral
            const saleDateParts = sale.date.split('/');
            const saleDate = new Date(Number(saleDateParts[2]), Number(saleDateParts[1]) - 1, Number(saleDateParts[0]));
            const monthKey = saleDate.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' });
            const existing = acc.find(item => item.month === monthKey);
            if (existing) {
                existing['Valor (R$)'] += sale.value;
            } else {
                acc.push({ month: monthKey, 'Valor (R$)': sale.value });
            }
            return acc;
        }, [] as { month: string; 'Valor (R$)': number }[]).slice(-6);


        // --- Dados para Tabelas ---
        const recentContracts = filteredSales.slice(0, 5);
        const topReps = reps.map(rep => {
            const repSales = filteredSales.filter(s => s.repId === rep.id && s.status === SaleStatus.Approved);
            return { name: rep.name, sales: repSales.length, value: repSales.reduce((sum, s) => sum + s.value, 0) };
        }).sort((a, b) => b.value - a.value).slice(0, 4);

        return { approvedValue, pendingContracts, approvalRate, averageTicket, salesByPlanData, salesOverTimeData, recentContracts, topReps };

    }, [sales, reps, clients, activeFilters]);
    
    // --- Handlers de Interação com Gráficos ---
    const handlePlanClick = (data: any) => {
        if (data && data.activePayload && data.activePayload[0]) {
            const planName = data.activePayload[0].payload.originalName;
            setActiveFilters(prev => ({ ...prev, plan: planName }));
        }
    };
    const handleMonthClick = (data: any) => {
        if (data && data.activePayload && data.activePayload[0]) {
            const monthName = data.activePayload[0].payload.month;
            setActiveFilters(prev => ({ ...prev, month: monthName }));
        }
    };

    const chartTickColor = isDarkMode ? '#94a3b8' : '#64748b';
    const chartTooltipStyle = {
        backgroundColor: isDarkMode ? 'rgb(30 41 59 / 0.9)' : '#fff',
        border: '1px solid',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        borderRadius: '0.5rem',
        color: isDarkMode ? '#f1f5f9' : '#0f172a'
    };

    const hasActiveFilters = activeFilters.time !== 'all' || activeFilters.plan || activeFilters.month;

    return (
        <>
        <div className="p-4 md:p-6">
            <ContentHeader 
                title="Dashboard Interativo"
                subtitle="Filtre e explore os dados da operação em tempo real."
            />
            {/* Controles de Filtro */}
            <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 mr-2">Período:</span>
                    {(['month', '3-months', 'year', 'all'] as const).map(period => (
                        <button key={period} onClick={() => setActiveFilters(prev => ({...prev, time: period}))}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeFilters.time === period ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}>
                            { {month: 'Este Mês', '3-months': 'Últimos 3 Meses', year: 'Este Ano', all: 'Tudo'}[period] }
                        </button>
                    ))}
                </div>
                {hasActiveFilters && (
                    <button onClick={handleClearFilters} className="text-sm font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 flex items-center transition-colors">
                        <FilterXIcon /> Limpar Filtros
                    </button>
                )}
            </div>
             {/* Display de Filtros Ativos */}
            {hasActiveFilters && (
                <div className="mb-6 flex items-center gap-2 flex-wrap text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Filtros Ativos:</span>
                    {activeFilters.plan && (
                        <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Plano: {activeFilters.plan.replace('Consórcio de ', '')}
                            <button onClick={() => setActiveFilters(f => ({ ...f, plan: null }))} className="ml-1 text-blue-600 hover:text-blue-800"><XIcon /></button>
                        </span>
                    )}
                    {activeFilters.month && (
                        <span className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            Mês: {activeFilters.month}
                             <button onClick={() => setActiveFilters(f => ({ ...f, month: null }))} className="ml-1 text-purple-600 hover:text-purple-800"><XIcon /></button>
                        </span>
                    )}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <KPICard 
                    icon={<DollarSignKpiIcon />} 
                    title="Valor Aprovado" 
                    value={formatCurrencyShort(filteredData.approvedValue)} 
                    description="Soma das vendas aprovadas no filtro"
                />
                <KPICard 
                    icon={<ScaleKpiIcon />}
                    title="Ticket Médio" 
                    value={formatCurrency(filteredData.averageTicket)} 
                    description="Valor médio por venda aprovada"
                />
                <KPICard 
                    icon={<PercentKpiIcon />} 
                    title="Taxa de Aprovação" 
                    value={`${filteredData.approvalRate.toFixed(1)}%`} 
                    description="Contratos aprovados vs. total"
                />
                <KPICard 
                    icon={<FileClockKpiIcon />} 
                    title="Pendentes no Filtro" 
                    value={formatNumber(filteredData.pendingContracts)} 
                    description="Aguardando sua análise"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Vendas nos Últimos Meses</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={filteredData.salesOverTimeData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }} onClick={handleMonthClick}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: chartTickColor }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(value) => formatCurrencyShort(Number(value))} tick={{ fill: chartTickColor }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => formatCurrency(Number(value))} />
                                <Line type="monotone" dataKey="Valor (R$)" stroke="#f97316" strokeWidth={3} dot={{ r: 5, fill: '#f97316', cursor: 'pointer' }} activeDot={{ r: 8, stroke: isDarkMode ? '#1e293b' : '#fff', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Vendas por Plano</h3>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={filteredData.salesByPlanData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }} onClick={handlePlanClick}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} horizontal={false} />
                                <XAxis type="number" tickFormatter={(value) => formatCurrencyShort(Number(value))} tick={{ fill: chartTickColor }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" width={70} tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={chartTooltipStyle}/>
                                <Bar dataKey="Vendas" fill="#3b82f6" barSize={20} radius={[0, 10, 10, 0]} cursor="pointer" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 p-6">Contratos Recentes (Filtrado)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Cliente / Representante</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Valor</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.recentContracts.map(c => (
                                    <tr key={c.id} className="border-b last:border-b-0 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            {clientMap.get(c.clientId)?.name || 'Cliente não encontrado'}
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">por {repMap.get(c.repId)?.name || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4">{formatCurrency(c.value)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setSelectedContract(c)} className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><MoreHorizontalIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                                 {filteredData.recentContracts.length === 0 && (
                                    <tr><td colSpan={4} className="text-center p-6 text-slate-500">Nenhum contrato encontrado para os filtros selecionados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 p-6">Top Representantes (Filtrado)</h3>
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                       {filteredData.topReps.map((rep, index) => (
                           <li key={index} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                               <div className="flex items-center">
                                   <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 mr-3">{rep.name.charAt(0)}</div>
                                   <div>
                                       <p className="font-semibold text-slate-800 dark:text-slate-200">{rep.name}</p>
                                       <p className="text-xs text-slate-500 dark:text-slate-400">{rep.sales} vendas</p>
                                   </div>
                               </div>
                               <p className="font-bold text-slate-700 dark:text-slate-300">{formatCurrencyShort(rep.value)}</p>
                           </li>
                       ))}
                        {filteredData.topReps.length === 0 && (
                            <li className="text-center p-6 text-slate-500">Nenhum dado de representante para exibir.</li>
                        )}
                    </ul>
                </div>
            </div>
            </div>
            {selectedContract && (
                <ApprovalModal
                    isOpen={true}
                    contract={selectedContract}
                    client={clientMap.get(selectedContract.clientId)}
                    rep={repMap.get(selectedContract.repId)}
                    onClose={() => setSelectedContract(null)}
                    onUpdate={handleUpdateStatus}
                />
            )}
        </>
    );
};

export default AdminDashboard;