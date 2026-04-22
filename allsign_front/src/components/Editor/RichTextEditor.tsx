import React from 'react';
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
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import EditorTheme from './themes/EditorTheme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import PaginationPlugin from './plugins/PaginationPlugin';
import SyncPlugin from './plugins/SyncPlugin';
import TableActionMenuPlugin from './plugins/TableActionMenuPlugin';
import { SpacerNode } from './nodes/SpacerNode';

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

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  content, 
  onChange, 
  editable = true, 
  onInit, 
  letterhead 
}) => {
  const initialConfig = {
    namespace: 'AllSignEditor',
    theme: EditorTheme,
    editable,
    onError: (error: Error) => console.error(error),
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
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
        {editable && <ToolbarPlugin />}
        
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
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          </div>
        </div>
        
        <HistoryPlugin />
        <ListPlugin />
        <TablePlugin />
        <LinkPlugin />
        <SyncPlugin onChange={onChange} onInit={onInit} initialHtml={content} />
        <PaginationPlugin />
        <TableActionMenuPlugin />

        <style>{`
          .editor-paragraph { margin-bottom: 1em; }
          .editor-text-bold { font-weight: bold; }
          .editor-text-italic { font-style: italic; }
          .editor-text-underline { text-decoration: underline; }
          .editor-text-strikethrough { text-decoration: line-through; }
          .editor-text-code { 
            background-color: #f0f2f5; 
            padding: 2px 4px; 
            border-radius: 4px; 
            font-family: monospace; 
          }
          .editor-ul { list-style-type: disc; padding-left: 2em; margin-bottom: 1em; }
          .editor-ol { list-style-type: decimal; padding-left: 2em; margin-bottom: 1em; }
          .editor-ol-alpha { list-style-type: lower-alpha; }
          .editor-ol-numeric { list-style-type: decimal; }
          .editor-listitem { margin: 0.5em 0; }
          .editor-nested-listitem { list-style-type: none; }
          .editor-link { color: #2563eb; text-decoration: underline; }
          .editor-heading-h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
          .editor-heading-h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
          .editor-quote { 
            border-left: 4px solid #e5e7eb; 
            padding-left: 1em; 
            color: #4b5563; 
            font-style: italic; 
            margin-bottom: 1em; 
          }
          .lexical-spacer { overflow: hidden; }

          /* Table Styles */
          table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
            margin-bottom: 1em;
          }
          td, th {
            border: 1px solid #d1d5db;
            padding: 8px;
            min-width: 40px;
            vertical-align: top;
            position: relative;
          }
          th {
            background-color: #f9fafb;
            font-weight: bold;
            text-align: left;
          }
        `}</style>
      </div>
    </LexicalComposer>
  );
};

export default RichTextEditor;
