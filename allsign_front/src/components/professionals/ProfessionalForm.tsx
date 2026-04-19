import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Modal } from '../ui/Modal';
import { Select, SelectItem } from '../ui/Select';

const ProfessionalForm = ({ isOpen, onClose, professional, onSuccess, isViewOnly }: any) => {
  const [formData, setFormData] = useState({
    name: '', email: '', crea_number: '', profession: 'ENGINEER', phones: [{ phone: '' }],
    cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const professions = [
    { id: 'ENGINEER', name: 'Engenheiro (a)' },
    { id: 'ARCHITECT', name: 'Arquiteto (a)' }
  ];

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name || '',
        email: professional.email || '',
        crea_number: professional.crea_number || '',
        profession: professional.profession || 'ENGINEER',
        phones: professional.phones?.length > 0 ? professional.phones : [{ phone: '' }],
        cep: professional.cep || '',
        state: professional.state || '',
        city: professional.city || '',
        neighborhood: professional.neighborhood || '',
        street: professional.street || '',
        number: professional.number || '',
        complement: professional.complement || '',
        is_active: professional.is_active !== undefined ? professional.is_active : true
      });
    } else {
      setFormData({
        name: '', email: '', crea_number: '', profession: 'ENGINEER', phones: [{ phone: '' }],
        cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '',
        is_active: true
      });
    }
    setError('');
  }, [professional, isOpen]);

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
    setError('');
    
    const payload = {
        ...formData,
        phones: formData.phones.filter(p => p.phone.trim() !== '')
    };

    try {
      if (professional?.id) {
        await api.put(`/users/professionals/${professional.id}/`, payload);
      } else {
        await api.post('/users/professionals/', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError('Erro ao salvar profissional. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isViewOnly ? 'Visualizar Profissional' : (professional ? 'Editar Profissional' : 'Cadastrar Novo Profissional')}
    >
        {error && <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Nome Completo" isRequired isReadOnly={isViewOnly} value={formData.name} onChange={(val) => setFormData({...formData, name: val})} className="md:col-span-2" />
            
            <Select 
              label="Profissão" 
              items={professions} 
              selectedKey={formData.profession}
              onSelectionChange={(key) => setFormData({...formData, profession: key as string})}
              isDisabled={isViewOnly}
            >
              {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
            </Select>

            <TextField label="CREA / CAU" isRequired isReadOnly={isViewOnly} value={formData.crea_number} onChange={(val) => setFormData({...formData, crea_number: val})} />
            
            <TextField label="Email" type="email" isRequired isReadOnly={isViewOnly} value={formData.email} onChange={(val) => setFormData({...formData, email: val})} className="md:col-span-2" />
            
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
                {loading ? 'Salvando...' : (professional ? 'Salvar Alterações' : 'Cadastrar Profissional')}
              </Button>
            )}
          </div>
        </form>
    </Modal>
  );
};

export default ProfessionalForm;
