/**
 * @file Modal de Recuperação de Senha
 * @description Fornece uma interface para que os usuários solicitem um link de
 * recuperação de senha. A funcionalidade simula o envio de um e-mail.
 */
import React, { useState } from 'react';
import { MailIcon, XIcon } from './icons';
import * as db from '../services/database';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Por favor, insira seu endereço de e-mail.');
      return;
    }

    setIsLoading(true);
    // Simula uma chamada de API para enviar o link de recuperação
    setTimeout(() => {
      // Em uma aplicação real, você faria uma chamada para o backend aqui.
      // Por segurança, não confirmamos se o e-mail existe.
      // Apenas mostramos uma mensagem genérica de sucesso.
      db.findUserByEmail(email); // Simula a verificação

      setIsLoading(false);
      setSuccessMessage('Se uma conta com este e-mail existir, um link de recuperação foi enviado.');
      setEmail('');
    }, 1000);
  };

  const handleClose = () => {
    // Reseta o estado do modal antes de fechar
    setEmail('');
    setError('');
    setSuccessMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Recuperar Senha</h3>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-800" aria-label="Fechar modal">
            <XIcon />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSendLink}>
          {!successMessage ? (
            <>
              <p className="text-sm text-slate-600">
                Insira o e-mail associado à sua conta e enviaremos um link para redefinir sua senha.
              </p>
              <div>
                <label htmlFor="recovery-email" className="block text-sm font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon />
                  </div>
                  <input
                    id="recovery-email"
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
              {error && <p className="text-sm text-red-500">{error}</p>}
            </>
          ) : (
            <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center">
              <p className="font-semibold">Link enviado!</p>
              <p className="text-sm">{successMessage}</p>
            </div>
          )}
        </form>
        <div className="flex justify-end items-center p-6 bg-slate-50 border-t">
          <button onClick={handleClose} className="text-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 mr-3">
            {successMessage ? 'Fechar' : 'Cancelar'}
          </button>
          {!successMessage && (
            <button
              type="submit"
              onClick={handleSendLink}
              disabled={isLoading}
              className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-slate-400 flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Enviar Link'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
