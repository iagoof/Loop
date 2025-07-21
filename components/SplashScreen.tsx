/**
 * @file Tela de Boas-Vindas (Landing Page)
 * @description Uma página de destino completa que serve como a entrada principal para a aplicação.
 * Ela apresenta a plataforma, suas funcionalidades, e inclui CTAs para solicitar uma demonstração
 * ou para acessar a plataforma (login). Esta versão inclui navegação com rolagem suave,
 * um menu mobile funcional e um cabeçalho dinâmico.
 */
import React, { useState, useEffect } from 'react';
import { 
    LogoIcon,
    MenuIcon,
    BotIcon,
    BarChart3Icon,
    BuildingIcon,
    UsersIconLucide,
    CheckCircle2Icon,
    ChevronDownIcon,
    XIcon
} from './icons';
import { LayoutDashboard } from 'lucide-react';


const DemoModal: React.FC<{isOpen: boolean, onClose: () => void}> = ({ isOpen, onClose }) => {
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
        } else {
            // Permite que a animação de saída seja concluída
            const timer = setTimeout(() => setIsRendering(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isRendering) return null;

    return (
        <div 
            className={`fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${isOpen ? 'bg-opacity-70' : 'bg-opacity-0'}`} 
            onClick={onClose}
        >
            <div 
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Solicite uma Demonstração</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100">
                        <XIcon />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">Preencha o formulário e nossa equipe entrará em contato para agendar uma apresentação personalizada.</p>
                    <form action="#" className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Seu Nome</label>
                            <input type="text" id="name" name="name" placeholder="Ex: João da Silva" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition" />
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Empresa</label>
                            <input type="text" id="company" name="company" placeholder="Ex: Silva Consórcios" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Corporativo</label>
                            <input type="email" id="email" name="email" placeholder="voce@suaempresa.com.br" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition" />
                        </div>
                    </form>
                </div>
                <div className="flex justify-end items-center p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
                    <button onClick={onClose} className="text-slate-600 dark:text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 mr-3">Cancelar</button>
                    <button className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105">
                        Enviar Solicitação
                    </button>
                </div>
            </div>
        </div>
    );
};

const MobileNav: React.FC<{isOpen: boolean, onClose: () => void, onNavigate: (e: React.MouseEvent, targetId: string) => void, onShowDemo: () => void, onContinue: () => void}> = ({ isOpen, onClose, onNavigate, onShowDemo, onContinue }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col items-center justify-center">
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-700 dark:text-slate-300">
                <XIcon />
            </button>
            <nav className="flex flex-col items-center space-y-8">
                <a href="#features" onClick={(e) => onNavigate(e, '#features')} className="text-2xl font-semibold hover:text-orange-600 transition-colors">Funcionalidades</a>
                <a href="#solutions" onClick={(e) => onNavigate(e, '#solutions')} className="text-2xl font-semibold hover:text-orange-600 transition-colors">Soluções</a>
                <a href="#faq" onClick={(e) => onNavigate(e, '#faq')} className="text-2xl font-semibold hover:text-orange-600 transition-colors">FAQ</a>
            </nav>
            <div className="mt-12 flex flex-col items-center gap-4 w-full px-8">
                <button onClick={onContinue} className="w-full bg-orange-600 text-white font-semibold px-5 py-3 rounded-lg hover:bg-orange-700">
                    Acessar Plataforma
                </button>
                <button onClick={onShowDemo} className="w-full text-orange-600 font-semibold px-5 py-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    Solicite uma Demo
                </button>
            </div>
        </div>
    );
}

const SplashScreen: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsHeaderScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSmoothScroll = (e: React.MouseEvent, targetId: string) => {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };
    
    const handleOpenDemoModal = () => {
        setIsModalOpen(true);
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isHeaderScrolled ? 'bg-white/95 dark:bg-slate-900/95 shadow-md backdrop-blur-sm' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="#" onClick={(e) => handleSmoothScroll(e, 'body')} className="flex items-center space-x-2">
                <LogoIcon />
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Loop</h1>
            </a>
            <nav className="hidden md:flex items-center space-x-8 text-slate-700 dark:text-slate-300 font-semibold">
                <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')} className="hover:text-orange-600 transition-colors">Funcionalidades</a>
                <a href="#solutions" onClick={(e) => handleSmoothScroll(e, '#solutions')} className="hover:text-orange-600 transition-colors">Soluções</a>
                <a href="#faq" onClick={(e) => handleSmoothScroll(e, '#faq')} className="hover:text-orange-600 transition-colors">FAQ</a>
            </nav>
            <div className="hidden md:flex items-center gap-4">
                 <button onClick={onContinue} className="text-orange-600 font-semibold px-5 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                    Acessar Plataforma
                </button>
                <button onClick={handleOpenDemoModal} className="bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105">
                    Solicite uma Demo
                </button>
            </div>
            <button className="md:hidden text-slate-800 dark:text-slate-200" onClick={() => setIsMobileMenuOpen(true)}>
                <MenuIcon />
            </button>
        </div>
      </header>
      
      <main className="pt-24">
        <section className="text-center py-20 md:py-32 px-6">
            <div className="container mx-auto">
                <h2 className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                    A Evolução da Gestão de Consórcios.
                    <span className="block gradient-text mt-2">Potencializada por IA.</span>
                </h2>
                <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400">
                    O Loop automatiza seus processos, centraliza suas vendas e utiliza inteligência artificial para oferecer insights que transformam dados em decisões. Venda mais e fidelize clientes como nunca antes.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={onContinue} className="bg-orange-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 shadow-lg w-full sm:w-auto">
                        Acessar Plataforma
                    </button>
                    <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-8 py-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-600 shadow-lg w-full sm:w-auto text-center">
                        Conheça os Recursos
                    </a>
                </div>
            </div>
        </section>

        <section id="features" className="py-20 bg-white dark:bg-slate-800/50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Por que escolher o Loop?</h3>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mt-4 max-w-3xl mx-auto">
                        Foco no que importa: fechar negócios e atender seus clientes com excelência. Nós cuidamos do resto.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all hover:border-orange-300 dark:hover:border-orange-500">
                        <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><BotIcon /></div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Pós-Venda com IA</h4>
                        <p className="text-slate-600 dark:text-slate-400">Ofereça suporte 24/7 com nosso chatbot inteligente. Reduza o tempo de resposta e aumente a satisfação do cliente.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all hover:border-orange-300 dark:hover:border-orange-500">
                        <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><LayoutDashboard /></div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Gestão Centralizada</h4>
                        <p className="text-slate-600 dark:text-slate-400">Visão 360° do seu negócio. Tome decisões mais rápidas e assertivas com todos os dados em um só lugar.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all hover:border-orange-300 dark:hover:border-orange-500">
                        <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><BarChart3Icon /></div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Relatórios Inteligentes</h4>
                        <p className="text-slate-600 dark:text-slate-400">Nossa IA gera relatórios com insights práticos para otimizar suas estratégias e identificar oportunidades.</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="solutions" className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Uma plataforma, duas soluções.</h3>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mt-4 max-w-3xl mx-auto">Seja você uma administradora ou um representante, o Loop se adapta às suas necessidades.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col">
                        <UsersIconLucide />
                        <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Para Representantes</h4>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">Ideal para quem representa administradoras. Gerencie sua equipe de vendas, controle comissões e acompanhe metas em um único lugar.</p>
                        <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                            <li className="flex items-center"><CheckCircle2Icon />Gestão de equipe (Gerentes, Vendedores)</li>
                            <li className="flex items-center"><CheckCircle2Icon />Controle de comissões</li>
                            <li className="flex items-center"><CheckCircle2Icon />Acompanhamento de metas em tempo real</li>
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col">
                        <BuildingIcon />
                        <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Para Administradoras</h4>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">Gerencie toda a rotina da sua administradora. Cadastre representantes, crie tabelas, gere contratos, boletos e tenha controle total.</p>
                         <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                            <li className="flex items-center"><CheckCircle2Icon />Gestão completa de contratos e grupos</li>
                            <li className="flex items-center"><CheckCircle2Icon />Geração de boletos e extratos</li>
                            <li className="flex items-center"><CheckCircle2Icon />Portal do Cliente integrado</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="py-20 bg-white dark:bg-slate-800/50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Histórias de Sucesso com o Loop</h3>
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-600 dark:text-slate-300 text-lg italic mb-6">"Desde que implementamos o Loop, nossa eficiência aumentou 40%. A IA nos ajuda a focar nos clientes certos e o pós-venda nunca foi tão organizado."</p>
                        <div className="flex items-center">
                            <img src="https://i.pravatar.cc/48?u=aline" className="rounded-full mr-4" alt="Foto de Aline Souza"/>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100">Aline Souza</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Representante de Consórcio</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-600 dark:text-slate-300 text-lg italic mb-6">"A área do cliente com o chatbot foi um divisor de águas. Nossos clientes estão mais satisfeitos e a equipe de suporte pode focar em casos mais complexos. Recomendo!"</p>
                        <div className="flex items-center">
                           <img src="https://i.pravatar.cc/48?u=joao" className="rounded-full mr-4" alt="Foto de João Silva"/>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100">João Silva</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Gerente de Vendas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="faq" className="py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Perguntas Frequentes</h3>
                </div>
                <div className="space-y-6">
                    <details className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <summary className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-100 cursor-pointer list-none">
                            O Loop é um serviço SaaS?
                            <ChevronDownIcon />
                        </summary>
                        <p className="text-slate-600 dark:text-slate-400 mt-4">Sim, o Loop é um Software as a Service (SaaS). Você acessa pela nuvem, sem se preocupar com instalação ou manutenção. Garantimos operação 24 horas com alta disponibilidade.</p>
                    </details>
                    <details className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <summary className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-100 cursor-pointer list-none">
                             Meus dados estão seguros na plataforma?
                            <ChevronDownIcon />
                        </summary>
                        <p className="text-slate-600 dark:text-slate-400 mt-4">Absolutamente. A segurança é nossa prioridade máxima. O sistema e a base de dados são armazenados em um Datacenter de ponta, com recursos dedicados, backups automáticos e alta disponibilidade (99,9%).</p>
                    </details>
                     <details className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <summary className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-100 cursor-pointer list-none">
                             Qual o público-alvo do Loop?
                            <ChevronDownIcon />
                        </summary>
                        <p className="text-slate-600 dark:text-slate-400 mt-4">O Loop foi desenhado para empresas que atuam no ramo de consórcios, incluindo administradoras que precisam de uma gestão completa e representantes que buscam otimizar suas vendas e o gerenciamento de suas equipes.</p>
                    </details>
                </div>
            </div>
        </section>

        <section id="contact" className="bg-orange-600 text-white">
            <div className="container mx-auto px-6 py-20 text-center">
                <h3 className="text-4xl font-extrabold">Pronto para revolucionar sua gestão?</h3>
                <p className="mt-4 text-lg text-orange-200 max-w-2xl mx-auto">Descubra como o Loop pode aumentar sua produtividade, melhorar a satisfação do cliente e impulsionar suas vendas.</p>
                <div className="mt-8">
                    <button onClick={handleOpenDemoModal} className="bg-white text-orange-600 font-bold px-8 py-4 rounded-lg hover:bg-orange-50 transition-transform transform hover:scale-105 shadow-2xl">
                        Solicite uma Demonstração Agora
                    </button>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-slate-800 text-slate-400">
        <div className="container mx-auto px-6 py-8 text-center">
            <p>&copy; 2025 Loop Soluções Financeiras. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">Uma plataforma de gestão inteligente para o futuro dos consórcios.</p>
        </div>
      </footer>
      
      <DemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={handleSmoothScroll}
        onShowDemo={handleOpenDemoModal}
        onContinue={onContinue}
      />
    </div>
  );
};

export default SplashScreen;
