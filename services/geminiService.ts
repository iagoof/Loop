/**
 * @file Serviço de Integração com a API Gemini
 * @description Este arquivo encapsula todas as chamadas para a API do Google Gemini.
 * Ele gerencia a inicialização do cliente, o tratamento de erros e fornece
 * funções específicas para diferentes casos de uso, como chatbot, análise de
 * cliente e relatórios estratégicos.
 */
import { GoogleGenAI, Type } from "@google/genai";
import { Client, ChatMessage, WhatsAppMessage, Sale, Representative, Activity } from "../types";

// Instância singleton do cliente da API
let ai: GoogleGenAI | null = null;

/**
 * Obtém a instância singleton do cliente Gemini AI.
 * A chave da API é obtida da variável de ambiente `process.env.API_KEY`,
 * que é injetada pelo ambiente de execução.
 * @returns {GoogleGenAI} A instância do cliente da API.
 */
const getAi = (): GoogleGenAI => {
    if (!ai) {
        // A chave da API é fornecida pela plataforma de execução através de process.env.API_KEY.
        // Confiamos que o ambiente de execução fornecerá esta variável.
        // O SDK do Gemini lidará com o erro se a chave for inválida ou ausente.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

// --- FUNCIONALIDADE DE CHATBOT (PAINEL DO CLIENTE) ---

/**
 * Envia uma mensagem para o chat e recebe a resposta em modo streaming.
 * @param {ChatMessage[]} messages - O histórico de mensagens da conversa atual.
 * @param {Client} client - O cliente.
 * @param {(chunk: string) => void} onChunk - Callback chamado para cada pedaço de texto recebido.
 */
export const streamChatMessage = async (
    messages: ChatMessage[], 
    client: Client,
    onChunk: (chunk: string) => void
): Promise<void> => {
    try {
        const googleAi = getAi();
        // Cria uma nova instância de chat com histórico para cada chamada de streaming
        const chat = googleAi.chats.create({
             model: 'gemini-2.5-flash',
             config: {
                systemInstruction: `Você é um assistente prestativo da Loop Soluções Financeiras. Você está conversando com ${client.name}. O plano atual dele(a) é ${client.plan}. ${client.nextPayment ? `O próximo vencimento é em ${client.nextPayment}.` : 'Ele(a) não tem um próximo vencimento agendado.'} Responda às perguntas dele(a) de forma concisa e educada com base nessas informações.`,
             },
             history: messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
             }))
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessageStream({ message: lastMessage.text });

        // Itera sobre a resposta em streaming
        for await (const chunk of result) {
            onChunk(chunk.text);
        }

    } catch (error) {
        console.error("Erro no streaming de chat Gemini:", error);
        onChunk("Desculpe, ocorreu um erro. Tente novamente.");
    }
};


// --- ANÁLISES COM IA ---

/**
 * Interface para a resposta estruturada da análise de contrato.
 */
export interface ContractAnalysisResult {
    summary: string;
    positivePoints: string[];
    attentionPoints: string[];
    recommendation: 'Aprovar' | 'Aprovar com Cautela' | 'Recusar' | 'Análise Adicional Necessária';
    finalConsiderations: string;
}

/**
 * Gera uma análise de risco de um contrato usando IA.
 * @param {Sale} contract - O contrato a ser analisado.
 * @param {Client} client - O cliente associado ao contrato.
 * @param {Representative} rep - O representante que realizou a venda.
 * @returns {Promise<ContractAnalysisResult>} A análise estruturada gerada pela IA.
 */
export const getContractAnalysis = async (
    contract: Sale,
    client: Client,
    rep: Representative
): Promise<ContractAnalysisResult> => {
    try {
        const googleAi = getAi();
        const prompt = `
        Analise o seguinte contrato de consórcio pendente para a Loop Soluções Financeiras e forneça uma avaliação de risco.

        **Dados do Contrato:**
        - Plano: ${contract.plan}
        - Valor do Crédito: R$ ${contract.value.toLocaleString('pt-BR')}
        - Data da Venda: ${contract.date}

        **Dados do Cliente:**
        - Nome: ${client.name}
        - Email: ${client.email}
        - Telefone: ${client.phone}
        - Documento: ${client.document}
        - Status Atual: ${client.status}
        - Plano de Interesse/Atual: ${client.plan}

        **Dados do Representante de Vendas:**
        - Nome: ${rep.name}
        - Vendas Totais: ${rep.sales}
        - Status: ${rep.status}

        Com base nesses dados, forneça um parecer conciso em formato JSON.
        - 'summary': Um resumo de 1 a 2 frases sobre o contrato.
        - 'positivePoints': Uma lista de 2-3 pontos positivos (ex: cliente já ativo, bom histórico do representante).
        - 'attentionPoints': Uma lista de 2-3 pontos que requerem atenção (ex: valor alto, cliente é um novo lead, status inativo do representante).
        - 'recommendation': Sua recomendação final. Escolha uma das seguintes opções: 'Aprovar', 'Aprovar com Cautela', 'Recusar', 'Análise Adicional Necessária'.
        - 'finalConsiderations': Uma justificativa breve para sua recomendação.
        `;
        
        const response = await googleAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Resumo do contrato." },
                        positivePoints: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Pontos positivos para aprovação."
                        },
                        attentionPoints: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Pontos de atenção ou riscos."
                        },
                        recommendation: {
                            type: Type.STRING,
                            description: "Recomendação final.",
                            enum: ['Aprovar', 'Aprovar com Cautela', 'Recusar', 'Análise Adicional Necessária']
                        },
                        finalConsiderations: { type: Type.STRING, description: "Justificativa da recomendação." }
                    },
                    required: ["summary", "positivePoints", "attentionPoints", "recommendation", "finalConsiderations"]
                }
            }
        });

        // The response text is a JSON string.
        const cleanedText = response.text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Erro na análise de contrato Gemini:", error);
        // Retornar um erro estruturado que pode ser tratado na UI.
        throw new Error("Não foi possível gerar a análise do contrato via IA.");
    }
};

