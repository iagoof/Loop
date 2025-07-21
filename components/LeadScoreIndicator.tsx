import React from 'react';
import { Flame } from 'lucide-react';

interface LeadScoreIndicatorProps {
    score: number | undefined;
    justification: string | undefined;
}

const LeadScoreIndicator: React.FC<LeadScoreIndicatorProps> = ({ score, justification }) => {
    if (score === undefined || score === null) {
        return <span className="text-slate-400 dark:text-slate-500">-</span>;
    }

    const getScoreColor = () => {
        if (score > 80) return 'text-red-500';
        if (score > 60) return 'text-orange-500';
        if (score > 40) return 'text-yellow-500';
        return 'text-slate-400';
    };

    const getScoreOpacity = () => {
        if (score > 80) return 'opacity-100';
        if (score > 60) return 'opacity-80';
        if (score > 40) return 'opacity-60';
        return 'opacity-40';
    }

    return (
        <div className="flex items-center group relative">
            <Flame className={`${getScoreColor()} ${getScoreOpacity()} w-5 h-5`} />
            <span className="font-semibold ml-1 text-slate-700 dark:text-slate-300">{score}</span>
            {justification && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity z-10 text-center">
                    <p className="font-bold mb-1">Justificativa da IA:</p>
                    {justification}
                </div>
            )}
        </div>
    );
};

export default LeadScoreIndicator;