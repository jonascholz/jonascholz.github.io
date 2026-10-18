/**
 * A tiny SVG builder that works without a DOM.
 *
 * Diagrams build a tree with `h()` and the helpers below; `toSvgString()`
 * serializes it. The same code renders static SVG at build time and
 * re-renders interactive diagrams in the browser.
 *
 * Colors are CSS values (usually `var(--...)`), so `fill`/`stroke`/`color`
 * are emitted as inline style: presentation attributes cannot resolve `var()`.
 */

export type Child = SvgNode | string | number | null | undefined | false | Child[];
export type Attrs = Record<string, string | number | boolean | null | undefined>;

export interface SvgNode {
  tag: string;
  attrs: Attrs;
  children: Child[];
}

const STYLE_ATTRS = new Set(['fill', 'stroke', 'color', 'opacity']);

export function h(tag: string, attrs: Attrs = {}, ...children: Child[]): SvgNode {
  return { tag, attrs, children };
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const num = (v: number) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100));

export function toSvgString(node: Child): string {
  if (node === null || node === undefined || node === false) return '';
  if (Array.isArray(node)) return node.map(toSvgString).join('');
  if (typeof node === 'number') return num(node);
  if (typeof node === 'string') return escape(node);

  const style: string[] = [];
  let attrs = '';
  for (const [k, v] of Object.entries(node.attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (STYLE_ATTRS.has(k)) style.push(`${k}:${v}`);
    else if (k === 'style') style.push(String(v));
    else attrs += v === true ? ` ${k}` : ` ${k}="${escape(typeof v === 'number' ? num(v) : v)}"`;
  }
  if (style.length) attrs += ` style="${escape(style.join(';'))}"`;
  return `<${node.tag}${attrs}>${toSvgString(node.children)}</${node.tag}>`;
}

/* ---------- Theme tokens for diagrams (defined in global.css) ---------- */

export const ink = 'var(--d-ink)';
export const axis = 'var(--d-axis)';
export const grid = 'var(--d-grid)';
export const paper = 'var(--d-paper)';
export const nodeFill = 'var(--d-node)';
export const muted = 'var(--d-muted)';

/* ---------- Shapes ---------- */

export interface StrokeOpts {
  color?: string;
  width?: number;
  dash?: string;
  /** Marker id from `arrowDefs()`. */
  arrow?: string;
  opacity?: number;
  cap?: 'butt' | 'round' | 'square';
}

const strokeAttrs = (o: StrokeOpts = {}): Attrs => ({
  stroke: o.color ?? ink,
  'stroke-width': o.width ?? 2,
  'stroke-dasharray': o.dash,
  'stroke-linecap': o.cap,
  'marker-end': o.arrow ? `url(#${o.arrow})` : undefined,
  opacity: o.opacity,
});

export const line = (x1: number, y1: number, x2: number, y2: number, o?: StrokeOpts) =>
  h('line', { x1, y1, x2, y2, ...strokeAttrs(o) });

export const path = (d: string, o: StrokeOpts & { fill?: string } = {}) =>
  h('path', { d, fill: o.fill ?? 'none', ...strokeAttrs(o) });

export const circle = (cx: number, cy: number, r: number, o: StrokeOpts & { fill?: string } = {}) =>
  h('circle', { cx, cy, r, fill: o.fill ?? paper, ...strokeAttrs(o) });

export const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  o: StrokeOpts & { fill?: string; rx?: number } = {},
) =>
  h('rect', {
    x,
    y,
    width,
    height,
    rx: o.rx,
    fill: o.fill ?? 'none',
    ...(o.width === 0 ? {} : strokeAttrs(o)),
  });

export interface TextOpts {
  color?: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number | 'bold';
  italic?: boolean;
  mono?: boolean;
  baseline?: 'auto' | 'middle' | 'hanging' | 'central';
  rotate?: number;
}

export function text(x: number, y: number, content: Child, o: TextOpts = {}) {
  return h(
    'text',
    {
      x,
      y,
      fill: o.color ?? ink,
      'font-size': o.size ?? 14,
      'text-anchor': o.anchor ?? 'middle',
      'font-weight': o.weight,
      'font-style': o.italic ? 'italic' : undefined,
      'font-family': o.mono ? 'var(--font-mono)' : undefined,
      'dominant-baseline': o.baseline,
      transform: o.rotate ? `rotate(${o.rotate} ${num(x)} ${num(y)})` : undefined,
    },
    content,
  );
}

/** Text with a subscript, e.g. `sub('W', 'in')` -> W_in. */
export const sub = (base: string, subscript: string) => [
  base,
  h('tspan', { 'baseline-shift': 'sub', 'font-size': '75%' }, subscript),
];

export const group = (attrs: Attrs, ...children: Child[]) => h('g', attrs, ...children);

export const translate = (x: number, y: number, ...children: Child[]) =>
  h('g', { transform: `translate(${num(x)},${num(y)})` }, ...children);

/* ---------- Arrow markers ---------- */

/**
 * Arrowhead markers, one per color. Ids are prefixed with the diagram id so
 * several diagrams on one page never share (or hide) each other's markers.
 * Returns the `<defs>` node and a lookup from color to marker id.
 */
export function arrowDefs<K extends string>(prefix: string, colors: Record<K, string>, size = 10) {
  const ids = {} as Record<K, string>;
  const markers = (Object.entries(colors) as [K, string][]).map(([key, c]) => {
    const id = `${prefix}-arrow-${key}`;
    ids[key] = id;
    return h(
      'marker',
      {
        id,
        markerWidth: size,
        markerHeight: size,
        refX: size * 0.9,
        refY: size * 0.3,
        orient: 'auto',
        markerUnits: 'userSpaceOnUse',
      },
      h('polygon', { points: `0 0, ${size} ${size * 0.3}, 0 ${size * 0.6}`, fill: c }),
    );
  });
  return { defs: h('defs', {}, ...markers), ids };
}

/* ---------- Root ---------- */

export interface SvgOpts {
  width: number;
  height: number;
  /** Accessible description of the figure. */
  label: string;
  /** Max rendered width in px (defaults to the viewBox width). */
  maxWidth?: number;
}

export function svg(o: SvgOpts, ...children: Child[]) {
  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: `0 0 ${o.width} ${o.height}`,
      width: o.width,
      height: o.height,
      role: 'img',
      'aria-label': o.label,
      style: `max-width:min(100%,${o.maxWidth ?? o.width}px)`,
    },
    ...children,
  );
}
