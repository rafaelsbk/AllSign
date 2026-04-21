import React, { useEffect } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import { Node, mergeAttributes } from '@tiptap/core';
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
  ChevronDown, FilePlus, Type
} from 'lucide-react';

// 1. Sistema de Paginação Real
const CustomDocument = Document.extend({
  content: 'page+',
});

const PageNode = Node.create({
  name: 'page',
  group: 'block',
  content: 'block+',
  
  parseHTML() {
    return [{ tag: 'div[data-type="page"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      mergeAttributes(HTMLAttributes, { 'data-type': 'page', class: 'a4-page' }),
      ['div', { class: 'page-letterhead-header', contenteditable: 'false' }],
      ['div', { class: 'page-header-shield', contenteditable: 'false' }],
      ['div', { class: 'page-content-area' }, 0],
      ['div', { class: 'page-footer-shield', contenteditable: 'false' }],
      ['div', { class: 'page-letterhead-footer', contenteditable: 'false' }]
    ];
  },

  addCommands() {
    return {
      addPage: () => ({ tr, dispatch, editor }) => {
        if (dispatch) {
          const { schema } = editor;
          const pageType = schema.nodes.page;
          const paragraphType = schema.nodes.paragraph;
          
          if (pageType && paragraphType) {
            const newPage = pageType.create(null, [paragraphType.create()]);
            tr.insert(tr.doc.content.size, newPage);
          }
        }
        return true;
      },
    } as any;
  },
});

// 2. Extensões de Estilo
const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: 'a', // MUDANÇA: Agora o padrão é alfabético
        parseHTML: element => element.getAttribute('type'),
        renderHTML: attributes => ({ type: attributes.type }),
      },
    };
  },
});

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
          renderHTML: attributes => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: attributes => attributes.backgroundColor ? { style: `background-color: ${attributes.backgroundColor}` } : {},
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
  onInit?: (editor: any) => void;
  letterhead?: { 
    header: string; 
    footer: string;
    header_margin_percent?: number;
    footer_margin_percent?: number;
  };
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  const fontSizes = ['10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '32pt', '48pt'];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-white/95 sticky top-0 z-50 backdrop-blur-md shadow-md rounded-t-2xl no-print">
      <div className="relative group flex items-center bg-white border border-gray-200 rounded-lg px-2 mr-1 shadow-sm">
        <select
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          className="bg-transparent text-xs py-1 outline-none cursor-pointer pr-4 appearance-none"
          value={editor.getAttributes('textStyle').fontSize || '12pt'}
        >
          {fontSizes.map(size => <option key={size} value={size}>{size}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-1 pointer-events-none text-gray-400" />
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Negrito"><Bold size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Itálico"><Italic size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Sublinhado"><UnderlineIcon size={18} /></button>
      
      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded-lg ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><AlignLeft size={18} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded-lg ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><AlignCenter size={18} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded-lg ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><AlignRight size={18} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-2 rounded-lg ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><AlignJustify size={18} /></button>

      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Lista de Pontos"><List size={18} /></button>
      <button 
        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
        className={`p-2 rounded-lg ${editor.isActive('orderedList', { type: 'a' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Lista Alfabética (a, b, c...)"
      >
        <div className="flex flex-col items-center leading-none"><Type size={16} /><span className="text-[8px] font-extrabold -mt-0.5">ABC</span></div>
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleOrderedList().updateAttributes('orderedList', { type: '1' }).run()} 
        className={`p-2 rounded-lg ${editor.isActive('orderedList', { type: '1' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Lista Numérica"
      >
        <ListOrdered size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().addPage().run()}
        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1 bg-purple-50/50 border border-purple-100"
        title="Adicionar Nova Folha A4"
      >
        <FilePlus size={18} />
        <span className="text-[10px] font-bold uppercase">Nova Folha</span>
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: false }).run()} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><TableIcon size={18} /></button>

      {(editor.isActive('table') || editor.isActive('tableRow')) && (
        <div className="flex items-center gap-1 ml-1 bg-zinc-50 p-1 rounded-lg border border-zinc-200">
          <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1 text-emerald-600 hover:bg-white rounded" title="+ Coluna"><Plus size={14} className="rotate-90" /></button>
          <button onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1 text-red-500 hover:bg-white rounded" title="- Coluna"><Minus size={14} className="rotate-90" /></button>
          <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1 text-emerald-600 hover:bg-white rounded" title="+ Linha"><Plus size={14} /></button>
          <button onClick={() => editor.chain().focus().deleteRow().run()} className="p-1 text-red-500 hover:bg-white rounded" title="- Linha"><Minus size={14} /></button>
          <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1 text-red-700 hover:bg-red-100 rounded" title="Excluir"><Trash2 size={14} /></button>
        </div>
      )}
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, editable = true, onInit, letterhead }) => {
  const editor = useEditor({
    extensions: [
      CustomDocument,
      StarterKit.configure({ document: false, orderedList: false, bulletList: false }),
      PageNode,
      CustomOrderedList,
      BulletList,
      TextStyle,
      FontSize,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      CustomTableCell,
    ],
    content: content || '<div data-type="page"><p></p></div>',
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      
      // Detecção de Transbordamento (Pagination) com Proteção de Loop
      const dom = editor.view.dom;
      const pages = dom.querySelectorAll('.a4-page');
      const lastPage = pages[pages.length - 1] as HTMLElement;
      
      if (lastPage) {
        const contentArea = lastPage.querySelector('.page-content-area') as HTMLElement;
        if (contentArea) {
          const isOverflowing = contentArea.scrollHeight > contentArea.clientHeight + 5;
          const hasContent = contentArea.innerText.trim().length > 0 || contentArea.querySelectorAll('img, table, hr').length > 0;
          
          // Só adiciona página se a atual transbordou E tem conteúdo
          if (isOverflowing && hasContent) {
             editor.commands.addPage();
          }
        }
      }
    },
  });

  useEffect(() => { if (editor && onInit) onInit(editor); }, [editor, onInit]);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-zinc-100 shadow-sm flex flex-col h-full">
      {editable && <MenuBar editor={editor} />}
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f1f5f9] custom-scrollbar scroll-smooth">
        <div className="editor-view-viewport py-10 flex flex-col items-center">
          <EditorContent editor={editor} />
        </div>
      </div>
      
      <style>{`
        * { box-sizing: border-box; }
        .ProseMirror { min-height: 100%; outline: none; background: transparent; width: 100%; }
        
        .editor-view-viewport .ProseMirror {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* FOLHA A4 - TAMANHO REAL */
        .a4-page {
          width: 210mm;
          height: 297mm;
          background: white;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: relative;
          cursor: text;
          overflow: hidden;
          flex-shrink: 0;
        }

        /* POSICIONAMENTO DO PAPEL TIMBRADO (REPETE EM TODAS AS PÁGINAS) */
        .page-letterhead-header {
          position: absolute;
          top: ${letterhead?.header_margin_percent || 2.0}%;
          left: 0; right: 0;
          height: 20.79mm;
          background-image: url("${letterhead?.header || ''}");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          z-index: 1;
          pointer-events: none;
          opacity: ${letterhead?.header ? '1' : '0.3'};
        }

        .page-letterhead-footer {
          position: absolute;
          bottom: ${letterhead?.footer_margin_percent || 2.0}%;
          left: 0; right: 0;
          height: 20.79mm;
          background-image: url("${letterhead?.footer || ''}");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          z-index: 1;
          pointer-events: none;
          opacity: ${letterhead?.footer ? '1' : '0.3'};
        }

        /* SHIELDS (ESPAÇAMENTO VISUAL PARA CABEÇALHO E RODAPÉ) */
        .page-header-shield, .page-footer-shield {
          height: 20.79mm;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          font-family: sans-serif;
          font-size: 8px;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: 0.2em;
          user-select: none;
          pointer-events: none;
          flex-shrink: 0;
          z-index: 5;
          padding-bottom: 5px;
        }

        .page-header-shield::after {
          content: 'CABEÇALHO';
        }

        .page-footer-shield {
          margin-top: auto;
          align-items: flex-start;
          padding-top: 5px;
        }

        .page-footer-shield::after {
          content: 'RODAPÉ';
        }

        /* ÁREA DE DIGITAÇÃO COM ALTURA CALCULADA */
        .page-content-area {
          padding: 5mm 25mm !important;
          height: calc(297mm - 41.58mm); /* Altura exata descontando os shields */
          z-index: 10;
          position: relative;
          overflow: hidden;
        }

        .ProseMirror table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 0; overflow: hidden; }
        .ProseMirror td, .ProseMirror th { min-width: 1em; border: 1px solid #ced4da; padding: 8px 12px; vertical-align: top; box-sizing: border-box; position: relative; }
        .ProseMirror ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
        .ProseMirror ol { padding-left: 1.5rem !important; margin: 1rem 0 !important; }
        .ProseMirror ol[type="a"] { list-style-type: lower-alpha !important; }
        .ProseMirror ol[type="A"] { list-style-type: upper-alpha !important; }
        .ProseMirror ol[type="1"] { list-style-type: decimal !important; }
        .ProseMirror li { display: list-item !important; margin-bottom: 0.25rem !important; }

        .a4-page:focus-within {
          border-color: #cbd5e1;
          box-shadow: 0 15px 45px rgba(0,0,0,0.12);
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
