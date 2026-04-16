import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Modal } from '../ui/Modal';

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
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.name?.[0] || 'Ocorreu um erro ao salvar o cargo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={role ? 'Editar Cargo' : 'Novo Cargo'}
            maxWidth="max-w-md"
        >
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <TextField 
                    label="Nome do Cargo"
                    isRequired
                    value={name}
                    onChange={setName}
                    placeholder="Ex: Vendedor"
                />
                
                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-700">
                    <Button variant="outline" onPress={onClose}>Cancelar</Button>
                    <Button type="submit" variant="solar" isDisabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default RoleForm;
