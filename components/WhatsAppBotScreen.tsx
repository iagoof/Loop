/**
 * @file Simulador de WhatsApp Bot
 * @description Uma tela complexa que simula uma interface de atendimento via WhatsApp.
 * Permite ao administrador visualizar conversas, simular a chegada de novas mensagens
 * de clientes, ver o bot de IA (Gemini) responder automaticamente e intervir
 * manualmente na conversa. A tela é totalmente responsiva.
 */
import React, { useState, useEffect, useRef } from 'react';
import * as db from '../services/database';
import * as gemini from '../services/geminiService';
import { WhatsAppChat, WhatsAppMessage, Client } from '../types';
import { BotIcon, SendIcon, UserIcon, ShieldCheckIcon, MessageCircleIcon, ArrowLeftIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

// Função utilitária para exibir tempo relativo
const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min";
    return "agora";
};

const WhatsAppBotScreen: React.FC = () => {
    const [chats, setChats] = useState<WhatsAppChat[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { addToast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchData = () => {
        setChats(db.getWhatsAppChats());
        setClients(db.getClients());
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 10000); // Polling para novos chats/mensagens
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChatId, chats]);

    const handleSelectChat = (chatId: number) => {
        setSelectedChatId(chatId);
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedChatId || isSending) return;
        setIsSending(true);

        const updatedChat = db.addWhatsAppMessage(selectedChatId, { sender: 'admin', text: message });
        setMessage('');

        if (updatedChat) {
            setChats(prev => prev.map(c => c.id === selectedChatId ? updatedChat : c));
        }
        setIsSending(false);
    };
    
    const handleSimulateMessage = () => {
        const { chat: updatedChat, newMessage } = db.simulateIncomingWhatsAppMessage() || {};
        if (updatedChat && newMessage) {
            addToast(`Nova mensagem de ${updatedChat.clientName}`, 'info');
            
            // Otimisticamente atualiza a UI com a mensagem do cliente
            setChats(prev => {
                const existingChat = prev.find(c => c.id === updatedChat.id);
                if (existingChat) {
                    return prev.map(c => c.id === updatedChat.id ? updatedChat : c).sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
                }
                return [updatedChat, ...prev];
            });

            // Trigger bot reply
            triggerBotReply(updatedChat, newMessage.text);
        } else {
            addToast('Não foi possível simular mensagem: sem clientes ativos.', 'error');
        }
    };
    
    const triggerBotReply = async (chat: WhatsAppChat, clientMessage: string) => {
        const client = clients.find(c => c.id === chat.clientId);
        if (!client) return;

        // Adiciona o indicador "digitando..."
        setChats(prev => prev.map(c => c.id === chat.id ? { ...c, isTyping: true } : c));

        setTimeout(async () => {
            const replyText = await gemini.getWhatsAppBotReply(clientMessage, client, chat.messages);
            const botReply = db.addWhatsAppMessage(chat.id, { sender: 'bot', text: replyText });
            if (botReply) {
                setChats(prev => prev.map(c => c.id === chat.id ? { ...botReply, isTyping: false } : c));
            }
        }, 1500 + Math.random() * 1000); // Delay para simular digitação
    };
    
    const selectedChat = chats.find(c => c.id === selectedChatId);

    return (
        <div className="flex h-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
            {/* Left Panel: Chat List */}
            <aside className={`w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ${selectedChatId && 'hidden md:flex'}`}>
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Conversas</h2>
                    <button onClick={handleSimulateMessage} className="text-sm text-orange-600 font-semibold mt-2">Simular Nova Mensagem &rarr;</button>
                </header>
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => (
                        <div key={chat.id} onClick={() => handleSelectChat(chat.id)} className={`p-4 flex items-center cursor-pointer border-l-4 ${selectedChatId === chat.id ? 'bg-slate-100 dark:bg-slate-700/50 border-orange-500' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                            <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-200 mr-4">
                                {chat.clientName.charAt(0)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{chat.clientName}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{timeSince(chat.lastMessageTimestamp)}</p>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{chat.isTyping ? <em className="text-green-500">digitando...</em> : chat.messages.slice(-1)[0]?.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Right Panel: Chat Window */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${!selectedChatId && 'hidden md:flex'}`}>
                {selectedChat ? (
                    <>
                        <header className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center flex-shrink-0">
                            <button onClick={() => setSelectedChatId(null)} className="mr-4 md:hidden text-slate-600 dark:text-slate-300"><ArrowLeftIcon /></button>
                            <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-200 mr-3">
                                {selectedChat.clientName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">{selectedChat.clientName}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedChat.clientPhone}</p>
                            </div>
                        </header>

                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-100/50 dark:bg-slate-900/50">
                            {selectedChat.messages.map(msg => (
                                <div key={msg.id} className={`flex items-start gap-3 ${msg.sender !== 'client' ? 'justify-end' : ''}`}>
                                    {msg.sender === 'client' && <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0"><UserIcon /></div>}
                                    <div className={`max-w-md p-3 rounded-xl shadow-sm text-sm ${
                                        msg.sender === 'client' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200' : 
                                        msg.sender === 'bot' ? 'bg-green-100 dark:bg-green-900/50 text-slate-800 dark:text-slate-200' : 
                                        'bg-blue-100 dark:bg-blue-900/50 text-slate-800 dark:text-slate-200'
                                    }`}>
                                        {msg.sender === 'bot' && <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1"><BotIcon /> Resposta Automática</p>}
                                        {msg.sender === 'admin' && <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1"><ShieldCheckIcon /> Atendimento</p>}
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    {msg.sender !== 'client' && <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${msg.sender === 'bot' ? 'bg-green-500' : 'bg-blue-500'}`}>{msg.sender === 'bot' ? <BotIcon /> : <ShieldCheckIcon />}</div>}
                                </div>
                            ))}
                            {selectedChat.isTyping && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white"><BotIcon /></div>
                                    <div className="max-w-md p-3 rounded-xl bg-green-100 dark:bg-green-900/50 text-slate-800 dark:text-slate-200 text-sm italic">
                                        digitando...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <footer className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                            <div className="relative">
                                <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Digite uma mensagem como administrador..." className="w-full pl-4 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200" disabled={isSending} />
                                <button onClick={handleSendMessage} disabled={isSending || !message.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 disabled:bg-slate-300 disabled:text-slate-500 transition"><SendIcon /></button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 dark:text-slate-400">
                        <MessageCircleIcon />
                        <h3 className="mt-4 text-xl font-bold text-slate-700 dark:text-slate-200">Selecione uma conversa</h3>
                        <p>Escolha um chat na lista ao lado para ver as mensagens ou simule uma nova.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WhatsAppBotScreen;
