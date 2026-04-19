import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Modal } from '../ui/Modal';
import { useToast } from '../shared/ToastContext';

const CompanyForm = ({ isOpen, onClose, company, onSuccess, isViewOnly }: any) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    legal_name: '', trading_name: '', email: '', cnpj: '', phones: [{ phone: '' }],
    cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

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
  }, [company, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;
    setLoading(true);
    
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
      showToast('Erro ao salvar empresa. Verifique os dados e tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isViewOnly ? 'Visualizar Empresa' : (company ? 'Editar Empresa' : 'Cadastrar Nova Empresa')}
    >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Razão Social" isRequired isReadOnly={isViewOnly} value={formData.legal_name} onChange={(val) => setFormData({...formData, legal_name: val})} className="md:col-span-2" />
            <TextField label="Nome Fantasia" isRequired isReadOnly={isViewOnly} value={formData.trading_name} onChange={(val) => setFormData({...formData, trading_name: val})} className="md:col-span-2" />
            <TextField label="CNPJ" isRequired isReadOnly={isViewOnly} value={formData.cnpj} onChange={handleCNPJChange} placeholder="00.000.000/0000-00" />
            <TextField label="Email" type="email" isRequired isReadOnly={isViewOnly} value={formData.email} onChange={(val) => setFormData({...formData, email: val})} />
            
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-semibold text-zinc-700">Telefones</label>
              {formData.phones.map((phoneObj, index) => (
                <div key={index} className="flex gap-2">
                  <TextField 
                    aria-label={`Telefone ${index + 1}`}
                    isReadOnly={isViewOnly} 
                    placeholder="Número de telefone" 
                    value={phoneObj.phone} 
                    onChange={(val) => handlePhoneChange(index, val)} 
                    className="flex-1"
                  />
                  {!isViewOnly && formData.phones.length > 1 && (
                    <Button variant="ghost" size="icon" onPress={() => setFormData({...formData, phones: formData.phones.filter((_, i) => i !== index)})} className="text-red-500">
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>
              ))}
              {!isViewOnly && (
                <Button variant="ghost" size="sm" onPress={() => setFormData({...formData, phones: [...formData.phones, { phone: '' }]})} className="text-solar-blue font-bold">
                  <Plus size={16} className="mr-1" /> Adicionar Telefone
                </Button>
              )}
            </div>

            <TextField label="CEP" isRequired isReadOnly={isViewOnly} value={formData.cep} onChange={handleCEPChange} placeholder="00000-000" />
            <TextField label="Bairro" isReadOnly={isViewOnly} value={formData.neighborhood} onChange={(val) => setFormData({...formData, neighborhood: val})} />
            <TextField label="Rua / Logradouro" isReadOnly={isViewOnly} value={formData.street} onChange={(val) => setFormData({...formData, street: val})} className="md:col-span-2" />
            <TextField label="Número" isReadOnly={isViewOnly} value={formData.number} onChange={(val) => setFormData({...formData, number: val})} />
            <TextField label="Cidade" isReadOnly={isViewOnly} value={formData.city} onChange={(val) => setFormData({...formData, city: val})} />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
            <Button variant="outline" onPress={onClose}>Cancelar</Button>
            {!isViewOnly && (
              <Button type="submit" variant="solar" isDisabled={loading}>
                {loading ? 'Salvando...' : (company ? 'Salvar Alterações' : 'Cadastrar Empresa')}
              </Button>
            )}
          </div>
        </form>
    </Modal>
  );
};

export default CompanyForm;
