import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Lock, User } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/token/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Usuário ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-zinc-900">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-8 shadow-xl border border-gray-100 dark:bg-zinc-800 dark:border-zinc-700">
        <div className="mb-8 text-center">
          <div className="inline-block bg-blue-700 px-6 py-2 rounded-md mb-4">
             <h1 className="text-3xl font-extrabold tracking-tight text-white">AllSol</h1>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuário</label>
            <div className="relative mt-1 flex items-center">
              <span className="absolute left-3 text-gray-400">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:text-sm transition-colors"
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
            <div className="relative mt-1 flex items-center">
              <span className="absolute left-3 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:text-sm transition-colors"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;