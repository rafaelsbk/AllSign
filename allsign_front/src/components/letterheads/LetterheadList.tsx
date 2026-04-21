import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, FileType } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { useToast } from '../shared/ToastContext';
import LetterheadForm from './LetterheadForm';

const LetterheadList = () => {
  const [letterheads, setLetterheads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLetterhead, setEditingLetterhead] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const { showToast } = useToast();

  const fetchLetterheads = async () => {
    setLoading(true);
    try {
      const response = await api.get('users/letterheads/', {
        params: searchTerm ? { search: searchTerm } : {}
      });
      
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        data = response.data.results;
      }

      // Garantir que as imagens tenham URL completa se forem caminhos relativos
      const processedData = data.map((lh: any) => {
        const getFullUrl = (path: string) => {
          if (!path) return '';
          if (path.startsWith('http')) return path;
          const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
          // Se o caminho não começar com /media, mas for um caminho relativo do Django, adicionamos
          const normalizedPath = path.startsWith('/') ? path : `/${path}`;
          return `${baseUrl}${normalizedPath}`;
        };

        return {
          ...lh,
          header_image: getFullUrl(lh.header_image),
          footer_image: getFullUrl(lh.footer_image),
          header_margin_percent: lh.header_margin_percent || 2.0,
          footer_margin_percent: lh.footer_margin_percent || 2.0,
        };
      });

      setLetterheads(processedData);
    } catch (err) {
      console.error('Erro ao buscar papéis timbrados', err);
      showToast('Erro ao carregar papéis timbrados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetterheads();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLetterheads();
  };

  const handleEdit = (lh: any) => {
    setEditingLetterhead(lh);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (lh: any) => {
    setEditingLetterhead(lh);
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este papel timbrado?')) {
      try {
        await api.delete(`/users/letterheads/${id}/`);
        fetchLetterheads();
        showToast('Papel timbrado excluído com sucesso!', 'success');
      } catch (err) {
        showToast('Erro ao excluir papel timbrado.', 'error');
      }
    }
  };

  const openCreateModal = () => {
    setEditingLetterhead(null);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    const message = editingLetterhead ? 'Papel timbrado atualizado com sucesso!' : 'Papel timbrado cadastrado com sucesso!';
    showToast(message, 'success');
    fetchLetterheads();
  };

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Papéis Timbrados</h1>
          <p className="text-zinc-500 font-medium mt-1">Configure a identidade visual das suas folhas de contrato</p>
        </div>
      </div>

      <div className="mb-10">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-solar-orange transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome..." 
              className="w-full pl-12 pr-4 h-14 rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-4 focus:ring-solar-orange/10 focus:border-solar-orange transition-all font-medium" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button type="submit" variant="solar" className="h-14 px-10 rounded-2xl shadow-solar shadow-lg font-bold text-base hover:scale-[1.02] active:scale-[0.98]">
            Filtrar Templates
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-4 border-solar-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Carregando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {letterheads.map((lh: any, index: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
              key={lh.id} 
              className="group relative rounded-[2.5rem] bg-white p-8 shadow-sm hover:shadow-2xl hover:shadow-solar-orange/5 transition-all duration-500 border border-zinc-100"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6 group-hover:bg-solar-orange/10 group-hover:text-solar-orange transition-colors duration-500">
                    <FileType size={28} className="opacity-60" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 truncate leading-tight mb-2" title={lh.name}>
                    {lh.name}
                  </h3>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase">Header OK</div>
                    <div className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase">Footer OK</div>
                  </div>
                </div>
                
                {/* Image Previews */}
                <div className="grid grid-cols-2 gap-2 mb-6 opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
                   <div className="aspect-[3/1] bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100">
                      <img src={lh.header_image} className="w-full h-full object-contain" alt="Header" />
                   </div>
                   <div className="aspect-[3/1] bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100">
                      <img src={lh.footer_image} className="w-full h-full object-contain" alt="Footer" />
                   </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-zinc-50">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleView(lh)} 
                      className="p-3 text-zinc-400 hover:text-solar-blue hover:bg-solar-blue/5 rounded-xl transition-all" 
                      title="Visualizar"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={() => handleEdit(lh)} 
                      className="p-3 text-zinc-400 hover:text-solar-orange hover:bg-solar-orange/5 rounded-xl transition-all" 
                      title="Editar"
                    >
                      <Edit size={20} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(lh.id)} 
                    className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                    title="Excluir"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && letterheads.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-zinc-200">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-50 mb-6">
            <FileType size={32} className="text-zinc-300" />
          </div>
          <p className="text-zinc-500 font-bold text-lg">Nenhum papel timbrado encontrado.</p>
        </div>
      )}

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 md:left-[calc(50%+144px)]">
        <Button 
          variant="solar" 
          size="lg" 
          onPress={openCreateModal} 
          className="rounded-[2rem] shadow-[0_20px_40px_rgba(243,146,0,0.3)] h-16 px-10 hover:scale-105 transition-all duration-300 group"
        >
           <Plus size={24} className="mr-3 group-hover:rotate-90 transition-transform duration-300" /> 
           <span className="text-lg">Novo Papel Timbrado</span>
        </Button>
      </div>

      <LetterheadForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        letterhead={editingLetterhead} 
        onSuccess={handleFormSuccess} 
        isViewOnly={isViewOnly} 
      />
    </div>
  );
};

export default LetterheadList;
