import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Users, Building2, FileText, Sun, Battery, ArrowUpRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 100 
      } 
    }
  };

  const stats = [
    { name: 'Total de Clientes', value: '128', change: '+12%', icon: Users, color: 'bg-solar-blue/10', textColor: 'text-solar-blue' },
    { name: 'Empresas Ativas', value: '42', change: '+5%', icon: Building2, color: 'bg-solar-orange/10', textColor: 'text-solar-orange' },
    { name: 'Contratos Gerados', value: '86', change: '+18%', icon: FileText, color: 'bg-solar-green/10', textColor: 'text-solar-green' },
    { name: 'Potência Total (kWp)', value: '1,250', change: '+24%', icon: Sun, color: 'bg-solar-gold/10', textColor: 'text-solar-gold' },
  ];

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
            Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium flex items-center">
            <Sun size={18} className="mr-2 text-solar-orange animate-spin-slow" />
            Visão geral da sua rede de energia inteligente.
          </p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
           <Calendar size={18} className="text-zinc-400" />
           <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
             {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
           </span>
        </div>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              variants={item}
              className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-solar-orange/5 transition-all duration-500 border border-zinc-100 dark:border-zinc-800 group cursor-default"
            >
              <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <Icon size={28} className={stat.textColor} />
                </div>
                <div className="flex items-center space-x-1 text-solar-green bg-solar-green/10 px-3 py-1 rounded-full">
                  <ArrowUpRight size={14} className="font-bold" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{stat.change}</span>
                </div>
              </div>
              <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.name}</p>
              <h3 className="text-4xl font-black text-zinc-900 dark:text-white">{stat.value}</h3>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="lg:col-span-2 bg-gradient-to-br from-solar-blue to-[#002B5C] rounded-[3rem] p-10 text-white shadow-[0_30px_60px_rgba(0,74,153,0.3)] relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-8">
              <Battery size={16} className="text-solar-gold" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Monitoramento Ativo</span>
            </div>
            
            <h2 className="text-5xl font-black mb-6 tracking-tighter leading-tight">
              Acompanhe sua <br />
              geração em <span className="text-solar-gold">tempo real.</span>
            </h2>
            
            <p className="text-blue-100/70 max-w-sm mb-10 font-medium leading-relaxed">
              Integramos os dados das suas usinas diretamente aqui no dashboard para facilitar o suporte ao seu cliente.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-colors">
                <span className="block text-[10px] uppercase font-bold text-blue-200/50 tracking-widest mb-2">Instalações</span>
                <span className="font-black text-2xl">86%</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-colors">
                <span className="block text-[10px] uppercase font-bold text-blue-200/50 tracking-widest mb-2">Propostas</span>
                <span className="font-black text-2xl">142</span>
              </div>
              <div className="hidden sm:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-colors">
                <span className="block text-[10px] uppercase font-bold text-blue-200/50 tracking-widest mb-2">Meta Mensal</span>
                <span className="font-black text-2xl">R$ 450k</span>
              </div>
            </div>
          </div>
          
          <Sun size={400} className="absolute -right-20 -bottom-20 text-white/[0.03] group-hover:text-white/[0.07] transition-all duration-1000 pointer-events-none" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col"
        >
          <div className="mb-10">
            <h2 className="text-2xl font-black dark:text-white tracking-tighter mb-2">Atalhos</h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Ações Rápidas</p>
          </div>
          
          <div className="space-y-3 flex-1">
             {[
               { name: 'Novo Cliente', icon: Users, color: 'group-hover:text-solar-blue', path: '/clients' },
               { name: 'Nova Empresa', icon: Building2, color: 'group-hover:text-solar-orange', path: '/companies' },
               { name: 'Gerar Contrato', icon: FileText, color: 'group-hover:text-solar-green', path: '/contracts' }
             ].map((action, i) => {
               const ActionIcon = action.icon;
               return (
                 <Link 
                  key={i}
                  to={action.path}
                  className="w-full text-left p-5 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none transition-all font-bold text-zinc-600 dark:text-zinc-300 flex items-center group border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700"
                 >
                   <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center mr-4 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-solar-orange transition-all">
                     <ActionIcon size={20} />
                   </div>
                   <div className="flex flex-col">
                     <span className="leading-none">{action.name}</span>
                     <span className="text-[10px] font-medium opacity-50 mt-1 uppercase tracking-wider">Criar Registro</span>
                   </div>
                 </Link>
               );
             })}
          </div>
          
          <div className="mt-10 pt-10 border-t border-zinc-100 dark:border-zinc-800">
             <div className="bg-solar-orange/5 p-6 rounded-[2rem] border border-solar-orange/10">
               <p className="text-[10px] font-black text-solar-orange uppercase tracking-widest mb-2">Suporte AllSol</p>
               <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Precisa de ajuda com o sistema?</p>
               <button className="mt-4 text-xs font-black uppercase text-solar-orange hover:text-solar-gold transition-colors">Abrir Chamado →</button>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
