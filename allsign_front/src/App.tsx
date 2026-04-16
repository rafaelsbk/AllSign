import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/sidebar/Sidebar';
import Login from './components/login/Login';
import Home from './components/home/Home';
import Dashboard from './components/dashboard/Dashboard';
import ClientList from './components/clients/ClientList';
import ContractList from './components/contracts/ContractList';
import TemplateList from './components/contracts/TemplateList';
import CompanyList from './components/companies/CompanyList';
import ProfessionalList from './components/professionals/ProfessionalList';
import { ToastProvider } from './components/shared/ToastContext';

// Layout Animado para rotas internas
const PageLayout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 md:pl-72 transition-colors duration-500 relative overflow-hidden">
      {/* Elemento Decorativo de Fundo */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white dark:bg-zinc-900/30 -skew-x-12 translate-x-1/2 pointer-events-none" />
      
      <Sidebar />
      <main className="pt-20 md:pt-0 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// Proteção de rotas
const PrivateRoute = () => {
  const isAuthenticated = !!localStorage.getItem('access_token');
  return isAuthenticated ? <PageLayout /> : <Navigate to="/login" />;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/contracts" element={<ContractList />} />
            <Route path="/templates" element={<TemplateList />} />
            <Route path="/companies" element={<CompanyList />} />
            <Route path="/professionals" element={<ProfessionalList />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
