import React, { useState } from 'react';
import { X, Save, Info, FileText, Globe } from 'lucide-react';
import api from '../services/api';
import RichTextEditor from './ui/RichTextEditor';

interface ContractTemplateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

const ContractTemplateOverlay: React.FC<ContractTemplateOverlayProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [templateName, setTemplateName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || 'Energia Solar');
  const [htmlContent, setHtmlContent] = useState(initialData?.content?.html_content || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!templateName) {
      alert('Por favor, dê um nome ao modelo.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: templateName,
        category: category,
        content: { 
            html_content: htmlContent,
            document_title: templateName
        }
      };
      
      if (initialData?.id) {
          await api.put(`/users/templates/${initialData.id}/`, payload);
      } else {
          await api.post('/users/templates/', payload);
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar template:', err);
      alert('Erro ao salvar modelo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:pl-72 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col h-full max-h-[95vh]">
        
        {/* Header Estilo Office */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 rounded-t-2xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">Editor de Modelos AllSign</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Interface Unificada (Word Style)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X size={24} className="text-gray-50" />
            </button>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="flex-1 overflow-y-auto bg-gray-100/50 dark:bg-zinc-950/40 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Informações de Registro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Nome do Documento</label>
                    <input 
                        className="w-full bg-transparent text-lg font-bold outline-none dark:text-white"
                        placeholder="Ex: Contrato Solar V2"
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value)}
                    />
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Categoria</label>
                    <input 
                        className="w-full bg-transparent text-lg font-bold outline-none dark:text-white"
                        placeholder="Ex: Venda / Instalação"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    />
                </div>
            </div>

            {/* Dica de Variáveis */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                    <Globe size={20} />
                </div>
                <div>
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Dica Pro: Use chaves duplas para campos dinâmicos.</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 opacity-80">Exemplo: "Eu, {"{{ nome_cliente }}"}, portador do CPF {"{{ cpf_cliente }}"}..."</p>
                </div>
            </div>

            {/* Editor Principal */}
            <div className="animate-in fade-in zoom-in-95 duration-500">
                <RichTextEditor 
                    content={htmlContent}
                    onChange={setHtmlContent}
                />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 rounded-b-2xl">
          <div className="hidden md:flex items-center gap-3 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-5 py-3 rounded-2xl text-xs font-bold border border-amber-100 dark:border-amber-800/50">
            <Info size={20} />
            <span>As variáveis serão extraídas automaticamente ao gerar o contrato.</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              Descartar
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-12 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-500/30 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : <><Save size={20} /> Salvar Modelo</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTemplateOverlay;
