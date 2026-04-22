import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $getSelection, $isRangeSelection, ParagraphNode } from 'lexical';
import { useEffect, useState } from 'react';

interface SyncPluginProps {
  onChange: (html: string) => void;
  onInit?: (editorApi: any) => void;
  initialHtml: string;
}

const SyncPlugin = ({ onChange, onInit, initialHtml }: SyncPluginProps) => {
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
