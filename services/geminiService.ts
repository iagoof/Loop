/**
 * @file Serviço de Integração com a API Gemini
 * @description Este arquivo encapsula todas as chamadas para a API do Google Gemini.
 * Ele gerencia a inicialização do cliente, o tratamento de erros e fornece
 * funções específicas para diferentes casos de uso, como chatbot, análise de
 * cliente e relatórios estratégicos.
 */
import { GoogleGenAI, Type } from "@google/genai";
import { Client, ChatMessage, WhatsAppMessage, Sale, Representative, Activity, NextActionAnalysis, Commission } from "../types";
import * as db from "./database";

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
 * Interface para a resposta estruturada da pontuação de lead.
 */
export interface LeadScoreResult {
    score: number;
    justification: string;
}

/**
 * Gera uma pontuação de lead e uma justificativa usando IA.
 * @param {Client} client - O lead a ser analisado.
 * @returns {Promise<LeadScoreResult>} A pontuação e justificativa geradas pela IA.
 */
export const getLeadScore = async (
    client: Client
): Promise<LeadScoreResult> => {
    try {
        const googleAi = getAi();
        const prompt = `
        Analise o seguinte lead para a Loop Soluções Financeiras e forneça uma pontuação de potencial de venda de 1 a 100.

        **Dados do Lead:**
        - Nome: ${client.name}
        - Email: ${client.email || 'Não informado'}
        - Telefone: ${client.phone}
        - Plano de Interesse: ${client.plan === 'Nenhum' ? 'Não especificado' : client.plan}
        - Endereço: ${client.address || 'Não informado'}

        Com base nesses dados, avalie o potencial deste lead se tornar um cliente. Considere fatores como:
        - O plano de interesse (planos de maior valor como 'Imóvel' têm maior potencial de comissão).
        - A completude dos dados (leads com mais informações são geralmente mais qualificados).

        Forneça um parecer conciso em formato JSON.
        - 'score': Um número inteiro de 1 a 100, onde 100 é o maior potencial de venda.
        - 'justification': Uma frase curta justificando a pontuação. Ex: "Alto potencial devido ao interesse em plano imobiliário e dados completos."
        `;
        
        const response = await googleAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER, description: "Pontuação do lead de 1 a 100." },
                        justification: { type: Type.STRING, description: "Justificativa curta para a pontuação." }
                    },
                    required: ["score", "justification"]
                }
            }
        });

        const cleanedText = response.text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleanedText);
        
        // Garante que o score esteja no range
        if (result.score < 1) result.score = 1;
        if (result.score > 100) result.score = 100;
        
        return result;

    } catch (error) {
        console.error("Erro na pontuação de lead com Gemini:", error);
        throw new Error("Não foi possível gerar a pontuação do lead via IA.");
    }
};

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
 * Gera uma sugestão de próxima ação para um cliente com base em seu perfil e histórico.
 * @param client O objeto do cliente.
 * @param activities Histórico de atividades do cliente.
 * @param sales Histórico de vendas do cliente.
 * @returns Uma sugestão de ação estruturada.
 */
export const getNextBestAction = async (client: Client, activities: Activity[], sales: Sale[]): Promise<NextActionAnalysis> => {
    try {
        const googleAi = getAi();

        const activityHistory = activities.length > 0
            ? activities.map(act => `- Em ${new Date(act.timestamp).toLocaleDateString('pt-BR')}, ${act.type}: "${act.notes}"`).join('\n')
            : "Nenhuma atividade registrada.";

        const salesHistory = sales.length > 0
            ? sales.map(s => `- Plano ${s.plan} (R$ ${s.value}) em ${s.date}, status: ${s.status}.`).join('\n')
            : "Nenhum contrato registrado.";

        const prompt = `
        Aja como um coach de vendas sênior para a "Loop Soluções Financeiras".
        Analise o perfil do cliente abaixo e sugira a próxima melhor ação de venda para um representante.

        **Dados do Cliente:**
        - Nome: ${client.name}
        - Status: ${client.status}
        - Plano de Interesse/Atual: ${client.plan}
        - Contato: ${client.email} / ${client.phone}
        - Lead Score (se aplicável): ${client.leadScore || 'N/A'} com justificativa: "${client.leadJustification || 'N/A'}"

        **Histórico de Contratos:**
        ${salesHistory}

        **Histórico de Atividades Recentes:**
        ${activityHistory}

        Baseado em TODOS os dados, forneça a próxima ação mais estratégica. Se o cliente for um "Lead" quente, sugira uma ação para conversão. Se for um "Cliente Ativo", sugira um upsell ou um follow-up de relacionamento. Se for "Inativo", sugira uma reativação.

        Retorne a resposta em formato JSON com a seguinte estrutura:
        - "suggestionTitle": Um título curto e acionável. Ex: "Agendar Reunião de Follow-up" ou "Sugerir Plano Imobiliário".
        - "justification": Uma explicação de 2-3 frases do motivo da sua sugestão, baseada nos dados.
        - "suggestedCommunication": Um texto de exemplo (e-mail ou roteiro de ligação) que o representante pode usar. Seja profissional e persuasivo.
        - "actionType": Um dos seguintes valores: 'EMAIL', 'CALL', 'MEETING', 'PLAN_SUGGESTION', 'FOLLOW_UP'.
        `;

        const response = await googleAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestionTitle: { type: Type.STRING },
                        justification: { type: Type.STRING },
                        suggestedCommunication: { type: Type.STRING },
                        actionType: { type: Type.STRING, enum: ['EMAIL', 'CALL', 'MEETING', 'PLAN_SUGGESTION', 'FOLLOW_UP'] }
                    },
                    required: ["suggestionTitle", "justification", "suggestedCommunication", "actionType"]
                }
            }
        });

        const cleanedText = response.text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Erro na sugestão de próxima ação com Gemini:", error);
        throw new Error("Não foi possível gerar a sugestão da IA.");
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

