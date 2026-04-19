import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, FileDown, Info, Edit3, Type, ClipboardList } from 'lucide-react';
import api from '../services/api';

interface ContractOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onSuccess: () => void;
  contract?: any;
  isViewOnly?: boolean;
}

const ContractOverlay: React.FC<ContractOverlayProps> = ({ isOpen, onClose, client, onSuccess, contract, isViewOnly }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [variablesData, setVariablesData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);

  // 1. Busca modelos disponíveis
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/users/templates/');
        const list = Array.isArray(response.data) ? response.data : (response.data.results || []);
        setTemplates(list);
      } catch (err) {
        console.error('Erro ao buscar formas:', err);
      }
    };
    if (isOpen) fetchTemplates();
  }, [isOpen]);

  // 2. Extrai variáveis do HTML do modelo
  const detectedVariables = useMemo(() => {
    const content = currentTemplate?.content?.html_content || '';
    const vars = new Set<string>();
    const matches = content.matchAll(/\{\{\s*(\w+)\s*\}\}/g);
    for (const match of matches) {
      vars.add(match[1]);
    }
    return Array.from(vars);
  }, [currentTemplate]);

  // 3. Ao mudar a forma, pré-preenche variáveis conhecidas
  const handleTemplateChange = async (id: string) => {
    setSelectedTemplateId(id);
    if (!id) {
      setCurrentTemplate(null);
      return;
    }

    setIsTemplateLoading(true);
    try {
      const response = await api.get(`/users/templates/${id}/`);
      const template = response.data;
      setCurrentTemplate(template);

      const clientMap: Record<string, string> = {
        client_name: client?.name || '',
        client_cpf: client?.cpf || '',
        client_rg: client?.rg || '',
        client_email: client?.email || '',
        client_phone: client?.phones?.[0]?.phone || '',
        client_street: client?.street || '',
        client_city: client?.city || '',
        date_day: new Date().getDate().toString().padStart(2, '0'),
        date_month: new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase(),
        date_year: new Date().getFullYear().toString()
      };

      const initialData: Record<string, string> = {};
      const matches = (template.content.html_content || '').matchAll(/\{\{\s*(\w+)\s*\}\}/g);
      for (const match of matches) {
        const v = match[1];
        initialData[v] = variablesData[v] || clientMap[v] || '';
      }
      setVariablesData(prev => ({ ...clientMap, ...prev, ...initialData }));

    } catch (err) {
      console.error('Erro ao carregar forma:', err);
    } finally {
      setIsTemplateLoading(false);
    }
  };

  // 4. Resolve variáveis para o preview visual
  const resolveHTML = (html: string) => {
    if (!html) return '';
    return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      const val = variablesData[key];
      if (val) return `<span class="text-blue-600 font-bold border-b border-blue-200">${val}</span>`;
      return `<span class="bg-amber-100 text-amber-700 font-bold px-1 rounded border border-amber-200">[${key.replace(/_/g, ' ')}]</span>`;
    });
  };

  const handleSave = async () => {
    if (!currentTemplate) return;
    setLoading(true);
    try {
      const payload = {
        client: client.id,
        contract_number: variablesData.contract_number || 'S/N',
        service_value: parseFloat(variablesData.service_value?.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        equipment_value: parseFloat(variablesData.equipment_value?.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        contract_date: variablesData.contract_date || new Date().toISOString().split('T')[0],
        extra_data: variablesData,
        // Informação técnica básica para compatibilidade com o model antigo
        inverter_brand: variablesData.inverter_brand || '',
        inverter_quantity: parseInt(variablesData.inverter_quantity) || 0,
        panels_brand: variablesData.panels_brand || '',
        panels_quantity: parseInt(variablesData.panels_quantity) || 0,
      };

      if (contract?.id) {
        await api.put(`/users/contracts/${contract.id}/`, payload);
      } else {
        await api.post('/users/contracts/', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar contrato.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const resolvedHtml = (currentTemplate.content.html_content || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => variablesData[key] || '_______');
      const payload = {
        client_name: client?.name,
        html_content: resolvedHtml,
        doc_title: currentTemplate.name.toUpperCase()
      };
      const response = await api.post('/users/contracts/generate-pdf/', payload, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.body.appendChild(document.createElement('a'));
      link.href = url;
      link.setAttribute('download', `Contrato_${client?.name.replace(/\s+/g, '_')}.pdf`);
      link.click();
      link.remove();
    } catch (err) {
      console.error('PDF Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-0 md:p-6 md:pl-72 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-[98vw] h-full max-h-[98vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
        
        {/* Top Header */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">Gerar Contrato para Cliente</h2>
              <p className="text-sm text-gray-500 font-medium uppercase">Preenchimento de Modelo Jurídico</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 p-2 rounded-xl border border-gray-100 dark:border-zinc-700">
              <label className="text-[10px] font-black text-gray-400 uppercase px-2">Modelo:</label>
              <select 
                className="bg-transparent text-sm font-bold outline-none dark:text-white min-w-[250px]"
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                disabled={isTemplateLoading || isViewOnly}
              >
                <option value="">Selecione um modelo...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-full transition-all">
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* PAINEL DE VARIÁVEIS (DIREITA) */}
          <div className="w-full md:w-[450px] border-r border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 overflow-y-auto p-8 shrink-0 order-2 md:order-1">
            <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600">
                        <Type size={20} />
                    </div>
                    <h3 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">Dados do Contrato</h3>
                </div>

                {!currentTemplate ? (
                    <div className="py-20 text-center space-y-4 opacity-40">
                        <Info size={40} className="mx-auto" />
                        <p className="text-sm font-bold">Selecione um modelo jurídico para preencher os dados.</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                        {detectedVariables.map((v) => (
                            <div key={v} className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    {v.replace(/_/g, ' ')}
                                </label>
                                <input 
                                    type="text"
                                    disabled={isViewOnly}
                                    className="w-full p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm transition-all font-medium"
                                    value={variablesData[v] || ''}
                                    onChange={(e) => setVariablesData({...variablesData, [v]: e.target.value})}
                                    placeholder={`Digite o(a) ${v.replace(/_/g, ' ')}...`}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>

          {/* PREVIEW DO CONTRATO (ESQUERDA) */}
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-y-auto p-4 md:p-12 relative order-1 md:order-2">
            {!currentTemplate ? (
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <h1 className="text-[120px] font-black rotate-[-15deg] select-none uppercase">Aguardando</h1>
              </div>
            ) : (
              <div className="bg-white text-zinc-900 p-10 md:p-20 shadow-2xl rounded-sm font-serif leading-relaxed text-[15px] mx-auto max-w-[210mm] min-h-[297mm] animate-in zoom-in-95 duration-500">
                 {/* Aqui renderizamos o HTML resolvido */}
                 <div 
                    className="prose max-w-none text-justify"
                    dangerouslySetInnerHTML={{ __html: resolveHTML(currentTemplate.content.html_content) }} 
                 />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end items-center gap-4 bg-white dark:bg-zinc-900 shrink-0">
          <button onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            Sair sem Salvar
          </button>
          <button 
            onClick={handleGeneratePDF}
            disabled={!currentTemplate || loading}
            className="flex items-center gap-3 px-10 py-3 rounded-2xl bg-zinc-800 text-white font-bold hover:bg-zinc-950 transition-all shadow-xl shadow-zinc-500/20 disabled:opacity-50"
          >
            <FileDown size={20} />
            <span>Exportar PDF</span>
          </button>
          {!isViewOnly && (
            <button 
              onClick={handleSave}
              disabled={!currentTemplate || loading}
              className="flex items-center gap-3 px-12 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 active:scale-95 disabled:opacity-50"
            >
              <Save size={20} />
              <span>Finalizar e Salvar</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .prose h1, .prose h2, .prose h3 { text-align: center; text-transform: uppercase; margin-bottom: 2rem; }
        .prose p { margin-bottom: 1rem; line-height: 1.6; }
        .prose table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin: 1.5rem 0; }
        .prose td, .prose th { border: 1px solid #000; padding: 8px; }
      `}</style>
    </div>
  );
};

export default ContractOverlay;
