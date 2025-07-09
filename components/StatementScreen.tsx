
import React from 'react';
import { DownloadIcon, CheckCircleIcon, XCircleIcon } from './icons';

const summary = {
    totalPaid: 45333.33,
    balanceDue: 34666.67,
    nextPayment: '15/08/2025',
    nextPaymentValue: 1333.33,
};

const transactions = [
    { id: 1, date: '15/07/2025', description: 'Pagamento da Parcela 12/60', value: 1333.33, type: 'credit' },
    { id: 2, date: '15/06/2025', description: 'Pagamento da Parcela 11/60', value: 1333.33, type: 'credit' },
    { id: 3, date: '25/05/2025', description: 'Oferta de Lance (não contemplado)', value: 10000, type: 'debit' },
    { id: 4, date: '15/05/2025', description: 'Pagamento da Parcela 10/60', value: 1333.33, type: 'credit' },
];

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const TransactionIcon: React.FC<{type: string}> = ({type}) => {
    if (type === 'credit') return <CheckCircleIcon />;
    if (type === 'debit') return <XCircleIcon />;
    return null;
}

const StatementScreen: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Extrato Detalhado</h2>
                    <p className="text-sm text-slate-500">Seu histórico de pagamentos e saldo devedor.</p>
                </div>
                <button className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 flex items-center space-x-2">
                    <DownloadIcon />
                    <span>Gerar PDF</span>
                </button>
            </header>
            <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                        {transactions.map(t => (
                            <li key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                                <div className="flex items-center">
                                    <div className="mr-4">
                                        <TransactionIcon type={t.type} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{t.description}</p>
                                        <p className="text-sm text-slate-500">{t.date}</p>
                                    </div>
                                </div>
                                <p className={`font-bold text-lg ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'credit' ? '+' : '-'} {formatCurrency(t.value)}
                                </p>
                            </li>
                        ))}
                     </ul>
                </div>
            </main>
        </div>
    );
};

export default StatementScreen;
