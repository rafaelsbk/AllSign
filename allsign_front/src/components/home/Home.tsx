import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Phone, User, Accessibility, Sun, Zap, ShieldCheck, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

const Home: React.FC = () => {
  const [showCookies, setShowCookies] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 overflow-x-hidden">
      {/* Top Bar */}
      <div className="bg-solar-blue py-2 text-xs text-white/90">
        <div className="container mx-auto flex flex-wrap items-center justify-between px-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone size={14} className="text-solar-sky" />
              <span className="font-bold">(84) 3220-6200</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Zap size={14} className="text-solar-gold" />
              <span className="font-medium">Atendimento 24h: 0800-084-2323</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 font-bold uppercase tracking-wider text-[10px]">
            <span className="cursor-pointer hover:text-white transition-colors">Canais de atendimento</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span className="cursor-pointer hover:text-white transition-colors">Ouvidoria</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="py-6 bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-solar-orange rounded-2xl flex items-center justify-center shadow-solar group-hover:rotate-6 transition-transform">
              <Sun size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tighter leading-none">
                All<span className="text-solar-orange">Sol</span>
              </h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Energia Inteligente</p>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-bold text-zinc-600">
            <a href="#about" className="hover:text-solar-orange transition-colors">A AllSol</a>
            <a href="#solutions" className="hover:text-solar-orange transition-colors">Soluções</a>
            <a href="#contact" className="hover:text-solar-orange transition-colors">Fale Conosco</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-solar-orange transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar..."
                className="bg-zinc-100 border-none rounded-xl py-2 pl-10 pr-4 text-sm w-48 focus:w-64 focus:ring-2 focus:ring-solar-orange/20 focus:bg-white transition-all outline-none"
              />
            </div>
            <Link to="/login">
              <Button variant="solar" className="px-8 rounded-xl h-12 font-bold shadow-solar group">
                <User size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                <span>Área do Cliente</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-zinc-900 pt-20">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-solar-orange/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-solar-blue/30 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-solar-gold/10 border border-solar-gold/20 px-4 py-2 rounded-full mb-8">
              <Zap size={16} className="text-solar-gold" />
              <span className="text-solar-gold text-xs font-black uppercase tracking-widest">Inovação Sustentável</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-6">
              O futuro é <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-solar-gold via-solar-orange to-solar-gold animate-gradient-x">Sustentável.</span>
            </h1>
            
            <p className="text-xl text-zinc-400 font-medium max-w-lg mb-10 leading-relaxed">
              Transforme a luz do sol em economia real para sua casa ou empresa com tecnologia de ponta e gestão inteligente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="solar" size="lg" className="h-16 px-10 text-lg rounded-2xl shadow-solar-orange/40">
                Começar agora
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-10 text-lg rounded-2xl border-white/20 text-white hover:bg-white/10">
                Ver simulador
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-10 max-w-md">
              <div>
                <p className="text-3xl font-black text-white">95%</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Economia</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">+5k</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Clientes</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">25a</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Garantia</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl rotate-3">
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent z-10" />
               <img 
                 src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=1000" 
                 alt="Solar Panels" 
                 className="w-full h-[600px] object-cover"
               />
               <div className="absolute bottom-10 left-10 right-10 z-20">
                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-solar-green rounded-2xl flex items-center justify-center">
                        <BarChart3 className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-white font-bold">Produção Diária</p>
                        <p className="text-white/60 text-xs">Acompanhamento em tempo real</p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full bg-solar-gold"
                      />
                    </div>
                 </div>
               </div>
            </div>
            
            {/* Floating Badges */}
            <div className="absolute -top-10 -left-10 z-30 bg-white p-6 rounded-3xl shadow-2xl -rotate-6">
              <ShieldCheck className="text-solar-green mb-2" size={32} />
              <p className="text-zinc-900 font-black text-xl leading-none">Certificada</p>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">ISO 9001 / 14001</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cookie Banner */}
      <AnimatePresence>
        {showCookies && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-4xl z-50"
          >
            <div className="bg-white/80 backdrop-blur-2xl border border-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-sm text-zinc-600 font-medium">
                <p>
                  Nós usamos cookies para personalizar sua experiência e analisar nosso tráfego. 
                  Ao continuar navegando, você concorda com nossa <span className="text-solar-orange font-bold cursor-pointer hover:underline">Política de Privacidade</span>.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => setShowCookies(false)}
                  className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Recusar
                </button>
                <Button 
                  onPress={() => setShowCookies(false)}
                  variant="solar"
                  className="px-8 rounded-2xl h-12 shadow-solar-orange/20"
                >
                  Aceitar Tudo
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Accessibility */}
      <div className="fixed right-6 bottom-32 flex flex-col gap-3 z-40">
        <button className="bg-solar-blue w-14 h-14 text-white hover:bg-blue-800 rounded-2xl shadow-xl flex items-center justify-center transition-all hover:-translate-x-2 group">
          <Accessibility size={28} />
          <span className="absolute right-full mr-4 bg-zinc-900 text-white text-[10px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Acessibilidade</span>
        </button>
        <button className="bg-solar-orange w-14 h-14 text-white hover:bg-solar-gold rounded-2xl shadow-xl flex items-center justify-center transition-all hover:-translate-x-2 group overflow-hidden">
          <span className="font-black text-[10px]">LIBRAS</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