/**
 * Gera uma análise de perfil de cliente com base em seu histórico de atividades.
 * @param client O objeto do cliente.
 * @param activities Uma lista de atividades registradas para o cliente.
 * @returns {Promise<string>} A análise gerada pela IA.
 */
export const getClientAnalysis = async (client: Client, activities: Activity[]): Promise<string> => {
    try {
        const googleAi = getAi();
        const history = activities
            .map(act => `Em ${new Date(act.timestamp).toLocaleDateString('pt-BR')}, tipo: ${act.type}, notas: "${act.notes}"`)
            .join('\n');
            
        const prompt = `
            Baseado nos seguintes dados e histórico de interações com o cliente, gere um resumo conciso do perfil e sugira a próxima ação de venda mais apropriada. 
            Seja breve, direto e use uma linguagem profissional.

            **Dados do Cliente:**
            - Nome: ${client.name}
            - Status: ${client.status}
            - Plano de Interesse/Atual: ${client.plan}

            **Histórico de Interações:**
            ${history || "Nenhuma atividade registrada."}
            
            **Sua Análise:**
        `;

        const response = await googleAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Erro na análise Gemini:", error);
        return "Não foi possível gerar a análise.";
    }
};

/**
 * Gera um relatório estratégico respondendo a uma pergunta em linguagem natural.
 * @param {string} query - A pergunta do usuário sobre os dados da empresa.
 * @returns {Promise<string>} O relatório gerado pela IA.
 */
export const getStrategicReport = async (query: string): Promise<string> => {
    try {
        const googleAi = getAi();
        // Em um aplicativo real, você passaria dados de negócios relevantes e resumidos no prompt.
        const prompt = `Como um analista de negócios da Loop Soluções Financeiras, responda à seguinte pergunta com base nos dados (simulados) da empresa. Pergunta: "${query}"`;
        const response = await googleAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Erro no relatório estratégico Gemini:", error);
        return "Não foi possível gerar o relatório. Verifique sua consulta e tente novamente.";
    }
};

// --- RESPOSTA DO BOT DO WHATSAPP ---

/**
 * Gera uma resposta para o bot do WhatsApp com base na mensagem, dados do cliente e histórico.
 * @param {string} clientMessage - A nova mensagem do cliente.
 * @param {Client | undefined} client - Os dados do cliente.
 * @param {WhatsAppMessage[]} chatHistory - O histórico de mensagens da conversa.
 * @returns {Promise<string>} A resposta formulada pela IA.
 */
export const getWhatsAppBotReply = async (
    clientMessage: string, 
    client: Client | undefined, 
    chatHistory: WhatsAppMessage[]
): Promise<string> => {
    if (!client) {
        return "Desculpe, não consegui identificar os dados do cliente para responder.";
    }

    try {
        const googleAi = getAi();
        const historyText = chatHistory
            .map(m => `${m.sender === 'client' ? 'Cliente' : 'Assistente'}: ${m.text}`)
            .join('\n');

        const prompt = `Você é um assistente de IA da Loop Soluções Financeiras. Sua tarefa é responder a uma mensagem de WhatsApp de um cliente.
        
        **Dados do Cliente:**
        ${JSON.stringify(client, null, 2)}

        **Histórico da Conversa Recente:**
        ${historyText}
        
        **Nova Mensagem do Cliente:**
        "${clientMessage}"

        Baseado nos dados do cliente, no histórico e na nova mensagem, formule uma resposta clara, profissional e concisa. Se a informação não estiver disponível nos dados fornecidos, informe educadamente que não pode ajudar com essa solicitação específica. Responda apenas como o assistente.`;

        const response = await googleAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Erro no bot de WhatsApp Gemini:", error);
        return "Desculpe, não foi possível gerar uma resposta de IA no momento.";
    }
};