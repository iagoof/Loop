import React from 'react';
import { XIcon, BrainCircuitIcon, ClipboardCopyIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

interface CommissionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportContent: string;
  isLoading: boolean;
  error: string | null;
}

const CommissionReportModal: React.FC<CommissionReportModalProps> = ({ isOpen, onClose, reportContent, isLoading, error }) => {
    const { addToast } = useToast();

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(reportContent);
        addToast("Relatório copiado para a área de transferência!", "success");
    };

    // Função para renderizar texto com markdown básico
    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, index) => {
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{line.substring(4)}</h3>;
            }
            if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={index} className="font-bold my-1">{line.substring(2, line.length - 2)}</p>;
            }
             if (line.includes('**')) {
                return (
                    <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-slate-50">$1</strong>') }} />
                );
            }
            return <p key={index}>{line || <br />}</p>;
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-100" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <BrainCircuitIcon /> Relatório de Validação por IA
                    </h3>
                    <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Fechar modal">
                        <XIcon />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-10">
                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">Gerando relatório...</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">A IA está analisando os cálculos de comissão. Isso pode levar alguns segundos.</p>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg text-red-700 dark:text-red-300 text-center">
                            <p className="font-bold">Erro ao Gerar Relatório</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    {reportContent && !isLoading && (
                        <div className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border dark:border-slate-700">
                           <div className="text-slate-700 dark:text-slate-300 space-y-2">
                             {renderMarkdown(reportContent)}
                           </div>
                        </div>
                    )}
                </main>
                <footer className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
                    <button 
                        onClick={handleCopy} 
                        disabled={!reportContent || isLoading}
                        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ClipboardCopyIcon /> Copiar Relatório
                    </button>
                    <button onClick={onClose} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700">
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CommissionReportModal;
