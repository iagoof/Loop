/**
 * @file Repositório Central de Ícones
 * @description Este arquivo exporta todos os ícones da aplicação, utilizando a biblioteca `lucide-react`.
 * Os ícones são organizados por categorias (Sidebar, UI, KPI) e têm classes CSS padronizadas
 * para manter a consistência visual em todo o sistema.
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Target,
  PieChart,
  Settings,
  LogOut,
  PlusCircle,
  MoreHorizontal,
  X,
  Bot,
  Send,
  User,
  BrainCircuit,
  FileSearch,
  DollarSign,
  FileClock,
  UserCheck,
  UserPlus,
  FileSpreadsheet,
  FileCheck2,
  Percent,
  UserX,
  CheckCircle,
  XCircle,
  DownloadCloud,
  FilePieChart,
  Edit2,
  Trash2,
  Download,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ArrowUpCircle,
  MessageCircle,
  ShieldCheck,
  FileSignature,
  Menu,
  ArrowLeft,
  Bell,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from 'lucide-react';

/**
 * Ícone do logotipo da aplicação, com um gradiente de cores.
 */
export const LogoIcon = () => (
    <svg width="48" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#f97316"/>
                <stop offset="100%" stopColor="#3b82f6"/>
            </linearGradient>
        </defs>
        <path d="M 6,12 C 6,0 18,24 18,12 C 18,0 6,24 6,12 Z" 
              stroke="url(#logoGradient)" 
              strokeWidth="2.5" 
              fill="none"
              strokeLinecap="round"
        />
    </svg>
);

// Classes de estilo padrão para os ícones
const sidebarIconClass = "w-5 h-5 mr-3";
const kpiIconClass = "w-6 h-6";
const actionIconClass = "w-5 h-5";

// --- Ícones da Barra Lateral (Sidebar) ---
export const DashboardIcon = () => <LayoutDashboard className={sidebarIconClass} />;
export const ClientsIcon = () => <Users className={sidebarIconClass} />;
export const SalesIcon = () => <FileText className={sidebarIconClass} />;
export const GoalsIcon = () => <Target className={sidebarIconClass} />;
export const ReportsIcon = () => <PieChart className={sidebarIconClass} />;
export const SettingsIcon = () => <Settings className={sidebarIconClass} />;
export const LogoutIcon = () => <LogOut className={sidebarIconClass} />;
export const FileSearchIcon = () => <FileSearch className={sidebarIconClass} />;
export const FileSpreadsheetIcon = () => <FileSpreadsheet className={sidebarIconClass} />;
export const FileCheck2Icon = () => <FileCheck2 className={sidebarIconClass} />;
export const PercentIcon = () => <Percent className={sidebarIconClass} />;
export const FilePieChartIcon = () => <FilePieChart className={sidebarIconClass} />;
export const DownloadCloudIcon = () => <DownloadCloud className={sidebarIconClass} />;
export const MessageCircleIcon = () => <MessageCircle className={sidebarIconClass} />;
export const FileSignatureIcon = () => <FileSignature className={sidebarIconClass} />;


// --- Ícones Gerais da Interface (UI) ---
export const PlusCircleIcon = () => <PlusCircle className="w-5 h-5" />;
export const MoreHorizontalIcon = () => <MoreHorizontal className={actionIconClass} />;
export const XIcon = () => <X className="w-6 h-6" />;
export const BotIcon = () => <Bot className="w-6 h-6" />;
export const SendIcon = () => <Send className="w-5 h-5" />;
export const UserIcon = () => <User className="w-6 h-6" />;
export const BrainCircuitIcon = () => <BrainCircuit className="w-5 h-5 mr-2" />;
export const TargetIconAction = () => <Target className={actionIconClass} />;
export const Edit2Icon = () => <Edit2 className={actionIconClass} />;
export const Trash2Icon = () => <Trash2 className={actionIconClass} />;
export const UserPlusIcon = () => <UserPlus className="w-5 h-5" />;
export const UserCheckIcon = () => <UserCheck className={actionIconClass} />;
export const UserXIcon = () => <UserX className={actionIconClass} />;
export const CheckCircleIcon = () => <CheckCircle className="w-5 h-5 text-green-500" />;
export const XCircleIcon = () => <XCircle className="w-5 h-5 text-red-500" />;
export const ArrowUpCircleIcon = () => <ArrowUpCircle className="w-5 h-5 text-blue-500" />;
export const DownloadIcon = () => <Download className="w-5 h-5" />;
export const PhoneIcon = () => <Phone className="w-4 h-4 mr-2" />;
export const MailIcon = () => <Mail className="w-4 h-4 text-slate-400" />;
export const LockIcon = () => <Lock className="w-4 h-4 text-slate-400" />;
export const ArrowRightIcon = () => <ArrowRight className="w-6 h-6 ml-2" />;
export const ShieldCheckIcon = () => <ShieldCheck className="w-6 h-6" />;
export const MenuIcon = () => <Menu className="w-6 h-6" />;
export const ArrowLeftIcon = () => <ArrowLeft className="w-5 h-5" />;
export const BellIcon = () => <Bell className="w-5 h-5" />;

// --- Ícones do Editor de Texto ---
export const BoldIcon = () => <Bold className={actionIconClass} />;
export const ItalicIcon = () => <Italic className={actionIconClass} />;
export const UnderlineIcon = () => <Underline className={actionIconClass} />;
export const Heading1Icon = () => <Heading1 className={actionIconClass} />;
export const Heading2Icon = () => <Heading2 className={actionIconClass} />;
export const ListIcon = () => <List className={actionIconClass} />;
export const ListOrderedIcon = () => <ListOrdered className={actionIconClass} />;


// --- Ícones de Indicadores de Desempenho (KPIs), geralmente maiores ---
export const DollarSignKpiIcon = () => <DollarSign className={kpiIconClass} />;
export const FileTextKpiIcon = () => <FileText className={kpiIconClass} />;
export const FileClockKpiIcon = () => <FileClock className={kpiIconClass} />;
export const UserCheckKpiIcon = () => <UserCheck className={kpiIconClass} />;
export const UsersKpiIcon = () => <Users className={kpiIconClass} />;
export const TargetKpiIcon = () => <Target className={kpiIconClass} />;