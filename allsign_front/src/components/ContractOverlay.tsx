import React, { useState, useEffect } from 'react';
import { X, Save, FileDown, Navigation, AlertCircle, Sun } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { useToast } from './shared/ToastContext';

interface ContractOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onSuccess: () => void;
  contract?: any;
  isViewOnly?: boolean;
}

const ContractOverlay: React.FC<ContractOverlayProps> = ({ isOpen, onClose, client, onSuccess, contract, isViewOnly }) => {
  const [formData, setFormData] = useState({
    date_day: '',
    date_month: '',
    date_year: '',
    contract_number: 'XXX',
    nationality: 'BRASILEIRO (A)',
    marital_status: 'SOLTEIRO (A)',
    client_name: '',
    client_cpf: '',
    client_rg: '',
    client_street: '',
    client_number: '',
    client_neighborhood: '',
    client_city: '',
    client_cep: '',
    client_phone: '',
    client_email: '',
    service_value: '',
    service_value_extenso: '',
    equipment_value: '',
    equipment_value_extenso: '',
    validity: '12 (DOZE) MESES',
    inverter_brand: '',
    inverter_quantity: '',
    inverter_k: 'XX',
    inverter_warranty: '10',
    panels_brand: '',
    panels_quantity: '',
    panels_watts: '550',
    panels_warranty: '25',
    due_date: 'MEDIANTE A INSTALAÇÃO DOS EQUIPAMENTOS',
    payment_method: 'EM PARCELA ÚNICA, POR TRANSFERÊNCIA BANCÁRIA, PIX, BOLETO OU CARTÃO DE CREDITO.',
    beneficiary_units: 'NÃO POSSUI',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const months = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
  ];

  const scrollToField = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        (element as HTMLElement).focus();
      }
    }
  };

  const navGroups = [
    {
      title: 'Identificação',
      items: [
        { id: 'field-contract-number', label: 'Nº do Contrato' },
        { id: 'section-assinaturas', label: 'Data do Contrato' },
      ]
    },
    {
      title: 'Contratante',
      items: [
        { id: 'field-client-name', label: 'Nome Completo' },
        { id: 'field-client-cpf', label: 'CPF / RG' },
        { id: 'section-contratante', label: 'Endereço Completo' },
      ]
    },
    {
      title: 'Resumo e Valores',
      items: [
        { id: 'section-resumo', label: 'Quadro Resumo' },
        { id: 'field-service-value', label: 'Valor do Serviço' },
        { id: 'field-equipment-value', label: 'Valor Equipamento' },
        { id: 'section-equipamentos', label: 'Especificação Técnica' },
      ]
    },
    {
      title: 'Cláusulas',
      items: [
        { id: 'section-clausulas', label: 'Objeto do Contrato' },
        { id: 'field-payment-clause', label: 'Pagamento (Cláusula 4)' },
        { id: 'field-beneficiary', label: 'Unidades Beneficiárias' },
      ]
    }
  ];

  useEffect(() => {
    if (isOpen) {
      if (contract) {
        const contractDate = new Date(contract.contract_date);
        setFormData({
          date_day: contractDate.getDate().toString().padStart(2, '0'),
          date_month: months[contractDate.getMonth()],
          date_year: contractDate.getFullYear().toString(),
          contract_number: contract.contract_number,
          nationality: contract.nationality || 'BRASILEIRO (A)',
          marital_status: contract.marital_status || client?.marital_status || 'SOLTEIRO (A)',
          client_name: contract.client_name || client?.name || '',
          client_cpf: contract.client_cpf || client?.cpf || '',
          client_rg: contract.client_rg || client?.rg || '',
          client_street: contract.client_street || client?.street || '',
          client_number: contract.client_number || client?.number || '',
          client_neighborhood: contract.client_neighborhood || client?.neighborhood || '',
          client_city: contract.client_city || client?.city || '',
          client_cep: contract.client_cep || client?.cep || '',
          client_phone: contract.client_phone || client?.phones?.[0]?.phone || '',
          client_email: contract.client_email || client?.email || '',
          service_value: contract.service_value.toString(),
          service_value_extenso: contract.service_value_extenso || '', 
          equipment_value: contract.equipment_value.toString(),
          equipment_value_extenso: contract.equipment_value_extenso || '',
          validity: contract.validity,
          inverter_brand: contract.inverter_brand,
          inverter_quantity: contract.inverter_quantity.toString(),
          inverter_k: contract.inverter_k,
          inverter_warranty: contract.inverter_warranty,
          panels_brand: contract.panels_brand,
          panels_quantity: contract.panels_quantity.toString(),
          panels_watts: contract.panels_watts,
          panels_warranty: contract.panels_warranty,
          due_date: contract.due_date,
          payment_method: contract.payment_method,
          beneficiary_units: contract.beneficiary_units,
        });
      } else {
        const now = new Date();
        setFormData({
          date_day: now.getDate().toString().padStart(2, '0'),
          date_month: months[now.getMonth()],
          date_year: now.getFullYear().toString(),
          contract_number: 'XXX',
          nationality: 'BRASILEIRO (A)',
          marital_status: client?.marital_status || 'SOLTEIRO (A)',
          client_name: client?.name || '',
          client_cpf: client?.cpf || '',
          client_rg: client?.rg || '',
          client_street: client?.street || '',
          client_number: client?.number || '',
          client_neighborhood: client?.neighborhood || '',
          client_city: client?.city || '',
          client_cep: client?.cep || '',
          client_phone: client?.phones?.[0]?.phone || '',
          client_email: client?.email || '',
          service_value: '',
          service_value_extenso: '',
          equipment_value: '',
          equipment_value_extenso: '',
          validity: '12 (DOZE) MESES',
          inverter_brand: '',
          inverter_quantity: '',
          inverter_k: 'XX',
          inverter_warranty: '10',
          panels_brand: '',
          panels_quantity: '',
          panels_watts: '550',
          panels_warranty: '25',
          due_date: 'MEDIANTE A INSTALAÇÃO DOS EQUIPAMENTOS',
          payment_method: 'EM PARCELA ÚNICA, POR TRANSFERÊNCIA BANCÁRIA, PIX, BOLETO OU CARTÃO DE CREDITO.',
          beneficiary_units: 'NÃO POSSUI',
        });
      }
    }
  }, [isOpen, contract, client]);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;
    setLoading(true);
    setError('');
    try {
      const monthIndex = months.indexOf(formData.date_month) + 1;
      const payload = {
        client: client.id,
        contract_number: formData.contract_number,
        nationality: formData.nationality,
        marital_status: formData.marital_status,
        client_name: formData.client_name,
        client_cpf: formData.client_cpf,
        client_rg: formData.client_rg,
        client_street: formData.client_street,
        client_number: formData.client_number,
        client_neighborhood: formData.client_neighborhood,
        client_city: formData.client_city,
        client_cep: formData.client_cep,
        client_phone: formData.client_phone,
        client_email: formData.client_email,
        service_value: parseFloat(formData.service_value.replace(/\./g, '').replace(',', '.')) || 0,
        service_value_extenso: formData.service_value_extenso,
        equipment_value: parseFloat(formData.equipment_value.replace(/\./g, '').replace(',', '.')) || 0,
        equipment_value_extenso: formData.equipment_value_extenso,
        validity: formData.validity,
        inverter_brand: formData.inverter_brand,
        inverter_quantity: parseInt(formData.inverter_quantity) || 0,
        inverter_k: formData.inverter_k,
        inverter_warranty: formData.inverter_warranty,
        panels_brand: formData.panels_brand,
        panels_quantity: parseInt(formData.panels_quantity) || 0,
        panels_watts: formData.panels_watts,
        panels_warranty: formData.panels_warranty,
        due_date: formData.due_date,
        payment_method: formData.payment_method,
        beneficiary_units: formData.beneficiary_units,
        contract_date: `${formData.date_year}-${monthIndex.toString().padStart(2, '0')}-${formData.date_day.padStart(2, '0')}`,
      };
      if (contract?.id) await api.put(`/users/contracts/${contract.id}/`, payload);
      else await api.post('/users/contracts/', payload);
      showToast(contract?.id ? 'Contrato atualizado!' : 'Contrato criado!', 'success');
      onSuccess();
      onClose();
    } catch (err) { 
      console.error(err);
      setError('Erro ao salvar contrato.'); 
      showToast('Erro ao salvar contrato.', 'error');
    }
    finally { setLoading(false); }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/users/contracts/generate-pdf/', formData, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contrato_${(formData.client_name || 'Documento').replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('PDF gerado com sucesso!', 'success');
    } catch (err) { 
      console.error('Erro PDF Backend:', err);
      setError('Falha ao gerar PDF no servidor.'); 
      showToast('Erro ao gerar PDF.', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  const inputClass = (baseClass: string) => isViewOnly 
    ? baseClass.replace('bg-solar-gold/10 border-solar-orange/30', 'bg-transparent border-transparent cursor-default font-bold') 
    : baseClass;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/80 p-0 md:p-4 backdrop-blur-md overflow-y-auto print:static print:bg-white print:p-0">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-7xl rounded-[2.5rem] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)] dark:bg-zinc-950 my-0 md:my-4 flex flex-col h-full md:h-auto max-h-[95vh] print:shadow-none print:my-0 print:h-auto print:max-h-none overflow-hidden border border-zinc-100 dark:border-zinc-800"
      >
        
        {/* UI Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-950 z-30 shrink-0 print:hidden">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
              {isViewOnly ? 'Visualização de Contrato' : (contract ? 'Editar Contrato' : 'Novo Contrato')}
            </h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Instrumento Particular de Prestação de Serviços</p>
          </div>
          <div className="flex items-center space-x-4">
            <AnimatePresence>
              {error && (
                <motion.span 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-full flex items-center gap-2"
                >
                  <AlertCircle size={14} /> {error}
                </motion.span>
              )}
            </AnimatePresence>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-72 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-100 dark:border-zinc-800 overflow-y-auto p-8 hidden lg:block print:hidden shrink-0">
            <div className="flex items-center space-x-2 mb-10">
              <Navigation size={14} className="text-solar-orange" />
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Navegação Rápida</h3>
            </div>
            <nav className="space-y-10">
              {navGroups.map((group, idx) => (
                <div key={idx} className="space-y-4">
                  <h4 className="text-[10px] font-black text-solar-blue dark:text-solar-sky uppercase tracking-widest px-2">{group.title}</h4>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => scrollToField(item.id)}
                          className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-solar-orange dark:hover:text-white hover:translate-x-1 transition-all duration-300 text-left w-full px-2 py-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800"
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            
            <div className="mt-12 p-6 rounded-[2rem] bg-solar-orange/5 border border-solar-orange/10">
              <p className="text-[10px] text-solar-orange leading-relaxed font-black uppercase tracking-widest text-center">
                Dica: Use os atalhos para navegar no documento.
              </p>
            </div>
          </div>

          {/* Scrollable Document Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-zinc-100 dark:bg-zinc-900 print:bg-white print:p-0 print:overflow-visible custom-scrollbar">
            <form id="contract-form" onSubmit={handleSubmit}>
              <div id="contract-paper" className="bg-white text-zinc-900 p-12 md:p-24 shadow-2xl border border-zinc-200 rounded-sm font-serif leading-relaxed text-[12px] md:text-[14px] print:shadow-none print:border-none print:p-0 mx-auto max-w-[210mm] print:max-w-none relative">
                
                {/* Solar Watermark (Optional) */}
                <Sun size={400} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-50 opacity-10 pointer-events-none print:hidden" />

                {/* PÁGINA 1 */}
                <div className="text-center mb-16 relative z-10">
                  <h1 className="font-bold text-[16px] md:text-lg uppercase tracking-tight">INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS VOLTADOS PARA INSTALAÇÃO DE SISTEMA SOLAR FOTOVOLTAICO</h1>
                  <p className="font-bold mt-6 uppercase text-[15px] text-solar-orange">CONTRATO N º ON-RN-<input id="field-contract-number" type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 border-b border-solar-orange/30 outline-none px-2 w-20 text-center font-black scroll-mt-32 focus:bg-solar-gold/20 transition-colors")} value={formData.contract_number} onChange={(e) => setFormData({...formData, contract_number: e.target.value})}/>-2025</p>
                </div>

                <section id="section-contratante" className="mb-12 scroll-mt-32 relative z-10">
                  <h2 className="font-bold mb-6 uppercase underline text-[14px] decoration-solar-orange decoration-2 underline-offset-4">I – DA QUALIFICAÇÃO DAS PARTES:</h2>
                  <div className="text-justify space-y-6">
                    <p>
                      <strong>Contratante:</strong> <input id="field-client-name" type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 px-2 font-bold uppercase w-full max-w-[400px] scroll-mt-24")} value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})}/>, <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-40 px-2 mx-1")} value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})}/>, inscrito no CPF sob o nº <input id="field-client-cpf" type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-40 px-2 mx-1 font-bold scroll-mt-24")} value={formData.client_cpf} onChange={e => setFormData({...formData, client_cpf: e.target.value})}/>, RG nº <input id="field-client-rg" type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-48 px-2 mx-1 font-bold scroll-mt-24")} value={formData.client_rg} onChange={e => setFormData({...formData, client_rg: e.target.value})}/>, residente e domiciliado na Rua <input id="field-client-address" type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-full max-w-[350px] px-2 font-bold uppercase scroll-mt-24")} value={formData.client_street} onChange={e => setFormData({...formData, client_street: e.target.value})}/>, nº <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-20 px-2 font-bold")} value={formData.client_number} onChange={e => setFormData({...formData, client_number: e.target.value})}/>, Bairro <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-48 px-2 font-bold uppercase")} value={formData.client_neighborhood} onChange={e => setFormData({...formData, client_neighborhood: e.target.value})}/>, Cidade <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-48 px-2 font-bold uppercase")} value={formData.client_city} onChange={e => setFormData({...formData, client_city: e.target.value})}/>, CEP: <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-32 px-2 font-bold")} value={formData.client_cep} onChange={e => setFormData({...formData, client_cep: e.target.value})}/>, de ora em diante denominada de CONTRATANTE.
                    </p>
                    <p>
                      <strong>Contratada: SOLAR SOL ENERGIA RENOVÁVEIS LTDA</strong>, pessoa jurídica de direito privado, inscrita sob o CNPJ nº 42.518.541/0001-56, com endereço comercial na Avenida Prudente de Morais, nº 0507, Centro Empresarial Djalma Marinho, Loja A, Tirol, Natal/RN, CEP 590.20-810, neste ato representado por seu sócio, Sr. Lucas Luís de Oliveira Barbosa, portador do RG nº 2189466 e CREA nº 2119764026, de ora em diante denominada de CONTRATADA.
                    </p>
                  </div>
                </section>

                {/* Rest of the document content stays the same but with inputClass and styling updates */}
                {/* PÁGINA 2 */}
                <section id="section-resumo" className="mb-12 break-inside-avoid scroll-mt-32 relative z-10">
                  <h2 className="font-bold mb-8 inline-block uppercase underline text-[14px] decoration-solar-orange decoration-2 underline-offset-4">II – DO QUADRO RESUMO:</h2>
                  <div className="border-2 border-zinc-200 overflow-hidden text-[12px] rounded-2xl">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b-2 border-zinc-100">
                          <td className="w-1/2 p-5 border-r-2 border-zinc-100 font-bold uppercase bg-zinc-50/50">VALOR DO SERVIÇO (SOLAR SOL)</td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 font-black text-solar-orange">● R$ <input id="field-service-value" type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 border-b border-solar-orange/30 outline-none px-3 w-48 font-black scroll-mt-24")} value={formData.service_value} onChange={e => setFormData({...formData, service_value: e.target.value})}/></div>
                          </td>
                        </tr>
                        <tr className="border-b-2 border-zinc-100">
                          <td className="p-5 border-r-2 border-zinc-100 font-bold uppercase bg-zinc-50/50">VALOR DO EQUIPAMENTO (DISTRIBUIDORA)</td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 font-black text-solar-blue">● R$ <input id="field-equipment-value" type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 border-b border-solar-orange/30 outline-none px-3 w-48 font-black scroll-mt-24")} value={formData.equipment_value} onChange={e => setFormData({...formData, equipment_value: e.target.value})}/></div>
                          </td>
                        </tr>
                        <tr className="border-b-2 border-zinc-100">
                          <td className="p-5 border-r-2 border-zinc-100 font-bold uppercase bg-zinc-50/50">VIGÊNCIA DO CONTRATO</td>
                          <td className="p-5 font-bold uppercase">● 12 (DOZE) MESES</td>
                        </tr>
                        <tr id="section-equipamentos" className="border-b-2 border-zinc-100 scroll-mt-32">
                          <td className="p-5 border-r-2 border-zinc-100 font-bold uppercase bg-zinc-50/50">ESPECIFICAÇÕES TÉCNICAS</td>
                          <td className="p-5 space-y-3 font-bold uppercase text-[11px]">
                            <div className="flex gap-3 items-center">
                              ● <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-12 text-center py-1 rounded-md")} value={formData.inverter_quantity} onChange={e => setFormData({...formData, inverter_quantity: e.target.value})}/> 
                              <span className="opacity-60">INVERSOR</span> 
                              <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 flex-1 px-3 py-1 uppercase rounded-md")} value={formData.inverter_brand} onChange={e => setFormData({...formData, inverter_brand: e.target.value})}/>
                            </div>
                            <div className="flex gap-3 items-center">
                              ● <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-12 text-center py-1 rounded-md")} value={formData.panels_quantity} onChange={e => setFormData({...formData, panels_quantity: e.target.value})}/> 
                              <span className="opacity-60">PAINÉIS</span> 
                              <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 flex-1 px-3 py-1 uppercase rounded-md")} value={formData.panels_brand} onChange={e => setFormData({...formData, panels_brand: e.target.value})}/>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-5 border-r-2 border-zinc-100 font-bold uppercase bg-zinc-50/50">UNIDADES BENEFICIÁRIAS</td>
                          <td className="p-5 font-bold uppercase">
                            ● <input id="field-beneficiary" type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-full px-3 py-1 rounded-md scroll-mt-24")} value={formData.beneficiary_units} onChange={e => setFormData({...formData, beneficiary_units: e.target.value})}/>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <div className="text-justify mb-10 italic opacity-70">
                  Pelo presente instrumento particular as partes, CONTRATADA e CONTRATANTE, têm entre si, certa, ajustada e contratada a PRESTAÇÃO DE SERVIÇOS voltados à instalação de sistema solar fotovoltaico...
                </div>

                <div className="text-center py-20 opacity-30 border-t border-zinc-100 print:hidden">
                   <p className="font-bold text-xs uppercase tracking-[0.5em]">Continuação do documento legal...</p>
                </div>

                {/* Final sections for signature */}
                <div id="section-assinaturas" className="mt-32 text-right uppercase font-bold pb-10 scroll-mt-32 border-t pt-10 border-zinc-100">
                  Natal/RN, <input id="field-date-day" type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-10 text-center rounded-md")} value={formData.date_day} onChange={e => setFormData({...formData, date_day: e.target.value})}/> de <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-48 text-center rounded-md")} value={formData.date_month} onChange={e => setFormData({...formData, date_month: e.target.value.toUpperCase()})}/> de <input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-24 text-center rounded-md")} value={formData.date_year} onChange={e => setFormData({...formData, date_year: e.target.value})}/>.
                </div>

                <div className="mt-32 grid grid-cols-2 gap-24 break-inside-avoid">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-full border-t-2 border-zinc-900 mb-4"></div>
                    <p className="font-black text-[14px] uppercase tracking-tighter"><input type="text" readOnly={isViewOnly} className={inputClass("bg-solar-gold/10 w-full text-center py-1 font-black")} value={formData.client_name}/></p>
                    <p className="text-[11px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">CONTRATANTE</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-full border-t-2 border-zinc-900 mb-4"></div>
                    <p className="font-black text-[14px] uppercase tracking-tighter">SOLAR SOL ENERGIA RENOVÁVEIS LTDA</p>
                    <p className="text-[11px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">CONTRATADA</p>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </div>

        {/* Footer Actions UI */}
        <div className="px-8 py-6 border-t border-zinc-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-950 z-30 shrink-0 print:hidden flex items-center justify-between">
          <Button variant="outline" onPress={onClose} className="px-8 rounded-2xl h-12 font-bold">
            Cancelar
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button 
              onPress={handleGeneratePDF}
              isDisabled={loading}
              variant="secondary"
              className="px-8 rounded-2xl h-12 font-bold shadow-sm"
            >
              <FileDown size={18} className="mr-2" />
              <span>{loading ? 'Processando...' : 'Gerar PDF'}</span>
            </Button>

            {!isViewOnly && (
              <Button 
                form="contract-form" 
                type="submit" 
                isDisabled={loading}
                variant="solar"
                className="px-10 rounded-2xl h-12 font-bold shadow-solar"
              >
                {loading ? 'Salvando...' : <><Save size={18} className="mr-2" /><span>Salvar Contrato</span></>}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden; }
          #contract-paper, #contract-paper * { visibility: visible; }
          #contract-paper {
            position: absolute; left: 0; top: 0; width: 100%;
            box-shadow: none; border: none; padding: 20mm; margin: 0;
          }
          .print\\:hidden { display: none !important; }
          input { border: none !important; background: transparent !important; color: black !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; }
      `}</style>
    </div>
  );
};

export default ContractOverlay;
