import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Eye, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { useToast } from '../shared/ToastContext';
import ClientForm from './ClientForm';
import ContractOverlay from '../ContractOverlay';

// Função para pegar o role do usuário do token
const getUserRole = () => {
  const token = localStorage.getItem('access_token');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const ClientList = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [contractClient, setContractClient] = useState<any>(null);
  
  const { showToast } = useToast();
  const userRole = getUserRole();

  const fetchClients = async (pageNum: number, isNewSearch: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.get('/users/clients/', {
        params: { search: searchTerm, only_mine: onlyMine, page: pageNum }
      });
      const newClients = response.data.results;
      if (isNewSearch) {
        setClients(newClients);
      } else {
        setClients(prev => [...prev, ...newClients]);
      }
      setHasMore(!!response.data.next);
      setPage(pageNum);
    } catch (err) {
      console.error('Erro ao buscar clientes', err);
      showToast('Erro ao carregar clientes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1, true);
  }, [onlyMine]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(1, true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && hasMore && !loading) {
        fetchClients(page + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, loading]);

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (client: any) => {
    setEditingClient(client);
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/users/clients/${id}/`);
        fetchClients(1, true);
        showToast('Cliente excluído com sucesso!', 'success');
      } catch (err) {
        showToast('Erro ao excluir cliente. Verifique suas permissões.', 'error');
      }
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    const message = editingClient ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!';
    showToast(message, 'success');
    fetchClients(1, true);
  };

  const handleOpenContract = (client: any) => {
    setContractClient(client);
    setIsContractOpen(true);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Clientes</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Gerencie sua base de clientes e prospectos</p>
        </div>
        <div className="flex items-center space-x-6 bg-white dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <label className="flex items-center space-x-3 text-sm font-bold text-zinc-600 dark:text-zinc-300 cursor-pointer group">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={onlyMine} 
                onChange={(e) => setOnlyMine(e.target.checked)} 
                className="peer sr-only" 
              />
              <div className="w-10 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full peer-checked:bg-solar-orange transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
            </div>
            <span>Apenas meus cadastros</span>
          </label>
        </div>
      </div>

      <div className="mb-10">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-solar-orange transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, CPF ou e-mail..." 
              className="w-full pl-12 pr-4 h-14 rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-4 focus:ring-solar-orange/10 focus:border-solar-orange dark:bg-zinc-900 dark:border-zinc-800 dark:text-white transition-all font-medium" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button type="submit" variant="solar" className="h-14 px-10 rounded-2xl shadow-solar shadow-lg font-bold text-base hover:scale-[1.02] active:scale-[0.98]">
            Filtrar Clientes
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client: any, index: number) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
            key={client.id} 
            className="group relative rounded-[2rem] bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-2xl hover:shadow-solar-orange/5 transition-all duration-500 border border-zinc-100 dark:border-zinc-800"
          >
            {/* Active Status Indicator */}
            <div className={`absolute top-6 right-6 w-2 h-2 rounded-full ${client.is_active ? 'bg-solar-green shadow-[0_0_8px_rgba(76,175,80,0.5)]' : 'bg-red-500'}`} />
            
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-solar-orange/10 group-hover:text-solar-orange transition-colors duration-500">
                  <User size={24} className="opacity-60" />
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white truncate leading-tight mb-1" title={client.name}>
                  {client.name}
                </h3>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  CPF: <span className="text-zinc-600 dark:text-zinc-400">{client.cpf}</span>
                </p>
              </div>
              
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleView(client)} 
                    className="p-2.5 text-zinc-400 hover:text-solar-blue hover:bg-solar-blue/5 rounded-xl transition-all" 
                    title="Visualizar"
                  >
                    <Eye size={20} />
                  </button>
                  <button 
                    onClick={() => handleEdit(client)} 
                    className="p-2.5 text-zinc-400 hover:text-solar-orange hover:bg-solar-orange/5 rounded-xl transition-all" 
                    title="Editar"
                  >
                    <Edit size={20} />
                  </button>
                </div>
                
                {userRole === 'Administrador' && (
                  <button 
                    onClick={() => handleDelete(client.id)} 
                    className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                    title="Excluir"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && clients.length === 0 && (
        <div className="py-24 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-800 mb-6">
            <Search size={32} className="text-zinc-300" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg">Nenhum cliente encontrado.</p>
          <p className="text-zinc-400 text-sm mt-2">Tente ajustar seus termos de pesquisa.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-4 border-solar-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Carregando...</p>
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
           <span className="text-lg">Novo Cliente</span>
        </Button>
      </div>

      <ClientForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        client={editingClient} 
        onSuccess={handleFormSuccess} 
        isViewOnly={isViewOnly} 
        onOpenContract={handleOpenContract} 
      />
      
      <ContractOverlay 
        isOpen={isContractOpen} 
        onClose={() => setIsContractOpen(false)} 
        client={contractClient} 
        onSuccess={() => showToast('Contrato gerado com sucesso!', 'success')} 
      />
    </div>
  );
};

export default ClientList;
