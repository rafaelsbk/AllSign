import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import CompanyForm from './CompanyForm';
import SuccessToast from '../shared/SuccessToast';

const CompanyList = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/companies/', {
        params: { search: searchTerm }
      });
      const data = Array.isArray(response.data) ? response.data : response.data.results;
      setCompanies(data || []);
    } catch (err) {
      console.error('Erro ao buscar empresas', err);
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
        setSuccessMessage('Empresa excluída com sucesso!');
      } catch (err) {
        alert('Erro ao excluir empresa.');
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
    setSuccessMessage(message);
    fetchCompanies();
  };

  return (
    <div className="p-8 pb-32">
      {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Empresas</h1>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Pesquisar por Razão Social ou CNPJ..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Filtrar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company: any) => (
          <div key={company.id} className="group relative rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all dark:bg-zinc-800 dark:border-zinc-700 border-l-4 border-l-blue-500">
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate" title={company.trading_name}>{company.trading_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">CNPJ: <span className="font-medium text-gray-700 dark:text-gray-300">{company.cnpj}</span></p>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-1 mt-2 pt-2 border-t border-gray-50 dark:border-zinc-700">
                <button onClick={() => handleView(company)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20" title="Visualizar"><Eye size={16} /></button>
                <button onClick={() => handleEdit(company)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20" title="Editar"><Edit size={16} /></button>
                <button onClick={() => handleDelete(company.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20" title="Excluir"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && companies.length === 0 && (<div className="py-20 text-center bg-gray-50 rounded-2xl dark:bg-zinc-800/50"><p className="text-gray-500 dark:text-gray-400">Nenhuma empresa encontrada.</p></div>)}
      {loading && (<div className="text-center py-8 text-gray-500">Carregando empresas...</div>)}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 md:left-[calc(50%+128px)]">
        <button onClick={openCreateModal} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-2xl shadow-blue-500/40 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap"><Plus size={24} /><span>Nova Empresa</span></button>
      </div>

      <CompanyForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} company={editingCompany} onSuccess={handleFormSuccess} isViewOnly={isViewOnly} />
    </div>
  );
};

export default CompanyList;
