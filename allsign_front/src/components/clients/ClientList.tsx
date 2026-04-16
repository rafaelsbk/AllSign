import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useToast } from '../shared/ToastContext';
import { Button } from '../ui/Button';
import ClientForm from './ClientForm';
import ContractOverlay from '../ContractOverlay';
import ContractTemplateOverlay from '../ContractTemplateOverlay';
import { jwtDecode } from 'jwt-decode';

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
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [contractClient, setContractClient] = useState<any>(null);
  const { showToast } = useToast();

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

  const userRole = getUserRole();

  const fetchClients = async (pageNum: number, isNewSearch: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.get('/users/clients/', {
        params: {
          search: searchTerm,
          only_mine: onlyMine,
          page: pageNum
        }
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
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 100 &&
        hasMore && !loading
      ) {
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
    showToast(editingClient ? 'Cliente atualizado!' : 'Cliente cadastrado!', 'success');
    fetchClients(1, true);
  };

  const handleOpenContract = (client: any) => {
    setContractClient(client);
    setIsContractOpen(true);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Clientes</h1>
          <p className="text-zinc-500 font-medium">Gerencie sua base de leads e clientes ativos.</p>
        </div>
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer group">
            <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${onlyMine ? 'bg-solar-blue border-solar-blue' : 'border-zinc-300 dark:border-zinc-700'}`}>
              {onlyMine && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
              className="hidden"
            />
            <span className="group-hover:text-solar-blue transition-colors">Cadastrados por mim</span>
          </label>
        </div>
      </motion.div>

      <div className="mb-12">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por Nome ou CPF..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-white shadow-sm focus:ring-4 focus:ring-solar-blue/10 transition-all outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="solar" type="submit" size="lg" className="rounded-2xl px-10">
            Filtrar
          </Button>
        </form>
      </div>

      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode='popLayout'>
          {clients.map((client: any) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={client.id} 
              className={`group relative rounded-[2rem] bg-white p-6 shadow-sm border border-zinc-100 hover:shadow-2xl hover:shadow-solar-blue/5 transition-all dark:bg-zinc-900 dark:border-zinc-800 border-l-[6px] ${
                client.is_active ? 'border-l-solar-blue' : 'border-l-red-500'
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white truncate tracking-tight" title={client.name}>
                      {client.name}
                    </h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                      CPF: <span className="text-zinc-600 dark:text-zinc-300">{client.cpf}</span>
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                    client.is_active 
                      ? 'bg-solar-blue/10 text-solar-blue' 
                      : 'bg-red-50 text-red-600 dark:bg-red-900/30'
                  }`}>
                    {client.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-end space-x-2 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                  <Button variant="ghost" size="icon" onPress={() => handleView(client)} className="rounded-xl hover:bg-solar-blue/5 text-zinc-400 hover:text-solar-blue">
                    <Eye size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onPress={() => handleEdit(client)} className="rounded-xl hover:bg-solar-blue/5 text-zinc-400 hover:text-solar-blue">
                    <Edit size={20} />
                  </Button>
                  {userRole === 'Administrador' && (
                    <Button variant="ghost" size="icon" onPress={() => handleDelete(client.id)} className="rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-600">
                      <Trash2 size={20} />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && clients.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 text-center bg-zinc-50 rounded-[3rem] dark:bg-zinc-800/20 border-2 border-dashed border-zinc-100 dark:border-zinc-800"
        >
          <p className="text-zinc-400 font-bold uppercase tracking-widest">Nenhum cliente encontrado.</p>
        </motion.div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-solar-blue/20 border-t-solar-blue rounded-full animate-spin" />
        </div>
      )}

      {/* Floating Action Button */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 md:left-[calc(50%+128px)]"
      >
        <Button
          onPress={openCreateModal}
          variant="solar"
          size="lg"
          className="rounded-full px-10 py-5 shadow-[0_20px_40px_rgba(243,146,0,0.3)] group"
        >
          <Plus size={24} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span>Novo Cliente</span>
        </Button>
      </motion.div>

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

      <ContractTemplateOverlay 
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
      />
    </div>
  );
};

export default ClientList;
