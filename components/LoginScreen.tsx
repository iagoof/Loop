/**
 * @file Tela de Login
 * @description Componente responsável pela autenticação do usuário. Inclui
 * um formulário de login, tratamento de erros, estado de carregamento e
 * links para recuperação de senha e para abrir o modal de registro.
 */
import React, { useState, useEffect } from 'react';
import { LogoIcon, MailIcon, LockIcon } from './icons';
import { User } from '../types';
import * as db from '../services/database';
import RegistrationModal from './RegistrationModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useToast, ToastProvider } from '../contexts/ToastContext';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const { addToast } = useToast();
  
  // Ao montar, verifica se há um e-mail salvo e preenche o formulário
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Lida com a submissão do formulário de login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simula uma chamada de API com um pequeno atraso
    setTimeout(() => {
      const user = db.findUserByEmail(email);
      // Simula a verificação do hash da senha
      const password_hash = `hashed_${password}`;

      if (user && user.password_hash === password_hash) {
        // Lógica do "Lembrar-me"
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        onLogin(user); // Callback de sucesso
      } else {
        setError('Email ou senha inválidos.');
        setIsLoading(false);
      }
    }, 500);
  };
  
  // Chamado quando um usuário é registrado com sucesso através do modal
  const handleUserRegistered = (user: User) => {
    setIsRegisterModalOpen(false);
    // Opcionalmente, faz o login do usuário diretamente após o registro
    onLogin(user);
  };
  
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsForgotPasswordModalOpen(true);
  };


  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center space-y-4">
          <LogoIcon />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Loop</h1>
          <p className="text-slate-500 dark:text-slate-400">Bem-vindo(a) de volta!</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                  placeholder="Sua senha"
                />
              </div>
            </div>
          </div>
          
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 dark:border-slate-600 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-slate-200">
                Lembrar-me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" onClick={handleForgotPassword} className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-500 dark:hover:text-orange-400">
                Esqueceu a senha?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:text-slate-600 disabled:scale-100"
            >
              {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Entrar'
                )}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Não tem uma conta?{' '}
          <button onClick={() => setIsRegisterModalOpen(true)} className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-500 dark:hover:text-orange-400">
            Criar Conta
          </button>
        </div>
      </div>
    </div>
    <RegistrationModal 
      isOpen={isRegisterModalOpen}
      onClose={() => setIsRegisterModalOpen(false)}
      onSuccess={handleUserRegistered}
    />
    <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
    />
    </>
  );
};

const LoginWithToast: React.FC<LoginScreenProps> = (props) => (
  <ToastProvider>
    <LoginScreen {...props} />
  </ToastProvider>
);

export default LoginWithToast;