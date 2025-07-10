
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSignKpiIcon, FileTextKpiIcon, UsersKpiIcon, TargetKpiIcon } from './icons';
import * as db from '../services/database';
import { Sale, Client, SaleStatus, Representative, User } from '../types';

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;
const formatCurrencyShort = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value}`;
};

const KPICard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center">
            <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    </div>
);

interface RecentActivity {
    type: 'Venda' | 'Cliente';
    text: string;
    time: string;
    date: Date;
}

export const RepDashboardScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
    const [rep, setRep] = useState<Representative | null>(null);
    const [sales, setSales] = useState<Sale[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        const currentRep = db.getRepresentativeByUserId(loggedInUser.id);
        if (currentRep) {
            setRep(currentRep);
            const allSales = db.getSales();
            const repSales = allSales.filter(s => s.repId === currentRep.id);
            setSales(repSales);
            setClients(db.getClients());
        }
    }, [loggedInUser]);

    const clientNameMap = useMemo(() => {
        return new Map(clients.map(client => [client.id, client.name]));
    }, [clients]);

    if (!rep) return <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;

    // --- Dynamic Data Calculation ---
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthlySalesData = sales.filter(s => {
        const [day, month, year] = s.date.split('/').map(Number);
        const saleDate = new Date(year, month - 1, day);
        return saleDate >= startOfMonth && s.status === SaleStatus.Approved;
    });

    const monthlySalesValue = monthlySalesData.reduce((sum, s) => sum + s.value, 0);
    const monthlyCommission = monthlySalesValue * (rep.commissionRate / 100);
    const newClientsThisMonth = new Set(monthlySalesData.map(s => s.clientId)).size;
    
    const goal = 200000; // Static goal for demo
    const goalPercentage = (monthlySalesValue / goal) * 100;

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


    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white border-b border-slate-200 p-4 sm:px-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Meu Dashboard</h2>
                    <p className="text-sm text-slate-500">Seus KPIs de vendas e comissões, {rep.name}.</p>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <KPICard icon={<DollarSignKpiIcon />} title="Vendas no Mês" value={formatCurrency(monthlySalesValue)} />
                    <KPICard icon={<FileTextKpiIcon />} title="Comissão no Mês" value={formatCurrency(monthlyCommission)} />
                    <KPICard icon={<UsersKpiIcon />} title="Novos Clientes" value={String(newClientsThisMonth)} />
                    <KPICard icon={<TargetKpiIcon />} title="Meta Mensal" value={formatCurrency(goal)} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Performance de Vendas (6 meses)</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={(value) => formatCurrencyShort(Number(value))} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Line type="monotone" dataKey="Vendas" stroke="#f97316" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Progresso da Meta</h3>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-slate-600">{formatCurrency(monthlySalesValue)} de {formatCurrency(goal)}</span>
                                <span className="text-sm font-bold text-orange-600">{goalPercentage.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${goalPercentage}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Atividades Recentes</h3>
                            <ul className="space-y-4">
                               {recentActivities.map((act, i) => (
                                   <li key={i} className="flex items-start">
                                       <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 ${act.type === 'Venda' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                       <div>
                                            <p className="text-sm text-slate-700">{act.text}</p>
                                            <p className="text-xs text-slate-400">{act.time}</p>
                                       </div>
                                   </li>
                               ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