/**
 * Gera um relatório textual de validação de comissões usando IA.
 * @param period O período (mês/ano) do relatório.
 * @param commissionsToReport A lista de comissões para o relatório.
 * @param rep O representante (opcional). Se nulo, gera para todos.
 * @param allSales A lista de todas as vendas para buscar detalhes.
 * @param allClients A lista de todos os clientes para buscar nomes.
 * @returns O relatório gerado pela IA em formato de texto.
 */
export const getCommissionAnalysisReport = async (
    period: string,
    commissionsToReport: Commission[],
    rep: Representative | null,
    allSales: Sale[],
    allClients: Client[],
): Promise<string> => {
    try {
        const googleAi = getAi();

        const clientMap = new Map(allClients.map(c => [c.id, c.name]));
        const repMap = new Map(db.getRepresentatives().map(r => [r.id, r]));

        const details = commissionsToReport.map(c => {
            const sale = allSales.find(s => s.id === c.id);
            const repData = repMap.get(sale?.repId || -1);
            const repRate = repData ? repData.commissionRate : 0;
            const calculatedRate = c.salesValue > 0 ? (c.commissionValue / c.salesValue * 100) : 0;
            
            return `- VendaID: ${c.id}, Cliente: ${clientMap.get(sale?.clientId || -1) || 'N/A'}, Plano: ${sale?.plan || 'N/A'}, ValorVenda: R$ ${c.salesValue.toLocaleString('pt-BR')}, ValorComissao: R$ ${c.commissionValue.toLocaleString('pt-BR')}, TaxaPadrãoRep: ${repRate}%, TaxaCalculada: ${calculatedRate.toFixed(2)}%`;
        }).join('\n');

        const prompt = `
        Você é um auditor financeiro sênior para a Loop Soluções Financeiras.
        Sua tarefa é gerar um relatório de validação de comissões conciso e claro para o período de ${period.toUpperCase()}${rep ? ` para o representante ${rep.name}` : ''}.

        **Dados Brutos para Análise:**
        (Formato: VendaID, Cliente, Plano, ValorVenda, ValorComissao, TaxaPadrãoRep, TaxaCalculada)
        ${details}

        **Instruções para o Relatório:**
        1. Crie um relatório em texto plano, utilizando markdown leve para ênfase (negrito para valores).
        2. Para cada comissão, explique o cálculo de forma clara: "Venda para [Cliente] ([Plano]): R$ [ValorVenda] x [TaxaCalculada]% = **R$ [ValorComissao]**".
        3. Se a TaxaCalculada for diferente da TaxaPadrãoRep, adicione uma breve observação entre parênteses. Ex: (taxa de bônus aplicada).
        4. No final, some todos os valores de comissão e apresente o **"Total de Comissões a Pagar no Período"**.
        5. O relatório deve ser profissional e direto. Comece com um título claro.

        **Exemplo de Formatação da Saída:**

        ### Relatório de Validação de Comissões - JUL/2025
        **Representante:** ${rep ? rep.name : 'Todos'}

        - Venda para João Silva (Plano: Meu Apê): R$ 350.000,00 x 5.00% = **R$ 17.500,00**
        - Venda para Ricardo Alves (Plano: Casa na Praia): R$ 450.000,00 x 5.50% = **R$ 24.750,00** (taxa de bônus aplicada)
        
        ----------------------------------
        **Total de Comissões a Pagar no Período:** **R$ 42.250,00**
        `;

        const response = await googleAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Limpa o markdown que o modelo às vezes adiciona ao redor do texto
        return response.text.replace(/^```markdown|```$/g, '').trim();

    } catch (error) {
        console.error("Erro na geração do relatório de comissão com Gemini:", error);
        throw new Error("Não foi possível gerar o relatório da IA. Verifique os dados e tente novamente.");
    }
};
