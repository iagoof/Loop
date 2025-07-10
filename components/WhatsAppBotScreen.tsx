
import React, { useState, useEffect, useRef } from 'react';
import * as db from '../services/database';
import * as gemini from '../services/geminiService';
import { WhatsAppChat, WhatsAppMessage, Client } from '../types';
import { BotIcon, SendIcon, UserIcon, ShieldCheckIcon, MessageCircleIcon, ArrowLeftIcon } from './icons';

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos";
    return Math.floor(seconds) + " segundos";
}

const WhatsAppBotScreen: React.FC = () => {
    const [chats, setChats] = useState<WhatsAppChat[]>([]);
    const [activeChat, setActiveChat] = useState<WhatsAppChat | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [adminMessage, setAdminMessage] = useState('');
    const [typingChatId, setTypingChatId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchChats = () => {
        const allChats = db.getWhatsAppChats();
        setChats(allChats);
        
        if (activeChat) {
            const refreshedChat = allChats.find(c => c.id === activeChat.id);
            setActiveChat(refreshedChat || null);
        } else if (!isMobile && allChats.length > 0) {
            // On desktop, auto-select the first chat
            setActiveChat(allChats[0]);
        }
    };

    useEffect(() => {
        fetchChats();
    }, [isMobile]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChat?.messages, typingChatId]);


    const handleSimulateMessage = async () => {
        setIsLoading(true);
        const simulationResult = db.simulateIncomingWhatsAppMessage();

        if (simulationResult) {
            const { chat, newMessage } = simulationResult;
            
            const allChats = db.getWhatsAppChats();
            const currentChatInDb = allChats.find(c => c.id === chat.id);
            setChats(allChats);
            setActiveChat(currentChatInDb || null);
            setTypingChatId(chat.id);
            
            const client = db.getClients().find(c => c.id === chat.clientId);
            const botReplyText = await gemini.getWhatsAppBotReply(newMessage.text, client, currentChatInDb?.messages || []);
            
            db.addWhatsAppMessage(chat.id, { sender: 'bot', text: botReplyText });
            
            setTypingChatId(null);
            fetchChats();
        } else {
            alert("Não foi possível simular mensagem. Verifique se existem clientes ativos.");
        }
        setIsLoading(false);
    };
    
    const handleAdminSend = () => {
        if (!adminMessage.trim() || !activeChat) return;

        db.addWhatsAppMessage(activeChat.id, {
            sender: 'admin',
            text: adminMessage,
        });
        setAdminMessage('');
        fetchChats();
    };

    const ChatMessageBubble: React.FC<{ msg: WhatsAppMessage }> = ({ msg }) => {
        const messageContainerClasses = "flex items-start gap-3";
        const bubbleClasses = "max-w-xl p-3 rounded-lg shadow-sm";
        const timeClasses = "text-xs text-slate-400 text-right mt-1";

        const senderIcon = () => {
            switch(msg.sender) {
                case 'bot': return <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0"><BotIcon /></div>;
                case 'client': return <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 flex-shrink-0"><UserIcon /></div>;
                case 'admin': return <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0"><ShieldCheckIcon /></div>;
            }
        };

        const bubbleStyle = () => {
             switch(msg.sender) {
                case 'bot': return 'bg-slate-100 text-slate-800';
                case 'client': return 'bg-green-100 text-slate-800';
                case 'admin': return 'bg-blue-100 text-slate-800';
            }
        };

        return (
            <div className={`${messageContainerClasses} ${msg.sender !== 'client' ? 'justify-start' : 'justify-end'}`}>
                {msg.sender !== 'client' && senderIcon()}
                <div className={`${bubbleClasses} ${bubbleStyle()}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className={timeClasses}>{new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {msg.sender === 'client' && senderIcon()}
            </div>
        );
    };
    
    const ChatList = (
        <div className={`w-full md:w-1/3 md:flex flex-col bg-white border-r border-slate-200 ${isMobile && activeChat ? 'hidden' : 'flex'}`}>
            <div className='p-4 border-b border-slate-200'>
                 <h3 className="font-bold text-slate-800">Conversas</h3>
            </div>
            <div className='overflow-y-auto'>
                {chats.map(chat => (
                    <div 
                        key={chat.id} 
                        onClick={() => setActiveChat(chat)}
                        className={`p-4 border-b border-slate-200 cursor-pointer ${activeChat?.id === chat.id ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                    >
                        <div className="flex justify-between">
                            <p className="font-semibold text-slate-800">{chat.clientName}</p>
                            <p className="text-xs text-slate-500">{timeSince(chat.lastMessageTimestamp)} atrás</p>
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                            {typingChatId === chat.id ? <span className="text-green-600 italic">Bot digitando...</span> : chat.messages[chat.messages.length - 1]?.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const ChatWindow = (
        <div className={`w-full md:w-2/3 flex-col bg-slate-50 ${isMobile && !activeChat ? 'hidden' : 'flex'}`}>
            {activeChat ? (
                <>
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6">
                        {isMobile && (
                            <button onClick={() => setActiveChat(null)} className="mr-3 p-1 text-slate-600">
                                <ArrowLeftIcon/>
                            </button>
                        )}
                        <h3 className="text-lg font-bold text-slate-800">{activeChat.clientName}</h3>
                        <p className="text-sm text-slate-500 ml-3">{activeChat.clientPhone}</p>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                       {activeChat.messages.map(msg => <ChatMessageBubble key={msg.id} msg={msg} />)}
                       {typingChatId === activeChat.id && (
                           <div className="flex items-start gap-3 justify-start">
                               <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0"><BotIcon /></div>
                               <div className="max-w-xl p-3 rounded-lg shadow-sm bg-slate-100 text-slate-800">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse " style={{animationDelay: '0s'}}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                                    </div>
                               </div>
                           </div>
                       )}
                       <div ref={messagesEndRef} />
                    </div>
                     <footer className="p-4 bg-white border-t border-slate-200">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Responder como Administrador..." 
                                className="w-full p-3 pl-4 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition" 
                                value={adminMessage}
                                onChange={e => setAdminMessage(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleAdminSend()}
                            />
                            <button onClick={handleAdminSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 disabled:bg-slate-300 transition">
                                <SendIcon />
                            </button>
                        </div>
                    </footer>
                </>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center text-slate-500 p-8">
                     <MessageCircleIcon />
                    <h3 className="mt-4 text-lg font-semibold">Bem-vindo ao Simulador de Bot</h3>
                    <p className="max-w-sm">Selecione uma conversa à esquerda ou clique em "Simular Nova Mensagem" para ver o assistente de IA em ação.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 flex-shrink-0">
                <div className="mb-2 sm:mb-0">
                    <h2 className="text-2xl font-bold text-slate-800">Simulador de WhatsApp Bot</h2>
                    <p className="text-sm text-slate-500">Gerencie conversas com o assistente de IA.</p>
                </div>
                <button
                    onClick={handleSimulateMessage}
                    disabled={isLoading}
                    className="bg-orange-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-slate-400 transition-colors flex items-center justify-center min-w-[200px]"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                       <> <SendIcon /> <span className="ml-2 hidden sm:inline">Simular Nova Mensagem</span><span className="ml-2 sm:hidden">Simular</span></>
                    )}
                </button>
            </header>
            <main className="flex-1 flex overflow-hidden">
                {ChatList}
                {ChatWindow}
            </main>
        </div>
    );
};

export default WhatsAppBotScreen;