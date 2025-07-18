/**
 * @file Tela de Configurações
 * @description Permite que o usuário gerencie suas preferências de perfil,
 * notificações e aparência (tema). As configurações são salvas no
 * `localStorage` para persistência entre as sessões.
 */
import React, { useState, useEffect, useRef } from 'react';
import { User as UserIconUI, Lock, Bell, Palette } from 'lucide-react';
import { User, UserRole, UserSettings } from '../types';
import * as db from '../services/database';
import ChangePasswordModal from './ChangePasswordModal';
import { useToast } from '../contexts/ToastContext';

interface SettingsScreenProps {
    loggedInUser: User;
    onSettingsSave: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ loggedInUser, onSettingsSave }) => {
    const [settings, setSettings] = useState<UserSettings>(db.getUserSettings(loggedInUser.id));
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    // Carrega as configurações do serviço de banco de dados
    useEffect(() => {
        setSettings(db.getUserSettings(loggedInUser.id));
    }, [loggedInUser.id]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, profile: { ...prev.profile, [name]: value } }));
    };

    const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [name]: checked } }));
    };
    
    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setSettings(prev => ({ ...prev, theme: newTheme }));
    }
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const newAvatarUrl = event.target?.result as string;
                setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, avatar: newAvatarUrl }
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Função unificada para salvar todas as configurações
    const handleSaveSettings = () => {
        db.saveUserSettings(loggedInUser.id, settings);
        onSettingsSave(); // Notifica o App.tsx para recarregar as configs e mostrar o toast
    }

    // Função para lidar com a gravação da senha vinda do modal
    const handlePasswordSave = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
        const result = db.updatePassword(loggedInUser.id, currentPassword, newPassword);
        if (result.success) {
            addToast('Senha alterada com sucesso!', 'success');
            setIsChangePasswordModalOpen(false); // Fecha o modal em caso de sucesso
        }
        return result;
    };

    return (
        <>
            <div className="p-4 md:p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Seção de Perfil */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center"><UserIconUI className="w-5 h-5 mr-2 text-orange-600" /> Perfil</h3>
                        </div>
                        <div className="p-6 space-y-6">
                             <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                                accept="image/png, image/jpeg, image/gif"
                            />
                            <div className="flex items-center space-x-4">
                                <img src={settings.profile.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                                <div>
                                    <button onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Alterar Foto</button>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG, JPG, GIF até 5MB.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome</label>
                                    <input type="text" id="name" name="name" value={settings.profile.name} onChange={handleProfileChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input type="email" id="email" name="email" value={settings.profile.email} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700/50 cursor-not-allowed text-slate-500 dark:text-slate-400" readOnly />
                                </div>
                            </div>
                        </div>
                         <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl flex justify-end gap-4">
                            <button onClick={() => setIsChangePasswordModalOpen(true)} className="font-semibold text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center"><Lock className="w-4 h-4 mr-2"/>Alterar Senha</button>
                        </div>
                    </div>

                    {/* Seção de Notificações */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center"><Bell className="w-5 h-5 mr-2 text-orange-600" /> Notificações</h3>
                        </div>
                        <div className="p-6 divide-y divide-slate-200 dark:divide-slate-700">
                           <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Novidades por E-mail</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Receba notícias sobre produtos e atualizações.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="emailNews" checked={settings.notifications.emailNews} onChange={handleNotificationChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                           </div>
                           {loggedInUser.role === UserRole.Representative && (
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Alertas de Vendas (E-mail)</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Seja notificado sobre aprovação de vendas e comissões.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="emailSales" checked={settings.notifications.emailSales} onChange={handleNotificationChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                           </div>
                           )}
                           <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Notificações no App</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Mostra notificações de eventos importantes na plataforma.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="appUpdates" checked={settings.notifications.appUpdates} onChange={handleNotificationChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                           </div>
                        </div>
                    </div>
                    
                    {/* Seção de Aparência */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center"><Palette className="w-5 h-5 mr-2 text-orange-600" /> Aparência</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tema</p>
                            <div className="flex space-x-2 rounded-lg bg-slate-100 dark:bg-slate-900 p-1">
                                <button onClick={() => handleThemeChange('light')} className={`w-full text-center font-semibold text-sm p-2 rounded-md transition-colors ${settings.theme === 'light' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>Claro</button>
                                <button onClick={() => handleThemeChange('dark')} className={`w-full text-center font-semibold text-sm p-2 rounded-md transition-colors ${settings.theme === 'dark' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>Escuro</button>
                                <button onClick={() => handleThemeChange('system')} className={`w-full text-center font-semibold text-sm p-2 rounded-md transition-colors ${settings.theme === 'system' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>Sistema</button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                         <button onClick={handleSaveSettings} className="bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105">
                            Salvar Todas as Configurações
                        </button>
                    </div>
                </div>
            </div>

            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSave={handlePasswordSave}
            />
        </>
    );
};

export default SettingsScreen;