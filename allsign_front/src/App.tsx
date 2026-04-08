import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Login from './components/login/Login';
import Home from './components/home/Home';

// Mock do Dashboard
const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold dark:text-white text-sky-600">Dashboard</h1>
    <p className="mt-4 text-gray-600 dark:text-gray-400">Bem-vindo ao sistema AllSol.</p>
  </div>
);

// Mock da criação de usuário
const CreateUser = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold dark:text-white">Criar Novo Usuário</h1>
    <div className="mt-8 max-w-lg rounded-xl bg-white p-6 shadow-md dark:bg-zinc-800">
       <p className="text-gray-500">Formulário de criação virá aqui...</p>
    </div>
  </div>
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-user" element={<CreateUser />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
