
import React from 'react';
import { BotIcon, PhoneIcon } from './icons';

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

const FAQItem: React.FC<{ q: string, a: string }> = ({ q, a }) => (
  <details className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 group">
    <summary className="flex justify-between items-center font-semibold text-slate-800 cursor-pointer list-none">
      {q}
      <svg className="w-5 h-5 transition-transform transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </summary>
    <p className="text-slate-600 mt-4">{a}</p>
  </details>
);

const HelpCenterScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Central de Ajuda</h2>
          <p className="text-sm text-slate-500">Encontre respostas para suas perguntas.</p>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
             <h3 className="text-xl font-bold text-slate-800">Perguntas Frequentes</h3>
            {faqs.map((faq, i) => <FAQItem key={i} q={faq.question} a={faq.answer} />)}
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <BotIcon />
                <h3 className="text-lg font-bold text-slate-800 mt-2">Ainda com dúvidas?</h3>
                <p className="text-slate-600 mt-2 mb-4">Nosso assistente virtual está disponível 24/7 para te ajudar com perguntas sobre seu plano.</p>
                <button className="w-full bg-orange-600 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-700">
                    Falar com Assistente Virtual
                </button>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <PhoneIcon />
                <h3 className="text-lg font-bold text-slate-800 mt-2">Atendimento Humano</h3>
                <p className="text-slate-600 mt-2">Prefere falar com uma pessoa?</p>
                <p className="font-semibold text-slate-800">0800 123 4567</p>
                <p className="text-sm text-slate-500">Seg. a Sex. das 9h às 18h</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpCenterScreen;
