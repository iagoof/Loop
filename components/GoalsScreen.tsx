import React, { useState, useEffect } from 'react';
import * as db from '../services/database';
import { Representative, Sale, SaleStatus, User } from '../types';

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


const GoalsScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [reps, setReps] = useState<Representative[]>([]);
    
    useEffect(() => {
        setSales(db.getSales());
        setReps(db.getRepresentatives());
    }, []);

    const getSalesForRep = (repId: number) => {
        return sales
            .filter(s => s.repId === repId && s.status === SaleStatus.Approved)
            .reduce((sum, s) => sum + s.value, 0);
    }
    
    // For demo, let's set a static goal for everyone
    const goal = 200000;
    const loggedInRep = db.getRepresentativeByUserId(loggedInUser.id);
    const personalSales = loggedInRep ? getSalesForRep(loggedInRep.id) : 0;

    const teamRanking = reps
        .map((rep, index) => ({
            rank: index + 1,
            id: rep.id,
            name: rep.id === loggedInRep?.id ? `${rep.name} (Você)` : rep.name,
            sales: getSalesForRep(rep.id),
            goal: goal, // Static goal for now
        }))
        .sort((a,b) => b.sales - a.sales)
        .map((rep, index) => ({...rep, rank: index + 1}));


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
                        <GoalGauge current={personalSales} target={goal} />
                        <p className="mt-4 text-lg font-semibold text-slate-700">{formatCurrency(personalSales)}</p>
                        <p className="text-sm text-slate-500">de {formatCurrency(goal)}</p>
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
                                            <tr key={rep.id} className={`border-b hover:bg-slate-50 ${rep.id === loggedInRep?.id ? 'bg-orange-50' : ''}`}>
                                                <td className="px-6 py-4 text-center font-bold text-slate-700">{rep.rank}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">{rep.name}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(rep.sales)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(goalPercent, 100)}%` }}></div>
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
