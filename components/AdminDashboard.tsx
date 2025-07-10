
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSignKpiIcon, FileTextKpiIcon, FileClockKpiIcon, UserCheckKpiIcon, MoreHorizontalIcon } from './icons';
import * as db from '../services/database';
import { Sale, Representative, SaleStatus, Client } from '../types';
import ApprovalModal from './ApprovalModal';


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
  'Aprovada': 'text-green-800 bg-green-100',
  'Pendente': 'text-yellow-800 bg-yellow-100',
  'Recusada': 'text-red-800 bg-red-100',
};


const AdminDashboard: React.FC<{setActiveScreen: (screen: string) => void}> = ({setActiveScreen}) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [reps, setReps] = useState<Representative[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedContract, setSelectedContract] = useState<Sale | null>(null);

    const fetchData = () => {
        setSales(db.getSales());
        setReps(db.getRepresentatives());
        setClients(db.getClients());
    }

    useEffect(() => {
        fetchData();
    }, []);

    const clientNameMap = useMemo(() => {
        return new Map(clients.map(client => [client.id, client.name]));
    }, [clients]);

    const handleUpdateStatus = (id: number, status: SaleStatus, reason?: string) => {
        db.updateSale(id, { status, rejectionReason: reason });
        fetchData(); // Refresh data
    };

    // --- Dynamic Data Calculation ---
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

    const salesByPlanData = sales.reduce((acc, sale) => {
        const planName = sale.plan.replace('Consórcio de ', '');
        const existing = acc.find(item => item.name === planName);
        if (existing) {
            existing.Vendas += sale.value;
        } else {
            acc.push({ name: planName, Vendas: sale.value });
        }
        return acc;
    }, [] as { name: string; Vendas: number }[]);

    const salesOverTimeData = sales.reduce((acc, sale) => {
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
    }, [] as { month: string; 'Valor (R$)': number }[]).slice(-6);

    const recentContracts = sales.slice(0, 5);

    const topReps = reps.map(rep => {
        const repSales = sales.filter(s => s.repId === rep.id && s.status === SaleStatus.Approved);
        return {
            name: rep.name,
            sales: repSales.length,
            value: repSales.reduce((sum, s) => sum + s.value, 0)
        };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
    

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
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Vendas nos Últimos Meses</h3>
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
                                                {clientNameMap.get(c.clientId) || 'Cliente não encontrado'}
                                                <p className="text-xs text-slate-500 font-normal">por {reps.find(r => r.id === c.repId)?.name || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4">{formatCurrency(c.value)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setSelectedContract(c)} className="text-slate-500 hover:text-orange-600 p-1 rounded-full hover:bg-slate-200"><MoreHorizontalIcon /></button>
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
            {selectedContract && <ApprovalModal isOpen={true} contract={selectedContract} clientName={clientNameMap.get(selectedContract.clientId) || ''} onClose={() => setSelectedContract(null)} onUpdate={handleUpdateStatus} />}
        </div>
    );
};

export default AdminDashboard;