import React, { useEffect } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node, mergeAttributes } from '@tiptap/core';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import OrderedList from '@tiptap/extension-ordered-list';
import BulletList from '@tiptap/extension-bullet-list';

import { 
  Bold, Italic, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Type, Scissors, Table as TableIcon,
  Plus, Minus, Trash2, ChevronDown
} from 'lucide-react';

// --- 1. EXTENSÕES CUSTOMIZADAS ---

// Extensão de Quebra de Página Manual
const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  selectable: true,
  draggable: true,
  parseHTML() { return [{ tag: 'div[data-type="page-break"]' }]; },
  renderHTML() { return ['div', { 'data-type': 'page-break', class: 'page-break' }]; },
  addCommands() {
    return {
      setPageBreak: () => ({ chain }: any) => chain().insertContent({ type: 'pageBreak' }).run(),
    } as any;
  },
});

// Extensão de Tamanho de Fonte
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize,
          renderHTML: attr => attr.fontSize ? { style: `font-size: ${attr.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize: size }).run(),
    } as any;
  },
});

// Célula de Tabela com Cor
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: el => el.style.backgroundColor,
        renderHTML: attr => attr.backgroundColor ? { style: `background-color: ${attr.backgroundColor}` } : {},
      },
    };
  },
});

// --- 2. COMPONENTE DA BARRA DE FERRAMENTAS ---

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  const sizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px'];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-200 bg-white/95 sticky top-0 z-[60] backdrop-blur-md shadow-sm no-print">
      {/* Font Size */}
      <div className="relative flex items-center bg-zinc-50 border rounded-lg px-2 mr-1">
        <select 
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          className="bg-transparent text-xs py-1 outline-none font-bold pr-4 appearance-none cursor-pointer"
          value={editor.getAttributes('textStyle').fontSize || '16px'}
        >
          {sizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-1 pointer-events-none text-zinc-400" />
      </div>

      <div className="flex gap-0.5 bg-zinc-50 p-0.5 rounded-lg border">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:bg-white'}`}><Bold size={16}/></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:bg-white'}`}><Italic size={16}/></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded ${editor.isActive('underline') ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:bg-white'}`}><UnderlineIcon size={16}/></button>
      </div>

      <div className="flex gap-0.5 bg-zinc-50 p-0.5 rounded-lg border">
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-white shadow-sm' : ''}`}><AlignLeft size={16}/></button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-white shadow-sm' : ''}`}><AlignCenter size={16}/></button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-white shadow-sm' : ''}`}><AlignRight size={16}/></button>
        <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-white shadow-sm' : ''}`}><AlignJustify size={16}/></button>
      </div>

      <button onClick={() => editor.chain().focus().setPageBreak().run()} className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors font-bold text-[10px] uppercase">
        <Scissors size={14} /> Quebra de Página
      </button>

      <button onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run()} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"><TableIcon size={18}/></button>
    </div>
  );
};

// --- 3. COMPONENTE PRINCIPAL ---

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, onInit }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: true }),
      Underline,
      TextStyle,
      FontSize,
      PageBreak,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      CustomTableCell,
    ],
    content: content || '<p>Comece seu contrato aqui...</p>',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => { if (editor && onInit) onInit(editor); }, [editor, onInit]);

  return (
    <div className="editor-workspace bg-zinc-200/50 min-h-full flex flex-col items-center p-4 md:p-12 overflow-y-auto">
      
      {/* Cabeçalho Fixo na Impressão (Não aparece no editor, ou aparece via CSS background) */}
      <div className="print-header hidden">
         {/* Conteúdo do seu Papel Timbrado aqui */}
         <div className="w-full border-b-2 border-zinc-800 pb-2 flex justify-between items-end">
            <span className="font-black text-xl tracking-tighter">ALLSIGN</span>
            <span className="text-[10px] text-zinc-500 uppercase">Documento Gerado via AllSign Engenharia Solar</span>
         </div>
      </div>

      <div className="editor-paper shadow-2xl relative">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} className="tiptap-content" />
      </div>

      {/* Rodapé Fixo na Impressão */}
      <div className="print-footer hidden">
        <div className="w-full border-t border-zinc-200 pt-2 text-center text-[8px] text-zinc-400">
          Página <span className="pageNumber"></span> de <span className="totalPages"></span>
        </div>
      </div>

      <style>{`
        /* --- ESTILOS DO EDITOR (TELA) --- */
        
        .editor-paper {
          width: 210mm;
          background: white;
          min-height: 297mm;
          margin-bottom: 50px;
        }

        .tiptap-content .ProseMirror {
          min-height: 297mm;
          padding: 20mm !important; /* MARGENS DE 20mm SOLICITADAS */
          outline: none;
          
          /* Visualização de Páginas A4 no Editor */
          background-color: white;
          background-image: 
            /* Desenha o vão cinza a cada 297mm */
            linear-gradient(to bottom, transparent 296mm, #e2e8f0 296mm, #e2e8f0 297mm);
          background-size: 100% 297mm;
        }

        /* Estilo da Quebra de Página no Editor */
        .page-break {
          height: 40px;
          margin: 2rem -20mm;
          background: #f1f5f9;
          border-top: 1px dashed #cbd5e1;
          border-bottom: 1px dashed #cbd5e1;
          position: relative;
          cursor: default;
        }
        .page-break::after {
          content: 'QUEBRA DE PÁGINA (IMPRESSÃO)';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 9px; font-weight: 900; color: #94a3b8; letter-spacing: 0.1em;
        }

        /* --- ESTILOS DE IMPRESSÃO --- */
        
        @media print {
          @page {
            size: A4;
            margin: 20mm; /* Margens físicas da impressora */
          }

          body, .editor-workspace { background: white !important; p: 0 !important; }
          .editor-paper { width: 100% !important; box-shadow: none !important; border: none !important; margin: 0 !important; }
          .no-print { display: none !important; }
          
          .tiptap-content .ProseMirror {
            padding: 0 !important;
            min-height: auto !important;
            background-image: none !important;
          }

          .page-break {
            display: block;
            height: 0;
            border: none;
            page-break-after: always;
          }

          /* Cabeçalho e Rodapé Fixos em cada folha */
          .print-header {
            display: block !important;
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 20mm;
          }
          .print-footer {
            display: block !important;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: 10mm;
          }
        }

        /* Estilos Base Tiptap */
        .ProseMirror p { margin-bottom: 1rem; line-height: 1.6; }
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        .ProseMirror td, .ProseMirror th { border: 1px solid #ddd; padding: 8px; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
