import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
    message: string;
    onClose: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-8 right-8 z-[60] flex items-center space-x-3 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
            <CheckCircle size={24} />
            <span className="font-bold">{message}</span>
            <button onClick={onClose} className="hover:bg-green-600 p-1 rounded-full transition-colors">
                <X size={18} />
            </button>
        </div>
    );
};

export default SuccessToast;
