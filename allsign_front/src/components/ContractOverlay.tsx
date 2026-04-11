import React, { useState, useEffect } from 'react';
import { X, Save, FileDown } from 'lucide-react';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const months = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
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
        service_value: parseFloat(formData.service_value.replace('.', '').replace(',', '.')) || 0,
        service_value_extenso: formData.service_value_extenso,
        equipment_value: parseFloat(formData.equipment_value.replace('.', '').replace(',', '.')) || 0,
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
      onSuccess();
      onClose();
    } catch (err) { 
      console.error(err);
      setError('Erro ao salvar contrato.'); 
    }
    finally { setLoading(false); }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/users/contracts/generate-pdf/', formData, {
        responseType: 'blob' // Importante para receber arquivos binários
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
    } catch (err) { 
      console.error('Erro PDF Backend:', err);
      setError('Falha ao gerar PDF no servidor.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const inputClass = (baseClass: string) => isViewOnly ? baseClass.replace('bg-yellow-100 border-yellow-400', 'bg-transparent border-transparent cursor-default') : baseClass;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-0 md:p-4 backdrop-blur-sm overflow-y-auto print:static print:bg-white print:p-0">
      <div className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl dark:bg-zinc-900 my-0 md:my-8 flex flex-col h-full md:h-auto max-h-screen print:shadow-none print:my-0 print:h-auto print:max-h-none">
        
        {/* UI Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-30 rounded-t-xl shrink-0 print:hidden">
          <div className="flex flex-col">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {isViewOnly ? 'Visualização de Contrato Completo' : (contract ? 'Editar Contrato' : 'Novo Contrato')}
            </h2>
            <p className="text-xs text-gray-500">Documento integral com todas as cláusulas jurídicas (15 páginas)</p>
          </div>
          <div className="flex items-center space-x-2">
            {error && <span className="text-red-500 text-xs mr-4">{error}</span>}
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-zinc-100 dark:bg-zinc-950 print:bg-white print:p-0 print:overflow-visible">
          <form id="contract-form" onSubmit={handleSubmit}>
            <div id="contract-paper" className="bg-white text-zinc-900 p-8 md:p-20 shadow-2xl border border-zinc-200 rounded-sm font-serif leading-relaxed text-[12px] md:text-[14px] print:shadow-none print:border-none print:p-0 mx-auto max-w-[210mm] print:max-w-none">
              
              {/* PÁGINA 1 */}
              <div className="text-center mb-12">
                <h1 className="font-bold text-[16px] md:text-lg uppercase">INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS VOLTADOS PARA INSTALAÇÃO DE SISTEMA SOLAR FOTOVOLTAICO</h1>
                <p className="font-bold mt-4 uppercase text-[15px]">CONTRATO N º ON-RN-<input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 border-b border-yellow-400 outline-none px-1 w-16 text-center font-bold")} value={formData.contract_number} onChange={(e) => setFormData({...formData, contract_number: e.target.value})}/>-2025</p>
              </div>

              <section className="mb-10">
                <h2 className="font-bold mb-4 uppercase underline text-[14px]">I – DA QUALIFICAÇÃO DAS PARTES:</h2>
                <div className="text-justify space-y-4">
                  <p>
                    <strong>Contratante:</strong> <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 px-1 font-bold uppercase w-full max-w-[400px]")} value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})}/>, <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-32 px-1 mx-1")} value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})}/>, inscrito no CPF sob o nº <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-32 px-1 mx-1 font-bold")} value={formData.client_cpf} onChange={e => setFormData({...formData, client_cpf: e.target.value})}/>, RG nº <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-40 px-1 mx-1 font-bold")} value={formData.client_rg} onChange={e => setFormData({...formData, client_rg: e.target.value})}/>, residente e domiciliado na Rua <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-full max-w-[300px] px-1 font-bold uppercase")} value={formData.client_street} onChange={e => setFormData({...formData, client_street: e.target.value})}/>, nº <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-16 px-1 font-bold")} value={formData.client_number} onChange={e => setFormData({...formData, client_number: e.target.value})}/>, Bairro <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-40 px-1 font-bold uppercase")} value={formData.client_neighborhood} onChange={e => setFormData({...formData, client_neighborhood: e.target.value})}/>, Cidade <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-40 px-1 font-bold uppercase")} value={formData.client_city} onChange={e => setFormData({...formData, client_city: e.target.value})}/>, CEP <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-24 px-1 font-bold")} value={formData.client_cep} onChange={e => setFormData({...formData, client_cep: e.target.value})}/>, portador do celular nº <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-32 px-1 font-bold")} value={formData.client_phone} onChange={e => setFormData({...formData, client_phone: e.target.value})}/> e endereço eletrônico <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-64 px-1 font-bold")} value={formData.client_email} onChange={e => setFormData({...formData, client_email: e.target.value})}/>, de ora em diante denominado(a) de CONTRATANTE.
                  </p>
                  <p>
                    <strong>Contratada: SOLAR SOL ENERGIA RENOVÁVEIS LTDA</strong>, pessoa jurídica de direito privado, inscrita sob o CNPJ nº 42.518.541/0001-56, com endereço comercial na Avenida Prudente de Morais, nº 0507, Centro Empresarial Djalma Marinho, Loja A, Tirol, Natal/RN, CEP 590.20-810, neste ato representado por seu sócio, Sr. Lucas Luís de Oliveira Barbosa, portador do RG nº 2189466 e CREA nº 2119764026, de ora em diante denominada de CONTRATADA.
                  </p>
                </div>
              </section>

              {/* PÁGINA 2 */}
              <section className="mb-10 break-inside-avoid">
                <h2 className="font-bold mb-6 inline-block uppercase underline text-[14px]">II – DO QUADRO RESUMO:</h2>
                <div className="border border-zinc-400 overflow-hidden text-[12px]">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-zinc-400">
                        <td className="w-1/2 p-3 border-r border-zinc-400 font-bold uppercase">VALOR DO SERVIÇO PARA SOLAR SOL ENERGIA RENOVÁVEIS LTDA</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 font-bold">● R$ <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 border-b border-yellow-400 outline-none px-2 w-40 font-bold")} value={formData.service_value} onChange={e => setFormData({...formData, service_value: e.target.value})}/></div>
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-400">
                        <td className="p-3 border-r border-zinc-400 font-bold uppercase">VALOR DO EQUIPAMENTO PARA OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 font-bold">● R$ <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 border-b border-yellow-400 outline-none px-2 w-40 font-bold")} value={formData.equipment_value} onChange={e => setFormData({...formData, equipment_value: e.target.value})}/></div>
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-400">
                        <td className="p-3 border-r border-zinc-400 font-bold uppercase">VIGÊNCIA DO CONTRATO</td>
                        <td className="p-3 font-bold uppercase">
                          ● 12 (DOZE) MESES
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-400">
                        <td className="p-3 border-r border-zinc-400 font-bold uppercase">EQUIPAMENTOS ADQUIRIDOS</td>
                        <td className="p-3 space-y-2 font-bold uppercase">
                          <div className="flex gap-2 items-center">
                            ● <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-8 text-center")} value={formData.inverter_quantity} onChange={e => setFormData({...formData, inverter_quantity: e.target.value})}/> 
                            <span>INVERSOR MARCA</span> 
                            <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 flex-1 px-2 uppercase")} value={formData.inverter_brand} onChange={e => setFormData({...formData, inverter_brand: e.target.value})}/>
                          </div>
                          <div className="flex gap-2 items-center">
                            ● <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-8 text-center")} value={formData.panels_quantity} onChange={e => setFormData({...formData, panels_quantity: e.target.value})}/> 
                            <span>PAINÉIS FOTOVOLTAICOS DE MARCA</span> 
                            <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 flex-1 px-2 uppercase")} value={formData.panels_brand} onChange={e => setFormData({...formData, panels_brand: e.target.value})}/>
                          </div>
                          <div className="pl-4">● KIT, CABOS CC, PARAFUSO, TRILHOS DE FIXAÇÃO DE INSTALAÇÃO</div>
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-400">
                        <td className="p-3 border-r border-zinc-400 font-bold uppercase">DATA DE VENCIMENTO DO PAGAMENTO DO SERVIÇO</td>
                        <td className="p-3 font-bold uppercase">
                           ● <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-full")} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})}/>
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-400">
                        <td className="p-3 border-r border-zinc-400 font-bold uppercase">FORMA DE PAGAMENTO</td>
                        <td className="p-3 uppercase font-bold">
                           ● <textarea readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-full outline-none h-16 resize-none")} value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 border-r border-zinc-400 font-bold uppercase">UNIDADES BENEFICIARIAS</td>
                        <td className="p-3 font-bold uppercase">
                          ● <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-full")} value={formData.beneficiary_units} onChange={e => setFormData({...formData, beneficiary_units: e.target.value})}/>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="text-justify mb-8">
                Pelo presente instrumento particular as partes, CONTRATADA e CONTRATANTE, têm entre si, certa, ajustada e contratada a PRESTAÇÃO DE SERVIÇOS voltados à instalação de sistema solar fotovoltaico, tudo subordinado às CLÁUSULAS E CONDIÇÕES adiante consignadas:
              </div>

              <section className="space-y-8 text-justify leading-relaxed">
                <h2 className="font-bold mb-6 inline-block uppercase underline text-[14px]">III – DAS CLÁUSULAS CONTRATUAIS:</h2>
                
                {/* CLÁUSULA 1 */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA PRIMEIRA – DO OBJETO DO CONTRATO:</h3>
                  <p>O presente instrumento particular tem por objeto a prestação de serviços voltados para instalação de sistema solar fotovoltaico.</p>
                  <p className="mt-4"><strong>Parágrafo Único:</strong> para realização do serviço, a CONTRATADA orienta a aquisição dos seguintes materiais pelo (a) CONTRATANTE junto à distribuidora <strong>OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA, CNPJ 27.568.657/0001-06</strong> e nome fantasia <strong>SOUENERGY</strong>. Sua sede localizada na Rua Paulo Amaral, 465, Galpão 465 - Santo Antônio, Eusebio - CE, 61.767-690, Telefone (11)4003-4343 e endereço eletrônico <span className="underline text-blue-600">ecommerce@souenergy.com.br</span>.</p>
                  
                  {/* PÁGINA 3 */}
                  <div className="mt-4 space-y-2">
                    <p>a) <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-12 text-center font-bold")} value={formData.panels_quantity} onChange={e => setFormData({...formData, panels_quantity: e.target.value})}/> painéis fotovoltaicos de <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-16 text-center font-bold")} value={formData.panels_watts} onChange={e => setFormData({...formData, panels_watts: e.target.value})}/> W, <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-32 px-1 font-bold uppercase")} value={formData.panels_brand} onChange={e => setFormData({...formData, panels_brand: e.target.value})}/> (garantia do fabricante <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-8 text-center font-bold")} value={formData.panels_warranty} onChange={e => setFormData({...formData, panels_warranty: e.target.value})}/> anos);</p>
                    <p>b) <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-12 text-center font-bold")} value={formData.inverter_quantity} onChange={e => setFormData({...formData, inverter_quantity: e.target.value})}/> inversor de <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-12 text-center font-bold")} value={formData.inverter_k} onChange={e => setFormData({...formData, inverter_k: e.target.value})}/> K, <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-32 px-1 font-bold uppercase")} value={formData.inverter_brand} onChange={e => setFormData({...formData, inverter_brand: e.target.value})}/> (garantia do fabricante <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-8 text-center font-bold")} value={formData.inverter_warranty} onChange={e => setFormData({...formData, inverter_warranty: e.target.value})}/> anos);</p>
                    <p>c) Kit parafuso, cabos cc, trilhos de fixação de instalação.</p>
                  </div>
                </div>

                {/* CLÁUSULA 2 */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DA CONTRATADA:</h3>
                  <p>Cumprir integralmente esse contrato em todas as suas cláusulas, responsabilizando-se, especialmente, pela prestação dos serviços ora contratados.</p>
                  <p className="mt-4"><strong>Parágrafo Único:</strong> Ainda resta, por este contrato, obrigada a CONTRATADA a:</p>
                  <ol className="list-[lower-alpha] ml-6 space-y-2">
                    <li>Realizar o pagamento de todos os encargos sociais e tributos previstos em lei, relacionados ao objeto deste contrato de prestação de serviço;</li>
                    <li>Fornecer ao(à) CONTRATANTE todos os dados e informações, quando solicitados, que se fizerem necessários ao bom entendimento e acompanhamento do serviço contratado;</li>
                    <li>Realizar os seguintes procedimentos junto à concessionaria de energia: apresentação de projeto e acompanhamento do procedimento até sua homologação.</li>
                    <li>Realizar os seguintes procedimentos junto ao Conselho de Classe (CFT, CRT ou CREA): apresentação de projeto e execução da obra.</li>
                    <li>Planejar, conduzir e executar os serviços, com integral observância das disposições deste contrato, obedecendo aos prazos contratuais e às normas vigentes, em especial a instalação de sistema solar em capacitação calculada de acordo a expectativa de média anual dos índices de radiação;</li>
                    
                    {/* PÁGINA 4 */}
                    <li>Designar como responsáveis, pela direção e execução dos serviços, profissionais devidamente capacitados e qualificados para suas respectivas funções, bem como utilizar equipamentos adequados à perfeita realização dos serviços;</li>
                    <li>Empregar na execução dos serviços toda a mão de obra necessária, com habilidade técnica adequada ao exercício de suas atribuições, assumindo toda a responsabilidade por eventuais encargos trabalhistas, incluindo àqueles decorrentes do reconhecimento de vínculo empregatício;</li>
                    <li>Orientar os profissionais sob sua responsabilidade a cumprir todas as normas disciplinares e de segurança, fornecendo os Equipamentos de Proteção Individual e Coletiva e fiscalizando sua correta utilização;</li>
                  </ol>
                </div>

                {/* CLÁUSULA 3 */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA TERCEIRA – OBRIGAÇÕES DO(A) CONTRATANTE:</h3>
                  <p>Cumprir integralmente esse contrato em todas as suas cláusulas, responsabilizando-se, especialmente, pelo pagamento da contraprestação pelos serviços ora contratados.</p>
                  <p className="mt-4"><strong>Parágrafo Único:</strong> Ainda resta, por este contrato, obrigado (a) o (a) CONTRATANTE a:</p>
                  <ol className="list-[lower-alpha] ml-6 space-y-2">
                    <li>Responsabilizar-se pela adequação de seu PADRÃO DE ENTRADA às normas vigentes, regida pela concessionária de energia e pelos órgãos de regulamentação estadual;</li>
                    <li>Facilitar o acesso dos profissionais contratados ao local da obra, caso necessário;</li>
                    <li>Fornecer corretamente todos os dados e informações necessárias à execução dos serviços contratados, prestando assistência à CONTRATADA no cumprimento de seus deveres decorrentes deste contrato;</li>
                    <li>O(a) CONTRATANTE se obriga a realizar quaisquer adaptações ou obras (civil, estrutural, ampliação ou reforço) solicitadas pela CONTRATADA antes ou durante o início da obra, visando a assegurar o pleno funcionamento do sistema contratado;</li>
                    
                    {/* PÁGINA 5 */}
                    <li>O(a) CONTRANTE terá a obrigação de conferencia integral do seu equipamento no momento da entrega, averiguando a quantidade de itens prescritos e abertura dos volumes que outrora venham em embalagens lacradas atestando sua plena forma ou possíveis avarias no transporte se responsabilizando pela informação das devidas intercorrências em nota fiscal entregue através de transportadora definida pelo distribuidor ora escolhido pelo CONTRATANTE.</li>
                    <li>O(a) CONTRANTE será responsável por receber os profissionais da concessionária de energia sempre que necessário, seja para vistoria, aumento de carga, manutenção ou qualquer outro serviço relacionado.</li>
                  </ol>
                </div>

                {/* CLÁUSULA 4 */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA QUARTA – DO PAGAMENTO:</h3>
                  <p>O(a) CONTRATANTE compromete-se a pagar à CONTRATADA, pelo presente contrato de prestação de serviços voltada para instalação de sistema solar fotovoltaico, o valor de <strong>R$ <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 border-b border-yellow-400 outline-none px-1 w-32 font-bold")} value={formData.service_value} onChange={e => setFormData({...formData, service_value: e.target.value})}/> (<input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-full max-w-[400px] outline-none")} value={formData.service_value_extenso} onChange={e => setFormData({...formData, service_value_extenso: e.target.value})} placeholder="valor por extenso"/>)</strong> em parcela única, por <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 px-1 w-full max-w-[500px]")} value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}/>, <strong>NÃO INCLUÍDO NESTE VALOR</strong> painéis fotovoltaicos, inversores e kit parafuso para instalação, cabos cc, trilhos de fixação de instalação;</p>
                  
                  <p className="mt-4"><strong>Parágrafo Primeiro:</strong> O(a) CONTRATANTE compromete-se a adquirir os materiais descritos nas alíneas a, b e c, Parágrafo Único da CLÁUSULA PRIMEIRA deste contrato, quais sejam, painéis fotovoltaicos, inversores, kit parafuso para instalação, cabos cc e trilhos de fixação de instalação, no valor de <strong>R$ <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 border-b border-yellow-400 outline-none px-1 w-32 font-bold")} value={formData.equipment_value} onChange={e => setFormData({...formData, equipment_value: e.target.value})}/> (<input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-full max-w-[400px] outline-none")} value={formData.equipment_value_extenso} onChange={e => setFormData({...formData, equipment_value_extenso: e.target.value})} placeholder="valor por extenso"/>)</strong> através de <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 px-1 w-full max-w-[400px]")} value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}/>, valor este que será pago diretamente à respectivo distribuidor OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA;</p>
                  
                  <p className="mt-4"><strong>Parágrafo Segundo:</strong> O pagamento pela prestação dos serviços de instalação mencionados no caput desta cláusula será efetuado <strong><input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 font-bold px-1")} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})}/></strong>, em parcela única, através de <strong><input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 font-bold px-1")} value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}/></strong>, diretamente nas contas abaixo indicadas:</p>
                  
                  <div className="mt-6 ml-6 space-y-2 text-[11px]">
                    <p>● <strong>Sicredi - 748:</strong> Agência (2207), Conta Corrente (43455-8), PIX (42.518.541/0001-56);</p>
                    <p>● <strong>Banco do Brasil - 001:</strong> Agência (1533-4), Conta Corrente (65257-1);</p>
                    <p>● <strong>Caixa Econômica Federal - 104:</strong> Agência (0759), Conta Corrente (3932-4)</p>
                    <p>● <strong>Banco Santander - 003:</strong> Agência (4667), Conta Corrente (13004130-3) PIX (<span className="underline text-blue-600">allsolenergias@gmail.com</span>);</p>
                  </div>

                  {/* PÁGINA 6 */}
                  <p className="mt-4"><strong>Parágrafo Terceiro:</strong> Em caso de pedido de mudança de endereço, poderá haver cobrança de novos valores para instalação em nova localidade.</p>
                  
                  <p className="mt-4 text-justify"><strong>Parágrafo Quarto:</strong> O pagamento ao distribuidor dos equipamentos/materiais descritos nas alíneas a, b e c, Parágrafo Único da CLÁUSULA PRIMEIRA deste contrato, quais sejam, painéis fotovoltaicos, inversores, kit parafuso para instalação, cabos cc e trilhos de fixação de instalação etc. será efetuado na data de assinatura do presente contrato, em conta bancária de titularidade do aludido distribuidor ou por outro meio de pagamento. Fica estabelecido que caberá ao CONTRATANTE a responsabilidade de encaminhar à CONTRATADA o respectivo comprovante de pagamento, sendo tal envio condição indispensável para o início dos trâmites de homologação da usina fotovoltaica junto à concessionária de energia.</p>
                </div>

                {/* CLÁUSULA 5 */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA QUINTA – DOS PRAZOS DE INSTALAÇÃO E DA HOMOLOGAÇÃO:</h3>
                  <p>O prazo de instalação dos devidos equipamentos do presente contrato é de 90 (noventa) dias iniciando-se a contagem a partir da assinatura deste contrato, acompanhado de todos os documentos necessários à confirmação da referida contratação.</p>
                  <p className="mt-4"><strong>Parágrafo Primeiro:</strong> Todas as datas e prazos contidos nas cláusulas deste contrato deverão ser contabilizados em dias úteis.</p>
                  <p className="mt-4"><strong>Parágrafo Segundo:</strong> Serão descontados do prazo mencionado no caput desta CLÁUSULA, dias chuvosos que não permitam o desenvolvimento dos trabalhos de instalação;</p>
                  
                  {/* PÁGINA 7 */}
                  <p className="mt-4 text-justify"><strong>Parágrafo Terceiro:</strong> Fica convencionado entre as partes que, em caso de inexistência de medidor, medidor inadequado ou necessidade de aumento de carga para a conexão da usina fotovoltaica junto à unidade consumidora, bem como em situações de atraso ou pendências na aprovação do projeto e/ou na instalação do referido medidor por parte da concessionária de energia, o prazo previsto no caput desta Cláusula será automaticamente suspenso. A contagem do prazo será retomada somente após a efetiva instalação do medidor e a autorização formal da concessionária para a conexão do sistema à rede elétrica.</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Quarto:</strong> Para que o processo de homologação do sistema solar fotovoltaico seja formalizado é indispensável que as faturas de energia da unidade geradora e compensadoras não constem débitos sem quitação, e, uma vez existentes, o prazo para execução de presente contrato só será retomado após quitação do valor no sistema da concessionária.</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Quinto:</strong> Havendo necessidade de aumento de carga, reforço na rede da concessionária, reforço na estrutura, pendências junto à concessionária ou qualquer outro fator que demande mais tempo para a conclusão da instalação e homologação, e/ou terceiros que impeçam o protocolo e a aprovação do projeto junto à companhia de energia, a contagem do prazo previsto no caput desta CLÁUSULA retornará somente após a efetiva regularização das demandas apontadas, podendo estender o prazo de acordo com as normativas da ANEEL.</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Sexto:</strong> Ocorrendo alguma das situações previstas nos parágrafos anteriores, o(a) CONTRATANTE se obriga a comunicar formalmente, a conclusão de quaisquer adequações necessárias ao andamento da obra e solução de eventuais pendências, por meio de e-mail: <span className="underline text-blue-600">allsolenergias@gmail.com</span>, WhatsApp ou outro meio de comunicação. Da mesma forma, caso o CONTRATANTE tenha conhecimento de alguma dessas situações, deverá comunicá-las.</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Sétimo:</strong> Os prazos serão suspensos desde o protocolo junto à concessionária de energia até a apresentação da resposta de aprovação, retomando a contagem após a devolutiva de aprovação por parte da concessionária. Igualmente ocorrerá nos demais prazos que dependam de processos de validação em órgãos públicos.</p>
                  
                  {/* PÁGINA 8 */}
                  <p className="mt-4 text-justify"><strong>Parágrafo Oitavo:</strong> Com relação ao prazo exclusivo da homologação, a CONTRATADA esclarece que o processo de homologação do sistema fotovoltaico depende exclusivamente da análise, aprovação e prazos internos da concessionária de energia e, em alguns casos, de outros órgãos públicos. Assim, eventuais atrasos decorrentes desses trâmites não poderão ser imputados à CONTRATADA, por se tratarem de etapas fora de seu controle direto. Desde já, a CONTRATADA se compromete a acompanhar e prestar todo o suporte necessário para o bom andamento do processo junto à concessionária.</p>
                </div>

                {/* CLÁUSULA 6 */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA SEXTA – DA RESPONSABILIDADE DA CONCESSIONÁRIA:</h3>
                  <p className="text-justify">A CONTRATADA compromete-se a prestar o suporte necessário ao CONTRATANTE durante o processo de homologação e conexão da usina solar fotovoltaica à rede elétrica. A definição dos prazos, bem como a aprovação final para a conexão da unidade geradora, é de responsabilidade exclusiva da concessionária de energia, que realiza uma análise técnica baseada nas condições e limitações da rede local.</p>
                  <p className="mt-4 text-justify">Essa análise poderá abranger aspectos como inversão de fluxo de energia, limitações da rede elétrica, aumento de carga, necessidade de inclusão de transformador, entre outros fatores técnicos. Tais decisões são de competência exclusiva da concessionária, isentando a CONTRATADA de qualquer responsabilidade caso essas condições sejam identificadas no processo.</p>
                  <p className="mt-4 text-justify">Se forem necessárias adequações técnicas para viabilizar a conexão da usina, como reforço da estrutura da rede, substituição ou instalação de transformadores, ou qualquer outra intervenção técnica, essas exigências poderão ser definidas pela concessionária. Nesses casos, o CONTRATANTE poderá ser solicitado a arcar com os investimentos necessários para atender às condições estabelecidas por parte da concessionaria.</p>
                  <p className="mt-4 text-justify">A CONTRATADA continuará prestando suporte técnico ao CONTRATANTE, orientando-o em todas as etapas e esclarecendo eventuais dúvidas. A liberação final da unidade geradora, entretanto, dependerá exclusivamente da aprovação da concessionária, podendo estar sujeita a ajustes técnicos que não estavam previstos no projeto inicial, sem que haja responsabilidade da CONTRATADA por essas modificações.</p>
                </div>

                {/* CLÁUSULA 7 */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA SÉTIMA – DO RECEBIMENTO E ENCERRAMENTO DOS SERVIÇOS:</h3>
                  <p>O recebimento definitivo dos serviços deverá ser precedido de uma vistoria por parte do (a) CONTRATANTE, para que este (a) verifique e comprove a satisfatória execução de todos os serviços.</p>
                </div>

                {/* CLÁUSULA 8 (PÁGINA 9) */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA OITAVA – DA GERAÇÃO DE ENERGIA ELÉTRICA:</h3>
                  <p className="text-justify">A geração de energia do sistema fotovoltaico depende das condições climáticas, com base em dados oficiais do Centro de Referência para Energia solar e eólica e Instituto Nacional de Pesquisas Espaciais. Após aferição de todos esses dados técnicos e geográficos, se chegará a uma geração média estimada, apresentada em proposta comercial;</p>
                  <p className="mt-4"><strong>Parágrafo Primeiro:</strong> Registre-se que a geração de energia é feita de acordo com a média base calculada de acordo com as contas apresentadas, podendo haver pedido pelo (a) CONTRATANTE de geração maior que a média, fato que impactará no valor do serviço ora prestado;</p>
                  <p className="mt-4"><strong>Parágrafo Segundo:</strong> Caso haja compensação de energia em mais de um local, é necessário que o (a) CONTRATANTE solicite conexão junto à concessionária de energia, serviço esse que poderá ser promovido pela CONTRATADA, sendo objeto de compensação no presente contrato as contas <strong><input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 font-bold px-1 w-full max-w-[400px]")} value={formData.beneficiary_units} onChange={e => setFormData({...formData, beneficiary_units: e.target.value})}/></strong>.</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Terceiro:</strong> O endereço da instalação dos painéis será compensado de forma primária e a(s) unidade(s) secundária(s) somente serão compensadas após total satisfação da geração da unidade de instalação, em conformidade com a Lei nº 14.300/2022, a qual define as diretrizes acerca do Sistema de Compensação de Energia;</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Quarto:</strong> Caso o(a) CONTRATANTE solicite a inserção de uma conta contrato em sua lista de rateio após a homologação de sua usina solar, será cobrado um valor adicional de R$ 250,00 (duzentos e cinquenta reais), referente aos custos técnicos;</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Quinto:</strong> Existindo a necessidade de ajustes na potência de painéis e inversores, poderão as partes optar pela substituição, devendo as referidas alterações serem registradas através de aditivo contratual, cabendo à CONTRARADA realizar a intermediação da substituição junto ao fabricante;</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Sexto:</strong> O sistema de energia solar depende de fatores naturais, como a irradiação solar e as condições climáticas, além de aspectos específicos do imóvel, como a presença de obstruções no telhado que possam afetar a geração (exemplo: platibanda, caixa d'água, entre outras estruturas), assim como a inclinação, a orientação do telhado e a qualidade da energia fornecida pela concessionária local. Nesse contexto, o CONTRATANTE está ciente de que a geração de energia pode sofrer variações, podendo tanto aumentar quanto diminuir. A CONTRATADA não se responsabiliza por essas alterações, uma vez que são decorrentes de condições externas e variáveis. A proposta comercial foi elaborada com base em estimativas, e o desempenho final pode variar conforme as condições mencionadas</p>
                </div>

                {/* CLÁUSULA 9 (PÁGINA 10) */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA NONA – DO MONITORAMENTO:</h3>
                  <p className="text-justify">Para conexão e acompanhamento remoto do sistema via aplicativo se faz necessária a utilização da rede de dados móveis, com internet WI-FI 2,4GHZ, a qual é de responsabilidade da parte CONTRATANTE para garantir a visibilidade de sua produção. Sua inexistência não afetará a geração, contudo, neste caso, ficará o (a) CONTRATANTE sem acompanhamento remoto.</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Primeiro:</strong> Caso não haja conexão de internet (wifi 2,4GHZ) no dia da instalação do sistema solar, poderá a CONTRATADA atribuir custos relativos à visita posterior para a realização do referido serviço, restando claro que o sistema de acompanhamento remoto é de total importância para a solicitação de garantia do equipamento, sendo ele item obrigatório junto ao fabricante;</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Segundo:</strong> Em caso de alteração de senha da internet ou provedor, o (a) CONTRATANTE precisará informar à CONTRATADA, sob pena de não funcionamento do sistema de acompanhamento remoto (aplicativo), sendo necessário abrir uma ordem de serviço para configuração do aparelho;</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Terceiro:</strong> Em caso de necessidade de visita técnica ao local da instalação para reconfiguração do sistema de monitoramento, será cobrada uma taxa adicional a partir de R$ 250,00 (duzentos e cinquenta reais), destinada a cobrir os custos operacionais com deslocamento, mão de obra técnica e retrabalho da equipe. Ressalta-se que esta cobrança se aplica, especialmente, quando a visita for decorrente de situações de retrabalho, como: ausência de conexão no dia da instalação, alteração de senha da rede Wi-Fi, troca de provedor de internet, desligamento do roteador por longos períodos, mudança do roteador de local ou ainda intervenção de terceiros no equipamento instalado.</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Quarto:</strong> Em caso de eventuais falhas técnicas, que afetem no todo ou em parte a geração de energia por parte da concessionária tais como: sobretensão; sobrecorrente e afins; será o acompanhamento remoto (monitoramento) a ferramenta indispensável para averiguar tais falhas e adotar as devidas providências para restauração do funcionamento normal do sistema;</p>
                </div>

                {/* CLÁUSULA 10 (PÁGINA 11) */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA DÉCIMA – DA GARANTIA:</h3>
                  <p className="text-justify">A CONTRATADA garante a qualidade e perfeição da execução do serviço de mão de obra, objeto deste contrato, respondendo, na forma da lei, por quaisquer defeitos decorrentes da prestação de seus serviços verificados no período de 12 meses, a contar da assinatura deste instrumento particular;</p>
                  <p className="mt-4"><strong>Parágrafo Primeiro:</strong> O(a) CONTRATANTE declara-se ciente de que os painéis fotovoltaicos e inversores contam com garantias ofertadas diretamente pelos seus respectivos fabricantes.</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Segundo:</strong> Após o vencimento da garantia de instalação (prestação de serviços) dada pela CONTRATADA (12 meses), a execução da cláusula de garantia dos equipamentos acima descritos deverá ser feita através de notificação dirigida à empresa fabricante pelo (a) CONTRATANTE;</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Terceiro:</strong> A realização de qualquer serviço por terceiros, incluindo ampliação do sistema, manutenção preventiva ou corretiva relacionada ao objeto deste contrato, dentro do prazo de, 12 (doze) meses de vigência, resultará na perda total da garantia de instalação e na isenção de qualquer outra obrigação da CONTRATADA para com o CONTRATANTE.</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Quarto:</strong> Após o término do período de garantia da prestação de serviço, que é de 12 (doze) meses a partir da data da assinatura deste contrato, a CONTRATADA não terá qualquer obrigação quanto a ajustes, correções ou qualquer outra responsabilidade referente à instalação e homologação realizadas, salvo se houver um contrato específico para a prestação desses serviços.</p>
                </div>

                {/* CLÁUSULA 11 */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA DÉCIMA PRIMEIRA – DA CONFIDENCIALIDADE:</h3>
                  <p className="text-justify">Toda e qualquer informação técnica, administrativa ou comercial, transmitida verbalmente ou por escrito entre as partes, fornecida durante a prestação de serviços, será considerada como estritamente confidencial pelas partes, as quais se obrigam a não compartilhar com terceiros, utilizando-as exclusivamente para os serviços contratados.</p>
                  <p className="mt-4"><strong>Parágrafo Único:</strong> As partes obrigam-se, ainda, a respeitar a Lei Geral sobre Proteção de Dados Pessoais (Lei 13.709/2018) e as determinações de órgãos reguladores e fiscalizadores sobre a matéria.</p>
                </div>

                {/* CLÁUSULA 12 (PÁGINA 12 / 13) */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA DÉCIMA SEGUNDA – DAS DISPOSIÇÕES GERAIS:</h3>
                  <ol className="list-[lower-alpha] ml-6 space-y-2">
                    <li>A CONTRATADA não se responsabiliza pela falta de cumprimento dos prazos da concessionária, em caso de atraso ou negligência, todavia, se compromete a cobrar do órgão o andamento da solicitação de acesso e da autorização para funcionamento;</li>
                    <li>O regime de compensação, bem como as diretrizes sobre o sistema de geração distribuída, é de responsabilidade exclusiva da ANEEL, não cabendo à CONTRATADA eventual responsabilidade sobre quaisquer alterações normativas ou lei do setor.</li>
                    <li>Este instrumento, juntamente aos eventuais anexos que o integram, constituem o inteiro teor do acordo entre as partes e substitui todas as outras comunicações, inclusive a proposta inicial, com relação ao objeto do presente Contrato;</li>
                    <li>Qualquer alteração do presente Contrato ou modificação das condições aqui acordadas deverão ser realizadas por escrito e assinada por ambas as partes;</li>
                    <li>Existindo conflito entre as condições deste Contrato e seus anexos, prevalecerão as condições deste Contrato;</li>
                    <li>As cláusulas deste Contrato deverão ser interpretadas com base nos princípios de probidade e boa-fé;</li>
                    <li>Em caso de qualquer disposição deste Contrato ser declarada nula ou ineficaz, as disposições remanescentes permanecerão em vigor, sem sofrer qualquer prejuízo em razão da declaração de nulidade ou ineficácia;</li>
                    <li>Nada neste Contrato deverá conceder a qualquer das partes o direito de assumir compromissos, de qualquer tipo, em nome da outra parte, sendo cada parte uma organização independente e sem relação de agência, representação ou parceria;</li>
                    <li>O presente Contrato é celebrado em caráter irrevogável e irretratável, obrigando não só as partes, como também seus herdeiros legais sucessores;</li>
                    <li>As partes não poderão ceder ou transferir os direitos relativos a este contrato sem o prévio e expresso consentimento escrito da outra parte;</li>
                    <li>A tolerância de quaisquer das partes em relação a eventuais infrações contratuais praticadas pela outra não importará em modificação, novação ou renúncia a qualquer direito;</li>
                    
                    {/* PÁGINA 13 */}
                    <li>Ocorrendo qualquer alteração no endereço eletrônico ou postal, obrigar-se-á o (a) respectivo (a) CONTRATANTE a informar imediatamente à parte CONTRATADA, sob pena de permanecer válida, para os fins ora previstos, a comunicação enviada ao endereço anterior;</li>
                    <li>Aplica-se, ao presente contrato, o disposto no Artigo 784, III, do Código de Processo Civil Brasileiro, haja vista o caráter de título executivo extrajudicial do presente instrumento.</li>
                  </ol>
                </div>

                {/* CLÁUSULA 13 (PÁGINA 13 / 14) */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA DÉCIMA TERCEIRA – DA RESCISÃO:</h3>
                  <p className="text-justify">O presente Contrato poderá ser rescindido por justa causa (resolução contratual), mediante notificação escrita, considerando-se como infração contratual, além das demais previstas neste instrumento, as seguintes hipóteses:</p>
                  <ol className="list-[lower-alpha] ml-6 space-y-2">
                    <li>Recuperação judicial, falência, dissolução amigável ou judicial, liquidação judicial ou extrajudicial, por quaisquer das partes;</li>
                    <li>Violação de qualquer obrigação oriunda de lei ou deste contrato, não sanada no prazo de 20 (vinte) dias contados da notificação promovida nesse sentido, quando for possível seu saneamento;</li>
                    <li>Violação do dever de sigilo ou confidencialidade por qualquer das partes;</li>
                    <li>Se o CONTRATANTE ou a CONTRATADA utilizar, de forma inadequada, a marca, nome, sinal distintivo, logotipo ou timbre da outra parte, em quaisquer documentos, matérias publicitários ou meios de divulgação, tais como internet, redes sociais, televisão, rádio, impresso ou quaisquer outras mídias, bem como realizar o registro de nomes e domínios na internet que possam gerar conflitos com a marca da parte contrária;</li>
                    <li>Suspensão, pelas autoridades competentes, da execução do objeto do Contrato, em decorrência de violação de dispositivos legais vigentes;</li>
                    <li>O presente Contrato será rescindido (resolução unilateral) sem necessidade de notificação caso a parte CONTRATANTE não arque com as obrigações de pagamento pactuadas;</li>
                  </ol>
                  
                  {/* PÁGINA 14 */}
                  <p className="mt-4 text-justify"><strong>Parágrafo Primeiro:</strong> As partes estabelecem que o presente contrato poderá ser rescindido de forma unilateral (resilição unilateral), porém, caso tal evento ocorra, a parte que lhe der causa restará obrigada ao pagamento da respectiva cláusula penal no montante equivalente em 50% (cinquenta por cento) do valor do contrato;</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Segundo:</strong> Em caso de rescisão por justa causa (resolução unilateral), a parte que der causa deverá ressarcir a prejudicada em eventuais perdas e danos, pagamento dos ônus sucumbenciais, custas e honorários advocatícios, acrescido da multa no valor de 20% (vinte por cento) sobre o valor do contrato, sem prejuízo das demais cláusulas penais.</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Terceiro:</strong> Em caso de desistência pelo (a) CONTRATANTE, sem justo motivo, antes de iniciada a instalação, será devido à CONTRATADA multa no percentual de 30% (trinta por cento) sobre o valor dos serviços contratados;</p>
                  <p className="mt-4 text-justify"><strong>Parágrafo Quarto:</strong> Em caso de desistência pelo(a) CONTRATANTE, sem justo motivo, durante ou quando já concluída a instalação, será devido à CONTRATADA multa no percentual de 80% (oitenta por cento) sobre o valor dos serviços contratados.</p>
                </div>

                {/* CLÁUSULA 14 */}
                <div>
                  <h3 className="font-bold uppercase">CLÁUSULA DÉCIMA QUARTA – DO FORO:</h3>
                  <p>Fica eleito o foro de NATAL/RN para dirimir quaisquer dúvidas oriundas deste instrumento, renunciando as partes a qualquer outro, por mais privilegiado que seja, correndo por conta da parte vencida, em caso de decisão judicial, todas as custas que o processo ocasionar, inclusive honorários advocatícios de 20% (vinte por cento) sobre o valor da causa.</p>
                </div>
              </section>

              <div className="mt-12 text-justify">
                E, por estarem justas e contratadas, as partes assinam este contrato, em 02 (duas) vias de igual teor e forma, juntamente com as testemunhas abaixo.
              </div>

              <div className="mt-24 text-right uppercase font-bold pb-10">
                Natal/RN, <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-8 text-center")} value={formData.date_day} onChange={e => setFormData({...formData, date_day: e.target.value})}/> de <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-32 text-center")} value={formData.date_month} onChange={e => setFormData({...formData, date_month: e.target.value.toUpperCase()})}/> de <input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-16 text-center")} value={formData.date_year} onChange={e => setFormData({...formData, date_year: e.target.value})}/>.
              </div>

              {/* PÁGINA 15 */}
              <div className="mt-20 grid grid-cols-2 gap-16 break-inside-avoid">
                <div className="flex flex-col items-center text-center">
                  <div className="w-full border-t border-zinc-900 mb-2"></div>
                  <p className="font-bold text-[13px] uppercase"><input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-full text-center")} value={formData.client_name}/></p>
                  <p className="text-[12px]">CPF: <span className="font-bold"><input type="text" readOnly={isViewOnly} className={inputClass("bg-yellow-100 w-32 text-center")} value={formData.client_cpf}/></span></p>
                  <p className="font-bold text-[11px] mt-1 uppercase">CONTRATANTE</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-full border-t border-zinc-900 mb-2"></div>
                  <p className="font-bold text-[13px] uppercase">SOLAR SOL ENERGIA RENOVÁVEIS LTDA</p>
                  <p className="text-[12px]">CNPJ: 42.518.541/0001-56</p>
                  <p className="font-bold text-[11px] mt-1 uppercase">CONTRATADA – Representante legal</p>
                </div>
              </div>

              <div className="mt-32 grid grid-cols-2 gap-16 pb-20 break-inside-avoid text-center">
                <div className="flex flex-col items-center">
                  <div className="w-full border-t border-zinc-400 mb-2"></div>
                  <p className="text-[12px] uppercase font-bold">TESTEMUNHA</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full border-t border-zinc-400 mb-2"></div>
                  <p className="text-[12px] uppercase font-bold">TESTEMUNHA</p>
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Footer Actions UI */}
        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 z-30 rounded-b-xl flex justify-end space-x-3 shrink-0 print:hidden">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:text-white transition-colors font-bold">
            Fechar
          </button>
          
          <button 
            type="button"
            onClick={handleGeneratePDF}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-600 hover:bg-zinc-700 text-white font-bold transition-all shadow-lg shadow-zinc-500/20 disabled:opacity-50"
          >
            <FileDown size={20} /><span>{loading ? 'Gerando...' : 'Gerar Arquivo PDF'}</span>
          </button>

          {!isViewOnly && (
            <button form="contract-form" type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-10 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center gap-2">
              {loading ? 'Salvando...' : <><Save size={20} /><span>Salvar Alterações</span></>}
            </button>
          )}
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          #contract-paper, #contract-paper * {
            visibility: visible;
          }
          #contract-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
            padding: 0;
            margin: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          input, textarea {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            appearance: none;
            -webkit-appearance: none;
            color: black !important;
          }
          .bg-yellow-100 {
            background-color: transparent !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ContractOverlay;
