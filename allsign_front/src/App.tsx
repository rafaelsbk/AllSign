import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Login from './components/login/Login';
import Home from './components/home/Home';
import api from './services/api';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

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

// Mock do Dashboard
const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold dark:text-white text-sky-600">Dashboard</h1>
    <p className="mt-4 text-gray-600 dark:text-gray-400">Bem-vindo ao sistema AllSol.</p>
  </div>
);

// Componente Modal de Formulário de Cliente (Criação e Edição)
const ClientFormModal = ({ isOpen, onClose, client, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cep: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        cpf: client.cpf || '',
        cep: client.cep || ''
      });
    } else {
      setFormData({ name: '', email: '', phone: '', cpf: '', cep: '' });
    }
    setError('');
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (client?.id) {
        await api.put(`/users/clients/${client.id}/`, formData);
      } else {
        await api.post('/users/clients/', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold dark:text-white">
            {client ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Celular</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
              value={formData.cpf}
              onChange={(e) => setFormData({...formData, cpf: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
              value={formData.cep}
              onChange={(e) => setFormData({...formData, cep: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : (client ? 'Salvar Alterações' : 'Cadastrar Cliente')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente para Listagem de Clientes em Cards com Scroll Infinito
const ClientList = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
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
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar busca quando filtros mudarem
  useEffect(() => {
    fetchClients(1, true);
  }, [onlyMine]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(1, true);
  };

  // Detectar scroll para carregar mais
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
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/users/clients/${id}/`);
        fetchClients(1, true);
      } catch (err) {
        alert('Erro ao excluir cliente. Verifique suas permissões.');
      }
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Clientes</h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Cadastrados por mim</span>
          </label>
        </div>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar por Nome ou CPF..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Filtrar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client: any) => (
          <div key={client.id} className="group relative rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all dark:bg-zinc-800 dark:border-zinc-700">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{client.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
              </div>
              
              <div className="space-y-2 mb-6 flex-grow">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">CPF:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{client.cpf}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Celular:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{client.phone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">CEP:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{client.cep}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-gray-50 dark:border-zinc-700">
                  <span className="text-gray-400">Vendedor:</span>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {client.seller_name}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-50 dark:border-zinc-700">
                <button 
                  onClick={() => handleEdit(client)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20"
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
                {userRole === 'ADMIN' && (
                  <button 
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && clients.length === 0 && (
        <div className="py-20 text-center bg-gray-50 rounded-2xl dark:bg-zinc-800/50">
          <p className="text-gray-500 dark:text-gray-400">Nenhum cliente encontrado.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-500">Carregando mais clientes...</div>
      )}

      {!loading && !hasMore && clients.length > 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">Fim da lista.</div>
      )}
      {/* Botão Fixo de Novo Cliente */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 md:left-[calc(50%+128px)]">
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-2xl shadow-blue-500/40 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap"
        >
          <Plus size={24} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <ClientFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        client={editingClient} 
        onSuccess={() => fetchClients(1, true)} 
      />
    </div>
  );
};

// Proteção de rotas
const PrivateRoute = () => {
  const isAuthenticated = !!localStorage.getItem('access_token');
  return isAuthenticated ? (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 md:pl-64">
      <Sidebar />
      <main className="pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  ) : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
