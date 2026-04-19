import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Users, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { useToast } from '../shared/ToastContext';
import EmployeeForm from './EmployeeForm';

const EmployeeList: React.FC = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const { showToast } = useToast();

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/employees/', {
                params: { search: searchTerm }
            });
            const data = Array.isArray(response.data) ? response.data : response.data.results;
            setEmployees(data || []);
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
            showToast('Erro ao carregar funcionários.', 'error');
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
        showToast(message, 'success');
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            try {
                await api.delete(`/users/employees/${id}/`);
                handleSuccess('Funcionário excluído com sucesso!');
            } catch (error) {
                console.error("Erro ao excluir funcionário:", error);
                showToast('Erro ao excluir funcionário.', 'error');
            }
        }
    };

    return (
        <div className="p-8 pb-32 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Funcionários</h1>
                    <p className="text-zinc-500 font-medium mt-1">Gerencie sua equipe interna e acessos</p>
                </div>
            </div>

            <div className="mb-10">
                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-solar-orange transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Pesquisar funcionários..." 
                            className="w-full pl-12 pr-4 h-14 rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-4 focus:ring-solar-orange/10 focus:border-solar-orange transition-all font-medium" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </form>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-10 h-10 border-4 border-solar-orange border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Carregando...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employees.map((employee: any, index: number) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: index * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
                            key={employee.id} 
                            className="group relative rounded-[2.5rem] bg-white p-8 shadow-sm hover:shadow-2xl hover:shadow-solar-orange/5 transition-all duration-500 border border-zinc-100"
                        >
                            <div className={`absolute top-8 right-8 w-2.5 h-2.5 rounded-full ${employee.is_active ? 'bg-solar-green shadow-[0_0_10px_rgba(76,175,80,0.5)]' : 'bg-red-500'}`} />
                            
                            <div className="flex flex-col h-full">
                                <div className="mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6 group-hover:bg-solar-orange/10 group-hover:text-solar-orange transition-colors duration-500">
                                        <Users size={28} className="opacity-60" />
                                    </div>
                                    <h3 className="text-xl font-black text-zinc-900 truncate leading-tight mb-1" title={`${employee.first_name} ${employee.last_name}`}>
                                        {employee.first_name} {employee.last_name}
                                    </h3>
                                    <p className="text-sm font-bold text-solar-orange uppercase tracking-wider mb-4">
                                        {employee.role}
                                    </p>
                                    <div className="flex items-center text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                        <Mail size={14} className="mr-2" />
                                        <span className="text-xs font-bold truncate">{employee.email}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-auto flex items-center justify-end pt-6 border-t border-zinc-50 space-x-2">
                                    <button 
                                        onClick={() => handleOpenModal(employee)} 
                                        className="p-3 text-zinc-400 hover:text-solar-orange hover:bg-solar-orange/5 rounded-xl transition-all" 
                                        title="Editar"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(employee.id)} 
                                        className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                                        title="Excluir"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {!loading && employees.length === 0 && (
                <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-zinc-200">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-50 mb-6">
                        <Users size={32} className="text-zinc-300" />
                    </div>
                    <p className="text-zinc-500 font-bold text-lg">Nenhum funcionário encontrado.</p>
                </div>
            )}

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 md:left-[calc(50%+144px)]">
                <Button 
                    variant="solar" 
                    size="lg" 
                    onPress={() => handleOpenModal()} 
                    className="rounded-[2rem] shadow-[0_20px_40px_rgba(243,146,0,0.3)] h-16 px-10 hover:scale-105 transition-all duration-300 group"
                >
                    <Plus size={24} className="mr-3 group-hover:rotate-90 transition-transform duration-300" /> 
                    <span className="text-lg">Novo Funcionário</span>
                </Button>
            </div>

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
