import React, { useState, useEffect, useMemo } from 'react';
import * as db from '../services/database';
import { Representative, User, UserRole, Sale, SaleStatus, Badge } from '../types';
import ContentHeader from './ContentHeader';
import { Trophy } from 'lucide-react';

const BadgeIcon: React.FC<{ badge: Badge, isUnlocked: boolean }> = ({ badge, isUnlocked }) => (
    <div 
        className="flex flex-col items-center text-center group relative cursor-pointer"
        title={`${badge.name}: ${badge.description}`}
    >
        <div className={`text-4xl transition-all duration-300 ${isUnlocked ? 'grayscale-0' : 'grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100'}`}>
            {badge.icon}
        </div>
        <p className={`text-xs font-semibold mt-1 ${isUnlocked ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
            {badge.name}
        </p>
         {!isUnlocked && (
             <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 {badge.description}
             </div>
         )}
    </div>
);


const GamificationScreen: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
    const [reps, setReps] = useState<Representative[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [filter, setFilter] = useState<'geral' | 'mes'>('geral');
    
    useEffect(() => {
        setReps(db.getRepresentatives());
        setSales(db.getSales());
    }, [loggedInUser]);

    const loggedInRep = useMemo(() => {
        return reps.find(r => r.userId === loggedInUser.id);
    }, [reps, loggedInUser.id]);

    const leaderboard = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return reps
            .map(rep => {
                let points = rep.points;
                if (filter === 'mes') {
                    const monthlySales = sales.filter(s => {
                         const [day, month, year] = s.date.split('/').map(Number);
                         const saleDate = new Date(year, month - 1, day);
                         return s.repId === rep.id && s.status === SaleStatus.Approved && saleDate >= startOfMonth;
                    });
                    points = monthlySales.reduce((sum, s) => sum + Math.floor(s.value / 1000), 0);
                }
                return { ...rep, displayPoints: points };
            })
            .sort((a, b) => b.displayPoints - a.displayPoints)
            .map((rep, index) => ({ ...rep, rank: index + 1 }));
    }, [reps, sales, filter]);
    
    const userRank = useMemo(() => {
        return leaderboard.find(r => r.id === loggedInRep?.id)?.rank;
    }, [leaderboard, loggedInRep]);

    const displayedLeaderboard = useMemo(() => {
        if (loggedInUser.role === UserRole.Supervisor && loggedInRep) {
            return leaderboard.filter(r => r.supervisorId === loggedInRep.id || r.id === loggedInRep.id);
        }
        return leaderboard;
    }, [leaderboard, loggedInUser.role, loggedInRep]);

    const nextLevel = useMemo(() => {
        if (!loggedInRep) return null;
        return db.LEVELS.find(l => l.minPoints > loggedInRep.points) || db.LEVELS[db.LEVELS.length - 1];
    }, [loggedInRep]);

    const levelProgress = useMemo(() => {
        if (!loggedInRep || !nextLevel) return 0;
        const currentLevelMin = loggedInRep.level.minPoints;
        const nextLevelMin = nextLevel.minPoints;
        if (nextLevelMin <= currentLevelMin) return 100;
        const progress = ((loggedInRep.points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
        return Math.min(progress, 100);
    }, [loggedInRep, nextLevel]);

    const userBadgeIds = useMemo(() => new Set(loggedInRep?.badges.map(b => b.id)), [loggedInRep]);

    return (
        <div className="p-4 md:p-6">
            <ContentHeader 
                title="Gamificação & Ranking"
                subtitle="Veja seu progresso, conquiste insígnias e compita pelo topo."
            />

            {/* User Stats Card */}
            {loggedInRep && (
                <div className="mb-6 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="flex items-center col-span-1">
                        <img src={`https://i.pravatar.cc/64?u=${loggedInRep.email}`} alt="Avatar" className="w-16 h-16 rounded-full mr-4" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{loggedInRep.name}</h3>
                            <div className="text-sm font-semibold text-orange-600 flex items-center gap-1">{loggedInRep.level.icon} {loggedInRep.level.name}</div>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                        <div className="p-2">
                            <p className="text-3xl font-bold text-orange-600">{loggedInRep.points.toLocaleString('pt-BR')}</p>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pontos Totais</p>
                        </div>
                        <div className="p-2">
                             <p className="text-3xl font-bold text-orange-600">#{userRank || '-'}</p>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Posição {filter === 'mes' ? 'no Mês' : 'Geral'}</p>
                        </div>
                        <div className="col-span-2 md:col-span-1 p-2">
                             <div className="w-full">
                                <p className="text-xs text-slate-500 dark:text-slate-400 text-left">Progresso para {nextLevel?.name}</p>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-1">
                                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${levelProgress}%` }}></div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Badges Showcase */}
            <div className="mb-6 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Quadro de Medalhas</h3>
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                    {db.ALL_BADGES.map(badge => (
                        <BadgeIcon key={badge.id} badge={badge} isUnlocked={userBadgeIds.has(badge.id)} />
                    ))}
                 </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Trophy className="text-yellow-500" />
                        Ranking de Representantes
                    </h3>
                    <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                        <button onClick={() => setFilter('geral')} className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'geral' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>Geral</button>
                        <button onClick={() => setFilter('mes')} className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'mes' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>Mês Atual</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-center">#</th>
                                <th scope="col" className="px-6 py-3">Representante</th>
                                <th scope="col" className="px-6 py-3">Nível</th>
                                <th scope="col" className="px-6 py-3 text-right">Pontos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedLeaderboard.map(rep => (
                                <tr key={rep.id} className={`border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${rep.id === loggedInRep?.id ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                                    <td className="px-6 py-4 text-center font-bold text-lg text-slate-700 dark:text-slate-200">{rep.rank}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{rep.name}</td>
                                    <td className="px-6 py-4 font-semibold">
                                        <span title={rep.level.name}>{rep.level.icon}</span> {rep.level.name}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-lg text-orange-600">{rep.displayPoints.toLocaleString('pt-BR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GamificationScreen;