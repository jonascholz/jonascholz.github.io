import { defineDiagram } from './lib/define';
import { axis, circle, h, ink, line, nodeFill, rect, svg, text } from './lib/svg';
import { color } from '../lib/palette';

/** Two unfair coin flips: outcome probabilities next to a prefix-free binary code tree. */
export default defineDiagram({
  render() {
    const prob = color('purple');
    const code = color('red');
    const leaf = color('green');
    const bold = { weight: 'bold' as const };

    const outcomes = [
      { name: 'Heads-Heads', p: 0.75 * 0.75 },
      { name: 'Heads-Tails', p: 0.75 * 0.25 },
      { name: 'Tails-Heads', p: 0.25 * 0.75 },
      { name: 'Tails-Tails', p: 0.25 * 0.25 },
    ];
    const leftX = 50;
    const barMax = 150;
    const bars = outcomes.map(({ name, p }, i) => {
      const y = 80 + i * 60;
      const w = p * barMax;
      return [
        rect(leftX, y, w, 30, { fill: prob, color: ink, width: 2 }),
        text(leftX + barMax + 10, y + 20, name, { size: 13, anchor: 'start' }),
        text(leftX + w + 5, y + 20, p.toFixed(2), { ...bold, size: 12, anchor: 'start', color: prob }),
      ];
    });

    const tx = 450;
    const ty = 60;
    const lh = 70;
    const nodes = [
      { x: tx, y: ty },
      { x: tx - 70, y: ty + lh, label: 'HH', code: '0' },
      { x: tx + 70, y: ty + lh },
      { x: tx + 20, y: ty + 2 * lh, label: 'HT', code: '10' },
      { x: tx + 120, y: ty + 2 * lh },
      { x: tx + 85, y: ty + 3 * lh, label: 'TH', code: '110' },
      { x: tx + 155, y: ty + 3 * lh, label: 'TT', code: '111' },
    ];
    const edges: [number, number, string][] = [
      [0, 1, '0'],
      [0, 2, '1'],
      [2, 3, '0'],
      [2, 4, '1'],
      [4, 5, '0'],
      [4, 6, '1'],
    ];

    return svg(
      {
        width: 700,
        height: 350,
        label: 'Probabilities of the four outcomes of two unfair coin flips, and a prefix-free binary tree that gives the likelier outcomes shorter codes.',
      },
      text(leftX + 100, 30, 'Outcomes & Probabilities', { ...bold, size: 16 }),
      bars,
      text(tx, 30, 'Binary Tree Encoding', { ...bold, size: 16 }),
      edges.map(([a, b, bit]) => {
        const f = nodes[a];
        const t = nodes[b];
        const dx = bit === '0' ? -10 : 10;
        return [
          line(f.x, f.y, t.x, t.y, { color: axis, width: 2 }),
          text((f.x + t.x) / 2 + dx, (f.y + t.y) / 2 - 5, bit, { ...bold, color: code }),
        ];
      }),
      nodes.map((n) =>
        n.label
          ? [
              // Opaque backing so the edges stay hidden behind the translucent leaf fill.
              circle(n.x, n.y, 20, { width: 0 }),
              h('circle', { cx: n.x, cy: n.y, r: 20, fill: leaf, 'fill-opacity': 0.55, stroke: ink, 'stroke-width': 2 }),
              text(n.x, n.y + 5, n.label, { ...bold, size: 12 }),
              text(n.x, n.y + 35, n.code, { ...bold, size: 11, color: code }),
            ]
          : circle(n.x, n.y, 20, { fill: nodeFill }),
      ),
    );
  },
});
