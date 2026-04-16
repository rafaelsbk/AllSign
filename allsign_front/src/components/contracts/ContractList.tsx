import React, { useState, useEffect } from 'react';
import { Search, Edit, Eye, Trash2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { useToast } from '../shared/ToastContext';
import ContractOverlay from '../ContractOverlay';

const ContractList = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [contractClient, setContractClient] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  
  const { showToast } = useToast();

  const fetchContracts = async (pageNum: number, isNewSearch: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.get('/users/contracts/', {
        params: { search: searchTerm, page: pageNum }
      });
      const newContracts = response.data.results;
      if (isNewSearch) {
        setContracts(newContracts);
      } else {
        setContracts(prev => [...prev, ...newContracts]);
      }
      setHasMore(!!response.data.next);
      setPage(pageNum);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      showToast('Erro ao carregar contratos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts(1, true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContracts(1, true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && hasMore && !loading) {
        fetchContracts(page + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, loading]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await api.delete(`/users/contracts/${id}/`);
        showToast('Contrato excluído com sucesso!', 'success');
        fetchContracts(1, true);
      } catch (error) {
        console.error('Erro ao excluir contrato:', error);
        showToast('Erro ao excluir contrato.', 'error');
      }
    }
  };

  const handleOpenContract = async (contract: any, viewOnly = false) => {
    try {
      const clientRes = await api.get(`/users/clients/${contract.client}/`);
      setContractClient(clientRes.data);
      setSelectedContract(contract);
      setIsViewOnly(viewOnly);
      setIsContractOpen(true);
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
      showToast('Erro ao carregar dados do cliente.', 'error');
    }
  };

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Contratos</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Gerencie os contratos de prestação de serviço</p>
        </div>
      </div>

      <div className="mb-10">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-solar-orange transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome do cliente ou número do contrato..." 
              className="w-full pl-12 pr-4 h-14 rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-4 focus:ring-solar-orange/10 focus:border-solar-orange dark:bg-zinc-900 dark:border-zinc-800 dark:text-white transition-all font-medium" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button type="submit" variant="solar" className="h-14 px-10 rounded-2xl shadow-solar shadow-lg font-bold text-base hover:scale-[1.02] active:scale-[0.98]">
            Filtrar Contratos
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map((contract: any, index: number) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
            key={contract.id} 
            className="group relative rounded-[2rem] bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-2xl hover:shadow-solar-orange/5 transition-all duration-500 border border-zinc-100 dark:border-zinc-800"
          >
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-solar-blue/10 group-hover:text-solar-blue transition-colors duration-500">
                    <FileText size={24} className="opacity-60" />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-solar-green">
                      R$ {contract.service_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                      {new Date(contract.contract_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-zinc-900 dark:text-white truncate leading-tight mb-1" title={contract.client_name}>
                  {contract.client_name}
                </h3>
                <p className="text-xs font-bold text-solar-orange uppercase tracking-[0.2em]">
                  Contrato #{contract.id}
                </p>
              </div>
              
              <div className="mt-auto flex items-center justify-end pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleOpenContract(contract, true)} 
                    className="p-2.5 text-zinc-400 hover:text-solar-blue hover:bg-solar-blue/5 rounded-xl transition-all" 
                    title="Visualizar"
                  >
                    <Eye size={20} />
                  </button>
                  <button 
                    onClick={() => handleOpenContract(contract, false)} 
                    className="p-2.5 text-zinc-400 hover:text-solar-orange hover:bg-solar-orange/5 rounded-xl transition-all" 
                    title="Editar"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(contract.id)} 
                    className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                    title="Excluir"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && contracts.length === 0 && (
        <div className="py-24 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-800 mb-6">
            <FileText size={32} className="text-zinc-300" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg">Nenhum contrato encontrado.</p>
          <p className="text-zinc-400 text-sm mt-2">Nenhum registro corresponde aos filtros aplicados.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-4 border-solar-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Carregando...</p>
        </div>
      )}
      
      <ContractOverlay 
        isOpen={isContractOpen} 
        onClose={() => setIsContractOpen(false)} 
        client={contractClient} 
        contract={selectedContract} 
        isViewOnly={isViewOnly} 
        onSuccess={() => { showToast('Contrato atualizado com sucesso!', 'success'); fetchContracts(1, true); }} 
      />
    </div>
  );
};

export default ContractList;
