import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) => {
  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  const bgColor = isError ? 'bg-red-600' : isSuccess ? 'bg-solar-green' : 'bg-solar-blue';
  const shadowColor = isError ? 'shadow-red-600/30' : isSuccess ? 'shadow-green-500/30' : 'shadow-blue-500/30';
  const Icon = isError ? AlertCircle : isSuccess ? CheckCircle : Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`pointer-events-auto flex items-center space-x-4 ${bgColor} text-white px-6 py-4 rounded-xl shadow-xl ${shadowColor} border border-white/10 max-w-md w-full`}
    >
      <div className="bg-white/20 p-2 rounded-full shrink-0">
        <Icon size={24} className="text-white" />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
          {isError ? 'Erro' : isSuccess ? 'Sucesso' : 'Aviso'}
        </span>
        <span className="font-bold text-sm leading-tight truncate">{toast.message}</span>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="bg-black/10 hover:bg-black/20 p-2 rounded-lg transition-all outline-none focus:ring-2 focus:ring-white/50 shrink-0"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};
