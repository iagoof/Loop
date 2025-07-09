
import React, { useState, useRef, useEffect } from 'react';
import { Client, ChatMessage } from '../types';
import { BotIcon, SendIcon, UserIcon } from './icons';
import { streamChatMessage } from '../services/geminiService';

const mockClient: Client = {
  id: 101,
  name: 'Ana Costa',
  plan: 'Consórcio de Automóvel - R$ 80.000,00',
  nextPayment: '15/08/2025'
};

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: `Olá, ${mockClient.name}! Sou seu assistente virtual. Como posso te ajudar hoje?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiMessage: ChatMessage = { sender: 'ai', text: '' };
        setMessages(prev => [...prev, aiMessage]);
        
        await streamChatMessage([...messages, userMessage], mockClient, (chunk) => {
            setMessages(prev => {
                const lastMsgIndex = prev.length - 1;
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
                            <p className="text-sm">{msg.text}</p>
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
                    />
                    <button onClick={handleSend} disabled={isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 disabled:bg-slate-300 transition">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};


const ClientDashboard: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Meu Painel</h2>
                    <p className="text-sm text-slate-500">Bem-vindo(a) de volta, {mockClient.name}!</p>
                </div>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-semibold text-slate-500 mb-2">Seu Plano</h4>
                        <p className="text-2xl font-bold text-slate-800">{mockClient.plan}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-semibold text-slate-500 mb-2">Próximo Vencimento</h4>
                        <p className="text-2xl font-bold text-slate-800">{mockClient.nextPayment}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-semibold text-slate-500 mb-2">Próxima Assembleia</h4>
                        <p className="text-2xl font-bold text-slate-800">25/07/2025</p>
                    </div>
                </div>
                <Chatbot />
            </main>
        </div>
    );
};

export default ClientDashboard;
