import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { XIcon, MailIcon, LockIcon, User as UserIcon } from 'lucide-react';
import * as db from '../services/database';

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

  if (!isOpen) return null;

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setIsLoading(true);

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
            alert('Conta criada com sucesso!');
            onSuccess(result);
            resetForm();
        }
        setIsLoading(false);
    }, 500);
  };
  
  const resetForm = () => {
      setName('');
      setEmail('');
      setPassword('');
      setRole(UserRole.Client);
      setError('');
  }
  
  const handleClose = () => {
      resetForm();
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Criar Nova Conta</h3>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-800">
            <XIcon />
          </button>
        </div>
        <div className="p-6 space-y-4">
          
          <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Conta</label>
              <div className="flex space-x-2 rounded-lg bg-slate-100 p-1">
                  <button onClick={() => setRole(UserRole.Client)} className={`w-full text-center font-semibold text-sm p-2 rounded-md transition-colors ${role === UserRole.Client ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Sou Cliente</button>
                  <button onClick={() => setRole(UserRole.Representative)} className={`w-full text-center font-semibold text-sm p-2 rounded-md transition-colors ${role === UserRole.Representative ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Sou Representante</button>
              </div>
          </div>
          
          <div>
            <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><UserIcon size={16}/></div>
                <input type="text" id="reg-name" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 pl-9 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><MailIcon size={16}/></div>
                <input type="email" id="reg-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 pl-9 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><LockIcon size={16}/></div>
                <input type="password" id="reg-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 pl-9 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end items-center p-6 bg-slate-50 border-t">
          <button onClick={handleClose} className="text-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 mr-3">Cancelar</button>
          <button onClick={handleRegister} disabled={isLoading} className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-slate-400 flex items-center justify-center min-w-[120px]">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Criar Conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
