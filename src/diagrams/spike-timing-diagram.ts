import { defineDiagram } from './lib/define';
import { axis, circle, group, h, ink, line, muted, svg, text } from './lib/svg';
import { varColor } from '../lib/palette';

/**
 * Latency coding: a neuron encodes the value 78 by firing once at t = 78.
 * A dashed cursor sweeps the time axis in a loop (SMIL, no JavaScript) and the
 * spike appears once the cursor passes it. Without animation support the
 * figure shows the final frame.
 */
export default defineDiagram({
  render() {
    const m = { left: 50, right: 30, top: 20, bottom: 35 };
    const width = 500;
    const height = 120;
    const plotW = width - m.left - m.right;
    const base = m.top + height - m.top - m.bottom;
    const tMax = 100;
    const spikeT = 78;
    const tx = (t: number) => m.left + (t / tMax) * plotW;

    // Sweep 2.6 s, hold 0.8 s, repeat
    const sweep = 2.6;
    const total = sweep + 0.8;
    const dur = `${total}s`;
    const k = (s: number) => Math.round((s / total) * 1e4) / 1e4;

    const S = varColor('S');
    const sx = tx(spikeT);
    const top = m.top + 4;

    return svg(
      { width, height, label: 'A time axis from 0 to 100 with a single spike at t = 78, encoding the value 78.' },
      line(m.left, base, m.left + plotW, base, { color: ink, width: 2 }),
      h('polygon', { points: `${m.left + plotW + 8},${base} ${m.left + plotW},${base - 4} ${m.left + plotW},${base + 4}`, fill: ink }),
      h('text', { x: m.left + plotW + 14, y: base + 4, fill: ink, 'font-size': 14, 'font-style': 'italic', 'dominant-baseline': 'middle', style: 'font-family:var(--font-serif)' }, 't'),
      [0, 25, 50, 75, 100].map((t) => [
        line(tx(t), base, tx(t), base + 5, { color: ink, width: 1 }),
        text(tx(t), base + 16, t, { size: 11, color: axis }),
      ]),
      group(
        {},
        line(sx, base, sx, top, { color: S, width: 2.5, cap: 'round' }),
        circle(sx, top, 3, { fill: S, width: 0 }),
        text(sx, base + 28, 'value = 78', { size: 11, color: S }),
        h('animate', { attributeName: 'opacity', values: '0;1', keyTimes: `0;${k((spikeT / tMax) * sweep)}`, calcMode: 'discrete', dur, repeatCount: 'indefinite' }),
      ),
      group(
        { transform: `translate(${sx - m.left},0)` },
        line(m.left, m.top, m.left, base, { color: muted, width: 1.5, dash: '4 3' }),
        h('animateTransform', { attributeName: 'transform', type: 'translate', values: `0 0;${plotW} 0;${plotW} 0`, keyTimes: `0;${k(sweep)};1`, dur, repeatCount: 'indefinite' }),
      ),
    );
  },
});
