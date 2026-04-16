import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Login from './components/login/Login';
import Home from './components/home/Home';
import { motion, AnimatePresence } from 'framer-motion';

// Importações dos componentes
import Dashboard from './components/dashboard/Dashboard';
import RoleList from './components/roles/RoleList';
import EmployeeList from './components/employees/EmployeeList';
import CompanyList from './components/companies/CompanyList';
import ProfessionalList from './components/professionals/ProfessionalList';
import ClientList from './components/clients/ClientList';
import ContractList from './components/contracts/ContractList';

// Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

// Proteção de rotas
const PrivateRoute = () => {
  const isAuthenticated = !!localStorage.getItem('access_token');
  return isAuthenticated ? (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 md:pl-64">
      <Sidebar />
      <main className="pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  ) : <Navigate to="/login" />;
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/clients" element={<PageTransition><ClientList /></PageTransition>} />
          <Route path="/contracts" element={<PageTransition><ContractList /></PageTransition>} />
          <Route path="/companies" element={<PageTransition><CompanyList /></PageTransition>} />
          <Route path="/professionals" element={<PageTransition><ProfessionalList /></PageTransition>} />
          <Route path="/roles" element={<PageTransition><RoleList /></PageTransition>} /> 
          <Route path="/employees" element={<PageTransition><EmployeeList /></PageTransition>} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
