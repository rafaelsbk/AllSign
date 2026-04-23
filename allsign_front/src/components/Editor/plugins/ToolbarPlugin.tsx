import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $wrapNodes,
} from '@lexical/selection';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from '@lexical/rich-text';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  List,
  ListOrdered,
  Type,
  Heading1,
  Heading2,
  Quote,
  Table,
  ChevronDown,
} from 'lucide-react';

const LowPriority = 1;

const blockTypeToBlockName: Record<string, string> = {
  code: 'Código',
  h1: 'Título 1',
  h2: 'Título 2',
  ol: 'Lista Ordenada',
  paragraph: 'Normal',
  quote: 'Citação',
  ul: 'Lista',
};

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [showBlockOptions, setShowBlockOptions] = useState(false);
  const [showListOptions, setShowListOptions] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      // Update links
      const node = selection.getNodes()[0];
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createParagraphNode());
        }
      });
    }
    setShowBlockOptions(false);
  };

  const formatLargeHeading = () => {
    if (blockType !== 'h1') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode('h1'));
        }
      });
    }
    setShowBlockOptions(false);
  };

  const formatSmallHeading = () => {
    if (blockType !== 'h2') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode('h2'));
        }
      });
    }
    setShowBlockOptions(false);
  };

  const formatBulletList = () => {
    if (blockType !== 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
    
    setTimeout(() => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const listNode = $getNearestNodeOfType(anchorNode, ListNode);
          if (listNode && listNode.getTag() === 'ol') {
            listNode.setStyle('list-style-type: decimal');
          }
        }
      });
    }, 0);
    setShowListOptions(false);
  };

  const formatAlphaList = () => {
    if (blockType !== 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
    
    // Wait for the command to finish and the ListNode to be created
    setTimeout(() => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const listNode = $getNearestNodeOfType(anchorNode, ListNode);
          if (listNode && listNode.getTag() === 'ol') {
            listNode.setStyle('list-style-type: lower-alpha');
          }
        }
      });
    }, 0);
    setShowListOptions(false);
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createQuoteNode());
        }
      });
    }
    setShowBlockOptions(false);
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-200 bg-white/80 sticky top-0 z-[100] backdrop-blur-md shadow-sm no-print w-full">
      <button
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
        title="Desfazer"
      >
        <Undo size={18} />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
        title="Refazer"
      >
        <Redo size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Block Type Selector */}
      <div className="relative">
        <button
          onClick={() => setShowBlockOptions(!showBlockOptions)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium min-w-[120px]"
        >
          <Type size={18} className="text-gray-500" />
          <span className="flex-1 text-left">{blockTypeToBlockName[blockType] || 'Normal'}</span>
          <ChevronDown size={14} />
        </button>
        
        {showBlockOptions && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <button onClick={formatParagraph} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Type size={16} /> Normal
            </button>
            <button onClick={formatLargeHeading} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Heading1 size={16} /> Título 1
            </button>
            <button onClick={formatSmallHeading} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Heading2 size={16} /> Título 2
            </button>
            <button onClick={formatQuote} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Quote size={16} /> Citação
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={formatBulletList}
        className={`p-2 rounded-lg ${blockType === 'ul' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Lista de Pontos"
      >
        <List size={18} />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowListOptions(!showListOptions)}
          className={`p-2 rounded-lg flex items-center gap-0.5 ${blockType === 'ol' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
          title="Lista Ordenada"
        >
          <ListOrdered size={18} />
          <ChevronDown size={12} />
        </button>

        {showListOptions && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <button onClick={formatNumberedList} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <span className="font-bold">1.</span> Numérica
            </button>
            <button onClick={formatAlphaList} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <span className="font-bold">a.</span> Alfabética
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={`p-2 rounded-lg ${isBold ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Negrito"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={`p-2 rounded-lg ${isItalic ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Itálico"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={`p-2 rounded-lg ${isUnderline ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Sublinhado"
      >
        <Underline size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        className={`p-2 rounded-lg ${isStrikethrough ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Riscado"
      >
        <Strikethrough size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        className={`p-2 rounded-lg ${isCode ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Código"
      >
        <Code size={18} />
      </button>
      <button
        onClick={insertLink}
        className={`p-2 rounded-lg ${isLink ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Inserir Link"
      >
        <Link size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={() => editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '2', rows: '2' })}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        title="Inserir Tabela"
      >
        <Table size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        title="Alinhar à Esquerda"
      >
        <AlignLeft size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        title="Centralizar"
      >
        <AlignCenter size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        title="Alinhar à Direita"
      >
        <AlignRight size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        title="Justificar"
      >
        <AlignJustify size={18} />
      </button>
    </div>
  );
}
