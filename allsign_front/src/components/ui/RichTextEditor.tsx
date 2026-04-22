import React, { useEffect, useRef } from 'react';
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
  Underline as UnderlineIcon,
  ChevronDown, FilePlus, Type
} from 'lucide-react';

// 1. Definição do Esquema de Documento com Páginas
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
      addPage: () => ({ tr, dispatch, editor }: any) => {
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

// 2. Extensões de Suporte
const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: 'a',
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

      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`} title="Negrito"><Bold size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`} title="Itálico"><Italic size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded-lg ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`} title="Sublinhado"><UnderlineIcon size={18} /></button>
      
      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded-lg ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}><AlignLeft size={18} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded-lg ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}><AlignCenter size={18} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded-lg ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}><AlignRight size={18} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-2 rounded-lg ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}><AlignJustify size={18} /></button>

      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`} title="Lista"><List size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-lg ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`} title="Lista Alfabética"><Type size={16} /></button>
      
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

      <button onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run()} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><TableIcon size={18} /></button>
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
    },
  });

  // Estratégia de Paginação (Split de Conteúdo)
  useEffect(() => {
    if (!editor || !editable) return;

    const handlePagination = () => {
      const { view, state } = editor;
      const pagesDOM = view.dom.querySelectorAll('.a4-page');
      
      for (let i = 0; i < pagesDOM.length; i++) {
        const page = pagesDOM[i] as HTMLElement;
        const contentArea = page.querySelector('.page-content-area') as HTMLElement;
        if (!contentArea) continue;

        // Se o conteúdo real transborda a altura fixa da área útil
        if (contentArea.scrollHeight > contentArea.clientHeight + 1) {
          const children = contentArea.children;
          let nodeToSplit = null;

          // Identificar o primeiro elemento que cruzou o limite
          for (let j = 0; j < children.length; j++) {
            const child = children[j] as HTMLElement;
            if (child.offsetTop + child.offsetHeight > contentArea.clientHeight) {
              nodeToSplit = child;
              break;
            }
          }

          if (nodeToSplit) {
            try {
              const pos = view.posAtDOM(nodeToSplit, 0);
              const resolvedPos = state.doc.resolve(pos);
              
              // Define o ponto de corte exatamente antes do bloco que transbordou
              const splitPos = resolvedPos.depth > 1 ? resolvedPos.before(resolvedPos.depth) : pos;
              
              // Garante que não estamos tentando cortar no início absoluto da página
              const pageStart = resolvedPos.start(1);
              if (splitPos <= pageStart) continue;

              // Move o parágrafo e todos os subsequentes para uma nova página
              editor.chain()
                .command(({ tr, dispatch }: any) => {
                  if (dispatch) {
                    tr.split(splitPos, 1);
                    return true;
                  }
                  return false;
                })
                .run();
              
              return; // O onUpdate ou Mutation disparará novamente
            } catch (e) {
              console.warn('Falha ao processar split de página:', e);
            }
          }
        }
      }
    };

    // MutationObserver monitora mudanças no DOM (digitação, colagem, deleção)
    const observer = new MutationObserver(() => {
      // Pequeno delay para permitir que o navegador calcule o layout
      setTimeout(handlePagination, 10);
    });

    observer.observe(editor.view.dom, { childList: true, subtree: true, characterData: true });
    
    return () => observer.disconnect();
  }, [editor, editable]);

  useEffect(() => { if (editor && onInit) onInit(editor); }, [editor, onInit]);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-zinc-100 shadow-sm flex flex-col h-full box-border">
      {editable && <MenuBar editor={editor} />}
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f1f5f9] custom-scrollbar scroll-smooth">
        <div className="editor-view-viewport py-10 flex flex-col items-center">
          <EditorContent editor={editor} />
        </div>
      </div>
      
      <style>{`
        * { box-sizing: border-box !important; }
        .ProseMirror { min-height: 100%; outline: none; background: transparent; width: 100%; }
        
        /* FOLHA A4 - RIGIDEZ TOTAL */
        .a4-page {
          width: 210mm !important;
          height: 297mm !important;
          min-height: 297mm !important;
          max-height: 297mm !important;
          background: white;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: relative;
          cursor: text;
          overflow: hidden !important;
          flex-shrink: 0;
        }

        /* ÁREA ÚTIL CALCULADA */
        .page-content-area {
          padding: 5mm 25mm !important;
          height: 255.42mm !important; /* 297mm - (20.79mm * 2) */
          min-height: 255.42mm !important;
          max-height: 255.42mm !important;
          z-index: 10;
          position: relative;
          overflow: hidden !important; /* Esconde o transbordo para o script detectar scrollHeight */
        }

        /* PAPEL TIMBRADO */
        .page-letterhead-header, .page-letterhead-footer {
          position: absolute;
          left: 0; right: 0;
          height: 20.79mm;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          z-index: 1;
          pointer-events: none;
        }
        .page-letterhead-header { top: ${letterhead?.header_margin_percent || 2.0}%; background-image: url("${letterhead?.header || ''}"); }
        .page-letterhead-footer { bottom: ${letterhead?.footer_margin_percent || 2.0}%; background-image: url("${letterhead?.footer || ''}"); }

        /* DECORAÇÃO VISUAL */
        .page-header-shield, .page-footer-shield {
          height: 20.79mm;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: 0.2em;
          user-select: none;
          pointer-events: none;
          flex-shrink: 0;
        }
        .page-header-shield::after { content: 'CABEÇALHO'; }
        .page-footer-shield::after { content: 'RODAPÉ'; }

        /* ESTILOS DE TEXTO */
        .ProseMirror p { margin-bottom: 0.5em; }
        .ProseMirror table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 0; }
        .ProseMirror td, .ProseMirror th { border: 1px solid #ced4da; padding: 8px; vertical-align: top; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
