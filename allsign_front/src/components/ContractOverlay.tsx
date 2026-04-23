import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Save, FileDown, Info, Type, ClipboardList } from 'lucide-react';
import api from '../services/api';
import RichTextEditor from './Editor/RichTextEditor';

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
  const [selectedLetterheadId, setSelectedLetterheadId] = useState('none');
  const [variablesData, setVariablesData] = useState<Record<string, string>>({});
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  
  const [letterheadTemplates, setLetterheadTemplates] = useState<any[]>([
    { id: 'none', name: 'Nenhum (Branco)', header_image: '', footer_image: '' }
  ]);

  const editorRef = useRef<any>(null);

  // 1. Busca modelos e papéis timbrados
  const fetchLetterheads = async () => {
    try {
      const response = await api.get('users/letterheads/');
      const data = Array.isArray(response.data) ? response.data : response.data.results;
      const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
      const getFullUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
      };

      const processedData = (data || []).map((lh: any) => ({
        ...lh,
        header_image: getFullUrl(lh.header_image),
        footer_image: getFullUrl(lh.footer_image),
      }));

      setLetterheadTemplates([
        { id: 'none', name: 'Nenhum (Branco)', header_image: '', footer_image: '' },
        ...processedData
      ]);
    } catch (err) {
      console.error('Erro ao buscar papéis timbrados:', err);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/users/templates/');
        const list = Array.isArray(response.data) ? response.data : (response.data.results || []);
        setTemplates(list);
        
        // Se estivermos editando/visualizando um contrato existente, tenta carregar o template dele
        if (contract?.extra_data?.template_id) {
          setSelectedTemplateId(String(contract.extra_data.template_id));
          const tRes = await api.get(`/users/templates/${contract.extra_data.template_id}/`);
          setCurrentTemplate(tRes.data);
        }
      } catch (err) {
        console.error('Erro ao buscar formas:', err);
      }
    };
    if (isOpen) {
      fetchTemplates();
      fetchLetterheads();

      if (contract) {
        // Inicializa dados do contrato salvo
        if (contract.extra_data) {
          setVariablesData(contract.extra_data);
          if (contract.extra_data.final_html) {
            setHtmlContent(contract.extra_data.final_html);
          }
          if (contract.extra_data.letterhead_id) {
            setSelectedLetterheadId(String(contract.extra_data.letterhead_id));
          }
        } else {
          // Fallback para campos básicos se extra_data não existir (contratos antigos)
          setVariablesData({
            contract_number: contract.contract_number || '',
            service_value: contract.service_value?.toString() || '',
            equipment_value: contract.equipment_value?.toString() || '',
            contract_date: contract.contract_date || '',
          });
        }
      } else {
        // Reset state for new contract
        setSelectedTemplateId('');
        setCurrentTemplate(null);
        setVariablesData({});
        setHtmlContent('');
        setSelectedLetterheadId('none');
      }
    }
  }, [isOpen, contract]);

  const currentLetterhead = useMemo(() => {
    return letterheadTemplates.find(t => String(t.id) === String(selectedLetterheadId)) || letterheadTemplates[0];
  }, [selectedLetterheadId, letterheadTemplates]);

  // 2. Extrai variáveis do HTML do modelo + Variáveis Fixas do Sistema
  const detectedVariables = useMemo(() => {
    const content = currentTemplate?.content?.html_content || '';
    const vars = new Set<string>();
    
    // Sempre incluímos o número do contrato como variável do sistema
    if (content || templates.length > 0) {
      vars.add('contract_number');
    }

    const matches = content.matchAll(/\{\{\s*(\w+)\s*\}\}/g);
    for (const match of matches) {
      vars.add(match[1]);
    }
    return Array.from(vars);
  }, [currentTemplate, templates]);

  // 3. Ao mudar a forma, pré-preenche variáveis conhecidas
  const handleTemplateChange = async (id: string) => {
    setSelectedTemplateId(id);
    if (!id) {
      setCurrentTemplate(null);
      setHtmlContent('');
      return;
    }

    setIsTemplateLoading(true);
    try {
      const response = await api.get(`/users/templates/${id}/`);
      const template = response.data;
      setCurrentTemplate(template);
      
      // Auto-seleciona o papel timbrado do modelo, se houver
      if (template.content?.letterhead_id) {
        setSelectedLetterheadId(String(template.content.letterhead_id));
      }

      const clientMap: Record<string, string> = {
        client_name: client?.name || '',
        client_cpf: client?.cpf || '',
        client_rg: client?.rg || '',
        client_email: client?.email || '',
        client_phone: client?.phones?.[0]?.phone || '',
        client_street: client?.street || '',
        client_city: client?.city || '',
        contract_number: contract?.contract_number || '',
        date_day: new Date().getDate().toString().padStart(2, '0'),
        date_month: new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase(),
        date_year: new Date().getFullYear().toString()
      };

      const initialData: Record<string, string> = {};
      const matches = (template.content.html_content || '').matchAll(/\{\{\s*(\w+)\s*\}\}/g);
      for (const match of matches) {
        const v = match[1];
        initialData[v] = clientMap[v] || '';
      }
      
      const newVars = { ...clientMap, ...initialData };
      setVariablesData(newVars);

      // Resolve o HTML inicial para o editor
      const resolved = (template.content.html_content || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
        return newVars[key] || `[${key.replace(/_/g, ' ')}]`;
      });
      setHtmlContent(resolved);

    } catch (err) {
      console.error('Erro ao carregar forma:', err);
    } finally {
      setIsTemplateLoading(false);
    }
  };

  // 4. Efeito para atualizar o editor quando as variáveis mudarem no painel lateral
  useEffect(() => {
    if (currentTemplate && !isViewOnly) {
       const resolved = (currentTemplate.content.html_content || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
         return variablesData[key] || `[${key.replace(/_/g, ' ')}]`;
       });
       setHtmlContent(resolved);
    }
  }, [variablesData, currentTemplate, isViewOnly]);

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
        extra_data: {
          ...variablesData,
          final_html: htmlContent,
          template_id: selectedTemplateId,
          letterhead_id: selectedLetterheadId !== 'none' ? selectedLetterheadId : null
        }
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
      // Limpeza final de spacers antes de enviar para o PDF
      const cleanHtml = htmlContent.replace(/<div[^>]*class="lexical-spacer"[^>]*>.*?<\/div>/g, '');
      
      const payload = {
        client_name: client?.name,
        html_content: cleanHtml,
        doc_title: currentTemplate?.name?.toUpperCase() || 'CONTRATO',
        letterhead_id: selectedLetterheadId !== 'none' ? selectedLetterheadId : null,
        contract_number: variablesData.contract_number
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
      <div className="bg-white w-full max-w-[98vw] h-full max-h-[98vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
        
        {/* Top Header */}
        <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white z-20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Gerar Contrato para Cliente</h2>
              <p className="text-sm text-gray-500 font-medium uppercase">Preenchimento de Modelo Jurídico</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase px-2">Modelo:</label>
              <select 
                className="bg-transparent text-sm font-bold outline-none min-w-[200px]"
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                disabled={isTemplateLoading || isViewOnly}
              >
                <option value="">Selecione um modelo...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase px-2">Papel Timbrado:</label>
              <select 
                className="bg-transparent text-sm font-bold outline-none min-w-[180px]"
                value={selectedLetterheadId}
                onChange={(e) => setSelectedLetterheadId(e.target.value)}
                disabled={isViewOnly}
              >
                {letterheadTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all">
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* PAINEL DE VARIÁVEIS (DIREITA) */}
          <div className="w-full md:w-[450px] border-r border-gray-100 bg-gray-50/50 overflow-y-auto p-8 shrink-0 order-2 md:order-1">
            <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Type size={20} />
                    </div>
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">Dados do Contrato</h3>
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
                                    className="w-full p-3.5 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm transition-all font-medium"
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

          {/* PREVIEW DO CONTRATO (ESQUERDA) - AGORA COM EDITOR */}
          <div className="flex-1 bg-zinc-100 overflow-hidden relative order-1 md:order-2 flex flex-col">
            {!currentTemplate && !htmlContent ? (
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <h1 className="text-[120px] font-black rotate-[-15deg] select-none uppercase">Aguardando</h1>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden p-4">
                  <RichTextEditor 
                    content={htmlContent}
                    onChange={setHtmlContent}
                    editable={!isViewOnly}
                    onInit={(api) => editorRef.current = api}
                    letterhead={{ 
                      header: currentLetterhead.header_image, 
                      footer: currentLetterhead.footer_image 
                    }}
                  />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex justify-end items-center gap-4 bg-white shrink-0">
          <button onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">
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
    </div>
  );
};

export default ContractOverlay;
