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

// Função utilitária para exibir tempo relativo
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
    return Math.floor(seconds) + " segundos atrás";
}

const WhatsAppBotScreen: React.FC = () => {
    const [chats, setChats] = useState<WhatsAppChat[]>([]);
    const [activeChat, setActiveChat] = useState<WhatsAppChat | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Para o botão de simulação
    const [adminMessage, setAdminMessage] = useState('');
    const [typingChatId, setTypingChatId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Efeito para responsividade
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Função para buscar e atualizar os chats
    const fetchChats = () => {
        const allChats = db.getWhatsAppChats();
        setChats(allChats);
        
        if (activeChat) {
            const refreshedChat = allChats.find(c => c.id === activeChat.id);
            setActiveChat(refreshedChat || null);
        } else if (!isMobile && allChats.length > 0) {
            // Em desktop, seleciona automaticamente o primeiro chat
            setActiveChat(allChats[0]);
        }
    };

    useEffect(() => {
        fetchChats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile]);

    // Rola para o final da conversa quando novas mensagens chegam
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChat?.messages, typingChatId]);


    // Simula a chegada de uma nova mensagem de cliente e a resposta da IA
    const handleSimulateMessage = async () => {
        setIsLoading(true);
        const simulationResult = db.simulateIncomingWhatsAppMessage();

        if (simulationResult) {
            const { chat, newMessage } = simulationResult;
            
            // Atualiza o estado para mostrar a nova mensagem do cliente
            let allChats = db.getWhatsAppChats();
            const currentChatInDb = allChats.find(c => c.id === chat.id);
            setChats(allChats);
            setActiveChat(currentChatInDb || null);
            setTypingChatId(chat.id); // Mostra o indicador "digitando..."
            
            // Busca os dados do cliente e chama a IA para gerar uma resposta
            const client = db.getClients().find(c => c.id === chat.clientId);
            const botReplyText = await gemini.getWhatsAppBotReply(newMessage.text, client, currentChatInDb?.messages || []);
            
            // Adiciona a resposta do bot ao banco de dados
            db.addWhatsAppMessage(chat.id, { sender: 'bot', text: botReplyText });
            
            setTypingChatId(null); // Esconde o indicador "digitando..."
            fetchChats(); // Atualiza a UI com a resposta do bot
        } else {
            alert("Não foi possível simular mensagem. Verifique se existem clientes ativos.");
        }
        setIsLoading(false);
    };
    
    // Envia uma mensagem como administrador
    const handleAdminSend = () => {
        if (!adminMessage.trim() || !activeChat) return;

        db.addWhatsAppMessage(activeChat.id, {
            sender: 'admin',
            text: adminMessage,
        });
        setAdminMessage('');
        fetchChats();
    };

    // Componente para a bolha de mensagem individual
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
    
    // Componente para a lista de conversas (à esquerda em desktop, tela cheia em mobile)
    const ChatList = (
        <div className={`w-full md:w-1/3 xl:w-1/4 md:flex flex-col bg-white border-r border-slate-200 ${isMobile && activeChat ? 'hidden' : 'flex'}`}>
            <header className="p-4 border-b border-slate-200 flex flex-col flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-800 mb-2">WhatsApp Bot</h2>
                 <button
                    onClick={handleSimulateMessage}
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 disabled:bg-slate-400 disabled:text-slate-600 flex items-center justify-center gap-2"
                >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><MessageCircleIcon /> Simular Nova Mensagem</>}
                </button>
            </header>
            <div className='overflow-y-auto flex-1'>
                {chats.map(chat => (
                    <div 
                        key={chat.id} 
                        onClick={() => setActiveChat(chat)}
                        className={`p-4 border-b border-slate-200 cursor-pointer flex items-center gap-4 ${activeChat?.id === chat.id ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 uppercase flex-shrink-0">
                            {chat.clientName.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-slate-800 truncate">{chat.clientName}</p>
                                <p className="text-xs text-slate-400 flex-shrink-0">{timeSince(chat.lastMessageTimestamp)}</p>
                            </div>
                            <p className="text-sm text-slate-500 truncate">
                               {chat.id === typingChatId ? <span className="text-green-600">digitando...</span> : chat.messages[chat.messages.length - 1]?.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    // Componente para a janela de chat ativa
    const ActiveChatWindow = (
        <div className={`w-full md:w-2/3 xl:w-3/4 flex flex-col bg-slate-50 ${isMobile && !activeChat ? 'hidden' : 'flex'}`}>
            {activeChat ? (
                <>
                    <header className="h-16 bg-white border-b border-l border-slate-200 flex items-center p-4 flex-shrink-0">
                        {isMobile && (
                             <button onClick={() => setActiveChat(null)} className="mr-4 text-slate-600 p-1 rounded-full hover:bg-slate-100">
                                 <ArrowLeftIcon />
                             </button>
                        )}
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 uppercase mr-3">
                            {activeChat.clientName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{activeChat.clientName}</h3>
                            <p className="text-sm text-slate-500">{activeChat.clientPhone}</p>
                        </div>
                    </header>
                    <main className="flex-1 p-6 overflow-y-auto space-y-4">
                        {activeChat.messages.map(msg => <ChatMessageBubble key={msg.id} msg={msg} />)}
                        {typingChatId === activeChat.id && (
                            <div className="flex items-start gap-3 justify-start">
                                 <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0"><BotIcon /></div>
                                 <div className="p-3 rounded-lg shadow-sm bg-slate-200 text-slate-500 text-sm">
                                    <span className="italic">Bot está digitando...</span>
                                 </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </main>
                    <footer className="bg-white p-4 border-t border-slate-200 flex-shrink-0">
                        <div className="relative">
                             <input
                                type="text"
                                value={adminMessage}
                                onChange={(e) => setAdminMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAdminSend()}
                                placeholder="Intervir como administrador..."
                                className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition bg-slate-50"
                                aria-label="Digite sua mensagem como administrador"
                            />
                            <button onClick={handleAdminSend} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 disabled:bg-slate-300 disabled:text-slate-500 transition" aria-label="Enviar mensagem">
                                <SendIcon />
                            </button>
                        </div>
                    </footer>
                </>
            ) : (
                <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-slate-500 bg-slate-50">
                    <div className="text-slate-400"><MessageCircleIcon /></div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-800">Selecione uma conversa</h3>
                    <p className="mt-1 text-sm">Ou simule uma nova mensagem para começar.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-full">
            {ChatList}
            {ActiveChatWindow}
        </div>
    );
};

export default WhatsAppBotScreen;