
import React from 'react';
import { LogoIcon, ArrowRightIcon } from './icons';

interface SplashScreenProps {
  onContinue: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100); // Small delay to ensure transition is applied
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-center p-8">
      <div className={`transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
        <div className="flex justify-center items-center space-x-4 mb-6">
          <LogoIcon />
          <h1 className="text-6xl font-bold text-slate-800 tracking-tighter">Loop</h1>
        </div>
        <h2 className="text-3xl font-semibold text-slate-700 mt-4 max-w-2xl mx-auto">
          Soluções Financeiras para o seu Futuro.
        </h2>
        <p className="max-w-xl mx-auto mt-4 text-lg text-slate-500">
          Simplificamos a gestão de consórcios, vendas e clientes em uma plataforma unificada, inteligente e fácil de usar.
        </p>
        <button
          onClick={onContinue}
          className="mt-12 inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-orange-600 rounded-xl shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
        >
          Acessar Plataforma
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
