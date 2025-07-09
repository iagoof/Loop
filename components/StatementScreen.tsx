import React, { useState, useEffect } from 'react';
import { DownloadIcon, CheckCircleIcon, ArrowUpCircleIcon } from './icons';
import { Client, User } from '../types';
import * as db from '../services/database';

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

interface Transaction {
    id: number;
    date: string;
    description: string;
    value: number;
    type: 'payment' | 'other';
}

const TransactionIcon: React.FC<{type: string}> = ({type}) => {
    if (type === 'payment') return <CheckCircleIcon />;
    return <ArrowUpCircleIcon />;
}

const StatementScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
    const [client, setClient] = useState<Client | null>(null);

    useEffect(() => {
        const clientProfile = db.getClientByUserId(loggedInUser.id);
        if (clientProfile) {
            setClient(clientProfile);
        }
    }, [loggedInUser]);

    const handlePrint = () => {
        window.print();
    };

    if (!client) {
         return <div className="flex-1 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
         </div>;
    }
    
    // --- DYNAMIC DATA DERIVATION ---
    const planValueMatch = client.plan.match(/R\$\s*([\d\.,]+)/);
    const planTotalValue = planValueMatch ? parseFloat(planValueMatch[1].replace(/\./g, '').replace(',', '.')) : (client.plan !== 'Nenhum' ? 80000 : 0); // Fallback for simple plans
    const termInMonths = 60; // Assuming a static term for demo
    const installmentValue = planTotalValue / termInMonths;

    // Simulate number of paid installments based on a fictional start date
    const startDate = new Date(2024, 7, 15); // Aug 15, 2024
    const today = new Date();
    const monthsPaid = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
    
    const totalPaid = installmentValue * monthsPaid;
    const balanceDue = planTotalValue - totalPaid;

    const summary = {
        totalPaid: totalPaid > 0 ? totalPaid : 0,
        balanceDue: balanceDue > 0 ? balanceDue : 0,
        nextPayment: client.nextPayment || 'N/A',
        nextPaymentValue: installmentValue,
    };

    const transactions: Transaction[] = [];
    for (let i = 0; i < monthsPaid; i++) {
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(startDate.getMonth() + i);
        transactions.push({
            id: i + 1,
            date: paymentDate.toLocaleDateString('pt-BR'),
            description: `Pagamento da Parcela ${i + 1}/${termInMonths}`,
            value: installmentValue,
            type: 'payment'
        });
    }
    transactions.reverse(); // Show most recent first


    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Extrato Detalhado</h2>
                    <p className="text-sm text-slate-500">Seu histórico de pagamentos e saldo devedor.</p>
                </div>
                <button onClick={handlePrint} className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2">
                    <DownloadIcon />
                    <span>Gerar PDF</span>
                </button>
            </header>
            <main className="flex-1 p-6 overflow-y-auto bg-slate-50 print:bg-white print:p-0">
                 <div className="print:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 print:grid-cols-4">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-semibold text-slate-500 mb-1">Total Amortizado</h4>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-semibold text-slate-500 mb-1">Saldo Devedor</h4>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.balanceDue)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-semibold text-slate-500 mb-1">Próximo Vencimento</h4>
                            <p className="text-2xl font-bold text-slate-800">{summary.nextPayment}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-semibold text-slate-500 mb-1">Valor da Parcela</h4>
                            <p className="text-2xl font-bold text-slate-800">{formatCurrency(summary.nextPaymentValue)}</p>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Últimas Transações</h3>
                        <ul className="space-y-4">
                            {transactions.length > 0 ? transactions.map(t => (
                                <li key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 print:border-b">
                                    <div className="flex items-center">
                                        <div className="mr-4">
                                            <TransactionIcon type={t.type} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{t.description}</p>
                                            <p className="text-sm text-slate-500">{t.date}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold text-lg ${t.type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(t.value)}
                                    </p>
                                </li>
                            )) : <p className="text-slate-500 text-center py-4">Nenhuma transação encontrada.</p>}
                        </ul>
                    </div>
                 </div>
            </main>
        </div>
    );
};

export default StatementScreen;
