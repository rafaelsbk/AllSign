import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Modal } from '../ui/Modal';
import { Select, SelectItem } from '../ui/Select';

interface EmployeeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    employee: any | null;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, onSuccess, employee }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        role_id: '',
        is_active: true,
    });
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get('/users/roles/');
                const data = Array.isArray(response.data) ? response.data : response.data.results;
                setRoles(data || []);
            } catch (error) {
                console.error("Erro ao buscar cargos:", error);
            }
        };

        if (isOpen) {
            fetchRoles();
            if (employee) {
                setFormData({
                    first_name: employee.first_name || '',
                    last_name: employee.last_name || '',
                    email: employee.email || '',
                    username: employee.username || '',
                    password: '',
                    role_id: employee.role_id ? String(employee.role_id) : '',
                    is_active: employee.is_active,
                });
            } else {
                setFormData({
                    first_name: '', last_name: '', email: '', username: '',
                    password: '', role_id: '', is_active: true,
                });
            }
            setError('');
        }
    }, [employee, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = { ...formData };
        if (employee && !payload.password) {
            // @ts-ignore
            delete payload.password;
        }

        try {
            if (employee) {
                await api.put(`/users/employees/${employee.id}/`, payload);
                onSuccess('Funcionário atualizado com sucesso!');
            } else {
                await api.post('/users/employees/', payload);
                onSuccess('Funcionário criado com sucesso!');
            }
            onClose();
        } catch (err: any) {
            const apiError = err.response?.data;
            const errorMsg = apiError ? Object.keys(apiError).map(key => `${key}: ${apiError[key].join(', ')}`).join(' | ') : 'Erro ao salvar.';
            setError(errorMsg || 'Ocorreu um erro ao salvar o funcionário.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={employee ? 'Editar Funcionário' : 'Novo Funcionário'}
            maxWidth="max-w-lg"
        >
            {error && <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField label="Nome" isRequired value={formData.first_name} onChange={(val) => setFormData({...formData, first_name: val})} />
                    <TextField label="Sobrenome" isRequired value={formData.last_name} onChange={(val) => setFormData({...formData, last_name: val})} />
                </div>
                
                <TextField label="Email" type="email" isRequired value={formData.email} onChange={(val) => setFormData({...formData, email: val})} />
                <TextField label="Nome de usuário" isRequired value={formData.username} onChange={(val) => setFormData({...formData, username: val})} />
                <TextField 
                    label="Senha" 
                    type="password" 
                    isRequired={!employee} 
                    placeholder={employee ? "Nova Senha (deixe em branco para não alterar)" : "Senha"} 
                    value={formData.password} 
                    onChange={(val) => setFormData({...formData, password: val})} 
                />
                
                <Select 
                    label="Cargo" 
                    items={roles} 
                    selectedKey={formData.role_id}
                    onSelectionChange={(key) => setFormData({...formData, role_id: String(key)})}
                >
                    {(item) => <SelectItem id={String(item.id)}>{item.name}</SelectItem>}
                </Select>

                <div className="flex items-center space-x-2">
                   <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-solar-orange rounded border-zinc-300 focus:ring-solar-gold" />
                   <label htmlFor="is_active" className="text-sm font-medium text-zinc-700">Funcionário Ativo</label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                    <Button variant="outline" onPress={onClose}>Cancelar</Button>
                    <Button type="submit" variant="solar" isDisabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EmployeeForm;
