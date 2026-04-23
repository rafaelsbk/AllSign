import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $getSelection, $isRangeSelection, ParagraphNode } from 'lexical';
import { useEffect, useRef } from 'react';

interface SyncPluginProps {
  onChange: (html: string) => void;
  onInit?: (editorApi: any) => void;
  initialHtml: string;
}

const SyncPlugin = ({ onChange, onInit, initialHtml }: SyncPluginProps) => {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = useRef(false);

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
    if (!hasInitialized.current && initialHtml) {
      editor.update(() => {
        const root = $getRoot();
        const parser = new DOMParser();
        const cleanHtml = initialHtml.trim().replace(/<div class="lexical-spacer.*?<\/div>/g, '');
        
        if (!cleanHtml) return;

        const dom = parser.parseFromString(cleanHtml, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        
        root.clear();
        root.append(...nodes);
        hasInitialized.current = true;
      });
    }
  }, [editor, initialHtml]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, tags }) => {
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

export default SyncPlugin;
