import React, { useState } from 'react';
import { LogoIcon, MailIcon, LockIcon } from './icons';
import { User } from '../types';
import * as db from '../services/database';
import RegistrationModal from './RegistrationModal';


interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@loop.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const user = db.findUserByEmail(email);
      const password_hash = `hashed_${password}`;

      if (user && user.password_hash === password_hash) {
        onLogin(user);
      } else {
        setError('Email ou senha inválidos.');
        setIsLoading(false);
      }
    }, 500);
  };
  
  const handleUserRegistered = (user: User) => {
    setIsRegisterModalOpen(false);
    // Optionally log the user in directly after registration
    onLogin(user);
  };
  
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Funcionalidade de recuperação de senha em desenvolvimento.');
  };


  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="flex flex-col items-center space-y-4">
          <LogoIcon />
          <h1 className="text-3xl font-bold text-slate-800">Loop</h1>
          <p className="text-slate-500">Bem-vindo(a) de volta!</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
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
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-semibold text-slate-700 mb-1">
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
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
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
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                Lembrar-me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" onClick={handleForgotPassword} className="font-semibold text-orange-600 hover:text-orange-500">
                Esqueceu a senha?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:scale-100"
            >
              {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Entrar'
                )}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-slate-600">
          Não tem uma conta?{' '}
          <button onClick={() => setIsRegisterModalOpen(true)} className="font-semibold text-orange-600 hover:text-orange-500">
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
    </>
  );
};

export default LoginScreen;