
import React from 'react';

const personalGoal = {
    current: 155000,
    target: 200000
};

const teamRanking = [
    { rank: 1, name: 'Mariana Lima', sales: 185000, goal: 200000 },
    { rank: 2, name: 'Carlos Andrade (Você)', sales: 155000, goal: 200000 },
    { rank: 3, name: 'Sofia Ribeiro', sales: 142000, goal: 180000 },
    { rank: 4, name: 'Juliana Paes', sales: 115000, goal: 150000 },
];

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

const GoalGauge: React.FC<{ current: number, target: number }> = ({ current, target }) => {
    const percentage = Math.min((current / target) * 100, 100);
    const circumference = 2 * Math.PI * 52; // 2 * pi * r
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="16" />
                <circle 
                    cx="60" 
                    cy="60" 
                    r="52" 
                    fill="none" 
                    stroke="#f97316" 
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-orange-600">{percentage.toFixed(0)}%</span>
                <span className="text-sm text-slate-500 font-semibold">da meta</span>
            </div>
        </div>
    );
};


const GoalsScreen: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Metas</h2>
                    <p className="text-sm text-slate-500">Acompanhe seu progresso e o ranking da equipe.</p>
                </div>
            </header>
            <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Sua Meta Mensal</h3>
                        <GoalGauge current={personalGoal.current} target={personalGoal.target} />
                        <p className="mt-4 text-lg font-semibold text-slate-700">{formatCurrency(personalGoal.current)}</p>
                        <p className="text-sm text-slate-500">de {formatCurrency(personalGoal.target)}</p>
                    </div>
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-800 p-6">Ranking da Equipe</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-center">#</th>
                                        <th scope="col" className="px-6 py-3">Representante</th>
                                        <th scope="col" className="px-6 py-3">Vendas</th>
                                        <th scope="col" className="px-6 py-3">Meta Atingida</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamRanking.map(rep => {
                                        const goalPercent = (rep.sales / rep.goal) * 100;
                                        return (
                                            <tr key={rep.rank} className={`border-b hover:bg-slate-50 ${rep.name.includes('(Você)') ? 'bg-orange-50' : ''}`}>
                                                <td className="px-6 py-4 text-center font-bold text-slate-700">{rep.rank}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">{rep.name}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(rep.sales)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${goalPercent}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{goalPercent.toFixed(0)}%</span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GoalsScreen;
