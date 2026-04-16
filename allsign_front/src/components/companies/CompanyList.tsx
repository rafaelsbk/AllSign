import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { useToast } from '../shared/ToastContext';
import CompanyForm from './CompanyForm';

const CompanyList = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const { showToast } = useToast();

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/companies/', {
        params: searchTerm ? { search: searchTerm } : {}
      });
      const data = Array.isArray(response.data) ? response.data : response.data.results;
      setCompanies(data || []);
    } catch (err) {
      console.error('Erro ao buscar empresas', err);
      showToast('Erro ao carregar empresas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies();
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (company: any) => {
    setEditingCompany(company);
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await api.delete(`/users/companies/${id}/`);
        fetchCompanies();
        showToast('Empresa excluída com sucesso!', 'success');
      } catch (err) {
        showToast('Erro ao excluir empresa.', 'error');
      }
    }
  };

  const openCreateModal = () => {
    setEditingCompany(null);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    const message = editingCompany ? 'Empresa atualizada com sucesso!' : 'Empresa cadastrada com sucesso!';
    showToast(message, 'success');
    fetchCompanies();
  };

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Empresas</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Gerencie as empresas parceiras e fornecedores</p>
        </div>
      </div>

      <div className="mb-10">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-solar-orange transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por razão social ou CNPJ..." 
              className="w-full pl-12 pr-4 h-14 rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-4 focus:ring-solar-orange/10 focus:border-solar-orange dark:bg-zinc-900 dark:border-zinc-800 dark:text-white transition-all font-medium" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button type="submit" variant="solar" className="h-14 px-10 rounded-2xl shadow-solar shadow-lg font-bold text-base hover:scale-[1.02] active:scale-[0.98]">
            Filtrar Empresas
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
          {companies.map((company: any, index: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
              key={company.id} 
              className="group relative rounded-[2.5rem] bg-white dark:bg-zinc-900 p-8 shadow-sm hover:shadow-2xl hover:shadow-solar-orange/5 transition-all duration-500 border border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-solar-orange/10 group-hover:text-solar-orange transition-colors duration-500">
                    <Building2 size={28} className="opacity-60" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white truncate leading-tight mb-2" title={company.trading_name}>
                    {company.trading_name}
                  </h3>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    CNPJ: <span className="text-zinc-600 dark:text-zinc-400">{company.cnpj}</span>
                  </p>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleView(company)} 
                      className="p-3 text-zinc-400 hover:text-solar-blue hover:bg-solar-blue/5 rounded-xl transition-all" 
                      title="Visualizar"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={() => handleEdit(company)} 
                      className="p-3 text-zinc-400 hover:text-solar-orange hover:bg-solar-orange/5 rounded-xl transition-all" 
                      title="Editar"
                    >
                      <Edit size={20} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(company.id)} 
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

      {!loading && companies.length === 0 && (
        <div className="py-24 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-800 mb-6">
            <Building2 size={32} className="text-zinc-300" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg">Nenhuma empresa encontrada.</p>
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
           <span className="text-lg">Nova Empresa</span>
        </Button>
      </div>

      <CompanyForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} company={editingCompany} onSuccess={handleFormSuccess} isViewOnly={isViewOnly} />
    </div>
  );
};

export default CompanyList;
