/**
 * @file Cabeçalho de Conteúdo
 * @description Um componente reutilizável para o cabeçalho de cada página,
 * contendo título, subtítulo e um espaço para botões de ação.
 */
import React from 'react';

interface ContentHeaderProps {
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ title, subtitle, children }) => {
    return (
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className="flex items-center space-x-4">
                {children}
            </div>
        </header>
    );
};

export default ContentHeader;