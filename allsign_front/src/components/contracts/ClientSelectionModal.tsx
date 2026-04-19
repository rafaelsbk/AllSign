import React, { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ClientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (client: any) => void;
}

const ClientSelectionModal: React.FC<ClientSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchClients = async (pageNum: number, isNewSearch: boolean = false) => {
    if (loading && !isNewSearch) return;
    setLoading(true);
    try {
      const response = await api.get('/users/clients/', {
        params: {
          search: searchTerm,
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
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClients(1, true);
    } else {
      setSearchTerm('');
      setClients([]);
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(1, true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Cliente para o Contrato">
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-solar-blue/20 transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="solar" type="submit" size="sm" className="px-6 rounded-xl">
            Buscar
          </Button>
        </form>

        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          <AnimatePresence mode="popLayout">
            {clients.map((client) => (
              <motion.button
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={client.id}
                onClick={() => onSelect(client)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-none transition-all group border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center group-hover:bg-solar-blue group-hover:text-white transition-all">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white leading-tight">{client.name}</h4>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">CPF: {client.cpf}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 group-hover:text-solar-blue group-hover:border-solar-blue/30 transition-all">
                  <X size={14} className="rotate-45" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          {clients.length === 0 && !loading && (
            <div className="py-12 text-center opacity-40">
              <Search size={40} className="mx-auto mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Nenhum cliente encontrado.</p>
            </div>
          )}

          {loading && (
            <div className="py-8 text-center">
              <div className="inline-block w-6 h-6 border-3 border-solar-blue/20 border-t-solar-blue rounded-full animate-spin" />
            </div>
          )}

          {hasMore && !loading && clients.length > 0 && (
            <button
              onClick={() => fetchClients(page + 1)}
              className="w-full py-3 text-xs font-black text-zinc-400 hover:text-solar-blue uppercase tracking-widest transition-colors"
            >
              Carregar mais clientes
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ClientSelectionModal;
