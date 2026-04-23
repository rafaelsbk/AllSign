import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import {
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  TableCellNode,
  TableCellHeaderStates,
} from '@lexical/table';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronDown, 
  Trash2, 
  Type, 
  Palette,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { $getNearestNodeOfType } from '@lexical/utils';

const COLORS = [
  { name: 'Nenhuma', value: 'transparent' },
  { name: 'Cinza Claro', value: '#f9fafb' },
  { name: 'Cinza', value: '#f3f4f6' },
  { name: 'Azul Claro', value: '#eff6ff' },
  { name: 'Laranja Solar', value: '#fff7ed' },
  { name: 'Verde Claro', value: '#f0fdf4' },
];

function TableActionMenu({
  anchorElem,
  onClose,
  tableCellNode,
}: {
  anchorElem: HTMLElement;
  onClose: () => void;
  tableCellNode: TableCellNode;
}): React.ReactNode {
  const [editor] = useLexicalComposerContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const insertRowAbove = () => {
    editor.update(() => {
      $insertTableRow__EXPERIMENTAL(false);
    });
    onClose();
  };

  const insertRowBelow = () => {
    editor.update(() => {
      $insertTableRow__EXPERIMENTAL(true);
    });
    onClose();
  };

  const insertColumnLeft = () => {
    editor.update(() => {
      $insertTableColumn__EXPERIMENTAL(false);
    });
    onClose();
  };

  const insertColumnRight = () => {
    editor.update(() => {
      $insertTableColumn__EXPERIMENTAL(true);
    });
    onClose();
  };

  const deleteRow = () => {
    editor.update(() => {
      $deleteTableRow__EXPERIMENTAL();
    });
    onClose();
  };

  const deleteColumn = () => {
    editor.update(() => {
      $deleteTableColumn__EXPERIMENTAL();
    });
    onClose();
  };

  const deleteTable = () => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      tableNode.remove();
    });
    onClose();
  };

  const toggleHeader = () => {
    editor.update(() => {
      tableCellNode.toggleHeaderStyle(TableCellHeaderStates.ROW);
    });
    onClose();
  };

  const applyColor = (color: string) => {
    editor.update(() => {
      tableCellNode.setBackgroundColor(color);
    });
    setShowColorPicker(false);
    onClose();
  };

  useEffect(() => {
    const menu = menuRef.current;
    if (menu && anchorElem) {
      const { top, left, height } = anchorElem.getBoundingClientRect();
      menu.style.top = `${top + height + window.scrollY}px`;
      menu.style.left = `${left + window.scrollX}px`;
    }
  }, [anchorElem]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[110] bg-white border border-gray-200 rounded-xl shadow-2xl py-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="px-3 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Linhas</div>
      <button type="button" onClick={insertRowAbove} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <ArrowUp size={14} /> Inserir acima
      </button>
      <button type="button" onClick={insertRowBelow} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <ArrowDown size={14} /> Inserir abaixo
      </button>
      <button type="button" onClick={deleteRow} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 size={14} /> Excluir linha
      </button>

      <div className="h-px bg-gray-100 my-1" />
      <div className="px-3 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Colunas</div>
      <button type="button" onClick={insertColumnLeft} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <ArrowLeft size={14} /> Inserir à esquerda
      </button>
      <button type="button" onClick={insertColumnRight} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <ArrowRight size={14} /> Inserir à direita
      </button>
      <button type="button" onClick={deleteColumn} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 size={14} /> Excluir coluna
      </button>

      <div className="h-px bg-gray-100 my-1" />
      <div className="px-3 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estilo</div>
      <button type="button" onClick={toggleHeader} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-bold transition-colors">
        <Type size={14} /> Alternar Cabeçalho (TH)
      </button>
      
      <div className="relative">
        <button 
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Palette size={14} /> Cor de Fundo
          <ChevronDown size={12} className={`ml-auto transition-transform ${showColorPicker ? 'rotate-180' : ''}`} />
        </button>
        
        {showColorPicker && (
          <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-xl shadow-xl py-2 w-40 animate-in fade-in slide-in-from-left-2 duration-200">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => applyColor(c.value)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <div className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: c.value }} />
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100 my-1" />
      <button type="button" onClick={deleteTable} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-bold transition-colors">
        <Trash2 size={14} /> EXCLUIR TABELA
      </button>
    </div>
  );
}

export default function TableActionMenuPlugin(): React.ReactNode {
  const [editor] = useLexicalComposerContext();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeCell, setActiveCell] = useState<TableCellNode | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const updateTableMenu = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = selection.anchor.getNode();
      const cell = $getNearestNodeOfType(node, TableCellNode);
      if (cell) {
        const dom = editor.getElementByKey(cell.getKey());
        setActiveCell(cell);
        setMenuAnchor(dom);
      } else {
        setMenuAnchor(null);
        setActiveCell(null);
        setShowMenu(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.getEditorState().read(() => {
        updateTableMenu();
      });
    });
  }, [editor, updateTableMenu]);

  if (!menuAnchor || !activeCell) return null;

  return createPortal(
    <div 
      className="fixed z-[100] no-print pointer-events-auto"
      style={{
        top: menuAnchor.getBoundingClientRect().top + window.scrollY + 5,
        left: menuAnchor.getBoundingClientRect().right + window.scrollX - 30,
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className={`w-6 h-6 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-400 transition-all ${showMenu ? 'bg-gray-100 text-gray-900 border-gray-400' : ''}`}
      >
        <ChevronDown size={14} />
      </button>
      
      {showMenu && (
         <TableActionMenu 
           anchorElem={menuAnchor} 
           tableCellNode={activeCell} 
           onClose={() => setShowMenu(false)} 
         />
      )}
    </div>,
    document.body
  );
}
