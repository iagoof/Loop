/**
 * @file Tela de Boas-Vindas (Splash Screen)
 * @description Uma tela de introdução visualmente agradável que aparece na
 * primeira vez que o usuário abre a aplicação. Utiliza uma animação de fade-in
 * e translate para uma entrada suave dos elementos.
 */
import React from 'react';
import { LogoIcon, ArrowRightIcon } from './icons';

interface SplashScreenProps {
  onContinue: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  const [visible, setVisible] = React.useState(false);

  // Aplica a classe para a animação de entrada após um pequeno delay
  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-black dark:to-slate-800 text-center p-8">
      <div className={`transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
        <div className="flex justify-center items-center space-x-2 md:space-x-4 mb-6">
          <LogoIcon />
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 dark:text-slate-100 tracking-tighter">Loop</h1>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 mt-4 max-w-2xl mx-auto">
          Soluções Financeiras para o seu Futuro.
        </h2>
        <p className="max-w-xl mx-auto mt-4 text-base md:text-lg text-slate-500 dark:text-slate-400">
          Simplificamos a gestão de consórcios, vendas e clientes em uma plataforma unificada, inteligente e fácil de usar.
        </p>
        <button
          onClick={onContinue}
          className="mt-12 inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-md md:text-lg font-bold text-white bg-orange-600 rounded-xl shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
        >
          Acessar Plataforma
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;