import React, { useState, useEffect } from 'react';
import * as db from '../services/database';
import { CheckCircle } from 'lucide-react';

const ContractTemplateScreen: React.FC = () => {
    const [template, setTemplate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        setTemplate(db.getContractTemplate());
    }, []);

    const handleSave = () => {
        setIsLoading(true);
        setSaveSuccess(false);
        db.setContractTemplate(template);
        setTimeout(() => {
            setIsLoading(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        }, 500);
    };

    const placeholders = [
        '{{CLIENT_NAME}}', '{{CLIENT_EMAIL}}', '{{CLIENT_PHONE}}',
        '{{CLIENT_DOCUMENT}}', '{{CLIENT_ADDRESS}}', '{{SALE_PLAN_NAME}}',
        '{{SALE_VALUE}}', '{{SALE_DATE}}', '{{REP_NAME}}', '{{TODAY_DATE}}'
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Modelo de Contrato</h2>
                    <p className="text-sm text-slate-500">Edite o modelo padrão para geração de contratos.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading || saveSuccess}
                    className={`bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 transition-all flex items-center justify-center min-w-[150px] disabled:opacity-70 ${saveSuccess ? '!bg-green-500 !hover:bg-green-600' : ''}`}
                >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (saveSuccess ? <><CheckCircle size={20} className="mr-2"/> Salvo!</> : 'Salvar Modelo')}
                </button>
            </header>
            <main className="flex-1 p-6 overflow-hidden bg-slate-50">
                <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <textarea
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            className="w-full h-full p-4 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                            placeholder="Insira o texto do contrato aqui..."
                        />
                    </div>
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Variáveis Disponíveis</h3>
                        <p className="text-sm text-slate-500 mb-4">Use estas variáveis no seu modelo. Elas serão substituídas pelos dados reais do cliente e da venda.</p>
                        <div className="space-y-2">
                            {placeholders.map(p => (
                                <div key={p} className="bg-slate-100 p-2 rounded-md">
                                    <code className="text-sm text-orange-700 font-semibold">{p}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContractTemplateScreen;
