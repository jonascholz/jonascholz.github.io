/**
 * Pandoc-style citations: `[@he2015]` or `[@he2015; @micheli2025]`.
 *
 * Numbers follow the order of the `references` list in the front matter, and
 * link to the reference list the post layout renders at the bottom.
 */
import type { Root, PhrasingContent } from 'mdast';
import type { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import { parse } from 'yaml';

const CITE = /\[(@[\w-]+(?:\s*;\s*@[\w-]+)*)\]/g;

function referenceIds(file: VFile): string[] {
  const fm = (file.data as any)?.astro?.frontmatter;
  let refs = fm?.references;
  if (!refs) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(file.value));
    refs = match ? parse(match[1])?.references : undefined;
  }
  return Array.isArray(refs) ? refs.map((r: { id: string }) => r.id) : [];
}

export default function remarkCitations() {
  return (tree: Root, file: VFile) => {
    let ids: string[] | undefined;

    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined || !node.value.includes('[@')) return;
      ids ??= referenceIds(file);
      const out: PhrasingContent[] = [];
      let last = 0;
      for (const m of node.value.matchAll(CITE)) {
        if (m.index! > last) out.push({ type: 'text', value: node.value.slice(last, m.index) });
        const keys = m[1].split(';').map((k) => k.trim().slice(1));
        const children: PhrasingContent[] = [{ type: 'text', value: '[' }];
        keys.forEach((key, i) => {
          const n = ids!.indexOf(key) + 1;
          if (n === 0) throw new Error(`${file.path}: citation [@${key}] has no entry in front matter references`);
          if (i > 0) children.push({ type: 'text', value: ', ' });
          children.push({ type: 'link', url: `#ref-${key}`, children: [{ type: 'text', value: String(n) }] });
        });
        children.push({ type: 'text', value: ']' });
        // Unknown node types with `hName` become that element in remark-rehype (works for MDX too).
        out.push({
          type: 'citation',
          children,
          data: { hName: 'span', hProperties: { className: ['citation'] } },
        } as unknown as PhrasingContent);
        last = m.index! + m[0].length;
      }
      if (out.length === 0) return;
      if (last < node.value.length) out.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(index, 1, ...out);
      return index + out.length;
    });
  };
}
