import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  Users,
  FileText,
  Briefcase,
  Shield,
  Building2,
  HardHat,
  Sun,
  ChevronRight
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';

// Função para pegar o role do usuário do token
const getUserRole = () => {
  const token = localStorage.getItem('access_token');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role;
    } catch (e) {
      console.error("Token inválido:", e);
      return null;
    }
  }
  return null;
};

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Administrador', 'Vendedor', 'Financeiro'] },
    { name: 'Clientes', path: '/clients', icon: <Users size={20} />, roles: ['Administrador', 'Vendedor', 'Financeiro'] },
    { name: 'Contratos', path: '/contracts', icon: <FileText size={20} />, roles: ['Administrador', 'Vendedor', 'Financeiro'] },
    { name: 'Empresas', path: '/companies', icon: <Building2 size={20} />, roles: ['Administrador', 'Vendedor', 'Financeiro'] },
    { name: 'Engenheiros', path: '/professionals', icon: <HardHat size={20} />, roles: ['Administrador', 'Vendedor', 'Financeiro'] },
    { name: 'Funcionários', path: '/employees', icon: <Briefcase size={20} />, roles: ['Administrador'] },
    { name: 'Cargos', path: '/roles', icon: <Shield size={20} />, roles: ['Administrador'] },
  ];
  
  const accessibleNavItems = navItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white dark:bg-zinc-900 px-6 py-4 shadow-sm md:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-solar-orange rounded-lg flex items-center justify-center shadow-solar">
            <Sun size={18} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">
            All<span className="text-solar-orange">Sol</span>
          </h2>
        </div>
        <button 
          className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2 text-zinc-600 dark:text-zinc-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-zinc-900/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-40 h-screen w-72 transform bg-white dark:bg-zinc-950 p-6 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0 border-r border-zinc-100 dark:border-zinc-900
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="mb-12 flex items-center space-x-3 px-2">
          <div className="w-12 h-12 bg-solar-orange rounded-2xl flex items-center justify-center shadow-solar-orange/40 shadow-lg rotate-3">
            <Sun size={24} className="text-white animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
              All<span className="text-solar-orange">Sol</span>
            </h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">Management</p>
          </div>
        </div>

        {/* User Info Card (Optional) */}
        <div className="mb-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-4 flex items-center space-x-3 border border-zinc-100 dark:border-zinc-800">
           <div className="w-10 h-10 rounded-xl bg-solar-blue/10 flex items-center justify-center text-solar-blue font-bold text-lg">
             {userRole?.[0]}
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">Usuário Ativo</p>
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{userRole}</p>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-[calc(100%-20rem)] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-1.5">
            <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Menu Principal</p>
            {accessibleNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300
                    ${isActive
                      ? 'bg-solar-orange text-white shadow-lg shadow-solar-orange/30 translate-x-1' 
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-solar-orange'}`}>
                      {item.icon}
                    </div>
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <motion.div layoutId="active-indicator">
                      <ChevronRight size={14} className="text-white/70" />
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 rounded-2xl px-4 py-4 text-sm font-bold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-950/20 group border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                <LogOut size={20} />
              </div>
              <div className="flex flex-col items-start">
                <span className="leading-none">Sair do Sistema</span>
                <span className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-wider">Encerrar Sessão</span>
              </div>
            </button>
          </div>
        </nav>
        
        {/* Footer Credit */}
        <div className="absolute bottom-6 left-6 right-6">
           <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest opacity-50">
             © 2026 AllSol v1.0
           </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
