import React, { useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  ParagraphNode
} from 'lexical';
import type { LexicalEditor } from 'lexical';
import { 
  Bold, Italic, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Underline as UnderlineIcon
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
  onInit?: (editorApi: any) => void;
  letterhead?: { 
    header: string; 
    footer: string;
  };
}

const theme = {
  paragraph: 'lexical-paragraph',
  text: {
    bold: 'lexical-bold',
    italic: 'lexical-italic',
    underline: 'lexical-underline',
  },
  list: {
    ul: 'lexical-ul',
    ol: 'lexical-ol',
    listitem: 'lexical-listitem',
  }
};

// Plugin para Sincronizar HTML e Variáveis
const SyncPlugin = ({ onChange, onInit, initialHtml }: { onChange: (html: string) => void, onInit: any, initialHtml: string }) => {
  const [editor] = useLexicalComposerContext();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (onInit) {
      onInit({
        insertContent: (text: string) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertText(text);
            } else {
              const root = $getRoot();
              const p = root.getLastChild() || root.append(new ParagraphNode());
              p.selectEnd();
              $getSelection()?.insertText(text);
            }
          });
        }
      });
    }
  }, [editor, onInit]);

  useEffect(() => {
    if (isFirstRender && initialHtml) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialHtml, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().select();
        $getSelection()?.insertNodes(nodes);
      });
      setIsFirstRender(false);
    }
  }, [editor, initialHtml, isFirstRender]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    });
  }, [editor, onChange]);

  return null;
};

// Plugin de Paginação Contínua (Visual A4 Flow)
const PaginationPlugin = () => {
  // Em vez de quebrar a árvore de nós (o que causa bugs no React/Lexical),
  // O editor será uma única folha que cresce, MAS visualmente ele renderiza
  // separadores de página a cada 297mm através de CSS, garantindo que a edição
  // nunca trave e o texto flua perfeitamente. O backend (xhtml2pdf) lida com a quebra final.
  return null;
};

const MenuBar = () => {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-white/95 sticky top-0 z-50 backdrop-blur-md shadow-md rounded-t-2xl no-print">
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Negrito"><Bold size={18} /></button>
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Itálico"><Italic size={18} /></button>
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Sublinhado"><UnderlineIcon size={18} /></button>
      
      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

      <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"><AlignLeft size={18} /></button>
      <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"><AlignCenter size={18} /></button>
      <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"><AlignRight size={18} /></button>
      <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"><AlignJustify size={18} /></button>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, editable = true, onInit, letterhead }) => {
  const initialConfig = {
    namespace: 'AllSignEditor',
    theme,
    editable,
    onError: (error: Error) => console.error(error),
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode
    ]
  };

  // O pulo do gato: CSS Background simulando as folhas A4.
  // A folha cresce infinitamente, mas visualmente tem cortes de 297mm.
  
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border border-gray-100 rounded-2xl overflow-hidden bg-zinc-100 shadow-sm flex flex-col h-full box-border">
        {editable && <MenuBar />}
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f1f5f9] custom-scrollbar scroll-smooth">
          <div className="editor-scroller flex flex-col items-center py-10">
            <div 
              className="lexical-root-container"
              style={{
                width: '210mm',
                minHeight: '297mm',
                backgroundColor: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                padding: '25mm',
                // A mágica: fundo repetitivo que desenha o cabeçalho e rodapé a cada 297mm
                backgroundImage: `
                  url("${letterhead?.header || ''}"),
                  url("${letterhead?.footer || ''}"),
                  linear-gradient(to bottom, transparent calc(297mm - 2px), #cbd5e1 calc(297mm - 2px), #cbd5e1 297mm)
                `,
                backgroundSize: '210mm 297mm, 210mm 297mm, 210mm 297mm',
                backgroundPosition: 'top center, bottom center, top center',
                backgroundRepeat: 'repeat-y',
                lineHeight: '1.6',
                position: 'relative'
              }}
            >
              <RichTextPlugin
                contentEditable={<ContentEditable className="outline-none min-h-full" />}
                placeholder={<div className="absolute top-[25mm] left-[25mm] text-gray-400 pointer-events-none">Comece a digitar o contrato...</div>}
                // @ts-expect-error type mismatch with older @lexical/react versions
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          </div>
        </div>
        
        <HistoryPlugin />
        <ListPlugin />
        <SyncPlugin onChange={onChange} onInit={onInit} initialHtml={content} />
        <PaginationPlugin />

        <style>{`
          .lexical-paragraph { margin-bottom: 1em; }
          .lexical-bold { font-weight: bold; }
          .lexical-italic { font-style: italic; }
          .lexical-underline { text-decoration: underline; }
          .lexical-ul { list-style-type: disc; padding-left: 2em; margin-bottom: 1em; }
          .lexical-ol { list-style-type: decimal; padding-left: 2em; margin-bottom: 1em; }
          
          /* Linhas guias de página para o usuário saber onde a A4 termina */
          .lexical-root-container {
            background-image: 
              linear-gradient(to bottom, transparent calc(297mm - 2px), #cbd5e1 calc(297mm - 2px), #cbd5e1 297mm);
            background-size: 100% 297mm;
          }
        `}</style>
      </div>
    </LexicalComposer>
  );
};

export default RichTextEditor;
