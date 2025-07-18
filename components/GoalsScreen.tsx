/**
 * @file Tela de Metas
 * @description Exibe o progresso de metas de vendas do representante logado
 * e um ranking de desempenho de toda a equipe. Utiliza um medidor (gauge)
 * visual para a meta pessoal e uma tabela para o ranking.
 */
import React, { useState, useEffect } from 'react';
import * as db from '../services/database';
import { Representative, Sale, SaleStatus, User } from '../types';
import ContentHeader from './ContentHeader';

// Formata um número como moeda brasileira
const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

/**
 * Componente visual de medidor (gauge) para exibir o progresso de uma meta.
 */
const GoalGauge: React.FC<{ current: number, target: number }> = ({ current, target }) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const circumference = 2 * Math.PI * 52; // 2 * pi * raio
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                {/* Círculo de fundo */}
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="16" />
                {/* Arco de progresso */}
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
                <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">da meta</span>
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

    // Calcula o total de vendas aprovadas para um representante específico
    const getSalesForRep = (repId: number) => {
        return sales
            .filter(s => s.repId === repId && s.status === SaleStatus.Approved)
            .reduce((sum, s) => sum + s.value, 0);
    }
    
    const loggedInRep = db.getRepresentativeByUserId(loggedInUser.id);
    const personalSales = loggedInRep ? getSalesForRep(loggedInRep.id) : 0;
    // Usa a meta configurável do representante, com um fallback para o caso de não estar definida
    const personalGoal = loggedInRep?.goal || 200000;

    // Cria o ranking da equipe, ordenando por vendas e destacando o usuário logado
    const teamRanking = reps
        .map(rep => ({
            id: rep.id,
            name: rep.id === loggedInRep?.id ? `${rep.name} (Você)` : rep.name,
            sales: getSalesForRep(rep.id),
            goal: rep.goal || 200000, // Usa a meta individual com fallback
        }))
        .sort((a,b) => b.sales - a.sales)
        .map((rep, index) => ({...rep, rank: index + 1})); // Recalcula a posição no ranking após ordenar


    return (
        <div className="p-4 md:p-6">
            <ContentHeader 
                title="Metas"
                subtitle="Acompanhe seu progresso e o ranking da equipe."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Painel da Meta Pessoal */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center flex flex-col items-center">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Sua Meta Mensal</h3>
                    <GoalGauge current={personalSales} target={personalGoal} />
                    <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(personalSales)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">de {formatCurrency(personalGoal)}</p>
                </div>
                {/* Painel do Ranking da Equipe */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 p-6">Ranking da Equipe</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-center">#</th>
                                    <th scope="col" className="px-6 py-3">Representante</th>
                                    <th scope="col" className="px-6 py-3">Vendas</th>
                                    <th scope="col" className="px-6 py-3">Meta Atingida</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamRanking.map(rep => {
                                    const goalPercent = rep.goal > 0 ? (rep.sales / rep.goal) * 100 : 0;
                                    return (
                                        <tr key={rep.id} className={`border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${rep.id === loggedInRep?.id ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                                            <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-200">{rep.rank}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{rep.name}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(rep.sales)}</td>
                                            <td className="px-6 py-4">
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(goalPercent, 100)}%` }}></div>
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{goalPercent.toFixed(0)}%</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalsScreen;