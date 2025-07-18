/**
 * @file Modal de Registro de Nova Conta
 * @description Permite que novos usuários criem uma conta, escolhendo entre
 * um perfil de Cliente ou Representante. Valida os dados, trata erros
 * e, em caso de sucesso, cria o registro do usuário e seu perfil associado.
 */
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MailIcon, LockIcon, UserIcon as UserIconUI, XIcon } from './icons';
import * as db from '../services/database';
import { useToast } from '../contexts/ToastContext';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Client);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  // Lida com a submissão do formulário de registro
  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setIsLoading(true);

    // Simula uma chamada de API
    setTimeout(() => {
        const result = db.registerUser({
            name,
            email,
            password_plaintext: password,
            role,
        });

        if ('error' in result) {
            setError(result.error);
        } else {
            addToast('Conta criada com sucesso!', 'success');
            onSuccess(result); // Callback de sucesso
            resetForm();
        }
        setIsLoading(false);
    }, 500);
  };
  
  // Reseta os campos do formulário para o estado inicial
  const resetForm = () => {
      setName('');
      setEmail('');
      setPassword('');
      setRole(UserRole.Client);
      setError('');
  }
  
  // Fecha o modal e reseta o formulário
  const handleClose = () => {
      resetForm();
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Criar Nova Conta</h3>
          <button onClick={handleClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Fechar modal">
            <XIcon />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          
          <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Conta</label>
              <div className="flex space-x-2 rounded-lg bg-slate-100 dark:bg-slate-900 p-1">
                  <button onClick={() => setRole(UserRole.Client)} className={`w-full text-center font-semibold text-sm p-2 rounded-md transition-colors ${role === UserRole.Client ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>Sou Cliente</button>
                  <button onClick={() => setRole(UserRole.Representative)} className={`w-full text-center font-semibold text-sm p-2 rounded-md transition-colors ${role === UserRole.Representative ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>Sou Representante</button>
              </div>
          </div>
          
          <div>
            <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><UserIconUI /></div>
                <input type="text" id="reg-name" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 pl-9 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><MailIcon /></div>
                <input type="email" id="reg-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 pl-9 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label htmlFor="reg-password"className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Senha</label>
            <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><LockIcon /></div>
                <input type="password" id="reg-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 pl-9 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </form>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-3">
            <button onClick={handleClose} className="text-slate-600 dark:text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">Cancelar</button>
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-slate-400 min-w-[120px] flex justify-center"
            >
              {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Criar Conta'
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;