import React, { useEffect } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { 
  Bold, Italic, List, ListOrdered, 
  Table as TableIcon, Plus, Trash2, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Underline as UnderlineIcon,
  ChevronDown
} from 'lucide-react';

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
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-30 backdrop-blur-md">
      {/* Font Size Dropdown */}
      <div className="relative group flex items-center bg-white border border-gray-200 rounded-lg px-2 mr-1">
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
        className={`p-2 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Lista Numerada"
      >
        <ListOrdered size={18} />
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

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, editable = true }) => {
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
          padding: 32mm 20mm 32mm 20mm !important; /* Margens A4: 32mm para Cabeçalho e Rodapé */
          margin: 0 auto;
          box-sizing: border-box;
          cursor: text;
          position: relative;
        }

        /* Simulação visual das margens de cabeçalho/rodapé */
        .ProseMirror::before {
          content: 'ÁREA DE CABEÇALHO (PAPEL TIMBRADO)';
          position: absolute;
          top: 25mm;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 8px;
          font-weight: 900;
          color: #cbd5e1;
          letter-spacing: 0.3em;
          pointer-events: none;
          border-bottom: 1px dashed #f1f5f9;
        }

        .ProseMirror::after {
          content: 'ÁREA DE RODAPÉ (PAPEL TIMBRADO)';
          position: absolute;
          bottom: 25mm;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 8px;
          font-weight: 900;
          color: #cbd5e1;
          letter-spacing: 0.3em;
          pointer-events: none;
          border-top: 1px dashed #f1f5f9;
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
        .ProseMirror td ul, .ProseMirror td ol, 
        .ProseMirror th ul, .ProseMirror th ol {
          margin: 0.5rem 0 !important;
          padding: 0 0 0 1.5rem !important;
          list-style-position: outside !important;
          display: block !important;
        }
        .ProseMirror td ul, .ProseMirror th ul {
          list-style-type: disc !important;
        }
        .ProseMirror td ol, .ProseMirror th ol {
          list-style-type: decimal !important;
        }
        .ProseMirror td li, .ProseMirror th li {
          margin: 0 0 0.2rem 0 !important;
          display: list-item !important;
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
