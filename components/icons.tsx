
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
} from 'lucide-react';

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

const sidebarIconClass = "w-5 h-5 mr-3";
const kpiIconClass = "w-6 h-6";
const actionIconClass = "w-5 h-5";

// Sidebar Icons
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


// General UI Icons
export const PlusCircleIcon = () => <PlusCircle className="w-5 h-5" />;
export const MoreHorizontalIcon = () => <MoreHorizontal className={actionIconClass} />;
export const XIcon = () => <X className="w-6 h-6" />;
export const BotIcon = () => <Bot className="w-6 h-6" />;
export const SendIcon = () => <Send className="w-5 h-5" />;
export const UserIcon = () => <User className="w-6 h-6" />;
export const BrainCircuitIcon = () => <BrainCircuit className="w-5 h-5 mr-2" />;
export const Edit2Icon = () => <Edit2 className={actionIconClass} />;
export const Trash2Icon = () => <Trash2 className={actionIconClass} />;
export const UserPlusIcon = () => <UserPlus className="w-5 h-5" />;
export const UserCheckIcon = () => <UserCheck className={actionIconClass} />;
export const UserXIcon = () => <UserX className={actionIconClass} />;
export const CheckCircleIcon = () => <CheckCircle className="w-5 h-5 text-green-500" />;
export const XCircleIcon = () => <XCircle className="w-5 h-5 text-red-500" />;
export const DownloadIcon = () => <Download className="w-5 h-5" />;
export const PhoneIcon = () => <Phone className="w-4 h-4 mr-2" />;
export const MailIcon = () => <Mail className="w-4 h-4 text-slate-400" />;
export const LockIcon = () => <Lock className="w-4 h-4 text-slate-400" />;


// KPI Icons (Larger)
export const DollarSignKpiIcon = () => <DollarSign className={kpiIconClass} />;
export const FileTextKpiIcon = () => <FileText className={kpiIconClass} />;
export const FileClockKpiIcon = () => <FileClock className={kpiIconClass} />;
export const UserCheckKpiIcon = () => <UserCheck className={kpiIconClass} />;
export const UsersKpiIcon = () => <Users className={kpiIconClass} />;
export const TargetKpiIcon = () => <Target className={kpiIconClass} />;