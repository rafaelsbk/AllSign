import React, { useEffect } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import OrderedList from '@tiptap/extension-ordered-list';
import BulletList from '@tiptap/extension-bullet-list';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { 
  Bold, Italic, List, ListOrdered, 
  Table as TableIcon, Plus, Trash2, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Underline as UnderlineIcon,
  ChevronDown, Scissors, Type
} from 'lucide-react';

// Custom OrderedList to support alphabetic types
const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: '1',
        parseHTML: element => element.getAttribute('type'),
        renderHTML: attributes => {
          return {
            type: attributes.type,
          };
        },
      },
    };
  },
});

// Custom PageBreak Extension
const PageBreak = Extension.create({
  name: 'pageBreak',
  group: 'block',
  content: '',
  parseHTML() {
    return [{ tag: 'div[data-type="page-break"]' }];
  },
  renderHTML() {
    return ['div', { 'data-type': 'page-break', class: 'page-break-divider' }];
  },
  addCommands() {
    return {
      setPageBreak: () => ({ chain }: any) => {
        return chain()
          .insertContent({ type: 'pageBreak' })
          .run();
      },
    } as any;
  },
});

// Custom FontSize Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    } as any;
  },
});

// Custom TableCell Extension to support background color
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
  onInit?: (editor: any) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-white/90 sticky top-0 z-50 backdrop-blur-md shadow-md rounded-t-2xl transition-all duration-300">
      {/* Font Size Dropdown */}
      <div className="relative group flex items-center bg-white border border-gray-200 rounded-lg px-2 mr-1 shadow-sm">
        <select
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          className="bg-transparent text-xs py-1 outline-none cursor-pointer pr-4 appearance-none"
          value={editor.getAttributes('textStyle').fontSize || '16px'}
        >
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-1 pointer-events-none text-gray-400" />
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Negrito"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Itálico"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Sublinhado"
      >
        <UnderlineIcon size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      {/* Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Alinhar à Esquerda"
      >
        <AlignLeft size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Centralizar"
      >
        <AlignCenter size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Alinhar à Direita"
      >
        <AlignRight size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Justificar"
      >
        <AlignJustify size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Título 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Título 2"
      >
        <Heading2 size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Lista com Marcadores"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('orderedList', { type: '1' }) || (editor.isActive('orderedList') && !editor.getAttributes('orderedList').type) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Lista Numerada"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().updateAttributes('orderedList', { type: 'a' }).run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('orderedList', { type: 'a' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Lista Alfabética (a, b, c)"
      >
        <div className="flex flex-col items-center leading-none">
            <Type size={16} />
            <span className="text-[8px] font-extrabold -mt-0.5">ABC</span>
        </div>
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().setPageBreak().run()}
        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1"
        title="Inserir Quebra de Página A4"
      >
        <Scissors size={18} />
        <span className="text-[10px] font-bold uppercase">Página</span>
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      {/* Table Controls */}
      <button
        onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: false }).run()}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        title="Inserir Tabela 2x2 Normal"
      >
        <TableIcon size={18} />
      </button>

      {(editor.isActive('table') || editor.isActive('tableRow') || editor.isActive('tableCell')) && (
        <>
          <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
          
          <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Adicionar Coluna">
            <Plus size={16} className="rotate-90" />
          </button>
          <button onClick={() => editor.chain().focus().deleteColumn().focus().run()} className="p-2 text-red-400 hover:bg-red-50 rounded-lg" title="Excluir Coluna">
            <Minus size={16} className="rotate-90" />
          </button>
          
          <div className="w-px h-4 bg-gray-100 mx-1 self-center" />
          
          <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Adicionar Linha">
            <Plus size={16} />
          </button>
          <button onClick={() => editor.chain().focus().deleteRow().focus().run()} className="p-2 text-red-400 hover:bg-red-50 rounded-lg" title="Excluir Linha">
            <Minus size={16} />
          </button>
          
          <div className="w-px h-4 bg-gray-100 mx-1 self-center" />
          
          {/* Cell Color Options */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
             <button
                onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', '#f4f4f5').run()}
                className="w-5 h-5 rounded bg-zinc-200 hover:scale-110 transition-transform border border-zinc-300"
                title="Fundo Cinza"
             />
             <button
                onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', '#eff6ff').run()}
                className="w-5 h-5 rounded bg-blue-100 hover:scale-110 transition-transform border border-blue-200"
                title="Fundo Azul"
             />
             <button
                onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', null).run()}
                className="w-5 h-5 rounded bg-white hover:scale-110 transition-transform border border-gray-300 flex items-center justify-center text-[10px] font-bold text-red-500"
                title="Limpar Cor"
             >
                X
             </button>
          </div>

          <div className="w-px h-4 bg-gray-100 mx-1 self-center" />

          <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Excluir Tabela Completa">
            <Trash2 size={18} />
          </button>
        </>
      )}
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, editable = true, onInit }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      CustomTableCell,
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none mx-auto bg-white shadow-2xl mb-12',
      },
    },
  });

  // Sync editor instance with parent
  useEffect(() => {
    if (editor && onInit) {
      onInit(editor);
    }
  }, [editor, onInit]);

  // Sync content from props if it changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-zinc-100 shadow-sm flex flex-col max-h-[85vh]">
      {editable && <MenuBar editor={editor} />}
      
      <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-zinc-200/50 custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
      
      <style>{`
        .ProseMirror {
          width: 210mm;
          min-height: 297mm;
          padding: 32mm 25mm !important; 
          margin: 40px auto;
          box-sizing: border-box;
          cursor: text;
          position: relative;
          outline: none;
          
          /* Fundo Base do Workspace */
          background-color: #f1f5f9; 
          
          /* Visualização de Páginas A4 Repetitivas com Áreas Demarcadas */
          background-image: 
            /* 1. Folha Branca Útil */
            linear-gradient(to bottom, white 0mm, white 297mm, transparent 297mm),
            /* 2. Área de Cabeçalho (Sombra para visualização) */
            linear-gradient(to bottom, #f8fafc 0mm, #f8fafc 32mm, transparent 32mm),
            /* 3. Área de Rodapé (Sombra para visualização) */
            linear-gradient(to top, transparent 47mm, #f8fafc 47mm, #f8fafc 79mm);
          
          /* Posicionamento dos fundos (Ciclo de 312mm) */
          background-size: 100% 312mm;
          background-repeat: repeat-y;
          background-position: top center;
          
          box-shadow: 0 0 50px rgba(0,0,0,0.15);
          border: 1px solid #cbd5e1;
        }

        /* Marcadores de Alerta nas Áreas Reservadas (SVG) */
        .ProseMirror::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='210mm' height='312mm'%3E%3Crect x='0' y='0' width='210mm' height='32mm' fill='rgba(241, 245, 249, 0.4)'/%3E%3Ctext x='50%25' y='18mm' font-family='sans-serif' font-size='10' fill='%2394a3b8' text-anchor='middle' font-weight='900' opacity='0.7'%3E\u26A0\uFE0F \u00C1REA RESERVADA (CABE\u00C7ALHO)\u3010TIMBRADO\u3011%3C/text%3E%3Crect x='0' y='265mm' width='210mm' height='32mm' fill='rgba(241, 245, 249, 0.4)'/%3E%3Ctext x='50%25' y='282mm' font-family='sans-serif' font-size='10' fill='%2394a3b8' text-anchor='middle' font-weight='900' opacity='0.7'%3E\u26A0\uFE0F \u00C1REA RESERVADA (RODAP\u00C9)\u3010TIMBRADO\u3011%3C/text%3E%3Cline x1='0' y1='32mm' x2='210mm' y2='32mm' stroke='%23e2e8f0' stroke-width='1' stroke-dasharray='5,5'/%3E%3Cline x1='0' y1='265mm' x2='210mm' y2='265mm' stroke='%23e2e8f0' stroke-width='1' stroke-dasharray='5,5'/%3E%3C/svg%3E");
          background-size: 100% 312mm;
          background-repeat: repeat-y;
          z-index: 10;
        }

        /* Quebra de Página Física: Funciona como uma transição física e visual */
        .page-break-divider {
          height: 79mm; /* 32mm (Footer) + 15mm (Gap) + 32mm (Header) */
          margin-left: -25mm;
          margin-right: -25mm;
          margin-top: 1rem;
          margin-bottom: 1rem;
          background-color: #f1f5f9; /* Cor do Workspace */
          background-image: 
            /* Sombra do Footer da página anterior */
            linear-gradient(to bottom, #f8fafc 0mm, #f8fafc 32mm, transparent 32mm, transparent 47mm, #f8fafc 47mm, #f8fafc 79mm);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          user-select: none;
          pointer-events: none;
          position: relative;
          border-top: 1px dashed #cbd5e1;
          border-bottom: 1px dashed #cbd5e1;
        }

        .page-break-divider::after {
          content: 'QUEBRA DE P\u00C1GINA A4';
          background: #94a3b8;
          color: white;
          padding: 2px 10px;
          border-radius: 4px;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        @media (max-width: 250mm) {
          .ProseMirror { width: 100%; min-height: auto; padding: 2rem !important; background-image: none; margin: 0; border: none; box-shadow: none; }
          .ProseMirror::before { display: none; }
          .page-break-divider { height: 20px; margin: 1rem 0; }
        }

        @media (max-width: 215mm) {
          .ProseMirror {
            width: 100%;
            min-height: auto;
            padding: 1rem !important;
          }
          .ProseMirror::before, .ProseMirror::after { display: none; }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .ProseMirror td, .ProseMirror th {
          min-width: 1em;
          border: 1px solid #ced4da;
          padding: 8px 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        .ProseMirror li {
          display: list-item !important;
          margin-bottom: 0.25rem !important;
        }
        .ProseMirror table ul, .ProseMirror table ol {
          margin: 0.25rem 0 !important;
          padding-left: 1.2rem !important;
        }
        .ProseMirror table li {
          margin-bottom: 0.1rem !important;
        }
        /* Estilo para listas com letras (opcional via classes se necessário, mas garantindo o básico) */
        .ProseMirror ol[type="a"] {
          list-style-type: lower-alpha !important;
        }
        .ProseMirror ol[type="A"] {
          list-style-type: upper-alpha !important;
        }
        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f8f9fa;
        }
        .ProseMirror .selectedCell:after {
          z-index: 2;
          content: "";
          position: absolute;
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
