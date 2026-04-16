import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X } from 'lucide-react';

interface RoleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    role: { id: number; name: string } | null;
}

const RoleForm: React.FC<RoleFormProps> = ({ isOpen, onClose, onSuccess, role }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (role) {
            setName(role.name);
        } else {
            setName('');
        }
        setError('');
    }, [role, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = { name };

        try {
            if (role) {
                await api.put(`/users/roles/${role.id}/`, payload);
                onSuccess('Cargo atualizado com sucesso!');
            } else {
                await api.post('/users/roles/', payload);
                onSuccess('Cargo criado com sucesso!');
            }
        } catch (err: any) {
            setError(err.response?.data?.name?.[0] || 'Ocorreu um erro ao salvar o cargo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold dark:text-white">
                        {role ? 'Editar Cargo' : 'Novo Cargo'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded bg-red-100 text-red-700 font-medium border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="role-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nome do Cargo
                        </label>
                        <input
                            id="role-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                        />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleForm;
