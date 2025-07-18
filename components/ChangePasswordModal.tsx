/**
 * @file Modal de Alteração de Senha
 * @description Permite que o usuário logado altere sua própria senha de acesso,
 * validando a senha atual antes de salvar a nova.
 */
import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSave }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSaveClick = async () => {
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não correspondem.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    const result = await onSave(currentPassword, newPassword);
    setIsLoading(false);

    if (result.success) {
      alert('Senha alterada com sucesso!');
      handleClose();
    } else {
      setError(result.error || 'Ocorreu um erro desconhecido.');
    }
  };

  const handleClose = () => {
    // Reseta o estado do formulário ao fechar
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Alterar Senha</h3>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-800" aria-label="Fechar modal">
            <X />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha Atual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>
        <div className="flex justify-end items-center p-6 bg-slate-50 border-t">
          <button onClick={handleClose} className="text-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 mr-3">Cancelar</button>
          <button onClick={handleSaveClick} disabled={isLoading} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-slate-400 min-w-[140px] flex justify-center">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Salvar Senha'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
