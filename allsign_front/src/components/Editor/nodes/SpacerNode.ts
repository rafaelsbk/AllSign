import { DecoratorNode } from 'lexical';
import type { NodeKey, LexicalNode, SerializedLexicalNode } from 'lexical';
import React from 'react';

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
