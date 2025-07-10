import React, { useState } from 'react';
import { Sale, SaleStatus } from '../types';
import { XIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface ApprovalModalProps {
    contract: Sale;
    clientName: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: number, status: SaleStatus, reason?: string) => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ contract, clientName, isOpen, onClose, onUpdate }) => {
    const [reason, setReason] = useState(contract.rejectionReason || '');

    if (!isOpen) return null;

    const handleReject = () => {
        onUpdate(contract.id, SaleStatus.Rejected, reason);
        onClose();
    };

    const handleApprove = () => {
        onUpdate(contract.id, SaleStatus.Approved);
        onClose();
    };

    const isPending = contract.status === SaleStatus.Pending;

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-transform duration-300 ease-in-out scale-100">
                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">Analisar Contrato</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p><strong>Cliente:</strong> {clientName}</p>
                    <p><strong>Plano:</strong> {contract.plan}</p>
                    <p><strong>Valor:</strong> R$ {contract.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    <p><strong>Data da Venda:</strong> {contract.date}</p>
                    <p><strong>Status Atual:</strong> {contract.status}</p>
                    
                    {contract.status === SaleStatus.Rejected && contract.rejectionReason && (
                         <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-red-800">Motivo da Recusa:</p>
                            <p className="text-sm text-red-700">{contract.rejectionReason}</p>
                         </div>
                    )}

                    {isPending && (
                        <div>
                            <label htmlFor="rejectionReason" className="block text-sm font-semibold text-slate-700 mb-1">Motivo para recusa (opcional)</label>
                            <textarea
                                id="rejectionReason"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Ex: Documentação pendente, score de crédito baixo."
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                            />
                        </div>
                    )}
                </div>
                {isPending && (
                    <div className="flex justify-end items-center p-6 bg-slate-50 border-t gap-4">
                        <button onClick={handleReject} className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700">
                            <XCircleIcon /> Recusar
                        </button>
                        <button onClick={handleApprove} className="flex items-center gap-2 text-white font-semibold px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700">
                            <CheckCircleIcon /> Aprovar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovalModal;