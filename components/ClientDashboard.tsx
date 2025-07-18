/**
 * @file Dashboard do Cliente
 * @description Esta tela é o painel principal para o usuário cliente.
 * Exibe informações chave como o plano atual, próximo vencimento e um chatbot
 * interativo para que o cliente possa tirar dúvidas com um assistente virtual (IA).
 */
import React, { useState, useRef, useEffect } from 'react';
import { Client, ChatMessage, User } from '../types';
import { BotIcon, SendIcon, UserIcon } from './icons';
import { streamChatMessage } from '../services/geminiService';
import * as db from '../services/database';
import ContentHeader from './ContentHeader';

/**
 * Componente do Chatbot interativo.
 */
const Chatbot: React.FC<{ client: Client }> = ({ client }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Função para rolar automaticamente para a mensagem mais recente
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Inicializa o chat com uma mensagem de boas-vindas da IA
    useEffect(() => {
      setMessages([
        { sender: 'ai', text: `Olá, ${client.name}! Sou seu assistente virtual. Como posso te ajudar hoje?` }
      ]);
    }, [client]);


    // Lida com o envio de uma nova mensagem pelo usuário
    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setInput('');
        setIsLoading(true);

        // Adiciona uma bolha de mensagem vazia para a IA, que será preenchida via streaming
        const aiMessage: ChatMessage = { sender: 'ai', text: '' };
        setMessages(prev => [...prev, aiMessage]);
        
        // Chama o serviço de streaming do Gemini
        await streamChatMessage(currentMessages, client, (chunk) => {
            // A cada "pedaço" de texto recebido, atualiza a última mensagem
            setMessages(prev => {
                const lastMsgIndex = prev.length - 1;
                if(lastMsgIndex < 0) return prev;
                const updatedMessages = [...prev];
                updatedMessages[lastMsgIndex] = {
                    ...updatedMessages[lastMsgIndex],
                    text: updatedMessages[lastMsgIndex].text + chunk,
                };
                return updatedMessages;
            });
        });
        
        setIsLoading(false);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px] mt-6">
            <div className="p-4 border-b border-slate-200 flex items-center">
                <BotIcon />
                <h3 className="text-lg font-bold text-slate-800 ml-3">Assistente Virtual</h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
                                <BotIcon />
                            </div>
                        )}
                        <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-slate-100 text-slate-800' : 'bg-orange-600 text-white'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 flex-shrink-0">
                                <UserIcon />
                            </div>
                        )}
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Quando vence minha parcela?"
                        className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                        disabled={isLoading}
                        aria-label="Digite sua mensagem"
                    />
                    <button onClick={handleSend} disabled={isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 disabled:bg-slate-300 disabled:text-slate-500 transition" aria-label="Enviar mensagem">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};


/**
 * Componente principal da tela do Dashboard do Cliente.
 */
const ClientDashboard: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
    const [client, setClient] = useState<Client | null>(null);

    // Busca os dados do perfil do cliente quando o componente é montado
    useEffect(() => {
        const clientProfile = db.getClientByUserId(loggedInUser.id);
        if (clientProfile) {
            setClient(clientProfile);
        }
    }, [loggedInUser]);

    // Exibe um loader enquanto os dados do cliente estão sendo carregados
    if (!client) {
        return (
            <div className="flex-1 flex items-center justify-center">
                 <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-6">
             <ContentHeader 
                title="Meu Painel" 
                subtitle={`Bem-vindo(a) de volta, ${client.name}!`}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-500 mb-2">Seu Plano</h4>
                    <p className="text-2xl font-bold text-slate-800">{client.plan}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-500 mb-2">Próximo Vencimento</h4>
                    <p className="text-2xl font-bold text-slate-800">{client.nextPayment || 'N/A'}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-500 mb-2">Próxima Assembleia</h4>
                    <p className="text-2xl font-bold text-slate-800">25/07/2025</p>
                </div>
            </div>
            <Chatbot client={client} />
        </div>
    );
};

export default ClientDashboard;