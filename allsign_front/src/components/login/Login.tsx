import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Sun } from 'lucide-react';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { motion } from 'framer-motion';

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
      console.error('Erro de login:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Erro de conexão: O servidor não está respondendo.');
      } else if (err.response?.status === 401) {
        setError('Usuário ou senha inválidos.');
      } else {
        setError(err.response?.data?.detail || 'Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-zinc-50 px-4 overflow-hidden">
      {/* Decorative Sun Background */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-solar-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-solar-orange/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-zinc-100">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-solar-orange rounded-2xl mb-6 shadow-solar rotate-3 group">
               <Sun size={32} className="text-white animate-spin-slow group-hover:rotate-12 transition-transform" />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">
              All<span className="text-solar-orange">Sol</span>
            </h1>
            <p className="mt-3 text-zinc-500 font-medium">Gestão Inteligente de Energia Solar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <TextField 
              label="Usuário" 
              isRequired 
              value={username} 
              onChange={setUsername}
              placeholder="Digite seu usuário"
              className="group"
            />

            <TextField 
              label="Senha" 
              type="password" 
              isRequired 
              value={password} 
              onChange={setPassword}
              placeholder="Sua senha secreta"
            />

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              variant="solar"
              size="lg"
              isDisabled={loading}
              className="w-full h-14 rounded-2xl text-lg mt-4"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : 'Acessar Sistema'}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">
              © 2026 AllSol Energy
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;