import { ReactNode } from 'react';

export enum UserRole {
  Admin = 'ADMINISTRATOR',
  Representative = 'REPRESENTATIVE',
  Client = 'CLIENT',
}

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string; // Storing hashed passwords
  role: UserRole;
}

export enum SaleStatus {
  Approved = 'Aprovada',
  Pending = 'Pendente',
  Rejected = 'Recusada',
}

export interface Sale {
  id: number;
  repId: number;
  clientName: string;
  plan: string;
  value: number;
  date: string;
  status: SaleStatus;
  commissionPaid: boolean;
}

export interface NavItem {
  label: string;
  icon: ReactNode;
  screen: string;
}

export interface Client {
  id: number;
  userId?: number; // Link to User
  repId?: number; // Link to Representative
  name: string;
  phone: string;
  plan: string;
  status: 'Cliente Ativo' | 'Lead' | 'Inativo';
  nextPayment?: string;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export interface Representative {
  id: number;
  userId?: number; // Link to User
  name: string;
  email: string;
  sales: number;
  commissionRate: number;
  status: 'Ativo' | 'Inativo';
}

export interface Plan {
  id: number;
  name: string;
  type: 'Imóvel' | 'Automóvel' | 'Serviços';
  valueRange: [number, number];
  term: number; // in months
  adminFee: number; // percentage
}

export interface Commission {
  id: number; // Sale ID
  repName: string;
  period: string;
  salesValue: number;
  commissionValue: number;
  status: 'Pendente' | 'Paga';
}
