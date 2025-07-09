
import { ReactNode } from 'react';

export enum UserRole {
  Admin = 'ADMINISTRATOR',
  Representative = 'REPRESENTATIVE',
  Client = 'CLIENT',
}

export enum SaleStatus {
  Approved = 'Aprovada',
  Pending = 'Pendente',
  Rejected = 'Recusada',
}

export interface Sale {
  id: number;
  clientName: string;
  plan: string;
  value: number;
  date: string;
  status: SaleStatus;
}

export interface NavItem {
  label: string;
  icon: ReactNode;
  screen: string;
}

export interface Client {
  id: number;
  name: string;
  plan: string;
  nextPayment: string;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}
