import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Plus, Trash2 } from 'lucide-react';

const CompanyForm = ({ isOpen, onClose, company, onSuccess, isViewOnly }: any) => {
  const [formData, setFormData] = useState({
    legal_name: '', trading_name: '', email: '', cnpj: '', phones: [{ phone: '' }],
    cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        legal_name: company.legal_name || '',
        trading_name: company.trading_name || '',
        email: company.email || '',
        cnpj: company.cnpj || '',
        phones: company.phones?.length > 0 ? company.phones : [{ phone: '' }],
        cep: company.cep || '',
        state: company.state || '',
        city: company.city || '',
        neighborhood: company.neighborhood || '',
        street: company.street || '',
        number: company.number || '',
        complement: company.complement || '',
        is_active: company.is_active !== undefined ? company.is_active : true
      });
    } else {
      setFormData({
        legal_name: '', trading_name: '', email: '', cnpj: '', phones: [{ phone: '' }],
        cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '',
        is_active: true
      });
    }
    setError('');
  }, [company, isOpen]);

  if (!isOpen) return null;

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

  const handleCNPJChange = (value: string) => {
    if (isViewOnly) return;
    let numbers = value.replace(/\D/g, '').slice(0, 14);
    let formatted = numbers;
    if (numbers.length > 12) {
      formatted = `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    } else if (numbers.length > 8) {
       formatted = `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    } else if (numbers.length > 5) {
       formatted = `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    } else if (numbers.length > 2) {
       formatted = `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    }
    setFormData({ ...formData, cnpj: formatted });
  };

  const handlePhoneChange = (index: number, value: string) => {
    if (isViewOnly) return;
    let numbers = value.replace(/\D/g, '').slice(0, 11);
    let formatted = numbers;
    if (numbers.length > 6) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length > 2) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length > 0) {
      formatted = `(${numbers}`;
    }
    const newPhones = [...formData.phones];
    newPhones[index].phone = formatted;
    setFormData({ ...formData, phones: newPhones });
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
    if (isViewOnly) return;
    setLoading(true);
    setError('');
    
    const payload = {
        ...formData,
        phones: formData.phones.filter(p => p.phone.trim() !== '')
    };

    try {
      if (company?.id) {
        await api.put(`/users/companies/${company.id}/`, payload);
      } else {
        await api.post('/users/companies/', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError('Erro ao salvar empresa. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-zinc-800 z-10 pb-2">
          <h2 className="text-xl font-bold dark:text-white">
            {isViewOnly ? 'Visualizar Empresa' : (company ? 'Editar Empresa' : 'Cadastrar Nova Empresa')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700 font-medium border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Razão Social</label>
            <input type="text" required disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.legal_name} onChange={(e) => setFormData({...formData, legal_name: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Fantasia</label>
            <input type="text" required disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.trading_name} onChange={(e) => setFormData({...formData, trading_name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CNPJ</label>
            <input type="text" required disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.cnpj} onChange={(e) => handleCNPJChange(e.target.value)} placeholder="00.000.000/0000-00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" required disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefones</label>
            {formData.phones.map((phoneObj, index) => (
              <div key={index} className="flex gap-2">
                <input type="text" required={index === 0} disabled={isViewOnly} placeholder="Número de telefone" className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={phoneObj.phone} onChange={(e) => handlePhoneChange(index, e.target.value)} />
                {!isViewOnly && formData.phones.length > 1 && (<button type="button" onClick={() => removePhone(index)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"><Trash2 size={20} /></button>)}
              </div>
            ))}
            {!isViewOnly && (<button type="button" onClick={addPhone} className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"><Plus size={16} /><span>Adicionar outro telefone</span></button>)}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label>
            <input type="text" required disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.cep} onChange={(e) => handleCEPChange(e.target.value)} placeholder="00000-000" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rua / Logradouro</label>
            <input type="text" disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label>
            <input type="text" disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bairro</label>
            <input type="text" disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.neighborhood} onChange={(e) => setFormData({...formData, neighborhood: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
            <input type="text" disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado (UF)</label>
            <input type="text" maxLength={2} disabled={isViewOnly} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})} placeholder="Ex: RN" />
          </div>
          <div className="md:col-span-2 mt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:text-white transition-colors">Cancelar</button>
            {!isViewOnly && (
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Salvando...' : (company ? 'Salvar Alterações' : 'Cadastrar Empresa')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;
