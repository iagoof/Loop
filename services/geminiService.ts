
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { Client, ChatMessage } from "../types";

let ai: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
    if (!ai) {
        // The API key is provided by the execution environment. This will throw an error
        // if process.env.API_KEY is not available, but only when an AI function is called,
        // allowing the rest of the application to render.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

let chatInstance: Chat | null = null;

// --- CHATBOT FUNCTIONALITY ---

const getChatInstance = (client: Client): Chat => {
    if (!chatInstance) {
        chatInstance = getAi().chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a helpful assistant for Loop Soluções Financeiras. 
                You are talking to ${client.name}. 
                Their current plan is ${client.plan}. 
                Their next payment is due on ${client.nextPayment}. 
                Answer their questions concisely and politely based on this information.
                Do not invent information. If you don't know the answer, say you cannot help with that request.`,
            },
        });
    }
    return chatInstance;
};

export const sendChatMessage = async (message: string, client: Client): Promise<string> => {
    try {
        const chat = getChatInstance(client);
        const response: GenerateContentResponse = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Gemini chat error:", error);
        return "Desculpe, não consigo responder no momento. Tente novamente mais tarde.";
    }
};

export const streamChatMessage = async (
    messages: ChatMessage[], 
    client: Client,
    onChunk: (chunk: string) => void
): Promise<void> => {
    try {
        // Simple history for context, not using the full chat object for this example
        const chat = getAi().chats.create({
             model: 'gemini-2.5-flash',
             config: {
                systemInstruction: `You are a helpful assistant for Loop Soluções Financeiras. You are talking to ${client.name}. Their current plan is ${client.plan}. Their next payment is due on ${client.nextPayment}. Answer their questions concisely and politely based on this information.`,
             },
             history: messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
             }))
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessageStream({ message: lastMessage.text });

        for await (const chunk of result) {
            onChunk(chunk.text);
        }

    } catch (error) {
        console.error("Gemini streaming chat error:", error);
        onChunk("Desculpe, ocorreu um erro. Tente novamente.");
    }
};


// --- AI-POWERED ANALYSIS ---

export const getClientAnalysis = async (clientHistory: string): Promise<string> => {
    try {
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Baseado no seguinte histórico de interações com o cliente, gere um resumo do perfil e sugira a próxima ação de venda mais apropriada. Seja breve e direto. Histórico: "${clientHistory}"`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini analysis error:", error);
        return "Não foi possível gerar a análise.";
    }
};

export const getStrategicReport = async (query: string): Promise<string> => {
    try {
        // In a real app, you would pass relevant, summarized business data in the prompt.
        const prompt = `Como um analista de negócios da Loop Soluções Financeiras, responda à seguinte pergunta com base nos dados (simulados) da empresa. Pergunta: "${query}"`;
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini strategic report error:", error);
        return "Não foi possível gerar o relatório. Verifique sua consulta e tente novamente.";
    }
};
