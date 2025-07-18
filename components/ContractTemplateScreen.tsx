import React, { useState, useEffect } from 'react';
import * as db from '../services/database';
import {
    BoldIcon, ItalicIcon, UnderlineIcon,
    Heading1Icon, Heading2Icon, ListIcon, ListOrderedIcon
} from './icons';
import { CheckCircle, CornerDownLeft } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { githubLight } from '@uiw/codemirror-theme-github';
import { EditorView } from '@codemirror/view';
import ContentHeader from './ContentHeader';

const ContractTemplateScreen: React.FC = () => {
    const [template, setTemplate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [editorView, setEditorView] = useState<EditorView | null>(null);

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
    
    const applyMarkdown = (syntaxStart: string, syntaxEnd: string = syntaxStart) => {
        if (!editorView) return;
        const { from, to } = editorView.state.selection.main;
        const selection = editorView.state.sliceDoc(from, to);
        
        const newText = `${syntaxStart}${selection}${syntaxEnd}`;
        editorView.dispatch({
            changes: { from, to, insert: newText }
        });

        if (from === to) {
            editorView.dispatch({
                selection: { anchor: from + syntaxStart.length }
            });
        }
        editorView.focus();
    };

    const applyLinePrefix = (prefix: string) => {
        if (!editorView) return;
        const { from } = editorView.state.selection.main;
        const line = editorView.state.doc.lineAt(from);
        
        editorView.dispatch({
            changes: { from: line.from, to: line.from, insert: prefix }
        });
        editorView.focus();
    }

    const handleInsertPlaceholder = (placeholder: string) => {
        if (editorView) {
            const { from, to } = editorView.state.selection.main;
            editorView.dispatch({
                changes: { from, to, insert: placeholder }
            });
            editorView.focus();
        }
    };

    const placeholders = [
        '{{CLIENT_NAME}}', '{{CLIENT_EMAIL}}', '{{CLIENT_PHONE}}',
        '{{CLIENT_DOCUMENT}}', '{{CLIENT_ADDRESS}}', '{{SALE_PLAN_NAME}}',
        '{{SALE_VALUE}}', '{{SALE_DATE}}', '{{REP_NAME}}', '{{TODAY_DATE}}'
    ];
    
    const EditorToolbarButton: React.FC<{onClick: () => void, title: string, children: React.ReactNode}> = ({ onClick, title, children }) => (
        <button
            onClick={onClick}
            title={title}
            className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
        >
            {children}
        </button>
    );

    return (
        <div className="p-4 md:p-6 flex flex-col h-full">
            <ContentHeader
                title="Modelo de Contrato"
                subtitle="Edite o modelo padrão para geração de contratos."
            >
                 <button
                    onClick={handleSave}
                    disabled={isLoading || saveSuccess}
                    className={`bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 transition-all flex items-center justify-center min-w-[150px] disabled:opacity-70 ${saveSuccess ? '!bg-green-500 !hover:bg-green-600' : ''}`}
                >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (saveSuccess ? <><CheckCircle size={20} className="mr-2"/> Salvo!</> : 'Salvar Modelo')}
                </button>
            </ContentHeader>

            <div className="mt-6 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col h-full min-h-[400px] lg:min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex-shrink-0 bg-slate-100 border-b border-slate-200 p-2 flex items-center gap-1 flex-wrap">
                        <EditorToolbarButton onClick={() => applyLinePrefix('# ')} title="Título 1"><Heading1Icon /></EditorToolbarButton>
                        <EditorToolbarButton onClick={() => applyLinePrefix('## ')} title="Título 2"><Heading2Icon /></EditorToolbarButton>
                        <div className="h-5 w-px bg-slate-300 mx-1"></div>
                        <EditorToolbarButton onClick={() => applyMarkdown('**')} title="Negrito"><BoldIcon /></EditorToolbarButton>
                        <EditorToolbarButton onClick={() => applyMarkdown('*')} title="Itálico"><ItalicIcon /></EditorToolbarButton>
                        <EditorToolbarButton onClick={() => applyMarkdown('<u>', '</u>')} title="Sublinhado"><UnderlineIcon /></EditorToolbarButton>
                        <div className="h-5 w-px bg-slate-300 mx-1"></div>
                        <EditorToolbarButton onClick={() => applyLinePrefix('- ')} title="Lista"><ListIcon /></EditorToolbarButton>
                        <EditorToolbarButton onClick={() => applyLinePrefix('1. ')} title="Lista Numerada"><ListOrderedIcon /></EditorToolbarButton>
                    </div>
                     <CodeMirror
                        value={template}
                        height="100%"
                        theme={githubLight}
                        extensions={[EditorView.lineWrapping]}
                        onChange={(value) => setTemplate(value)}
                        onCreateEditor={(view) => setEditorView(view)}
                        className="h-full text-base flex-grow"
                    />
                </div>
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Variáveis Disponíveis</h3>
                    <p className="text-sm text-slate-500 mb-4">Clique para inserir uma variável no editor.</p>
                    <div className="space-y-2">
                        {placeholders.map(p => (
                            <button
                                key={p}
                                onClick={() => handleInsertPlaceholder(p)}
                                className="w-full text-left bg-slate-100 p-2 rounded-md hover:bg-slate-200 transition-colors flex items-center justify-between group"
                            >
                                <code className="text-sm text-orange-700 font-semibold">{p}</code>
                                <CornerDownLeft size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractTemplateScreen;