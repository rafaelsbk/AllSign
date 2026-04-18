import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, FileDown, Info, Edit3 } from 'lucide-react';
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
  const [error, setError] = useState('');

  // 1. Busca todos os modelos (formas) disponíveis
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

  // Efeito para carregar dados do contrato quando em modo edição
  useEffect(() => {
    if (isOpen && contract) {
      // Se estamos editando, preenchemos os dados
      setVariablesData({
        contract_number: contract.contract_number || '',
        service_value: contract.service_value?.toString() || '',
        service_value_extenso: contract.service_value_extenso || '',
        equipment_value: contract.equipment_value?.toString() || '',
        equipment_value_extenso: contract.equipment_value_extenso || '',
        validity: contract.validity || '12 (DOZE) MESES',
        inverter_brand: contract.inverter_brand || '',
        inverter_quantity: contract.inverter_quantity?.toString() || '',
        inverter_k: contract.inverter_k || '',
        inverter_warranty: contract.inverter_warranty || '10',
        panels_brand: contract.panels_brand || '',
        panels_quantity: contract.panels_quantity?.toString() || '',
        panels_watts: contract.panels_watts || '',
        panels_warranty: contract.panels_warranty || '25',
        due_date: contract.due_date || '',
        payment_method: contract.payment_method || '',
        beneficiary_units: contract.beneficiary_units || '',
        contract_date: contract.contract_date || new Date().toISOString().split('T')[0],
        // Adicionar mapeamento de variáveis extras se houver
        ...contract.extra_data // assumindo que pode haver dados extras
      });
    }
  }, [isOpen, contract]);

  // 2. Extrai todas as variáveis únicas da forma selecionada {{variavel}}
  const detectedVariables = useMemo(() => {
    if (!currentTemplate?.content?.sections) return [];
    const vars = new Set<string>();
    const jsonString = JSON.stringify(currentTemplate.content.sections);
    const matches = jsonString.matchAll(/\{\{\s*(\w+)\s*\}\}/g);
    for (const match of matches) {
      vars.add(match[1]);
    }
    return Array.from(vars);
  }, [currentTemplate]);

  // 3. Ao mudar a forma, tenta pré-preencher variáveis com dados do cliente
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

      // Mapeamento inteligente de dados conhecidos do cliente para as variáveis da forma
      const clientMap: Record<string, string> = {
        client_name: client?.name || '',
        client_cpf: client?.cpf || '',
        client_rg: client?.rg || '',
        client_email: client?.email || '',
        client_phone: client?.phones?.[0]?.phone || '',
        client_street: client?.street || '',
        client_number: client?.number || '',
        client_city: client?.city || '',
        client_neighborhood: client?.neighborhood || '',
        client_cep: client?.cep || '',
        date_day: new Date().getDate().toString().padStart(2, '0'),
        date_month: new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase(),
        date_year: new Date().getFullYear().toString()
      };

      const initialData: Record<string, string> = {};
      const vars = new Set<string>();
      const jsonString = JSON.stringify(template.content.sections);
      const matches = jsonString.matchAll(/\{\{\s*(\w+)\s*\}\}/g);
      
      for (const match of matches) {
        const v = match[1];
        initialData[v] = clientMap[v] || '';
      }
      setVariablesData(initialData);

    } catch (err) {
      console.error('Erro ao carregar forma:', err);
    } finally {
      setIsTemplateLoading(false);
    }
  };

  // 4. Resolve variáveis para o preview visual
  const resolve = (text: string) => {
    if (!text) return '';
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      return variablesData[key] || `<span class="text-blue-500 font-bold underline bg-blue-50 px-1 rounded">[${key}]</span>`;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;
    
    setLoading(true);
    setError('');

    const parseNumber = (val: string) => {
      if (!val) return 0;
      // Converte "1.234,56" ou similar para float
      const cleaned = val.replace(/[^\d,]/g, '').replace(',', '.');
      return parseFloat(cleaned) || 0;
    };

    const payload = {
      client: client.id,
      contract_number: variablesData.contract_number || 'S/N',
      service_value: parseNumber(variablesData.service_value),
      service_value_extenso: variablesData.service_value_extenso || '',
      equipment_value: parseNumber(variablesData.equipment_value),
      equipment_value_extenso: variablesData.equipment_value_extenso || '',
      validity: variablesData.validity || '12 (DOZE) MESES',
      inverter_brand: variablesData.inverter_brand || '',
      inverter_quantity: parseInt(variablesData.inverter_quantity) || 0,
      inverter_k: variablesData.inverter_k || '',
      inverter_warranty: variablesData.inverter_warranty || '10',
      panels_brand: variablesData.panels_brand || '',
      panels_quantity: parseInt(variablesData.panels_quantity) || 0,
      panels_watts: variablesData.panels_watts || '',
      panels_warranty: variablesData.panels_warranty || '25',
      due_date: variablesData.due_date || '',
      payment_method: variablesData.payment_method || '',
      beneficiary_units: variablesData.beneficiary_units || '',
      contract_date: variablesData.contract_date || new Date().toISOString().split('T')[0],
      // Também guardamos os dados extras para persistência de variáveis customizadas
      extra_data: variablesData 
    };

    try {
      if (contract?.id) {
        await api.put(`/users/contracts/${contract.id}/`, payload);
      } else {
        await api.post('/users/contracts/', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar contrato:', err);
      setError('Erro ao salvar contrato. Verifique os campos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      // Enviamos as seções da forma já com as variáveis resolvidas para o PDF
      const payload = {
        client_name: client?.name,
        sections: JSON.parse(JSON.stringify(currentTemplate.content.sections).replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => variablesData[key] || '_______')),
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
      console.error('Erro PDF:', err);
      alert('Falha ao gerar PDF.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-0 md:p-6 md:pl-72 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-[95vw] h-full max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
        
        {/* Header Dinâmico */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Edit3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">Gerar Contrato Dinâmico</h2>
              <p className="text-sm text-gray-500 font-medium">Cliente: <span className="text-blue-600 uppercase font-bold">{client.name}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 p-2 rounded-xl border border-gray-100 dark:border-zinc-700">
              <label className="text-[10px] font-bold text-gray-400 uppercase px-2">Escolha a Forma:</label>
              <select 
                className="bg-transparent text-sm font-bold outline-none dark:text-white min-w-[250px]"
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                disabled={isTemplateLoading || isViewOnly}
              >
                <option value="">Selecione um modelo jurídico...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-full transition-all">
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* PAINEL DE VARIÁVEIS (ESQUERDA) */}
          <div className="w-full md:w-[400px] border-r border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 overflow-y-auto p-8 shrink-0">
            {!currentTemplate ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-full shadow-inner border border-gray-100 dark:border-zinc-800">
                  <Info size={40} className="opacity-20" />
                </div>
                <p className="text-sm font-medium">Selecione uma forma de contrato <br/> para começar o preenchimento.</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Campos da Forma Jurídica</h3>
                  <div className="space-y-5">
                    {detectedVariables.map((v) => (
                      <div key={v} className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                          {v.replace(/_/g, ' ')}
                        </label>
                        <input 
                          type="text"
                          disabled={isViewOnly}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                          value={variablesData[v] || ''}
                          onChange={(e) => setVariablesData({...variablesData, [v]: e.target.value})}
                          placeholder={`Digite o(a) ${v.replace(/_/g, ' ')}...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PREVIEW DO CONTRATO (DIREITA) */}
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-y-auto p-4 md:p-12 relative">
            {!currentTemplate ? (
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <h1 className="text-9xl font-black rotate-[-15deg] select-none">PREVIEW</h1>
              </div>
            ) : (
              <div className="bg-white text-zinc-900 p-10 md:p-24 shadow-2xl rounded-sm font-serif leading-relaxed text-[14px] mx-auto max-w-[210mm] min-h-[297mm] animate-in zoom-in-95 duration-500">
                <div className="space-y-8">
                  {currentTemplate.content.sections.map((section: any) => (
                    <section key={section.id} className={section.mb ? 'mb-10' : ''}>
                      {section.title && (
                        <h2 className={`font-bold mb-6 uppercase ${section.underline ? 'underline' : ''} text-[15px]`}>
                          {section.title}
                        </h2>
                      )}
                      <div className="space-y-4 text-justify">
                        {section.blocks.map((block: any, bIdx: number) => {
                          if (block.type === 'text' || block.type === 'text_highlight') {
                            return <p key={bIdx} className={`${block.type === 'text_highlight' ? 'font-bold uppercase mt-8' : ''} ${block.mt ? 'mt-4' : ''}`} dangerouslySetInnerHTML={{ __html: resolve(block.content) }} />;
                          }
                          if (block.type === 'list_alpha') {
                            return (
                              <div key={bIdx} className="ml-8 space-y-2">
                                {block.items.map((item: string, iIdx: number) => (
                                  <p key={iIdx} className="flex gap-2">
                                    <span className="font-bold">{String.fromCharCode(97 + iIdx)})</span>
                                    <span dangerouslySetInnerHTML={{ __html: resolve(item) }} />
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          if (block.type === 'structured_table') {
                            return (
                              <div key={bIdx} className="border-2 border-zinc-900 my-8 overflow-hidden">
                                <table className="w-full border-collapse">
                                  <tbody>
                                    {block.rows.map((row: any, rIdx: number) => (
                                      <tr key={rIdx} className="border-b-2 border-zinc-900 last:border-0">
                                        <td className="w-1/2 p-4 border-r-2 border-zinc-900 font-bold uppercase bg-zinc-50 text-[12px]">{row.label}</td>
                                        <td className={`p-4 text-[12px] ${row.bold_value ? 'font-bold' : ''}`} dangerouslySetInnerHTML={{ __html: resolve(row.value) }} />
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }
                          if (block.type === 'signatures') {
                            return (
                              <div key={bIdx} className="mt-24 space-y-20">
                                <p className="text-center font-bold uppercase tracking-widest">{resolve(block.date_text)}</p>
                                <div className="grid grid-cols-2 gap-12">
                                  <div className="text-center border-t-2 border-zinc-900 pt-4">
                                    <p className="font-bold uppercase text-[13px]">{resolve(block.party_1_name)}</p>
                                    <p className="text-[10px] text-zinc-500 font-sans mt-1">{block.party_1_role}</p>
                                  </div>
                                  <div className="text-center border-t-2 border-zinc-900 pt-4">
                                    <p className="font-bold uppercase text-[13px]">{resolve(block.party_2_name)}</p>
                                    <p className="text-[10px] text-zinc-500 font-sans mt-1">{block.party_2_role}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end items-center gap-4 bg-white dark:bg-zinc-900 shrink-0">
          <div className="flex-1 hidden md:block">
            {currentTemplate && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl text-xs font-bold w-fit border border-amber-100 dark:border-amber-800/50">
                <Info size={16} />
                <span>Formulário gerado automaticamente com {detectedVariables.length} variáveis detectadas.</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleGeneratePDF}
            disabled={!currentTemplate || loading}
            className="flex items-center gap-3 px-10 py-3 rounded-2xl bg-zinc-800 text-white font-bold hover:bg-zinc-950 transition-all shadow-xl shadow-zinc-500/20 disabled:opacity-50"
          >
            <FileDown size={20} />
            <span>Gerar PDF Oficial</span>
          </button>
          {!isViewOnly && (
            <button 
              onClick={handleSave}
              disabled={!currentTemplate || loading}
              className="flex items-center gap-3 px-12 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50"
            >
              <Save size={20} />
              <span>Finalizar Contrato</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractOverlay;
