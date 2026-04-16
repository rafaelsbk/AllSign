import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Login from './components/login/Login';
import Home from './components/home/Home';
import api from './services/api';
import { jwtDecode } from 'jwt-decode';
import { Search, Plus, Trash2, Edit, X, Eye, FilePlus } from 'lucide-react';

// Importações dos componentes
import Dashboard from './components/dashboard/Dashboard';
import RoleList from './components/roles/RoleList';
import EmployeeList from './components/employees/EmployeeList'; // Importando EmployeeList
import CompanyList from './components/companies/CompanyList';
import ProfessionalList from './components/professionals/ProfessionalList';
import SuccessToast from './components/shared/SuccessToast';
import DuplicateCPFModal from './components/shared/DuplicateCPFModal';
import ContractOverlay from './components/ContractOverlay';

// Helper functions (moved to top-level to be accessible)
// Utilitário para formatar erros da API
const parseApiError = (err: any, defaultMsg: string = 'Ocorreu um erro.') => {
  console.error('Erro detalhado da API:', err);
  
  if (err.code === 'ERR_NETWORK') {
    return 'Erro de conexão: O servidor não está respondendo. Verifique sua conexão ou se o serviço está ativo.';
  }

  if (err.response?.data) {
    const errorData = err.response.data;
    
    if (typeof errorData === 'string') return errorData;
    if (errorData.detail) return errorData.detail;
    
    const fieldNames: {[key: string]: string} = {
      cpf: 'CPF', rg: 'RG', email: 'E-mail', name: 'Nome',
      birth_date: 'Data de Nascimento', cep: 'CEP', phone: 'Telefone',
      phones: 'Telefones', username: 'Usuário', password: 'Senha'
    };

    if (typeof errorData === 'object') {
      return Object.entries(errorData)
        .map(([field, msgs]: any) => {
          const label = fieldNames[field] || field;
          const message = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          return `${label}: ${message}`;
        })
        .join(' | ');
    }
  }

  return defaultMsg;
};

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

