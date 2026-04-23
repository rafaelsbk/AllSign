import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, FileText, Upload, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { parseApiError } from '../../services/api';
import { useToast } from '../shared/ToastContext';
import { Button } from '../ui/Button';
import ContractTemplateOverlay from '../ContractTemplateOverlay';

const TemplateList = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/templates/');
      setTemplates(response.data.results || response.data);
    } catch (err) {
      console.error('Erro ao buscar templates:', err);
      showToast('Erro ao carregar modelos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setIsTemplateOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await api.post('/users/templates/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Modelo importado!', 'success');
      fetchTemplates();
      // Abre automaticamente para edição após importar
      if (response.data) {
        handleEdit(response.data);
      }
    } catch (err: any) {
      showToast(parseApiError(err, 'Erro ao importar modelo.'), 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este modelo?')) return;
    try {
      await api.delete(`/users/templates/${id}/`);
      showToast('Modelo excluído!', 'success');
      fetchTemplates();
    } catch (err) {
      showToast('Erro ao excluir modelo.', 'error');
    }
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setIsTemplateOpen(true);
  };

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">Modelos de Contrato</h1>
          <p className="text-zinc-500 font-medium">Crie e gerencie as estruturas dos seus contratos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="solar" onPress={handleNewTemplate} className="rounded-xl px-6">
            <Plus size={20} className="mr-2" />
            Novo Modelo
          </Button>
          
          <label className={`flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? <Clock size={20} className="animate-spin" /> : <Upload size={20} />}
            <span>{isUploading ? 'Processando...' : 'Importar'}</span>
            <input type="file" className="hidden" accept=".docx,.pdf" disabled={isUploading} onChange={handleFileUpload} />
          </label>
        </div>
      </motion.div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode='popLayout'>
          {templates.map((template: any) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={template.id} 
              className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 hover:shadow-2xl transition-all group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-solar-gold/10 rounded-2xl text-solar-gold group-hover:scale-110 transition-transform duration-500">
                  <FileText size={32} />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onPress={() => handleEdit(template)} className="rounded-xl text-zinc-400 hover:text-solar-blue hover:bg-blue-50">
                    <Edit size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onPress={() => handleDelete(template.id)} className="rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">{template.name}</h3>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">{template.category || 'Geral'}</p>
              <div className="flex items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest pt-6 border-t border-zinc-50">
                <span>Criado em: {new Date(template.created_at || Date.now()).toLocaleDateString('pt-BR')}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {!loading && templates.length === 0 && (
        <div className="py-32 text-center bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-100">
          <p className="text-zinc-400 font-bold uppercase tracking-widest">Nenhum modelo encontrado.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-solar-blue/20 border-t-solar-blue rounded-full animate-spin" />
        </div>
      )}

      {isTemplateOpen && (
        <ContractTemplateOverlay 
          isOpen={isTemplateOpen}
          onClose={() => setIsTemplateOpen(false)}
          initialData={editingTemplate}
          onSuccess={() => {
            showToast(editingTemplate ? 'Modelo atualizado!' : 'Modelo criado!', 'success');
            fetchTemplates();
          }}
        />
      )}
    </div>
  );
};

export default TemplateList;
