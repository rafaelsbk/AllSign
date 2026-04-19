import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useToast } from '../shared/ToastContext';
import { Button } from '../ui/Button';
import ContractOverlay from '../ContractOverlay';
import ClientSelectionModal from './ClientSelectionModal';

const ContractList = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isClientSelectionOpen, setIsClientSelectionOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [contractClient, setContractClient] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const { showToast } = useToast();

  const fetchContracts = async (pageNum: number, isNewSearch: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.get('/users/contracts/', {
        params: {
          search: searchTerm,
          page: pageNum
        }
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
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 100 &&
        hasMore && !loading
      ) {
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
        showToast('Contrato excluído!', 'success');
        fetchContracts(1, true);
      } catch (error) {
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
      showToast('Erro ao carregar dados do cliente.', 'error');
    }
  };

  const handleNewContract = () => {
    setSelectedContract(null);
    setIsViewOnly(false);
    setIsClientSelectionOpen(true);
  };

  const handleClientSelect = (client: any) => {
    setContractClient(client);
    setIsClientSelectionOpen(false);
    setIsContractOpen(true);
  };

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Meus Contratos</h1>
          <p className="text-zinc-500 font-medium">Gerencie e visualize os contratos gerados para seus clientes.</p>
        </div>
      </motion.div>

      <div className="mb-12">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente..."
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

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {contracts.map((contract: any) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={contract.id} 
              className="group relative rounded-[2rem] bg-white p-6 shadow-sm border border-zinc-100 hover:shadow-2xl transition-all dark:bg-zinc-900 dark:border-zinc-800 border-l-[6px] border-l-solar-blue"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white truncate tracking-tight" title={contract.client_name}>
                      {contract.client_name}
                    </h3>
                    <p className="text-xs font-bold text-solar-blue uppercase tracking-widest mt-1">
                      Contrato #{contract.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-solar-green tracking-tighter">
                      R$ {contract.service_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
                      {new Date(contract.contract_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-end space-x-2 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                  <Button variant="ghost" size="icon" onPress={() => handleOpenContract(contract, true)} className="rounded-xl hover:bg-solar-blue/5 text-zinc-400 hover:text-solar-blue">
                    <Eye size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onPress={() => handleOpenContract(contract, false)} className="rounded-xl hover:bg-amber-50 text-zinc-400 hover:text-amber-600">
                    <Edit size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onPress={() => handleDelete(contract.id)} className="rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-600">
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {!loading && contracts.length === 0 && (
        <div className="py-32 text-center bg-zinc-50 rounded-[3rem] dark:bg-zinc-800/20 border-2 border-dashed border-zinc-100 dark:border-zinc-800">
          <p className="text-zinc-400 font-bold uppercase tracking-widest">Nenhum contrato encontrado.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-solar-blue/20 border-t-solar-blue rounded-full animate-spin" />
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 md:left-[calc(50%+128px)] flex flex-col items-center gap-4">
        <Button
          onPress={handleNewContract}
          variant="solar"
          size="lg"
          className="rounded-full px-12 py-5 shadow-[0_20px_40px_rgba(243,146,0,0.3)]"
        >
          <Plus size={24} className="mr-2" />
          <span className="text-sm uppercase tracking-wider">Novo Contrato</span>
        </Button>
      </div>

      <ContractOverlay
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        client={contractClient}
        contract={selectedContract}
        isViewOnly={isViewOnly}
        onSuccess={() => {
          showToast(selectedContract ? 'Contrato atualizado!' : 'Contrato gerado!', 'success');
          fetchContracts(1, true);
        }}
      />

      <ClientSelectionModal
        isOpen={isClientSelectionOpen}
        onClose={() => setIsClientSelectionOpen(false)}
        onSelect={handleClientSelect}
      />
    </div>
  );
};

export default ContractList;
