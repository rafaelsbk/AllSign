import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import SuccessToast from '../../components/shared/SuccessToast';

const EmployeeList: React.FC = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/employees/', {
                params: { search: searchTerm }
            });
            // Handle paginated response or direct array
            const data = Array.isArray(response.data) ? response.data : response.data.results;
            setEmployees(data || []);
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchEmployees();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleOpenModal = (employee: any | null = null) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingEmployee(null);
        setIsModalOpen(false);
    };

    const handleSuccess = (message: string) => {
        fetchEmployees();
        handleCloseModal();
        setSuccessMessage(message);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            try {
                await api.delete(`/users/employees/${id}/`);
                handleSuccess('Funcionário excluído com sucesso!');
            } catch (error) {
                console.error("Erro ao excluir funcionário:", error);
                alert("Não foi possível excluir o funcionário.");
            }
        }
    };

    return (
        <div className="p-8">
            {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h1 className="text-2xl font-bold dark:text-white">Gerenciamento de Funcionários</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar funcionário..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                        <span>Novo Funcionário</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="dark:text-gray-400">Carregando funcionários...</p>
            ) : (
                <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                        <thead className="bg-gray-50 dark:bg-zinc-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Funcionário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cargo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                            {employees.map((employee) => (
                                <tr key={employee.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.first_name} {employee.last_name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{employee.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            employee.is_active 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            {employee.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenModal(employee)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <EmployeeForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                employee={editingEmployee}
            />
        </div>
    );
};

export default EmployeeList;
