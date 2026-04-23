import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { useEffect } from 'react';
import { $createSpacerNode, $isSpacerNode } from '../nodes/SpacerNode';

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

export default PaginationPlugin;
