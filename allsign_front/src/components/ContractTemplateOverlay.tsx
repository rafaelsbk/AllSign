import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Info, Type, Table, List, GripVertical, FileText } from 'lucide-react';
import api from '../services/api';

type BlockType = 'text' | 'structured_table' | 'list_alpha' | 'signatures' | 'text_highlight';

interface Block {
  type: BlockType;
  content?: string;
  items?: string[];
  rows?: { label: string; value: string; bold_value?: boolean }[];
  date_text?: string;
  party_1_name?: string;
  party_1_doc?: string;
  party_1_role?: string;
  party_2_name?: string;
  party_2_doc?: string;
  party_2_role?: string;
  witnesses?: boolean;
  mt?: boolean;
}

interface Section {
  id: string;
  title: string;
  mb: boolean;
  underline: boolean;
  page_break_before: boolean;
  blocks: Block[];
}

interface ContractTemplateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ContractTemplateOverlay: React.FC<ContractTemplateOverlayProps> = ({ isOpen, onClose, onSuccess }) => {
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('Geral');
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const addSection = () => {
    const newSection: Section = {
      id: `sec_${Date.now()}`,
      title: 'Nova Seção',
      mb: true,
      underline: false,
      page_break_before: false,
      blocks: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const addBlock = (sectionId: string, type: BlockType) => {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s;
      
      let newBlock: Block = { type };
      if (type === 'text' || type === 'text_highlight') newBlock.content = '';
      if (type === 'list_alpha') newBlock.items = [''];
      if (type === 'structured_table') newBlock.rows = [{ label: '', value: '' }];
      if (type === 'signatures') {
        newBlock.date_text = 'NATAL/RN, {{ date_day }} DE {{ date_month }} DE {{ date_year }}.';
        newBlock.party_1_name = '{{ client_name }}';
        newBlock.party_1_role = 'CONTRATANTE';
        newBlock.party_2_name = 'SOLAR SOL ENERGIA RENOVÁVEIS LTDA';
        newBlock.party_2_role = 'CONTRATADA';
      }

      return { ...s, blocks: [...s.blocks, newBlock] };
    }));
  };

  const removeBlock = (sectionId: string, blockIndex: number) => {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, blocks: s.blocks.filter((_, i) => i !== blockIndex) };
    }));
  };

  const updateSection = (sectionId: string, field: keyof Section, value: any) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s));
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
        content: { sections }
      };
      await api.post('/users/templates/', payload);
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col h-full max-h-[95vh]">
        
        {/* Header Profissional */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 rounded-t-2xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">Arquiteto de Modelos V2</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Construtor Profissional por Blocos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30 dark:bg-zinc-950/20">
          
          {/* Top Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="space-y-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <label className="text-xs font-bold text-gray-400 uppercase">Nome do Modelo de Contrato</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                placeholder="Ex: Contrato de Prestação de Serviço Solar V2"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <label className="text-xs font-bold text-gray-400 uppercase">Categoria / Ramo</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Energia Solar / Jurídico / RH"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-12">
            {sections.map((section, sIdx) => (
              <div key={section.id} className="relative group animate-in slide-in-from-bottom-4 duration-500">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Section Header Control */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-md">
                      {sIdx + 1}
                    </span>
                    <input 
                      type="text"
                      className="bg-transparent text-xl font-bold dark:text-white outline-none border-b border-transparent focus:border-blue-500 px-1"
                      value={section.title}
                      onChange={e => updateSection(section.id, 'title', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <button 
                      onClick={() => updateSection(section.id, 'underline', !section.underline)}
                      className={`p-2 rounded-lg text-xs font-bold transition-all ${section.underline ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                    >U</button>
                    <button 
                      onClick={() => updateSection(section.id, 'page_break_before', !section.page_break_before)}
                      className={`p-2 rounded-lg text-xs font-bold transition-all ${section.page_break_before ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:bg-gray-50'}`}
                    >QUEBRA DE PÁGINA</button>
                    <div className="w-px h-6 bg-gray-100 dark:bg-zinc-800 mx-1"></div>
                    <button 
                      onClick={() => removeSection(section.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    ><Trash2 size={18} /></button>
                  </div>
                </div>

                {/* Blocks Container */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-6">
                    {section.blocks.map((block, bIdx) => (
                      <div key={bIdx} className="relative pl-8 border-l-2 border-gray-50 dark:border-zinc-800 pb-6 last:pb-0">
                        <button 
                          onClick={() => removeBlock(section.id, bIdx)}
                          className="absolute -left-[11px] top-0 bg-white dark:bg-zinc-900 p-1 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>

                        {/* Block Editors baseados no Tipo */}
                        {block.type === 'text' || block.type === 'text_highlight' ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-blue-500 uppercase">{block.type === 'text' ? 'Parágrafo Simples' : 'Cláusula Destacada'}</span>
                            </div>
                            <textarea 
                              className="w-full p-4 rounded-xl bg-gray-50 dark:bg-zinc-950 dark:text-white text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/20 border border-transparent min-h-[100px]"
                              placeholder="Digite o texto aqui... Use {{ }} para variáveis."
                              value={block.content}
                              onChange={e => {
                                const newBlocks = [...section.blocks];
                                newBlocks[bIdx].content = e.target.value;
                                updateSection(section.id, 'blocks', newBlocks);
                              }}
                            />
                          </div>
                        ) : block.type === 'list_alpha' ? (
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-green-500 uppercase">Lista de Alíneas (a, b, c...)</span>
                            {block.items?.map((item, iIdx) => (
                              <div key={iIdx} className="flex gap-2">
                                <span className="text-gray-400 font-mono mt-2">{String.fromCharCode(97 + iIdx)})</span>
                                <input 
                                  className="flex-1 p-2 bg-gray-50 dark:bg-zinc-950 dark:text-white text-sm rounded-lg outline-none"
                                  value={item}
                                  onChange={e => {
                                    const newBlocks = [...section.blocks];
                                    newBlocks[bIdx].items![iIdx] = e.target.value;
                                    updateSection(section.id, 'blocks', newBlocks);
                                  }}
                                />
                                <button 
                                  onClick={() => {
                                    const newBlocks = [...section.blocks];
                                    newBlocks[bIdx].items = block.items?.filter((_, i) => i !== iIdx);
                                    updateSection(section.id, 'blocks', newBlocks);
                                  }}
                                  className="p-2 text-gray-300 hover:text-red-500"
                                ><X size={14} /></button>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newBlocks = [...section.blocks];
                                newBlocks[bIdx].items = [...(block.items || []), ''];
                                updateSection(section.id, 'blocks', newBlocks);
                              }}
                              className="text-xs font-bold text-green-600 flex items-center gap-1 hover:underline ml-6"
                            ><Plus size={14} /> Adicionar Item</button>
                          </div>
                        ) : block.type === 'structured_table' ? (
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-purple-500 uppercase">Tabela / Quadro Resumo</span>
                            <div className="grid grid-cols-1 gap-2">
                              {block.rows?.map((row, rIdx) => (
                                <div key={rIdx} className="flex gap-2 items-center bg-gray-50 dark:bg-zinc-950 p-2 rounded-xl">
                                  <input 
                                    className="w-1/3 p-2 bg-white dark:bg-zinc-900 rounded-lg text-xs font-bold uppercase outline-none" 
                                    placeholder="Rótulo (ex: VALOR)" 
                                    value={row.label}
                                    onChange={e => {
                                      const newBlocks = [...section.blocks];
                                      newBlocks[bIdx].rows![rIdx].label = e.target.value;
                                      updateSection(section.id, 'blocks', newBlocks);
                                    }}
                                  />
                                  <input 
                                    className="flex-1 p-2 bg-white dark:bg-zinc-900 rounded-lg text-xs outline-none" 
                                    placeholder="Valor ou {{ variavel }}" 
                                    value={row.value}
                                    onChange={e => {
                                      const newBlocks = [...section.blocks];
                                      newBlocks[bIdx].rows![rIdx].value = e.target.value;
                                      updateSection(section.id, 'blocks', newBlocks);
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      const newBlocks = [...section.blocks];
                                      newBlocks[bIdx].rows = block.rows?.filter((_, i) => i !== rIdx);
                                      updateSection(section.id, 'blocks', newBlocks);
                                    }}
                                    className="p-2 text-gray-300 hover:text-red-500"
                                  ><X size={14} /></button>
                                </div>
                              ))}
                            </div>
                            <button 
                              onClick={() => {
                                const newBlocks = [...section.blocks];
                                newBlocks[bIdx].rows = [...(block.rows || []), { label: '', value: '' }];
                                updateSection(section.id, 'blocks', newBlocks);
                              }}
                              className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:underline"
                            ><Plus size={14} /> Adicionar Linha</button>
                          </div>
                        ) : block.type === 'signatures' && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                            <span className="text-[10px] font-bold text-blue-600 uppercase">Bloco de Assinaturas Ativo</span>
                            <p className="text-xs text-blue-500 mt-1">Este bloco gera automaticamente o grid de assinaturas para Contratante e Contratada com as testemunhas.</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {section.blocks.length === 0 && (
                      <div className="py-8 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-xl">
                        <Info size={24} className="mb-2 opacity-50" />
                        <p className="text-sm">Esta seção está vazia. Adicione um bloco abaixo.</p>
                      </div>
                    )}
                  </div>

                  {/* Add Block Toolbar */}
                  <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 flex flex-wrap gap-2 border-t border-gray-100 dark:border-zinc-800">
                    <button 
                      onClick={() => addBlock(section.id, 'text')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-[11px] font-bold hover:shadow-md transition-all hover:-translate-y-0.5 dark:text-white"
                    >
                      <Type size={14} className="text-blue-500" /> PARÁGRAFO
                    </button>
                    <button 
                      onClick={() => addBlock(section.id, 'text_highlight')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-[11px] font-bold hover:shadow-md transition-all hover:-translate-y-0.5 dark:text-white"
                    >
                      <FileText size={14} className="text-amber-500" /> TÍTULO CLÁUSULA
                    </button>
                    <button 
                      onClick={() => addBlock(section.id, 'list_alpha')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-[11px] font-bold hover:shadow-md transition-all hover:-translate-y-0.5 dark:text-white"
                    >
                      <List size={14} className="text-green-500" /> LISTA (A,B,C)
                    </button>
                    <button 
                      onClick={() => addBlock(section.id, 'structured_table')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-[11px] font-bold hover:shadow-md transition-all hover:-translate-y-0.5 dark:text-white"
                    >
                      <Table size={14} className="text-purple-500" /> QUADRO RESUMO
                    </button>
                    <button 
                      onClick={() => addBlock(section.id, 'signatures')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-[11px] font-bold hover:shadow-md transition-all hover:-translate-y-0.5 dark:text-white"
                    >
                      <Plus size={14} className="text-zinc-500" /> ASSINATURAS
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={addSection}
              className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
            >
              <div className="p-3 rounded-full bg-gray-100 dark:bg-zinc-800 group-hover:bg-blue-100 transition-colors">
                <Plus size={24} />
              </div>
              <span className="font-bold text-sm">Adicionar Nova Seção ao Contrato</span>
            </button>
          </div>
        </div>

        {/* Footer Profissional */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 rounded-b-2xl shadow-inner">
          <div className="hidden md:flex items-center gap-3 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-5 py-3 rounded-2xl text-xs font-bold border border-amber-100 dark:border-amber-800/50">
            <Info size={20} />
            <div className="flex flex-col">
              <span>Modo Estruturado Ativo</span>
              <span className="opacity-70 font-normal">Use {"{{ }}"} para campos dinâmicos como nome do cliente.</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              Descartar
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-12 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-500/30 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : <><Save size={20} /> Salvar Modelo V2</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTemplateOverlay;
