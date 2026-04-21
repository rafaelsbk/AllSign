import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  Users,
  FileText,
  Sun,
  ChevronRight,
  Briefcase,
  FileType
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', path: '/clients', icon: Users },
    { name: 'Contratos', path: '/contracts', icon: FileText },
  ];

  const registrationItems = [
    { name: 'Empresas', path: '/companies', icon: Briefcase },
    { name: 'Engenheiros', path: '/professionals', icon: Users },
    { name: 'Papéis Timbrados', path: '/letterheads', icon: FileType },
    { name: 'Modelos', path: '/templates', icon: Menu },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-100 z-40 flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-solar-blue rounded-lg flex items-center justify-center">
            <Sun size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter">AllSol</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-zinc-50 text-zinc-600"
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
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 z-50 h-screen w-72 transform border-r border-zinc-100 bg-white transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo Area */}
          <div className="flex h-20 items-center px-8 border-b border-zinc-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-solar-blue to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sun size={22} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-zinc-900 leading-none">AllSol</span>
                <span className="text-[10px] font-bold text-solar-orange uppercase tracking-[0.2em] mt-1">Energy Admin</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-4 py-8 overflow-y-auto">
            {/* Main Menu */}
            <div className="px-4 mb-4">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Menu Principal</span>
            </div>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200
                    ${active 
                      ? 'bg-solar-blue text-white shadow-lg shadow-blue-500/20' 
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={20} className={active ? 'text-white' : 'group-hover:text-solar-blue transition-colors'} />
                    <span>{item.name}</span>
                  </div>
                  {active && (
                    <motion.div layoutId="active-indicator">
                      <ChevronRight size={14} className="text-white/50" />
                    </motion.div>
                  )}
                </Link>
              );
            })}

            {/* Registration Menu */}
            <div className="px-4 mt-10 mb-4">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cadastros Técnicos</span>
            </div>
            {registrationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200
                    ${active 
                      ? 'bg-solar-blue text-white shadow-lg shadow-blue-500/20' 
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={20} className={active ? 'text-white' : 'group-hover:text-solar-blue transition-colors'} />
                    <span>{item.name}</span>
                  </div>
                  {active && (
                    <motion.div layoutId="active-indicator-reg">
                      <ChevronRight size={14} className="text-white/50" />
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer / User Area */}
          <div className="p-4 border-t border-zinc-50">
            <div className="bg-zinc-50 rounded-3xl p-4 mb-4">
               <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold">
                    {localStorage.getItem('username')?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-zinc-900 truncate">
                      {localStorage.getItem('username') || 'Usuário'}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Consultor Solar</span>
                  </div>
               </div>
               <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-red-500 shadow-sm border border-zinc-100 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                <span>Encerrar Sessão</span>
              </button>
            </div>
            
            <p className="text-center text-[10px] font-medium text-zinc-400">
              v1.2.0 • © 2026 AllSol
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;