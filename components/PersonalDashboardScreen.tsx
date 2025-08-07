/**
 * @file Dashboard Pessoal do Representante
 * @description Painel de controle principal para o representante (Vendedor ou Supervisor).
 * Exibe KPIs personalizados (vendas, comissões, novos clientes), um gráfico de
 * performance ao longo do tempo, o progresso da meta mensal e uma lista de
 * atividades recentes. Todos os dados são filtrados para o representante logado.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSignKpiIcon, FileTextKpiIcon, UsersKpiIcon, TargetKpiIcon } from './icons';
import * as db from '../services/database';
import { Sale, Client, SaleStatus, Representative, User } from '../types';
import ContentHeader from './ContentHeader';

// Funções de formatação de moeda
const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;
const formatCurrencyShort = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value}`;
};

/**
 * Componente reutilizável para exibir um cartão de KPI.
 */
const KPICard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center">
            <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            </div>
        </div>
    </div>
);

// Interface para estruturar as atividades recentes
interface RecentActivity {
    type: 'Venda' | 'Cliente';
    text: string;
    time: string;
    date: Date;
}

const PersonalDashboardScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
    const [rep, setRep] = useState<Representative | null>(null);
    const [sales, setSales] = useState<Sale[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Busca os dados específicos do representante logado
    useEffect(() => {
        const currentRep = db.getRepresentativeByUserId(loggedInUser.id);
        if (currentRep) {
            setRep(currentRep);
            const allSales = db.getSales();
            const repSales = allSales.filter(s => s.repId === currentRep.id);
            setSales(repSales);
            setClients(db.getClients());
        }

        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        return () => observer.disconnect();
    }, [loggedInUser]);

    // Memoiza o mapa de nomes de clientes para performance
    const clientNameMap = useMemo(() => {
        return new Map(clients.map(client => [client.id, client.name]));
    }, [clients]);

    // Exibe um loader enquanto os dados estão sendo carregados
    if (!rep) return <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;

    // --- Cálculos de Dados Dinâmicos para KPIs e Gráficos ---
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Filtra vendas aprovadas no mês corrente
    const monthlySalesData = sales.filter(s => {
        const [day, month, year] = s.date.split('/').map(Number);
        const saleDate = new Date(year, month - 1, day);
        return saleDate >= startOfMonth && s.status === SaleStatus.Approved;
    });

    const monthlySalesValue = monthlySalesData.reduce((sum, s) => sum + s.value, 0);
    const monthlyCommission = monthlySalesValue * (rep.commissionRate / 100);
    const newClientsThisMonth = new Set(monthlySalesData.map(s => s.clientId)).size;
    
    // Usa a meta dinâmica do representante, que pode ser undefined
    const goal = rep.goal;
    const goalPercentage = (goal && goal > 0) ? (monthlySalesValue / goal) * 100 : 0;

    // Prepara os dados para o gráfico de vendas dos últimos 6 meses
    const salesChartData = sales
        .filter(s => s.status === SaleStatus.Approved)
        .reduce((acc, sale) => {
            const saleDateParts = sale.date.split('/');
            const saleDate = new Date(Number(saleDateParts[2]), Number(saleDateParts[1]) - 1, Number(saleDateParts[0]));
            const month = saleDate.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' });
            const existing = acc.find(item => item.month === month);
            if (existing) {
                existing.Vendas += sale.value;
            } else {
                acc.push({ month, Vendas: sale.value });
            }
            return acc;
        }, [] as { month: string; Vendas: number }[]).slice(-6);

    // Monta a lista de atividades recentes a partir das vendas
    const recentActivities: RecentActivity[] = sales.map((s): RecentActivity => {
       const [day, month, year] = s.date.split('/').map(Number);
       const saleDate = new Date(year, month - 1, day);
       const timeDiff = today.getTime() - saleDate.getTime();
       const daysAgo = Math.floor(timeDiff / (1000 * 3600 * 24));
       const clientName = clientNameMap.get(s.clientId) || 'Cliente';
       return {
           type: 'Venda',
           text: `Venda de ${formatCurrency(s.value)} para ${clientName} (${s.status})`,
           time: daysAgo === 0 ? 'Hoje' : `${daysAgo}d atrás`,
           date: saleDate,
       };
    })
    .sort((a,b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);
    
    const chartTickColor = isDarkMode ? '#94a3b8' : '#64748b';
    const chartTooltipStyle = {
        backgroundColor: isDarkMode ? 'rgb(30 41 59 / 0.9)' : '#fff',
        border: '1px solid',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        borderRadius: '0.5rem',
        color: isDarkMode ? '#f1f5f9' : '#0f172a'
    };


    return (
        <div className="p-4 md:p-6">
            <ContentHeader 
                title="Meu Dashboard Pessoal"
                subtitle={`Seus KPIs de vendas e comissões, ${rep.name}.`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <KPICard icon={<DollarSignKpiIcon />} title="Vendas no Mês" value={formatCurrency(monthlySalesValue)} />
                <KPICard icon={<FileTextKpiIcon />} title="Comissão no Mês" value={formatCurrency(monthlyCommission)} />
                <KPICard icon={<UsersKpiIcon />} title="Novos Clientes" value={String(newClientsThisMonth)} />
                <KPICard icon={<TargetKpiIcon />} title="Meta Mensal" value={goal ? formatCurrency(goal) : 'Não definida'} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Performance de Vendas (6 meses)</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: chartTickColor }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(value) => formatCurrencyShort(Number(value))} tick={{ fill: chartTickColor }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={chartTooltipStyle} />
                                <Line type="monotone" dataKey="Vendas" stroke="#f97316" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Progresso da Meta</h3>
                        {goal && goal > 0 ? (
                            <>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(monthlySalesValue)} de {formatCurrency(goal)}</span>
                                    <span className="text-sm font-bold text-orange-600 dark:text-orange-500">{goalPercentage.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${Math.min(goalPercentage, 100)}%` }}></div>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                Nenhuma meta definida para este mês.
                            </p>
                        )}
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Atividades Recentes</h3>
                        <ul className="space-y-4">
                           {recentActivities.map((act, i) => (
                               <li key={i} className="flex items-start">
                                   <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 ${act.type === 'Venda' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                   <div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{act.text}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{act.time}</p>
                                   </div>
                               </li>
                           ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalDashboardScreen;
