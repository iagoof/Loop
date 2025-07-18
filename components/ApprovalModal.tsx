/**
 * @file Modal de Aprovação de Contrato
 * @description Este modal foi reprojetado para ser uma ferramenta de análise de contratos com IA.
 * Ao abrir um contrato pendente, ele chama o Gemini para gerar um parecer. Exibe um
 * estado de carregamento e, em seguida, apresenta a análise detalhada da IA,
 * além dos dados do contrato, permitindo que o administrador aprove ou recuse com mais contexto.
 */
import React, { useState, useEffect } from 'react';
import { Sale, SaleStatus, Client, Representative } from '../types';
import { XIcon, BrainCircuitIcon } from './icons';
import { CheckCircle, XCircle, AlertTriangle, ThumbsUp, FileText } from 'lucide-react';
import * as gemini from '../services/geminiService';
import { ContractAnalysisResult } from '../services/geminiService';

interface ApprovalModalProps {
    contract: Sale;
    client: Client | undefined;
    rep: Representative | undefined;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: number, status: SaleStatus, reason?: string) => void;
}

const recommendationStyles: Record<string, string> = {
    'Aprovar': 'bg-green-100 text-green-800',
    'Aprovar com Cautela': 'bg-yellow-100 text-yellow-800',
    'Recusar': 'bg-red-100 text-red-800',
    'Análise Adicional Necessária': 'bg-blue-100 text-blue-800',
};

// Componente para exibir os detalhes da análise da IA
const AnalysisResultDisplay: React.FC<{ analysis: ContractAnalysisResult }> = ({ analysis }) => (
    <div className="space-y-4">
        <div className={`p-3 rounded-lg ${recommendationStyles[analysis.recommendation] || 'bg-slate-100'}`}>
            <h4 className="font-bold text-sm">Recomendação da IA: {analysis.recommendation}</h4>
            <p className="text-sm">{analysis.finalConsiderations}</p>
        </div>

        <div>
            <h4 className="font-semibold text-slate-700 mb-2">Resumo do Contrato</h4>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">{analysis.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><ThumbsUp size={16} className="text-green-500" /> Pontos Positivos</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                    {analysis.positivePoints.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-500" /> Pontos de Atenção</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                    {analysis.attentionPoints.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
            </div>
        </div>
    </div>
);

const ApprovalModal: React.FC<ApprovalModalProps> = ({ contract, client, rep, isOpen, onClose, onUpdate }) => {
    const [reason, setReason] = useState('');
    const [analysis, setAnalysis] = useState<ContractAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isPending = contract.status === SaleStatus.Pending;

    useEffect(() => {
        // Redefine o estado ao abrir o modal para um novo contrato
        if (isOpen) {
            setAnalysis(null);
            setError('');
            setIsLoading(false);
            setReason(contract.rejectionReason || '');

            if (isPending && client && rep) {
                const fetchAnalysis = async () => {
                    setIsLoading(true);
                    try {
                        const result = await gemini.getContractAnalysis(contract, client, rep);
                        setAnalysis(result);
                    } catch (e: any) {
                        setError(e.message || 'Falha ao buscar análise da IA.');
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchAnalysis();
            }
        }
    }, [isOpen, isPending, contract, client, rep]);


    if (!isOpen) return null;

    const handleReject = () => {
        onUpdate(contract.id, SaleStatus.Rejected, reason);
        onClose();
    };

    const handleApprove = () => {
        onUpdate(contract.id, SaleStatus.Approved);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-transform duration-300 ease-in-out scale-100 max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-800">Analisar Contrato</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Fechar modal"><XIcon /></button>
                </header>
                
                <main className="p-6 space-y-6 overflow-y-auto">
                    {/* Detalhes Básicos */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><FileText size={16}/> Detalhes do Contrato</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-700">
                            <p><strong>Cliente:</strong> {client?.name || 'N/A'}</p>
                            <p><strong>Plano:</strong> {contract.plan}</p>
                            <p><strong>Representante:</strong> {rep?.name || 'N/A'}</p>
                            <p><strong>Valor:</strong> R$ {contract.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                            <p><strong>Data:</strong> {contract.date}</p>
                            <p><strong>Status:</strong> {contract.status}</p>
                        </div>
                    </div>
                    
                    {/* Análise com IA */}
                    {isPending && (
                        <div className="pt-6 border-t border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BrainCircuitIcon /> Análise de Risco com IA</h4>
                            {isLoading && (
                                <div className="flex items-center justify-center p-8 bg-slate-50 rounded-lg">
                                    <div className="w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                                    <p className="text-slate-600">Analisando dados...</p>
                                </div>
                            )}
                            {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
                            {analysis && <AnalysisResultDisplay analysis={analysis} />}
                        </div>
                    )}
                    
                    {/* Motivo da recusa (se já recusado) */}
                    {contract.status === SaleStatus.Rejected && contract.rejectionReason && (
                         <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-red-800">Motivo da Recusa:</p>
                            <p className="text-sm text-red-700">{contract.rejectionReason}</p>
                         </div>
                    )}

                    {/* Campo de motivo (para recusar) */}
                    {isPending && (
                        <div>
                            <label htmlFor="rejectionReason" className="block text-sm font-semibold text-slate-700 mb-1">Motivo para recusa (caso aplicável)</label>
                            <textarea
                                id="rejectionReason"
                                rows={2}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Se recusar o contrato, forneça uma justificativa clara aqui."
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                            />
                        </div>
                    )}
                </main>
                
                {/* Botões de Ação */}
                {isPending && (
                    <footer className="flex-shrink-0 flex flex-col sm:flex-row justify-end items-center p-6 bg-slate-50 border-t gap-4">
                        <button onClick={handleReject} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 text-white font-semibold px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-400">
                            <XCircle className="w-5 h-5" /> Recusar
                        </button>
                        <button onClick={handleApprove} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 text-white font-semibold px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-slate-400">
                            <CheckCircle className="w-5 h-5" /> Aprovar
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default ApprovalModal;