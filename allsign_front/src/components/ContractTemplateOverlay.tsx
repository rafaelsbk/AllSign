import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Info, FileText, Globe, User, Building2, HardHat, Plus, Copy } from 'lucide-react';
import api from '../services/api';
import RichTextEditor from './ui/RichTextEditor';

interface ContractTemplateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

const ContractTemplateOverlay: React.FC<ContractTemplateOverlayProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('Energia Solar');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [customVar, setCustomVar] = useState('');
  
  // Ref para o editor para inserção externa
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTemplateName(initialData?.name || '');
      setCategory(initialData?.category || 'Energia Solar');
      setHtmlContent(initialData?.content?.html_content || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const insertVariable = (variable: string) => {
    if (editorRef.current) {
      editorRef.current.chain().focus().insertContent(`{{ ${variable} }}`).run();
    }
  };

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

  const variableGroups = [
    {
      title: 'Cliente',
      icon: <User size={16} />,
      color: 'blue',
      vars: [
        { label: 'Nome Completo', value: 'client_name' },
        { label: 'CPF', value: 'client_cpf' },
        { label: 'RG', value: 'client_rg' },
        { label: 'E-mail', value: 'client_email' },
        { label: 'Telefone', value: 'client_phone' },
        { label: 'CEP', value: 'client_cep' },
        { label: 'Logradouro', value: 'client_street' },
        { label: 'Número', value: 'client_number' },
        { label: 'Bairro', value: 'client_neighborhood' },
        { label: 'Cidade', value: 'client_city' },
        { label: 'Estado (UF)', value: 'client_state' },
        { label: 'Complemento', value: 'client_complement' },
      ]
    },
    {
      title: 'Empresa',
      icon: <Building2 size={16} />,
      color: 'emerald',
      vars: [
        { label: 'Razão Social', value: 'company_name' },
        { label: 'CNPJ', value: 'company_cnpj' },
        { label: 'CEP', value: 'company_cep' },
        { label: 'Logradouro', value: 'company_street' },
        { label: 'Número', value: 'company_number' },
        { label: 'Bairro', value: 'company_neighborhood' },
        { label: 'Cidade', value: 'company_city' },
        { label: 'Estado (UF)', value: 'company_state' },
      ]
    },
    {
      title: 'Engenheiro / Profissional',
      icon: <HardHat size={16} />,
      color: 'amber',
      vars: [
        { label: 'Nome do Profissional', value: 'pro_name' },
        { label: 'CREA / Registro', value: 'pro_crea' },
        { label: 'CPF Profissional', value: 'pro_cpf' },
        { label: 'CEP', value: 'pro_cep' },
        { label: 'Logradouro', value: 'pro_street' },
        { label: 'Número', value: 'pro_number' },
        { label: 'Bairro', value: 'pro_neighborhood' },
        { label: 'Cidade', value: 'pro_city' },
        { label: 'Estado (UF)', value: 'pro_state' },
      ]
    },
    {
        title: 'Data do Contrato',
        icon: <Globe size={16} />,
        color: 'purple',
        vars: [
          { label: 'Dia (01)', value: 'date_day' },
          { label: 'Mês (Extenso)', value: 'date_month' },
          { label: 'Ano (2026)', value: 'date_year' },
          { label: 'Data Completa', value: 'contract_date' },
        ]
      }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:pl-72 overflow-y-auto">
      <div className="bg-white w-full max-w-[95vw] rounded-2xl shadow-2xl flex flex-col h-full max-h-[95vh]">
        
        {/* Header Estilo Office */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Editor de Modelos AllSign</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Interface de Engenharia Solar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-400 hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="flex-1 overflow-hidden bg-gray-50 flex">
          
          {/* LADO ESQUERDO: EDITOR */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Informações de Registro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Nome do Documento</label>
                        <input 
                            className="w-full bg-transparent text-lg font-bold outline-none"
                            placeholder="Ex: Contrato Solar V2"
                            value={templateName}
                            onChange={e => setTemplateName(e.target.value)}
                        />
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Categoria</label>
                        <input 
                            className="w-full bg-transparent text-lg font-bold outline-none"
                            placeholder="Ex: Venda / Instalação"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        />
                    </div>
                </div>

                {/* Editor Principal */}
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <RichTextEditor 
                        content={htmlContent}
                        onChange={setHtmlContent}
                        onInit={(editor) => editorRef.current = editor}
                    />
                </div>
            </div>
          </div>

          {/* LADO DIREITO: SIDEBAR DE VARIÁVEIS */}
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto custom-scrollbar p-6 space-y-8">
            <div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Copy size={18} className="text-blue-600" />
                    Variáveis do Sistema
                </h3>
                <p className="text-[10px] text-gray-500 leading-relaxed mb-6">
                    Clique em uma variável abaixo para inseri-la no documento na posição do cursor.
                </p>

                <div className="space-y-6">
                    {variableGroups.map((group) => (
                        <div key={group.title} className="space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                {group.icon}
                                {group.title}
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {group.vars.map((v) => (
                                    <button
                                        key={v.value}
                                        onClick={() => insertVariable(v.value)}
                                        className="text-left px-3 py-2 rounded-xl text-xs font-medium border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group relative flex justify-between items-center"
                                    >
                                        <span className="text-gray-600 group-hover:text-blue-700">{v.label}</span>
                                        <span className="text-[9px] font-mono text-gray-300 group-hover:text-blue-300">{"{{"}{v.value.split('_')[1] || v.value}{"}}"}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Variável Avulsa */}
                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            <Plus size={16} />
                            Variável Personalizada
                        </div>
                        <div className="space-y-2">
                            <input 
                                type="text"
                                placeholder="Nome da variável (ex: kit_painel)"
                                className="w-full p-3 rounded-xl border border-gray-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={customVar}
                                onChange={e => setCustomVar(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                            />
                            <button 
                                onClick={() => {
                                    if(customVar) {
                                        insertVariable(customVar);
                                        setCustomVar('');
                                    }
                                }}
                                disabled={!customVar}
                                className="w-full py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors disabled:opacity-30"
                            >
                                Inserir Personalizada
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl">
          <div className="hidden md:flex items-center gap-3 text-amber-600 bg-amber-50 px-5 py-3 rounded-2xl text-xs font-bold border border-amber-100">
            <Info size={20} />
            <span>As variáveis dinâmicas serão preenchidas automaticamente ao gerar o contrato final.</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">
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
