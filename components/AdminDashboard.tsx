import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSignKpiIcon, FileTextKpiIcon, FileClockKpiIcon, UserCheckKpiIcon, MoreHorizontalIcon } from './icons';

// Mock Data
const kpiData = {
    totalValue: 5850000,
    newContracts: 12,
    pendingContracts: 3,
    activeReps: 8,
};

const salesByPlanData = [
    { name: 'Imóvel', Vendas: 3500000 },
    { name: 'Automóvel', Vendas: 1850000 },
    { name: 'Serviços', Vendas: 500000 },
];

const salesOverTimeData = [
    { month: 'Fev', 'Valor (R$)': 850000 },
    { month: 'Mar', 'Valor (R$)': 920000 },
    { month: 'Abr', 'Valor (R$)': 1100000 },
    { month: 'Mai', 'Valor (R$)': 1050000 },
    { month: 'Jun', 'Valor (R$)': 1300000 },
    { month: 'Jul', 'Valor (R$)': 1550000 },
];

const recentContracts = [
    { id: 1, client: 'Fernanda Lima', rep: 'Carlos Andrade', plan: 'Consórcio de Imóvel', value: 450000, status: 'Pendente' },
    { id: 2, client: 'Roberto Dias', rep: 'Sofia Ribeiro', plan: 'Consórcio de Automóvel', value: 95000, status: 'Aprovado' },
    { id: 3, client: 'Lucas Martins', rep: 'Carlos Andrade', plan: 'Consórcio de Serviços', value: 25000, status: 'Aprovado' },
    { id: 4, client: 'Vanessa Costa', rep: 'Juliana Paes', plan: 'Consórcio de Imóvel', value: 600000, status: 'Pendente' },
    { id: 5, client: 'Gabriel Rocha', rep: 'Pedro Mendes', plan: 'Consórcio de Automóvel', value: 120000, status: 'Recusado' },
];

const topReps = [
    { name: 'Carlos Andrade', sales: 12, value: 1250000 },
    { name: 'Sofia Ribeiro', sales: 9, value: 980000 },
    { name: 'Juliana Paes', sales: 7, value: 850000 },
    { name: 'Pedro Mendes', sales: 5, value: 650000 },
];

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const formatCurrencyShort = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
    return `R$ ${value}`;
};
const formatNumber = (value: number) => value.toLocaleString('pt-BR');

const KPICard: React.FC<{ icon: React.ReactNode; title: string; value: string; description: string }> = ({ icon, title, value, description }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start">
        <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
    </div>
);

const statusColors: { [key: string]: string } = {
  'Aprovado': 'text-green-800 bg-green-100',
  'Pendente': 'text-yellow-800 bg-yellow-100',
  'Recusado': 'text-red-800 bg-red-100',
};

const AdminDashboard: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dashboard do Administrador</h2>
                    <p className="text-sm text-slate-500">Visão geral da operação em tempo real.</p>
                </div>
            </header>
            <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <KPICard 
                        icon={<DollarSignKpiIcon />} 
                        title="Valor Total Vendido" 
                        value={formatCurrencyShort(kpiData.totalValue)} 
                        description="Acumulado este ano"
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
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Vendas nos Últimos 6 Meses</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={salesOverTimeData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={(value) => formatCurrencyShort(Number(value))} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem'}} formatter={(value) => formatCurrency(Number(value))} />
                                    <Line type="monotone" dataKey="Valor (R$)" stroke="#f97316" strokeWidth={3} dot={{ r: 5, fill: '#f97316' }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Vendas por Plano</h3>
                         <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={salesByPlanData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" tickFormatter={(value) => formatCurrencyShort(Number(value))} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" width={70} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem'}}/>
                                    <Bar dataKey="Vendas" fill="#3b82f6" barSize={20} radius={[0, 10, 10, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <h3 className="text-lg font-bold text-slate-800 p-6">Contratos Recentes</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-medium">Cliente / Representante</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Valor</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentContracts.map(c => (
                                        <tr key={c.id} className="border-b last:border-b-0 border-slate-200 hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {c.client}
                                                <p className="text-xs text-slate-500 font-normal">por {c.rep}</p>
                                            </td>
                                            <td className="px-6 py-4">{formatCurrency(c.value)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-500 hover:text-orange-600 p-1 rounded-full hover:bg-slate-200"><MoreHorizontalIcon /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <h3 className="text-lg font-bold text-slate-800 p-6">Top Representantes</h3>
                        <ul className="divide-y divide-slate-200">
                           {topReps.map((rep, index) => (
                               <li key={index} className="flex justify-between items-center p-4 hover:bg-slate-50">
                                   <div className="flex items-center">
                                       <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 mr-3">{rep.name.charAt(0)}</div>
                                       <div>
                                           <p className="font-semibold text-slate-800">{rep.name}</p>
                                           <p className="text-xs text-slate-500">{rep.sales} vendas</p>
                                       </div>
                                   </div>
                                   <p className="font-bold text-slate-700">{formatCurrencyShort(rep.value)}</p>
                               </li>
                           ))}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;