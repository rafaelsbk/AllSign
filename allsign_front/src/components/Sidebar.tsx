import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  LogOut, 
  Menu, 
  X,
  Users
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

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Criar Usuário', path: '/create-user', icon: <UserPlus size={20} /> },
    { name: 'Lista Usuários', path: '/users', icon: <Users size={20} /> },
  ];

  return (
    <>
      {/* Botão Mobile Menu */}
      <button 
        className="fixed top-4 left-4 z-50 rounded-lg bg-indigo-600 p-2 text-white md:hidden"
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
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">AllSign</h2>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${location.pathname === item.path 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-700'}
              `}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
