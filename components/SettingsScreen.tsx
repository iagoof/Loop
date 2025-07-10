import React, { useState, useEffect } from 'react';
import { User as UserIconUI, Lock, Bell, Palette } from 'lucide-react';
import { User, UserRole } from '../types';

interface SettingsScreenProps {
    loggedInUser: User;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ loggedInUser }) => {
    const SETTINGS_KEY = `loop_user_settings_${loggedInUser.id}`;

    const defaultSettings = {
        profile: {
            name: loggedInUser.name,
            email: loggedInUser.email,
            avatar: `https://i.pravatar.cc/150?u=${loggedInUser.email}`
        },
        notifications: {
            emailNews: true,
            emailSales: loggedInUser.role === UserRole.Representative,
            appUpdates: true,
        },
        theme: 'system'
    };

    const [profile, setProfile] = useState(defaultSettings.profile);
    const [notifications, setNotifications] = useState(defaultSettings.notifications);
    const [theme, setTheme] = useState(defaultSettings.theme);
    
    // Load settings from localStorage on initial render
    useEffect(() => {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setProfile(settings.profile || defaultSettings.profile);
            setNotifications(settings.notifications || defaultSettings.notifications);
            setTheme(settings.theme || defaultSettings.theme);
        } else {
            // Set initial state if nothing is saved
            setProfile(defaultSettings.profile);
            setNotifications(defaultSettings.notifications);
            setTheme(defaultSettings.theme);
        }
    }, [loggedInUser, SETTINGS_KEY]);

    const saveSettings = (updatedSettings: any) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
        alert('Configurações salvas!');
    }

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setNotifications(prev => ({ ...prev, [name]: checked }));
    };

    const handleSaveProfile = () => {
        const currentSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
        saveSettings({ ...currentSettings, profile });
    }

    const handleSaveNotifications = () => {
        const currentSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
        saveSettings({ ...currentSettings, notifications });
    }

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        const currentSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
        saveSettings({ ...currentSettings, theme: newTheme });
        // Add logic here to apply theme (e.g., adding class to <html> element)
    }


    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
                    <p className="text-sm text-slate-500">Gerencie suas preferências de perfil e notificações.</p>
                </div>
            </header>
            <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Profile Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center"><UserIconUI className="w-5 h-5 mr-2 text-orange-600" /> Perfil</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center space-x-4">
                                <img src={profile.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
                                <div>
                                    <button onClick={() => alert('Funcionalidade para alterar foto em desenvolvimento.')} className="text-sm font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200">Alterar Foto</button>
                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF até 5MB.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
                                    <input type="text" id="name" name="name" value={profile.name} onChange={handleProfileChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                                    <input type="email" id="email" name="email" value={profile.email} onChange={handleProfileChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition" readOnly={loggedInUser.role !== UserRole.Admin} />
                                </div>
                            </div>
                        </div>
                         <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end gap-4">
                            <button onClick={() => alert('Funcionalidade para alterar senha em desenvolvimento.')} className="font-semibold text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 flex items-center"><Lock className="w-4 h-4 mr-2"/>Alterar Senha</button>
                            <button onClick={handleSaveProfile} className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700">Salvar Alterações</button>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center"><Bell className="w-5 h-5 mr-2 text-orange-600" /> Notificações</h3>
                        </div>
                        <div className="p-6 divide-y divide-slate-200">
                           <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-semibold text-slate-800">Novidades por E-mail</p>
                                    <p className="text-sm text-slate-500">Receba notícias sobre produtos e atualizações.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="emailNews" checked={notifications.emailNews} onChange={handleNotificationChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                           </div>
                           {loggedInUser.role === UserRole.Representative && (
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-semibold text-slate-800">Alertas de Vendas</p>
                                    <p className="text-sm text-slate-500">Seja notificado sobre vendas e comissões.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="emailSales" checked={notifications.emailSales} onChange={handleNotificationChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                           </div>
                           )}
                           <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-semibold text-slate-800">Notificações no App</p>
                                    <p className="text-sm text-slate-500">Mostra notificações dentro da plataforma.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="appUpdates" checked={notifications.appUpdates} onChange={handleNotificationChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                           </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end">
                            <button onClick={handleSaveNotifications} className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700">Salvar Notificações</button>
                        </div>
                    </div>
                    
                    {/* Appearance Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center"><Palette className="w-5 h-5 mr-2 text-orange-600" /> Aparência</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Tema</p>
                            <div className="flex space-x-2 rounded-lg bg-slate-100 p-1">
                                <button onClick={() => handleThemeChange('light')} className={`w-full text-center font-semibold text-sm p-2 rounded-md transition-colors ${theme === 'light' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Claro</button>
                                <button onClick={() => handleThemeChange('dark')} className={`w-full text-center font-semibold text-sm p-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Escuro</button>
                                <button onClick={() => handleThemeChange('system')} className={`w-full text-center font-semibold text-sm p-2 rounded-md transition-colors ${theme === 'system' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Sistema</button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default SettingsScreen;