import React, { useState } from 'react';
import './Sidebar.css';
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
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

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
    { name: 'Empresas', path: '/companies', icon: <Building2 size={20} />, roles: ['Administrador', 'Vendedor', 'Financeiro'] },
    { name: 'Engenheiros / Arq.', path: '/professionals', icon: <HardHat size={20} />, roles: ['Administrador', 'Vendedor', 'Financeiro'] },
    { name: 'Contratos', path: '/contracts', icon: <FileText size={20} />, roles: ['Administrador', 'Vendedor', 'Financeiro'] },
    { name: 'Funcionários', path: '/employees', icon: <Briefcase size={20} />, roles: ['Administrador'] },
    { name: 'Cargos', path: '/roles', icon: <Shield size={20} />, roles: ['Administrador'] },
  ];
  
  const accessibleNavItems = navItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <>
      {/* Botão Mobile Menu */}
      <button 
        className="fixed top-4 left-4 z-50 rounded-lg bg-blue-600 p-2 text-white md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-40 h-screen w-64 transform bg-white p-4 shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-800 md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-8 px-2 py-4">
          <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-500 tracking-tight">AllSol</h2>
        </div>

        <nav className="flex flex-col h-[calc(100%-8rem)]">
          <div className="space-y-2">
            {accessibleNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${location.pathname.startsWith(item.path)
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-700'}
                `}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
