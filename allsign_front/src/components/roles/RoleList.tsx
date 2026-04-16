import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import RoleForm from './RoleForm'; // Componente do formulário que criaremos a seguir
import SuccessToast from '../../components/shared/SuccessToast'; // Supondo um componente de toast

const RoleList: React.FC = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingRole, setEditingRole] = useState<any | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/roles/');
            // Handle paginated response or direct array
            const data = Array.isArray(response.data) ? response.data : response.data.results;
            setRoles(data || []);
        } catch (error) {
            console.error("Erro ao buscar cargos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleOpenModal = (role: any | null = null) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingRole(null);
        setIsModalOpen(false);
    };

    const handleSuccess = (message: string) => {
        fetchRoles();
        handleCloseModal();
        setSuccessMessage(message);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este cargo?')) {
            try {
                await api.delete(`/users/roles/${id}/`);
                handleSuccess('Cargo excluído com sucesso!');
            } catch (error) {
                console.error("Erro ao excluir cargo:", error);
                alert("Não foi possível excluir o cargo. Verifique se ele não está sendo utilizado por algum funcionário.");
            }
        }
    };

    return (
        <div className="p-8">
            {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold dark:text-white">Gerenciamento de Cargos</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>Novo Cargo</span>
                </button>
            </div>

            {loading ? (
                <p className="dark:text-gray-400">Carregando cargos...</p>
            ) : (
                <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                        <thead className="bg-gray-50 dark:bg-zinc-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Nome do Cargo
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {role.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenModal(role)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <RoleForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                role={editingRole}
            />
        </div>
    );
};

export default RoleList;
