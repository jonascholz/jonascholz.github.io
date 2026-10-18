import { defineDiagram } from './lib/define';
import { axis, grid, h, ink, muted, svg, type Attrs, type Child } from './lib/svg';
import { color, varColor } from '../lib/palette';

/** Rate coding (left) vs. latency coding (right): what the output is and where the gradient flows. */
export default defineDiagram({
  render({ id }) {
    const W = 720;
    const H = 300;
    const midX = W / 2;
    const C = { spike: varColor('S'), latency: color('blue'), deriv: color('red') };

    // Arrowheads sized in stroke-width units like the original markers
    const marker = (key: string, fill: string, reverse = false) =>
      h(
        'marker',
        { id: `${id}-${key}`, markerWidth: 9, markerHeight: 9, refX: reverse ? 1 : 8, refY: 3, orient: 'auto' },
        h('polygon', { points: reverse ? '9 0, 0 3, 9 6' : '0 0, 9 3, 0 6', fill }),
      );
    const url = (key: string) => `url(#${id}-${key})`;

    const seg = (x1: number, y1: number, x2: number, y2: number, stroke: string, width: number, extra: Attrs = {}) =>
      h('line', { x1, y1, x2, y2, stroke, 'stroke-width': width, ...extra });

    const txt = (x: number, y: number, s: Child, o: { size?: number; fill?: string; sans?: boolean; bold?: boolean; italic?: boolean; anchor?: string } = {}) =>
      h(
        'text',
        {
          x,
          y,
          fill: o.fill ?? ink,
          'font-size': o.size ?? 14,
          'text-anchor': o.anchor ?? 'middle',
          'dominant-baseline': 'middle',
          'font-weight': o.bold ? 'bold' : undefined,
          'font-style': o.italic ? 'italic' : undefined,
          style: o.sans ? undefined : 'font-family:var(--font-serif)',
        },
        s,
      );

    const axY = 100;
    const spikeH = 44;
    const lx1 = 28;
    const lx2 = midX - 28;
    const rx1 = midX + 28;
    const rx2 = W - 28;
    const lLen = lx2 - lx1;
    const rLen = rx2 - rx1;
    const rateSpikes = [0.07, 0.17, 0.28, 0.39, 0.51, 0.62, 0.74, 0.85, 0.93];

    // Averaging bracket over the spike train
    const bY = axY - spikeH - 10;
    const bx1 = lx1 + 0.03 * lLen;
    const bx2 = lx1 + 0.97 * lLen;

    const ssX = rx1 + 0.65 * rLen;
    const arrY = axY - spikeH / 2;

    // Mini spike trains with one gradient arrow per spike
    const mY = 236;
    const mH = 22;

    return svg(
      {
        width: W,
        height: H,
        label: 'Rate coding averages a spike train over time, so the loss gradient flows back through every spike; latency coding reads the delay of a single spike, so there is one gradient.',
      },
      h('defs', {}, marker('axis', axis), marker('fwd', C.latency), marker('rev', C.latency, true), marker('deriv', C.deriv)),
      seg(midX, 8, midX, H - 8, grid, 1.5),

      txt(midX / 2, 22, 'Rate Coding', { size: 15, bold: true, sans: true }),
      txt(midX * 1.5, 22, 'Latency Coding', { size: 15, bold: true, sans: true }),

      // Row 1: spike trains
      seg(lx1, axY, lx2 + 16, axY, axis, 2, { 'marker-end': url('axis') }),
      txt(lx2 + 24, axY, 't', { size: 13, fill: axis, italic: true, anchor: 'start' }),
      rateSpikes.map((p) => seg(lx1 + p * lLen, axY, lx1 + p * lLen, axY - spikeH, C.spike, 2)),
      seg(bx1, bY, bx2, bY, muted, 1.5),
      seg(bx1, bY, bx1, bY + 7, muted, 1.5),
      seg(bx2, bY, bx2, bY + 7, muted, 1.5),
      txt((bx1 + bx2) / 2, bY - 11, 'average over T', { size: 11, fill: muted, sans: true }),

      seg(rx1, axY, rx2 + 16, axY, axis, 2, { 'marker-end': url('axis') }),
      txt(rx2 + 24, axY, 't', { size: 13, fill: axis, italic: true, anchor: 'start' }),
      seg(ssX, axY, ssX, axY - spikeH, C.spike, 2.5),
      seg(rx1 + 4, arrY, ssX - 4, arrY, C.latency, 1.8, { 'marker-end': url('fwd'), 'marker-start': url('rev') }),
      txt((rx1 + ssX) / 2, arrY - 13, 'latency', { size: 12, fill: C.latency, sans: true, italic: true }),

      txt(midX / 2, 125, 'output = ⟨s(t)⟩'),
      txt(midX * 1.5, 125, 'output = delay(spike)'),
      seg(16, 142, W - 16, 142, grid, 1),

      // Row 2: formulas and derivatives
      txt(midX / 2, 163, '1/T · Σk s(tk)'),
      txt(midX * 1.5, 163, 'tspike − t₀'),
      txt(midX / 2, 184, 'differentiate w.r.t. each spike', { size: 11, fill: muted, sans: true }),
      txt(midX * 1.5, 184, 'differentiate w.r.t. one spike', { size: 11, fill: muted, sans: true }),

      seg(lx1, mY, lx2 + 10, mY, axis, 1.5),
      rateSpikes.map((p) => {
        const x = lx1 + p * lLen;
        return [seg(x, mY, x, mY - mH, C.spike, 1.5), seg(x, mY + 5, x, mY + 20, C.deriv, 1.5, { 'marker-end': url('deriv') })];
      }),
      txt(midX / 2, mY + 34, '∂L/∂s(tk) for each k', { size: 12, fill: C.deriv, sans: true }),

      seg(rx1, mY, rx2 + 10, mY, axis, 1.5),
      seg(rx1 + 0.65 * rLen, mY, rx1 + 0.65 * rLen, mY - mH, C.spike, 2),
      seg(rx1 + 0.65 * rLen, mY + 5, rx1 + 0.65 * rLen, mY + 20, C.deriv, 2, { 'marker-end': url('deriv') }),
      txt(midX * 1.5, mY + 34, '∂L/∂tspike', { size: 12, fill: C.deriv, sans: true }),
    );
  },
});
