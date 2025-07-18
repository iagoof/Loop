/**
 * @file Central de Ajuda
 * @description Fornece uma página de autoatendimento para os clientes, com uma
 * seção de Perguntas Frequentes (FAQ) e links para outras formas de suporte,
 * como o chatbot ou o atendimento telefônico.
 */
import React from 'react';
import { BotIcon, PhoneIcon } from './icons';
import { User } from '../types';
import ContentHeader from './ContentHeader';

// Conteúdo estático para as Perguntas Frequentes
const faqs = [
  {
    question: 'Como posso ofertar um lance?',
    answer: 'Você pode ofertar um lance diretamente pelo seu painel do cliente até a data da assembleia. O valor do lance é um percentual do valor total do crédito. Lances podem ser livres ou fixos, dependendo das regras do seu grupo.'
  },
  {
    question: 'O que acontece se eu atrasar o pagamento de uma parcela?',
    answer: 'O atraso no pagamento pode acarretar multas e juros, conforme estipulado em seu contrato. Além disso, o consorciado inadimplente não pode participar das assembleias e sorteios. Recomendamos entrar em contato com nossa central para negociar o débito.'
  },
  {
    question: 'Posso antecipar o pagamento de parcelas?',
    answer: 'Sim, você pode antecipar o pagamento de parcelas a qualquer momento. A antecipação pode ser usada para diminuir o prazo do seu plano ou para reduzir o valor das parcelas futuras, dependendo da sua escolha.'
  },
  {
    question: 'Como funciona a contemplação?',
    answer: 'A contemplação ocorre mensalmente nas assembleias, por meio de sorteio ou lance. Uma vez contemplado, você receberá a carta de crédito para adquirir seu bem ou serviço, mas continuará pagando as parcelas até o final do plano.'
  }
];

/**
 * Componente de item de FAQ, utilizando a tag <details> para um acordeão acessível.
 */
const FAQItem: React.FC<{ q: string, a: string }> = ({ q, a }) => (
  <details className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 group">
    <summary className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-100 cursor-pointer list-none">
      {q}
      <svg className="w-5 h-5 transition-transform transform group-open:rotate-180 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </summary>
    <p className="text-slate-600 dark:text-slate-300 mt-4">{a}</p>
  </details>
);

interface HelpCenterScreenProps {
    setActiveScreen: (screen: string) => void;
    loggedInUser: User;
}

const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({setActiveScreen, loggedInUser}) => {
  return (
    <div className="p-4 md:p-6">
      <ContentHeader 
        title="Central de Ajuda"
        subtitle="Encontre respostas para suas perguntas."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Perguntas Frequentes</h3>
          {faqs.map((faq, i) => <FAQItem key={i} q={faq.question} a={faq.answer} />)}
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <BotIcon />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">Ainda com dúvidas?</h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2 mb-4">Nosso assistente virtual está disponível 24/7 para te ajudar com perguntas sobre seu plano.</p>
              <button 
                onClick={() => setActiveScreen('client_dashboard')}
                className="w-full bg-orange-600 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-700"
              >
                  Falar com Assistente Virtual
              </button>
          </div>
           <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <PhoneIcon />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">Atendimento Humano</h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">Prefere falar com uma pessoa?</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">0800 123 4567</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Seg. a Sex. das 9h às 18h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterScreen;