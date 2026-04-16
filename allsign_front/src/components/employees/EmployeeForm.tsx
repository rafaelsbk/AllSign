import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X } from 'lucide-react';

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
                // Handle paginated response or direct array
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
                    role_id: employee.role_id || '',
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

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        // @ts-ignore
        const checked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = { ...formData };
        if (employee && !payload.password) {
            // @ts-ignore
            delete payload.password; // Não envia a senha se estiver vazia na edição
        }

        try {
            if (employee) {
                await api.put(`/users/employees/${employee.id}/`, payload);
                onSuccess('Funcionário atualizado com sucesso!');
            } else {
                await api.post('/users/employees/', payload);
                onSuccess('Funcionário criado com sucesso!');
            }
        } catch (err: any) {
            const apiError = err.response?.data;
            const errorMsg = Object.keys(apiError).map(key => `${key}: ${apiError[key].join(', ')}`).join(' | ');
            setError(errorMsg || 'Ocorreu um erro ao salvar o funcionário.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold dark:text-white">
                        {employee ? 'Editar Funcionário' : 'Novo Funcionário'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700 font-medium border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Nome" required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                        <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Sobrenome" required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                    </div>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                    <input name="username" value={formData.username} onChange={handleChange} placeholder="Nome de usuário" required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                    <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={employee ? "Nova Senha (deixe em branco para não alterar)" : "Senha"} required={!employee} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                    
                    <select name="role_id" value={formData.role_id} onChange={handleChange} required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white">
                        <option value="">Selecione um cargo</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>

                    <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="rounded" />
                        <span>Funcionário Ativo</span>
                    </label>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:text-white transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