// Componente Modal de Formulário de Cliente (Criação e Edição)
// TODO: Consider moving this to a separate file like ClientFormModal.tsx if it becomes too large.
const ClientFormModal = ({ isOpen, onClose, client, onSuccess, isViewOnly, onOpenContract }: any) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phones: [{ phone: '' }], cep: '', state: '', city: '',
    neighborhood: '', street: '', number: '', complement: '', cpf: '', rg: '',
    birth_date: '', marital_status: 'SOLTEIRO', education_level: 'MEDIO', is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateCpfError, setDuplicateCpfError] = useState<{name: string, id: number} | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '', email: client.email || '',
        phones: client.phones?.length > 0 ? client.phones : [{ phone: '' }],
        cpf: client.cpf || '', cep: client.cep || '', state: client.state || '',
        city: client.city || '', neighborhood: client.neighborhood || '',
        street: client.street || '', number: client.number || '', complement: client.complement || '',
        rg: client.rg || '', birth_date: client.birth_date || '',
        marital_status: client.marital_status || 'SOLTEIRO',
        education_level: client.education_level || 'MEDIO',
        is_active: client.is_active !== undefined ? client.is_active : true
      });
    } else {
      setFormData({ 
        name: '', email: '', phones: [{ phone: '' }], cpf: '', cep: '', state: '', city: '',
        neighborhood: '', street: '', number: '', complement: '', rg: '', birth_date: '',
        marital_status: 'SOLTEIRO', education_level: 'MEDIO', is_active: true
      });
    }
    setError('');
    setDuplicateCpfError(null);
    setShowDuplicateModal(false);
  }, [client, isOpen]);

  if (!isOpen) return null;

  const checkDuplicateCpf = async (cpfValue: string) => {
    if (client && client.cpf === cpfValue) {
      setDuplicateCpfError(null);
      return;
    }
    const numbers = cpfValue.replace(/\D/g, '');
    if (numbers.length === 11 || numbers.length === 14) {
      try {
        const response = await api.get('/users/clients/', { params: { search: cpfValue } });
        const match = response.data.results.find((c: any) => c.cpf === cpfValue);
        
        if (match && match.id !== client?.id) {
          setDuplicateCpfError({ name: match.name, id: match.id });
          setShowDuplicateModal(true);
        } else {
          setDuplicateCpfError(null);
        }
      } catch (err) {
        console.error('Erro ao verificar duplicidade de CPF:', err);
      }
    } else {
      setDuplicateCpfError(null);
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    if (isViewOnly) return;
    let numbers = value.replace(/\D/g, ''); // Remove tudo que não é número

    // Limita ao máximo de 11 dígitos (DDD + 9 dígitos para celular)
    if (numbers.length > 11) {
      numbers = numbers.substring(0, 11);
    }

    let formattedValue = '';

    if (numbers.length > 0) {
      // Aplica o formato (DD)
      if (numbers.length <= 2) {
        formattedValue = `(${numbers}`;
      } else {
        formattedValue = `(${numbers.substring(0, 2)})`;
        
        // Se o número tem mais de 2 dígitos (DDD completo)
        // e o primeiro dígito do número (após o DDD) for '9' e tiver 11 dígitos no total,
        // ou se tiver 11 dígitos e for um celular (com 9º dígito), aplica máscara de celular.
        if (numbers.length >= 3) {
          if (numbers.charAt(2) === '9' && numbers.length > 7) { // Celular
            formattedValue += ` ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
          } else if (numbers.length <= 6) { // Progressão de 3 a 6 dígitos após o DDD
            formattedValue += ` ${numbers.substring(2)}`;
          } else if (numbers.length <= 10) { // Fixo: (DD) XXXX-XXXX
            formattedValue += ` ${numbers.substring(2, 6)}-${numbers.substring(6, 10)}`;
          } else if (numbers.length === 11) { // Caso seja um celular com 11 dígitos, mas não começa com 9 depois do DDD
             formattedValue += ` ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
          } else { // Caso geral, apenas adiciona o resto dos números
             formattedValue += ` ${numbers.substring(2)}`;
          }
        }
      }
    }

    const newPhones = [...formData.phones];
    newPhones[index].phone = formattedValue;
    setFormData({ ...formData, phones: newPhones });
  };

  const handleCEPChange = async (value: string) => {
    if (isViewOnly) return;
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    let formatted = numbers;
    if (numbers.length > 5) {
      formatted = `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
    setFormData(prev => ({ ...prev, cep: formatted }));
    if (numbers.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev, street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood, city: data.localidade || prev.city,
            state: data.uf || prev.state
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  const handleCPFCNPJChange = (value: string) => {
    if (isViewOnly) return;
    setShowDuplicateModal(false); // Esconde o modal ao começar a digitar
    let numbers = value.replace(/\D/g, '');
    if (numbers.length > 14) {
      numbers = numbers.substring(0, 14);
    }

    let formatted = numbers;
    if (numbers.length <= 11) {
      formatted = numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else {
      formatted = numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    setFormData({ ...formData, cpf: formatted });
    if (numbers.length === 11 || numbers.length === 14) {
      checkDuplicateCpf(formatted);
    } else {
      setDuplicateCpfError(null);
    }
  };

  const addPhone = () => {
    if (isViewOnly) return;
    setFormData({ ...formData, phones: [...formData.phones, { phone: '' }] });
  };

  const removePhone = (index: number) => {
    if (isViewOnly) return;
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index);
      setFormData({ ...formData, phones: newPhones });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly || !!duplicateCpfError) return;
    setLoading(true);
    setError('');
    const payload: any = {
      name: formData.name, email: formData.email, cpf: formData.cpf, cep: formData.cep,
      state: formData.state || null, city: formData.city || null,
      neighborhood: formData.neighborhood || null, street: formData.street || null,
      number: formData.number || null, complement: formData.complement || null,
      rg: formData.rg || null, birth_date: formData.birth_date || null,
      marital_status: formData.marital_status, education_level: formData.education_level,
      is_active: formData.is_active,
      phones: formData.phones
        .filter(p => p.phone && p.phone.trim() !== '')
        .map(p => ({ phone: p.phone.trim() }))
    };
    try {
      if (client?.id) {
        await api.put(`/users/clients/${client.id}/`, payload);
      } else {
        await api.post('/users/clients/', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(parseApiError(err, 'Erro ao salvar cliente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DuplicateCPFModal 
        isOpen={showDuplicateModal}
        errorInfo={duplicateCpfError}
        onClose={() => setShowDuplicateModal(false)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-zinc-800 z-10 pb-2">
            <h2 className="text-xl font-bold dark:text-white">
              {isViewOnly ? 'Visualizar Cliente' : (client ? 'Editar Cliente' : 'Cadastrar Novo Cliente')}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 font-medium border border-red-200 animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
              <input type="text" required disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" required disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefones / WhatsApp</label>
              {formData.phones.map((phoneObj, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" required={index === 0} disabled={isViewOnly} placeholder="Número de telefone" className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={phoneObj.phone} onChange={(e) => handlePhoneChange(index, e.target.value)} />
                  {!isViewOnly && formData.phones.length > 1 && (<button type="button" onClick={() => removePhone(index)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"><Trash2 size={20} /></button>)}
                </div>
              ))}
              {!isViewOnly && (<button type="button" onClick={addPhone} className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"><Plus size={16} /><span>Adicionar outro telefone</span></button>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF / CNPJ</label>
              <input type="text" required disabled={isViewOnly} className={`mt-1 block w-full rounded-lg border p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75 ${duplicateCpfError ? 'border-amber-400 bg-amber-50 focus:ring-amber-500' : 'border-gray-300 bg-gray-50 dark:border-zinc-700 focus:ring-blue-500'}`} value={formData.cpf} onChange={(e) => handleCPFCNPJChange(e.target.value)} placeholder="000.000.000-00 ou 00.000.../0001-00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RG</label>
              <input type="text" disabled={isViewOnly} maxLength={11} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.rg} onChange={(e) => setFormData({...formData, rg: e.target.value.replace(/\D/g, '')})} placeholder="Máx 11 números" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
              <input type="date" disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado Civil</label>
              <select disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.marital_status} onChange={(e) => setFormData({...formData, marital_status: e.target.value})}>
                <option value="SOLTEIRO">Solteiro(a)</option>
                <option value="CASADO">Casado(a)</option>
                <option value="DIVORCIADO">Divorciado(a)</option>
                <option value="VIUVO">Viúvo(a)</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Escolaridade</label>
              <select disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.education_level} onChange={(e) => setFormData({...formData, education_level: e.target.value})}>
                <option value="FUNDAMENTAL">Ensino Fundamental</option>
                <option value="MEDIO">Ensino Médio</option>
                <option value="SUPERIOR">Ensino Superior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label>
              <input type="text" required disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.cep} onChange={(e) => handleCEPChange(e.target.value)} placeholder="00000-000" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rua / Logradouro</label>
              <input type="text" disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label>
              <input type="text" disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complemento</label>
              <input type="text" disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.complement} onChange={(e) => setFormData({...formData, complement: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bairro</label>
              <input type="text" disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.neighborhood} onChange={(e) => setFormData({...formData, neighborhood: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
              <input type="text" disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado (UF)</label>
              <input type="text" maxLength={2} disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white disabled:opacity-75" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})} placeholder="Ex: RN" />
            </div>
            {client && (
              <div className={`md:col-span-2 flex items-center space-x-3 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-700 ${isViewOnly ? 'opacity-75' : ''}`}>
                <label className={`relative inline-flex items-center ${isViewOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                  <input type="checkbox" className="sr-only peer" disabled={isViewOnly} checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cliente {formData.is_active ? 'Ativo' : 'Inativo'}</span>
              </div>
            )}
            <div className="md:col-span-2 mt-4 flex justify-end space-x-3">
              {isViewOnly ? (
                <button type="button" onClick={() => onOpenContract(client)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"><FilePlus size={20} /><span>Criar novo contrato</span></button>
              ) : (
                <>
                  <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:text-white transition-colors">Cancelar</button>
                  <button type="submit" disabled={loading || !!duplicateCpfError} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Salvando...' : (client ? 'Salvar Alterações' : 'Cadastrar Cliente')}</button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// Componente para Listagem de Clientes em Cards com Scroll Infinito
// TODO: Consider moving this to a separate file like ClientList.tsx
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
  const [successMessage, setSuccessMessage] = useState('');
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
        setSuccessMessage('Cliente excluído com sucesso!');
      } catch (err) {
        alert('Erro ao excluir cliente. Verifique suas permissões.');
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
    setSuccessMessage(message);
    fetchClients(1, true);
  };

  const handleOpenContract = (client: any) => {
    setContractClient(client);
    setIsContractOpen(true);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 pb-32">
      {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Clientes</h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span>Cadastrados por mim</span>
          </label>
        </div>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Pesquisar por Nome ou CPF..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Filtrar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client: any) => (
          <div key={client.id} className={`group relative rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all dark:bg-zinc-800 dark:border-zinc-700 border-l-4 ${client.is_active ? 'border-l-blue-500' : 'border-l-red-500'}`}>
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate" title={client.name}>{client.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">CPF: <span className="font-medium text-gray-700 dark:text-gray-300">{client.cpf}</span></p>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${client.is_active ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{client.is_active ? 'Ativo' : 'Inativo'}</span>
              </div>
              <div className="flex items-center justify-end space-x-1 mt-2 pt-2 border-t border-gray-50 dark:border-zinc-700">
                <button onClick={() => handleView(client)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20" title="Visualizar"><Eye size={16} /></button>
                <button onClick={() => handleEdit(client)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20" title="Editar"><Edit size={16} /></button>
                {userRole === 'ADMIN' && (<button onClick={() => handleDelete(client.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20" title="Excluir"><Trash2 size={16} /></button>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && clients.length === 0 && (<div className="py-20 text-center bg-gray-50 rounded-2xl dark:bg-zinc-800/50"><p className="text-gray-500 dark:text-gray-400">Nenhum cliente encontrado.</p></div>)}
      {loading && (<div className="text-center py-8 text-gray-500">Carregando mais clientes...</div>)}
      {!loading && !hasMore && clients.length > 0 && (<div className="text-center py-8 text-gray-400 text-sm">.  .  .</div>)}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 md:left-[calc(50%+128px)]">
        <button onClick={openCreateModal} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-2xl shadow-blue-500/40 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap"><Plus size={24} /><span>Novo Cliente</span></button>
      </div>

      <ClientFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} client={editingClient} onSuccess={handleFormSuccess} isViewOnly={isViewOnly} onOpenContract={handleOpenContract} />
      <ContractOverlay isOpen={isContractOpen} onClose={() => setIsContractOpen(false)} client={contractClient} onSuccess={() => setSuccessMessage('Contrato gerado com sucesso!')} />
    </div>
  );
};

// Componente para Listagem de Contratos
// TODO: Consider moving this to a separate file like ContractList.tsx
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
  const [successMessage, setSuccessMessage] = useState('');

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
        setSuccessMessage('Contrato excluído com sucesso!');
        fetchContracts(1, true);
      } catch (error) {
        console.error('Erro ao excluir contrato:', error);
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
    }
  };

  return (
    <div className="p-8 pb-32">
      {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Contratos</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Gerencie os contratos de prestação de serviço</p>
        </div>
      </div>
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar por cliente..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Filtrar</button>
        </form>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.map((contract: any) => (
          <div key={contract.id} className="group relative rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all dark:bg-zinc-800 dark:border-zinc-700 border-l-4 border-l-blue-500">
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate" title={contract.client_name}>{contract.client_name}</h3>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">Contrato #{contract.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">R$ {contract.service_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{new Date(contract.contract_date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-1 mt-2 pt-2 border-t border-gray-50 dark:border-zinc-700">
                <button onClick={() => handleOpenContract(contract, true)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20" title="Visualizar"><Eye size={16} /></button>
                <button onClick={() => handleOpenContract(contract, false)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors dark:hover:bg-amber-900/20" title="Editar"><Edit size={16} /></button>
                <button onClick={() => handleDelete(contract.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20" title="Excluir"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!loading && contracts.length === 0 && (<div className="py-20 text-center bg-gray-50 rounded-2xl dark:bg-zinc-800/50"><p className="text-gray-500 dark:text-gray-400">Nenhum contrato encontrado.</p></div>)}
      {loading && (<div className="text-center py-8 text-gray-500">Carregando contratos...</div>)}
      {!loading && !hasMore && contracts.length > 0 && (<div className="text-center py-8 text-gray-400 text-sm">.  .  .</div>)}
      <ContractOverlay isOpen={isContractOpen} onClose={() => setIsContractOpen(false)} client={contractClient} contract={selectedContract} isViewOnly={isViewOnly} onSuccess={() => { setSuccessMessage('Contrato atualizado com sucesso!'); fetchContracts(1, true); }} />
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
          <Route path="/contracts" element={<ContractList />} />
          <Route path="/companies" element={<CompanyList />} />
          <Route path="/professionals" element={<ProfessionalList />} />
          <Route path="/roles" element={<RoleList />} /> 
          <Route path="/employees" element={<EmployeeList />} /> {/* Adicionando a nova rota de Funcionários */}
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
