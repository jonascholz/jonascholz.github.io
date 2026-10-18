/**
 * Renders remark-math output with MathJax at build time.
 *
 * Numbering follows AMS rules (every `equation`/`align` row is numbered, in
 * document order). `\ref` and `\eqref` work in any math, including references
 * to equations further down the page: a first pass assigns numbers to labels,
 * the second pass renders with references already resolved.
 */
import type { Element, ElementContent, Root } from 'hast';
import type { VFile } from 'vfile';
import { fromHtml } from 'hast-util-from-html';
import { visit, SKIP } from 'unist-util-visit';
import { createConverter } from './mathjax';

interface MathNode {
  tex: string;
  display: boolean;
  replace: (node: Element) => void;
}

const REF = /\\(eq)?ref\{([^}]*)\}/g;

function classes(node: Element): string[] {
  const c = node.properties?.className;
  return Array.isArray(c) ? c.map(String) : [];
}

function text(node: Element): string {
  return node.children.map((c) => (c.type === 'text' ? c.value : '')).join('');
}

export default function rehypeMathjax() {
  return (tree: Root, file: VFile) => {
    const nodes: MathNode[] = [];

    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index === undefined) return;
      const target = node.tagName === 'pre' && node.children.length === 1 ? node.children[0] : node;
      if (target.type !== 'element' || target.tagName !== 'code') return;
      const cls = classes(target);
      if (!cls.includes('language-math')) return;
      const display = node.tagName === 'pre' || cls.includes('math-display');
      nodes.push({
        tex: text(target),
        display,
        replace: (el) => {
          parent.children[index] = display
            ? { type: 'element', tagName: 'div', properties: { className: ['math-display'] }, children: [el] }
            : el;
        },
      });
      return SKIP;
    });

    if (nodes.length === 0) return;

    // Pass 1: number every displayed equation to learn label -> tag.
    const numbering = createConverter();
    for (const n of nodes) if (n.display) numbering.toHtml(n.tex.replace(REF, ''), true);
    const labels = numbering.labels();

    // Pass 2: render with references rewritten to resolved links.
    const converter = createConverter();
    for (const n of nodes) {
      const tex = n.tex.replace(REF, (_, eq: string | undefined, label: string) => {
        const target = labels[label];
        if (!target) throw new Error(`${file.path}: \\${eq ?? ''}ref to unknown label "${label}"`);
        const shown = eq ? `(${target.tag})` : target.tag;
        return `\\href{#${target.id}}{\\text{${shown}}}`;
      });
      const html = converter.toHtml(tex, n.display);
      if (html.includes('<mjx-merror')) {
        throw new Error(`${file.path}: MathJax could not render: ${n.tex.trim().slice(0, 200)}`);
      }
      const [el] = fromHtml(html, { fragment: true }).children as ElementContent[];
      n.replace(el as Element);
    }
  };
}
