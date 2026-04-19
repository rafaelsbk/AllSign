import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DuplicateCPFModalProps {
    errorInfo: {name: string} | null;
    isOpen: boolean;
    onClose: () => void;
}

const DuplicateCPFModal: React.FC<DuplicateCPFModalProps> = ({ errorInfo, isOpen, onClose }) => {
  if (!isOpen || !errorInfo) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-5">
          <AlertTriangle size={36} className="text-amber-500" />
        </div>
        <h3 className="text-xl font-bold text-zinc-800">CPF/CNPJ já Cadastrado</h3>
        <p className="mt-3 text-zinc-600">
          Este documento já está vinculado ao cliente: <strong className="">{errorInfo.name}</strong>.
        </p>
        <p className="text-sm text-zinc-500 mt-1">Por favor, utilize um documento diferente.</p>
        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateCPFModal;
