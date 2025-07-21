/**
 * @file Definições de Tipos e Interfaces
 * @description Este arquivo centraliza todas as definições de tipos de dados,
 * enums e interfaces utilizados em toda a aplicação, garantindo consistência e
 * segurança de tipo.
 */

import { ReactNode } from 'react';

/**
 * Define os papéis (funções) dos usuários no sistema.
 */
export enum UserRole {
  Admin = 'ADMINISTRATOR',
  Representative = 'REPRESENTATIVE',
  Client = 'CLIENT',
}

/**
 * Representa a estrutura de um usuário no sistema.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string; // Armazena o hash da senha do usuário.
  role: UserRole;
}

/**
 * Define os possíveis status de uma venda ou contrato.
 */
export enum SaleStatus {
  Approved = 'Aprovada',
  Pending = 'Pendente',
  Rejected = 'Recusada',
}

/**
 * Representa uma venda ou contrato de consórcio.
 */
export interface Sale {
  id: number;
  repId: number;        // ID do representante que realizou a venda.
  clientId: number;     // ID do cliente associado.
  plan: string;         // Nome do plano vendido.
  value: number;        // Valor do crédito.
  date: string;         // Data da venda no formato 'DD/MM/YYYY'.
  status: SaleStatus;
  commissionPaid: boolean; // Indica se a comissão foi paga.
  rejectionReason?: string; // Motivo da recusa, se aplicável.
}

/**
 * Define a estrutura de um item de navegação na barra lateral.
 */
export interface NavItem {
  label: string;
  icon: ReactNode;
  screen: string;
}

/**
 * Representa um cliente no sistema.
 */
export interface Client {
  id: number;
  userId?: number;      // ID do usuário associado (se o cliente tiver login).
  repId?: number;       // ID do representante responsável.
  name: string;
  email?: string;
  phone: string;
  document?: string;    // CPF ou CNPJ.
  address?: string;
  plan: string;         // Plano atual ou de interesse.
  status: 'Cliente Ativo' | 'Lead' | 'Inativo';
  nextPayment?: string; // Data do próximo pagamento.
  contractStartDate?: string; // Data de início do contrato para cálculos. Formato: 'YYYY-MM-DD'.
  leadScore?: number; // Pontuação do lead gerada por IA (1-100)
  leadJustification?: string; // Justificativa da IA para a pontuação
}

/**
 * Representa uma mensagem no chatbot do cliente.
 */
export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

/**
 * Representa um representante de vendas.
 */
export interface Representative {
  id: number;
  userId?: number;      // ID do usuário associado (para login).
  name: string;
  email: string;
  sales: number;        // Número de vendas (pode ser usado para contagem).
  commissionRate: number; // Percentual de comissão.
  goal?: number;        // Meta de vendas mensal em valor (ex: 200000).
  status: 'Ativo' | 'Inativo';
}

/**
 * Representa um plano de consórcio.
 */
export interface Plan {
  id: number;
  name: string;
  type: 'Imóvel' | 'Automóvel' | 'Serviços';
  valueRange: [number, number]; // Faixa de valor do crédito [min, max].
  term: number;         // Prazo em meses.
  adminFee: number;     // Taxa de administração em porcentagem.
}

/**
 * Representa uma comissão a ser paga, calculada a partir de uma venda.
 */
export interface Commission {
  id: number;           // ID da venda original.
  repName: string;
  period: string;       // Mês/ano da comissão.
  salesValue: number;   // Valor da venda que gerou a comissão.
  commissionValue: number; // Valor da comissão calculada.
  status: 'Pendente' | 'Paga';
}

/**
 * Representa uma mensagem individual no simulador de chat do WhatsApp.
 */
export interface WhatsAppMessage {
    id: number;
    sender: 'client' | 'bot' | 'admin';
    text: string;
    timestamp: string; // Formato ISO 8601.
}

/**
 * Representa uma conversa (chat) completa no simulador de WhatsApp.
 */
export interface WhatsAppChat {
    id: number;
    clientId: number;
    clientName: string;
    clientPhone: string;
    messages: WhatsAppMessage[];
    lastMessageTimestamp: string;
    isTyping?: boolean; // Para simular o "digitando...".
}

/**
 * Representa uma notificação no sistema.
 */
export interface Notification {
    id: number;
    userId: number; // ID do usuário que deve receber a notificação.
    message: string;
    link?: any; // Tela para onde o usuário deve ser levado ao clicar. Pode ser string ou objeto.
    isRead: boolean;
    createdAt: string; // Data de criação no formato ISO 8601.
}

/**
 * Representa as configurações de um usuário.
 */
export interface UserSettings {
    profile: {
        name: string;
        email: string;
        avatar: string;
    };
    notifications: {
        emailNews: boolean;
        emailSales: boolean;
        appUpdates: boolean;
    };
    theme: 'light' | 'dark' | 'system';
}

/**
 * Representa uma atividade de contato com o cliente.
 */
export interface Activity {
  id: number;
  clientId: number;
  repId: number;
  type: 'Ligação' | 'Email' | 'Reunião' | 'Outro';
  notes: string;
  timestamp: string; // Data da atividade no formato ISO 8601.
}

/**
 * Representa a análise da IA para a próxima melhor ação de venda.
 */
export interface NextActionAnalysis {
  suggestionTitle: string;
  justification: string;
  suggestedCommunication: string;
  actionType: 'EMAIL' | 'CALL' | 'MEETING' | 'PLAN_SUGGESTION' | 'FOLLOW_UP';
}