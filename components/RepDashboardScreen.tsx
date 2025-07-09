
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSignKpiIcon, FileTextKpiIcon, UsersKpiIcon, TargetKpiIcon } from './icons';

const kpiData = {
    monthlySales: 155000,
    monthlyCommission: 7750,
    newClients: 3,
    goal: 200000,
};

const salesData = [
    { month: 'Fev', Vendas: 85000 },
    { month: 'Mar', Vendas: 92000 },
    { month: 'Abr', Vendas: 110000 },
    { month: 'Mai', Vendas: 105000 },
    { month: 'Jun', Vendas: 130000 },
    { month: 'Jul', Vendas: 155000 },
];

const recentActivities = [
    { type: 'Venda', text: 'Venda de R$ 95.000 para Roberto Dias', time: '2h atrás' },
    { type: 'Cliente', text: 'Novo cliente adicionado: Fernanda Lima', time: 'Ontem' },
    { type: 'Venda', text: 'Venda de R$ 25.000 para Lucas Martins', time: '3 dias atrás' },
];

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;
const goalPercentage = (kpiData.monthlySales / kpiData.goal) * 100;

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

const RepDashboardScreen: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Meu Dashboard</h2>
                    <p className="text-sm text-slate-500">Seus KPIs de vendas e comissões.</p>
                </div>
            </header>
            <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <KPICard icon={<DollarSignKpiIcon />} title="Vendas no Mês" value={formatCurrency(kpiData.monthlySales)} />
                    <KPICard icon={<FileTextKpiIcon />} title="Comissão no Mês" value={formatCurrency(kpiData.monthlyCommission)} />
                    <KPICard icon={<UsersKpiIcon />} title="Novos Clientes" value={String(kpiData.newClients)} />
                    <KPICard icon={<TargetKpiIcon />} title="Meta Mensal" value={formatCurrency(kpiData.goal)} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Performance de Vendas (6 meses)</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={(value) => `R$${Number(value) / 1000}k`} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                                <span className="text-sm font-semibold text-slate-600">{formatCurrency(kpiData.monthlySales)} de {formatCurrency(kpiData.goal)}</span>
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

export default RepDashboardScreen;
