import React, { useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { Search, Phone, User, X, ChevronLeft, ChevronRight, Plus, Accessibility } from 'lucide-react';
import heroImg from '../../assets/images/fotoex1.jpg'; // Certifique-se de que o caminho da imagem está correto

const Home: React.FC = () => {
  const [showCookies, setShowCookies] = useState(true);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Top Bar */}
      <div className="border-b border-gray-100 py-2 text-xs">
        <div className="container mx-auto flex flex-wrap items-center justify-center md:justify-end px-4 space-x-4 md:space-x-8 text-gray-600">
          <div className="flex items-center space-x-2">
            <Phone size={14} className="text-blue-600" />
            <span className="font-bold text-gray-700">(84) 3220-6200</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-blue-600">SAC</span>
            <span className="font-bold text-gray-700">0800-084-2323</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 cursor-pointer hover:text-blue-600">
            <Plus size={14} className="text-blue-600" />
            <span>Canais de atendimento</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="py-5">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-4">
          {/* Logo */}
          <div className="flex items-center bg-blue-700 px-6 py-3 rounded-md min-w-[160px] justify-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">AllSol</span>
            <span className="ml-1 text-[11px] text-white self-end mb-1.5 font-medium">Energia</span>
          </div>

          {/* Search */}
          <div className="flex w-full md:flex-1 max-w-2xl mx-0 md:mx-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Faça sua busca aqui"
              className="w-full bg-gray-50 border border-gray-100 rounded-md py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Login Button */}
          <Link 
            to="/login"
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md transition-colors w-full md:w-auto"
          >
            <User size={20} className="border-2 border-white rounded-full p-0.5" />
            <span>Login</span>
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-y border-gray-200">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <ul className="flex flex-wrap justify-center md:justify-start space-x-6 md:space-x-8 py-4 text-[15px] font-medium text-gray-600">
            <li className="hover:text-blue-600 cursor-pointer transition-colors">A AllSol</li>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Quero ser Cliente</li>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Sou Cliente</li>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Notícias</li>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Guia Médico</li>
          </ul>
          <div className="flex items-center space-x-2 text-sm font-bold text-gray-800 cursor-pointer py-4 md:py-0 hover:text-blue-600 transition-colors">
            <span>ACESSO RÁPIDO</span>
            <ChevronRight size={16} className="rotate-90" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden bg-blue-900">
        {/* Usando a imagem como fundo com máscara/gradiente */}
        <div className="absolute inset-0 bg-blue-900 z-0"></div>
        <img 
          src={heroImg} 
          alt="Hero" 
          className="absolute right-0 top-0 h-full w-full md:w-3/5 object-cover object-center z-10 opacity-60 md:opacity-100 mask-image-gradient"
          style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
        />
        
        <div className="container mx-auto relative z-20 h-full flex flex-col justify-center px-4 md:px-12">
          <div className="max-w-2xl text-white">
            
            {/* Price Badge */}
            <div className="bg-white text-blue-900 inline-flex flex-col px-6 py-3 rounded-3xl rounded-bl-none mb-8 shadow-lg">
              <span className="text-sm font-bold bg-blue-900 text-white px-3 py-1 rounded-full self-start mb-2 -mt-6 -ml-2">Planos a partir de</span>
              <div className="flex items-baseline space-x-1 text-blue-700">
                <span className="text-2xl font-bold">R$</span>
                <span className="text-6xl font-extrabold tracking-tighter">118</span>
                <span className="text-3xl font-bold">,82</span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">Porte III (30 a 99 vidas)</p>
            </div>
            
            {/* Titles */}
            <h1 className="text-7xl font-extrabold tracking-tight mb-4">
              AllSol Ser
            </h1>
            <p className="text-4xl font-semibold text-yellow-400 mb-2">
              Essencial no cuidado.
            </p>
            <p className="text-3xl font-light text-white/90">
              Básico no preço.
            </p>
          </div>
        </div>

        {/* Carousel Buttons */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-sm transition-colors hidden md:block">
          <ChevronLeft size={24} />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-sm transition-colors hidden md:block">
          <ChevronRight size={24} />
        </button>
      </section>

      {/* Cookie Banner (Baseado no layout da Unimed) */}
      {showCookies && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#f4ece8] border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 p-6">
          <div className="container mx-auto flex flex-col xl:flex-row items-center justify-between gap-6 relative pr-8">
            <div className="flex-1 text-[13px] text-gray-700 leading-relaxed">
              <p>
                A <span className="font-bold text-blue-700">AllSol</span> utiliza cookies e dados de navegação visando proporcionar uma melhor experiência durante o uso do site. Ao aceitar, você terá acesso a todas as funcionalidades do site. Se clicar em "Rejeitar Cookies", os cookies que não forem estritamente necessários serão desativados. Para escolher quais quer autorizar, clique em "Gerenciar cookies". Conheça a nova versão da nossa Política de Privacidade.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                onClick={() => setShowCookies(false)}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors whitespace-nowrap"
              >
                Rejeitar Cookies
              </button>
              <button 
                onClick={() => setShowCookies(false)}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors whitespace-nowrap"
              >
                Aceitar todos
              </button>
              <button className="text-sm font-medium text-blue-700 hover:underline whitespace-nowrap px-4">
                Gerenciar os Cookies
              </button>
            </div>
            <button 
              onClick={() => setShowCookies(false)}
              className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-700"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Accessibility (Azul escuro) */}
      <div className="fixed right-0 top-1/4 -translate-y-1/2 flex flex-col z-40">
        <button className="bg-blue-900 p-3 text-white hover:bg-blue-800 rounded-l-md mb-1 shadow-md">
          <Accessibility size={24} />
        </button>
        <button className="bg-blue-900 p-3 text-white hover:bg-blue-800 rounded-l-md shadow-md">
          <div className="w-6 h-6 flex items-center justify-center font-bold">LIBRAS</div>
        </button>
      </div>
    </div>
  );
};

export default Home;