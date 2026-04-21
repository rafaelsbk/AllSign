import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Upload } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { useToast } from '../shared/ToastContext';

interface LetterheadFormProps {
  isOpen: boolean;
  onClose: () => void;
  letterhead?: any;
  onSuccess: () => void;
  isViewOnly?: boolean;
}

const LetterheadForm: React.FC<LetterheadFormProps> = ({ isOpen, onClose, letterhead, onSuccess, isViewOnly }) => {
  const [name, setName] = useState('');
  const [headerImage, setHeaderImage] = useState<File | null>(null);
  const [footerImage, setFooterImage] = useState<File | null>(null);
  const [headerMargin, setHeaderMargin] = useState<string>('2,00%');
  const [footerMargin, setFooterMargin] = useState<string>('2,00%');
  const [headerPreview, setHeaderPreview] = useState<string>('');
  const [footerPreview, setFooterPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const formatPercent = (value: string) => {
    // Remove tudo que não é número
    const digits = value.replace(/\D/g, '');
    if (!digits) return '0,00%';
    
    // Converte para número e divide por 100 para ter 2 casas decimais
    const numberValue = parseInt(digits, 10) / 100;
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%';
  };

  const parsePercentToFloat = (value: string) => {
    return parseFloat(value.replace('%', '').replace(',', '.'));
  };

  const formatFloatToPercent = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%';
  };

  useEffect(() => {
    if (isOpen) {
      if (letterhead) {
        setName(letterhead.name || '');
        setHeaderMargin(formatFloatToPercent(letterhead.header_margin_percent || 2.0));
        setFooterMargin(formatFloatToPercent(letterhead.footer_margin_percent || 2.0));
        setHeaderPreview(letterhead.header_image || '');
        setFooterPreview(letterhead.footer_image || '');
      } else {
        setName('');
        setHeaderImage(null);
        setFooterImage(null);
        setHeaderMargin('2,00%');
        setFooterMargin('2,00%');
        setHeaderPreview('');
        setFooterPreview('');
      }
    }
  }, [isOpen, letterhead]);

  if (!isOpen) return null;

  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const formatted = formatPercent(e.target.value);
    setter(formatted);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'footer') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'header') {
        setHeaderImage(file);
        setHeaderPreview(URL.createObjectURL(file));
      } else {
        setFooterImage(file);
        setFooterPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;

    if (!name || (!headerPreview && !headerImage) || (!footerPreview && !footerImage)) {
      showToast('Por favor, preencha o nome e selecione ambas as imagens.', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('header_margin_percent', parsePercentToFloat(headerMargin).toString());
      formData.append('footer_margin_percent', parsePercentToFloat(footerMargin).toString());
      if (headerImage) formData.append('header_image', headerImage);
      if (footerImage) formData.append('footer_image', footerImage);

      if (letterhead?.id) {
        await api.put(`users/letterheads/${letterhead.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('users/letterheads/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar papel timbrado:', err);
      showToast('Erro ao salvar papel timbrado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">
              {isViewOnly ? 'Visualizar Papel Timbrado' : letterhead ? 'Editar Papel Timbrado' : 'Novo Papel Timbrado'}
            </h2>
            <p className="text-zinc-500 text-sm font-medium">Configure a identidade visual dos seus contratos</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-zinc-100 rounded-full transition-colors group">
            <X size={24} className="text-zinc-400 group-hover:text-zinc-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Distância Topo (%)</label>
              <input
                type="text"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl h-14 px-6 focus:outline-none focus:ring-4 focus:ring-solar-orange/10 focus:border-solar-orange transition-all font-bold text-zinc-900"
                value={headerMargin}
                onChange={(e) => handlePercentChange(e, setHeaderMargin)}
                disabled={isViewOnly}
              />
            </div>
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Distância Fundo (%)</label>
              <input
                type="text"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl h-14 px-6 focus:outline-none focus:ring-4 focus:ring-solar-orange/10 focus:border-solar-orange transition-all font-bold text-zinc-900"
                value={footerMargin}
                onChange={(e) => handlePercentChange(e, setFooterMargin)}
                disabled={isViewOnly}
              />
            </div>
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nome do Template</label>
              <input
                type="text"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl h-14 px-6 focus:outline-none focus:ring-4 focus:ring-solar-orange/10 focus:border-solar-orange transition-all font-bold text-zinc-900"
                placeholder="Ex: AllSol"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isViewOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header Image */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Cabeçalho (Header)</label>
              <div className={`relative aspect-[3/1] rounded-2xl border-2 border-dashed ${headerPreview ? 'border-emerald-200 bg-emerald-50/30' : 'border-zinc-200 bg-zinc-50'} overflow-hidden flex flex-col items-center justify-center transition-all`}>
                {headerPreview ? (
                  <img src={headerPreview} alt="Header Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={32} className="mx-auto text-zinc-300 mb-2" />
                    <p className="text-[10px] font-bold text-zinc-400">Nenhuma imagem</p>
                  </div>
                )}
                {!isViewOnly && (
                  <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/5 flex items-center justify-center transition-all opacity-0 hover:opacity-100">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'header')} />
                    <div className="bg-white p-3 rounded-full shadow-lg text-zinc-900">
                      <Upload size={20} />
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Footer Image */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Rodapé (Footer)</label>
              <div className={`relative aspect-[3/1] rounded-2xl border-2 border-dashed ${footerPreview ? 'border-emerald-200 bg-emerald-50/30' : 'border-zinc-200 bg-zinc-50'} overflow-hidden flex flex-col items-center justify-center transition-all`}>
                {footerPreview ? (
                  <img src={footerPreview} alt="Footer Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={32} className="mx-auto text-zinc-300 mb-2" />
                    <p className="text-[10px] font-bold text-zinc-400">Nenhuma imagem</p>
                  </div>
                )}
                {!isViewOnly && (
                  <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/5 flex items-center justify-center transition-all opacity-0 hover:opacity-100">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'footer')} />
                    <div className="bg-white p-3 rounded-full shadow-lg text-zinc-900">
                      <Upload size={20} />
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              <strong>Dica:</strong> Para melhores resultados, utilize imagens PNG com fundo transparente. O sistema posicionará automaticamente as imagens a 2% das bordas da folha A4.
            </p>
          </div>
        </form>

        <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 flex gap-3">
          <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={onClose}>
            Cancelar
          </Button>
          {!isViewOnly && (
            <Button
              variant="solar"
              className="flex-[2] h-14 rounded-2xl font-black shadow-lg shadow-solar-orange/20"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={20} />
                  Salvar Template
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterheadForm;
