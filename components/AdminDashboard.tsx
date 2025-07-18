/**
 * @file Dashboard do Administrador
 * @description Esta tela fornece uma visão geral completa da operação para o administrador.
 * Inclui KPIs (Indicadores Chave de Desempenho), gráficos de vendas, uma lista de
 * contratos recentes para análise e um ranking de representantes.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSignKpiIcon, FileTextKpiIcon, FileClockKpiIcon, UserCheckKpiIcon, MoreHorizontalIcon } from './icons';
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

    // Função para buscar todos os dados necessários do banco de dados simulado
    const fetchData = () => {
        setSales(db.getSales());
        setReps(db.getRepresentatives());
        setClients(db.getClients());
    }

    useEffect(() => {
        fetchData();
        // Verifica o tema na montagem e observa mudanças
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        return () => observer.disconnect();
    }, []);

    // Memoiza os mapas de clientes e representantes para otimizar a busca
    const clientMap = useMemo(() => {
        return new Map(clients.map(client => [client.id, client]));
    }, [clients]);

    const repMap = useMemo(() => {
        return new Map(reps.map(rep => [rep.id, rep]));
    }, [reps]);


    // Função para atualizar o status de um contrato
    const handleUpdateStatus = (id: number, status: SaleStatus, reason?: string) => {
        db.updateSale(id, { status, rejectionReason: reason });
        fetchData(); // Atualiza os dados após a modificação
    };

    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload[0]) {
            const planName = data.activePayload[0].payload.originalName;
            setActiveScreen({ screen: 'contracts', params: { filter: planName } });
        }
    };

    // --- Cálculos de Dados Dinâmicos para KPIs e Gráficos ---
    const totalValue = sales.reduce((sum, sale) => sum + sale.value, 0);
    const newContractsThisMonth = sales.filter(s => {
        const saleDateParts = s.date.split('/');
        const saleDate = new Date(Number(saleDateParts[2]), Number(saleDateParts[1]) - 1, Number(saleDateParts[0]));
        const today = new Date();
        return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
    }).length;
    const pendingContracts = sales.filter(s => s.status === SaleStatus.Pending).length;
    const activeReps = reps.filter(r => r.status === 'Ativo').length;
    
    const kpiData = { totalValue, newContracts: newContractsThisMonth, pendingContracts, activeReps };

    // Agrupa as vendas por plano para o gráfico de barras
    const salesByPlanData = useMemo(() => sales.reduce((acc, sale) => {
        const planNameShort = sale.plan.replace('Consórcio de ', '');
        const existing = acc.find(item => item.name === planNameShort);
        if (existing) {
            existing.Vendas += sale.value;
        } else {
            acc.push({ name: planNameShort, Vendas: sale.value, originalName: sale.plan });
        }
        return acc;
    }, [] as { name: string; Vendas: number, originalName: string }[]), [sales]);

    // Agrupa as vendas por mês para o gráfico de linha
    const salesOverTimeData = useMemo(() => sales.reduce((acc, sale) => {
        const saleDateParts = sale.date.split('/');
        const saleDate = new Date(Number(saleDateParts[2]), Number(saleDateParts[1]) - 1, Number(saleDateParts[0]));
        const month = saleDate.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' });
        const existing = acc.find(item => item.month === month);
        if (existing) {
            existing['Valor (R$)'] += sale.value;
        } else {
            acc.push({ month, 'Valor (R$)': sale.value });
        }
        return acc;
    }, [] as { month: string; 'Valor (R$)': number }[]).slice(-6), [sales]);

    const recentContracts = sales.slice(0, 5);

    // Calcula o ranking dos representantes com base no valor de vendas aprovadas
    const topReps = useMemo(() => reps.map(rep => {
        const repSales = sales.filter(s => s.repId === rep.id && s.status === SaleStatus.Approved);
        return {
            name: rep.name,
            sales: repSales.length,
            value: repSales.reduce((sum, s) => sum + s.value, 0)
        };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 4), [reps, sales]);
    
    const chartTickColor = isDarkMode ? '#94a3b8' : '#64748b';
    const chartTooltipStyle = {
        backgroundColor: isDarkMode ? 'rgb(30 41 59 / 0.9)' : '#fff',
        border: '1px solid',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        borderRadius: '0.5rem',
        color: isDarkMode ? '#f1f5f9' : '#0f172a'
    };


    return (
        <>
        <div className="p-4 md:p-6">
            <ContentHeader 
                title="Dashboard do Administrador"
                subtitle="Visão geral da operação em tempo real."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <KPICard 
                    icon={<DollarSignKpiIcon />} 
                    title="Valor Total Vendido" 
                    value={formatCurrencyShort(kpiData.totalValue)} 
                    description="Acumulado geral"
                />
                <KPICard 
                    icon={<FileTextKpiIcon />}
                    title="Novos Contratos" 
                    value={formatNumber(kpiData.newContracts)} 
                    description="Este mês"
                />
                <KPICard 
                    icon={<FileClockKpiIcon />} 
                    title="Aprovações Pendentes" 
                    value={formatNumber(kpiData.pendingContracts)} 
                    description="Aguardando sua análise"
                />
                <KPICard 
                    icon={<UserCheckKpiIcon />} 
                    title="Representantes Ativos" 
                    value={formatNumber(kpiData.activeReps)} 
                    description="Com vendas no último mês"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Vendas nos Últimos Meses</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={salesOverTimeData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: chartTickColor }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(value) => formatCurrencyShort(Number(value))} tick={{ fill: chartTickColor }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => formatCurrency(Number(value))} />
                                <Line type="monotone" dataKey="Valor (R$)" stroke="#f97316" strokeWidth={3} dot={{ r: 5, fill: '#f97316' }} activeDot={{ r: 8, stroke: isDarkMode ? '#1e293b' : '#fff', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Vendas por Plano</h3>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={salesByPlanData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }} onClick={handleChartClick}>
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
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 p-6">Contratos Recentes</h3>
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
                                {recentContracts.map(c => (
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
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 p-6">Top Representantes</h3>
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                       {topReps.map((rep, index) => (
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