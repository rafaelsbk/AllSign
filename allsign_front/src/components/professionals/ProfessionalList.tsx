import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { useToast } from '../shared/ToastContext';
import ProfessionalForm from './ProfessionalForm';

const ProfessionalList = () => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const { showToast } = useToast();

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/professionals/', {
        params: searchTerm ? { search: searchTerm } : {}
      });
      const data = Array.isArray(response.data) ? response.data : response.data.results;
      setProfessionals(data || []);
    } catch (err) {
      console.error('Erro ao buscar profissionais', err);
      showToast('Erro ao carregar profissionais.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfessionals();
  };

  const handleEdit = (prof: any) => {
    setEditingProfessional(prof);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (prof: any) => {
    setEditingProfessional(prof);
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
      try {
        await api.delete(`/users/professionals/${id}/`);
        fetchProfessionals();
        showToast('Profissional excluído com sucesso!', 'success');
      } catch (err) {
        showToast('Erro ao excluir profissional.', 'error');
      }
    }
  };

  const openCreateModal = () => {
    setEditingProfessional(null);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    const message = editingProfessional ? 'Profissional atualizado com sucesso!' : 'Profissional cadastrado com sucesso!';
    showToast(message, 'success');
    fetchProfessionals();
  };

  const getProfessionLabel = (p: string) => {
    return p === 'ENGINEER' ? 'Engenheiro (a)' : 'Arquiteto (a)';
  };

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Engenheiros e Arquitetos</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Gerencie os profissionais técnicos responsáveis</p>
        </div>
      </div>

      <div className="mb-10">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-solar-orange transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou CREA/CAU..." 
              className="w-full pl-12 pr-4 h-14 rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-4 focus:ring-solar-orange/10 focus:border-solar-orange dark:bg-zinc-900 dark:border-zinc-800 dark:text-white transition-all font-medium" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button type="submit" variant="solar" className="h-14 px-10 rounded-2xl shadow-solar shadow-lg font-bold text-base hover:scale-[1.02] active:scale-[0.98]">
            Filtrar Profissionais
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
          {professionals.map((prof: any, index: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
              key={prof.id} 
              className="group relative rounded-[2.5rem] bg-white dark:bg-zinc-900 p-8 shadow-sm hover:shadow-2xl hover:shadow-solar-orange/5 transition-all duration-500 border border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-solar-orange/10 group-hover:text-solar-orange transition-colors duration-500">
                    <UserCheck size={28} className="opacity-60" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white truncate leading-tight mb-2" title={prof.name}>
                    {prof.name}
                  </h3>
                  <p className="text-sm font-bold text-solar-orange uppercase tracking-wider mb-2">
                    {getProfessionLabel(prof.profession)}
                  </p>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    CREA/CAU: <span className="text-zinc-600 dark:text-zinc-400">{prof.crea_number}</span>
                  </p>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleView(prof)} 
                      className="p-3 text-zinc-400 hover:text-solar-blue hover:bg-solar-blue/5 rounded-xl transition-all" 
                      title="Visualizar"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={() => handleEdit(prof)} 
                      className="p-3 text-zinc-400 hover:text-solar-orange hover:bg-solar-orange/5 rounded-xl transition-all" 
                      title="Editar"
                    >
                      <Edit size={20} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(prof.id)} 
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

      {!loading && professionals.length === 0 && (
        <div className="py-24 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-800 mb-6">
            <UserCheck size={32} className="text-zinc-300" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg">Nenhum profissional encontrado.</p>
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
           <span className="text-lg">Novo Profissional</span>
        </Button>
      </div>

      <ProfessionalForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        professional={editingProfessional} 
        onSuccess={handleFormSuccess} 
        isViewOnly={isViewOnly} 
      />
    </div>
  );
};

export default ProfessionalList;
