import { defineDiagram } from './lib/define';
import { arrowDefs, circle, h, ink, line, svg, text, translate } from './lib/svg';
import { color } from '../lib/palette';

/** Two connected neurons: no spike encodes heads, a spike encodes tails. */
export default defineDiagram({
  render({ id }) {
    const neuron = color('blue');
    const spike = color('red');
    const { defs, ids } = arrowDefs(id, { ink }, 20);
    const r = 25;
    const x1 = 80;
    const x2 = 280;

    // Translucent palette blue over an opaque backing, softer than the raw color.
    const node = (x: number, y: number) => [
      circle(x, y, r, { width: 0 }),
      h('circle', { cx: x, cy: y, r, fill: neuron, 'fill-opacity': 0.7, stroke: ink, 'stroke-width': 2 }),
    ];

    const scenario = (y: number, hasSpike: boolean, label: string) => {
      const mid = (x1 + x2) / 2;
      return [
        line(x1 + r, y, x2 - r, y, { color: ink, arrow: ids.ink }),
        hasSpike && line(mid, y - 45, mid, y - 20, { color: spike, width: 3, cap: 'round' }),
        node(x1, y),
        node(x2, y),
        text(x2 + r + 20, y + 5, label, { size: 18, anchor: 'start' }),
      ];
    };

    // The original viewBox started at y = 30; shift everything up instead.
    return svg(
      { width: 400, height: 230, label: 'Two neurons connected by a synapse: no spike for heads, one spike for tails.' },
      defs,
      translate(0, -30, scenario(75, false, 'heads'), scenario(215, true, 'tails')),
    );
  },
});
