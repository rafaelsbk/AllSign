import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, FilePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Modal } from '../ui/Modal';
import DuplicateCPFModal from '../shared/DuplicateCPFModal';

// Utilitário para formatar erros da API (can be shared later)
const parseApiError = (err: any, defaultMsg: string = 'Ocorreu um erro.') => {
  if (err.code === 'ERR_NETWORK') {
    return 'Erro de conexão: O servidor não está respondendo.';
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

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onSuccess: () => void;
  isViewOnly?: boolean;
  onOpenContract: (client: any) => void;
}

const ClientForm = ({ isOpen, onClose, client, onSuccess, isViewOnly, onOpenContract }: ClientFormProps) => {
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
    let numbers = value.replace(/\D/g, '');
    if (numbers.length > 11) numbers = numbers.substring(0, 11);
    let formattedValue = '';
    if (numbers.length > 0) {
      if (numbers.length <= 2) {
        formattedValue = `(${numbers}`;
      } else {
        formattedValue = `(${numbers.substring(0, 2)})`;
        if (numbers.length >= 3) {
          if (numbers.charAt(2) === '9' && numbers.length > 7) {
            formattedValue += ` ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
          } else if (numbers.length <= 6) {
            formattedValue += ` ${numbers.substring(2)}`;
          } else if (numbers.length <= 10) {
            formattedValue += ` ${numbers.substring(2, 6)}-${numbers.substring(6, 10)}`;
          } else {
             formattedValue += ` ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
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
    if (numbers.length > 5) formatted = `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
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
      } catch (err) { console.error('Erro ao buscar CEP:', err); }
    }
  };

  const handleCPFCNPJChange = (value: string) => {
    if (isViewOnly) return;
    setShowDuplicateModal(false);
    let numbers = value.replace(/\D/g, '');
    if (numbers.length > 14) numbers = numbers.substring(0, 14);
    let formatted = numbers;
    if (numbers.length <= 11) {
      formatted = numbers.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else {
      formatted = numbers.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    setFormData({ ...formData, cpf: formatted });
    if (numbers.length === 11 || numbers.length === 14) checkDuplicateCpf(formatted);
    else setDuplicateCpfError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly || !!duplicateCpfError) return;
    setLoading(true);
    setError('');
    const payload = {
      ...formData,
      phones: formData.phones.filter(p => p.phone && p.phone.trim() !== '').map(p => ({ phone: p.phone.trim() }))
    };
    try {
      if (client?.id) await api.put(`/users/clients/${client.id}/`, payload);
      else await api.post('/users/clients/', payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(parseApiError(err, 'Erro ao salvar cliente.'));
    } finally { setLoading(false); }
  };

  return (
    <>
      <DuplicateCPFModal isOpen={showDuplicateModal} errorInfo={duplicateCpfError} onClose={() => setShowDuplicateModal(false)} />
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={isViewOnly ? 'Visualizar Cliente' : (client ? 'Editar Cliente' : 'Cadastrar Novo Cliente')}
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-medium flex items-center gap-3 shadow-sm"
            >
              <AlertCircle size={20} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Nome Completo" isRequired isReadOnly={isViewOnly} value={formData.name} onChange={(val) => setFormData({...formData, name: val})} className="md:col-span-2" />
            <TextField label="Email" type="email" isRequired isReadOnly={isViewOnly} value={formData.email} onChange={(val) => setFormData({...formData, email: val})} />
            <TextField label="CPF / CNPJ" isRequired isReadOnly={isViewOnly} value={formData.cpf} onChange={handleCPFCNPJChange} isInvalid={!!duplicateCpfError} errorMessage={duplicateCpfError ? 'Este CPF já está cadastrado.' : ''} />
            
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-semibold text-zinc-700">Telefones</label>
              {formData.phones.map((phoneObj, index) => (
                <div key={index} className="flex gap-2">
                  <TextField 
                    aria-label={`Telefone ${index + 1}`}
                    isReadOnly={isViewOnly} 
                    placeholder="(00) 00000-0000" 
                    value={phoneObj.phone} 
                    onChange={(val) => handlePhoneChange(index, val)} 
                    className="flex-1"
                  />
                  {!isViewOnly && formData.phones.length > 1 && (
                    <Button variant="ghost" size="icon" onPress={() => setFormData({...formData, phones: formData.phones.filter((_, i) => i !== index)})} className="text-red-500 hover:bg-red-50">
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>
              ))}
              {!isViewOnly && (
                <Button variant="ghost" size="sm" onPress={() => setFormData({...formData, phones: [...formData.phones, { phone: '' }]})} className="text-solar-blue font-bold hover:bg-blue-50">
                  <Plus size={16} className="mr-1" /> Adicionar Telefone
                </Button>
              )}
            </div>

            <TextField label="RG" isReadOnly={isViewOnly} value={formData.rg} onChange={(val) => setFormData({...formData, rg: val.replace(/\D/g, '')})} />
            <TextField label="Data de Nascimento" type="date" isReadOnly={isViewOnly} value={formData.birth_date} onChange={(val) => setFormData({...formData, birth_date: val})} />
            <TextField label="CEP" isRequired isReadOnly={isViewOnly} value={formData.cep} onChange={handleCEPChange} />
            <TextField label="Bairro" isReadOnly={isViewOnly} value={formData.neighborhood} onChange={(val) => setFormData({...formData, neighborhood: val})} />
            <TextField label="Rua / Logradouro" isReadOnly={isViewOnly} value={formData.street} onChange={(val) => setFormData({...formData, street: val})} className="md:col-span-2" />
            <TextField label="Número" isReadOnly={isViewOnly} value={formData.number} onChange={(val) => setFormData({...formData, number: val})} />
            <TextField label="Cidade" isReadOnly={isViewOnly} value={formData.city} onChange={(val) => setFormData({...formData, city: val})} />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
            <Button variant="outline" onPress={onClose}>Cancelar</Button>
            {!isViewOnly && (
              <Button type="submit" variant="solar" isDisabled={loading || !!duplicateCpfError}>
                {loading ? 'Salvando...' : (client ? 'Salvar Alterações' : 'Cadastrar Cliente')}
              </Button>
            )}
            {isViewOnly && (
               <Button variant="solar" onPress={() => onOpenContract(client)}>
                 <FilePlus size={18} className="mr-2" /> Criar Contrato
               </Button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ClientForm;
