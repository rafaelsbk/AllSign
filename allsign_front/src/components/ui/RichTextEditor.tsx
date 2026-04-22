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
  ParagraphNode,
  DecoratorNode
} from 'lexical';
import type {
  NodeKey,
  LexicalNode,
  SerializedLexicalNode
} from 'lexical';
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

// 1. Nó Customizado para Pular o Gap e as Margens (Paginação Real)
export class SpacerNode extends DecoratorNode<React.ReactNode> {
  __height: number;

  static getType(): string { return 'spacer'; }
  static clone(node: SpacerNode): SpacerNode { return new SpacerNode(node.__height, node.__key); }
  
  constructor(height: number, key?: NodeKey) {
    super(key);
    this.__height = height;
  }
  
  createDOM(): HTMLElement {
    const el = document.createElement('div');
    el.style.height = `${this.__height}px`;
    el.style.width = '100%';
    el.className = 'lexical-spacer pointer-events-none select-none';
    el.contentEditable = "false";
    return el;
  }
  
  updateDOM(prevNode: SpacerNode, dom: HTMLElement): boolean {
    if (prevNode.__height !== this.__height) {
      dom.style.height = `${this.__height}px`;
    }
    return false;
  }
  
  decorate(): React.ReactNode { return null; }
  
  exportJSON(): SerializedLexicalNode & { height: number } {
    return { ...super.exportJSON(), height: this.__height, type: 'spacer', version: 1 };
  }
  
  static importJSON(serializedNode: any): SpacerNode {
    return $createSpacerNode(serializedNode.height);
  }
}
export function $createSpacerNode(height: number): SpacerNode { return new SpacerNode(height); }
export function $isSpacerNode(node: LexicalNode | null | undefined): node is SpacerNode { return node instanceof SpacerNode; }

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
        
        // Remove spacers do HTML salvo para não duplicar espaços
        const cleanHtml = initialHtml.replace(/<div class="lexical-spacer.*?<\/div>/g, '');
        const dom = parser.parseFromString(cleanHtml, 'text/html');
        
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().select();
        $getSelection()?.insertNodes(nodes);
      });
      setIsFirstRender(false);
    }
  }, [editor, initialHtml, isFirstRender]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, tags }) => {
      // Evitamos disparar onChange durante a formatação interna de paginação
      if (!tags.has('pagination')) {
        editorState.read(() => {
          const html = $generateHtmlFromNodes(editor, null);
          onChange(html);
        });
      }
    });
  }, [editor, onChange]);

  return null;
};

// Plugin de Paginação Robusta (Pula Margens e Gaps)
const PaginationPlugin = () => {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    const doPagination = () => {
      editor.update(() => {
        const root = $getRoot();
        const children = root.getChildren();
        
        // Conversão de MM para PX (aproximadamente 3.78px/mm)
        const MM_TO_PX = 3.779527559;
        
        // Configuração da Folha A4
        const PAGE_HEIGHT = 297 * MM_TO_PX;
        const GAP = 15 * MM_TO_PX; // 15mm de gap visual cinza
        const CYCLE = PAGE_HEIGHT + GAP;
        
        const TOP_MARGIN = 25 * MM_TO_PX;
        const BOTTOM_MARGIN = 25 * MM_TO_PX;
        
        // Mantemos um tracker da posição Y imaginária (border-box)
        let currentY = TOP_MARGIN; 
        let pageIndex = 0;
        
        // 1. Limpamos os spacers antigos para recalcular
        children.forEach(c => {
          if ($isSpacerNode(c)) c.remove();
        });
        
        // 2. Obtemos apenas os blocos de conteúdo reais
        const blocks = root.getChildren().filter(c => !$isSpacerNode(c));
        
        // 3. Calculamos onde o texto deve "pular"
        blocks.forEach(child => {
          const dom = editor.getElementByKey(child.getKey());
          if (!dom) return;
          
          const height = dom.offsetHeight;
          const style = window.getComputedStyle(dom);
          const marginTop = parseFloat(style.marginTop) || 0;
          const marginBottom = parseFloat(style.marginBottom) || 0;
          
          // Altura total do bloco
          const totalHeight = height + Math.max(marginTop, marginBottom);
          
          // Fim da área útil da página atual
          const printableBottomY = pageIndex * CYCLE + PAGE_HEIGHT - BOTTOM_MARGIN;
          
          // Se este bloco ultrapassa a área útil (e não é gigante a ponto de nunca caber)
          if (currentY + totalHeight > printableBottomY && totalHeight < (PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN)) {
            // Empurramos para o início da área útil da próxima página!
            const targetY = (pageIndex + 1) * CYCLE + TOP_MARGIN;
            const requiredHeight = targetY - currentY;
            
            const spacer = $createSpacerNode(requiredHeight);
            child.insertBefore(spacer);
            
            currentY = targetY + totalHeight;
            pageIndex++;
          } else {
            currentY += totalHeight;
          }
        });
      }, { tag: 'pagination' });
    };

    return editor.registerUpdateListener(({ tags }) => {
      // Ignoramos updates causados por nossa própria paginação
      if (!tags.has('pagination')) {
        setTimeout(doPagination, 50); // Delay para o DOM renderizar os novos nós
      }
    });
  }, [editor]);
  
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
      LinkNode,
      SpacerNode
    ]
  };

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
                backgroundColor: 'transparent', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                paddingLeft: '25mm',
                paddingRight: '25mm',
                paddingTop: '25mm',
                paddingBottom: '25mm',
                boxSizing: 'border-box',
                backgroundOrigin: 'border-box',
                // A mágica: Desenhamos as folhas A4 reais e injetamos o header/footer
                backgroundImage: `
                  linear-gradient(to bottom, white 0mm, white 297mm, transparent 297mm, transparent 312mm),
                  url("${letterhead?.header || ''}"),
                  url("${letterhead?.footer || ''}")
                `,
                backgroundSize: '210mm 312mm, 210mm 312mm, 210mm 312mm',
                backgroundPosition: 'top center, center 5mm, center 272mm',
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
          .lexical-spacer { overflow: hidden; }
        `}</style>
      </div>
    </LexicalComposer>
  );
};

export default RichTextEditor;
