import { defineDiagram } from './lib/define';
import { axis, grid, ink, line, muted, rect, svg, text } from './lib/svg';
import { color } from '../lib/palette';

/**
 * Compute of a WAM relative to a VLA of the same size and context, from the
 * linear cost model in the post (attention ignored):
 *   training per sample:  L_c + L_f + L_a  vs  L_c + L_a
 *   inference per chunk:  L_c + K (L_f + L_a)  vs  L_c + K L_a
 */
export default defineDiagram({
  params: { ctx: 800, fut: 588, act: 50, steps: 10 },
  render({ params }) {
    const { ctx, fut, act, steps } = params;
    const groups = [
      {
        title: 'Training, per sample',
        bars: [
          { label: 'VLA', value: 1, color: color('teal') },
          { label: 'WAM', value: (ctx + fut + act) / (ctx + act), color: color('blue') },
        ],
      },
      {
        title: 'Inference, per action chunk',
        bars: [
          { label: 'VLA', value: 1, color: color('teal') },
          { label: 'WAM, joint', value: (ctx + steps * (fut + act)) / (ctx + steps * act), color: color('blue') },
          { label: 'WAM, action only', value: 1, color: muted },
        ],
      },
    ];

    const W = 720;
    const H = 300;
    const top = 40;
    const bottom = H - 56;
    const left = 64;
    const max = Math.max(2, ...groups.flatMap((g) => g.bars.map((b) => b.value))) * 1.15;
    const y = (v: number) => bottom - (v / max) * (bottom - top);
    const ticks = niceTicks(max);
    const barW = 74;
    const groupX = [left + 40, left + 310];

    return svg(
      {
        width: W,
        height: H,
        label: `Compute relative to a VLA with the same size and context. Training: WAM ${fmt(groups[0].bars[1].value)} times. Inference with joint video and action denoising: ${fmt(groups[1].bars[1].value)} times. Inference with action-only decoding: about the same as the VLA.`,
      },
      ticks.map((t) => [
        line(left, y(t), W - 16, y(t), { color: grid, width: 1 }),
        text(left - 8, y(t), `${t}×`, { anchor: 'end', size: 12, color: axis, baseline: 'middle' }),
      ]),
      line(left, bottom, W - 16, bottom, { color: axis, width: 1.5 }),
      text(18, (top + bottom) / 2, 'compute (VLA = 1)', { size: 12, color: axis, rotate: -90 }),
      groups.map((g, gi) => [
        text(groupX[gi] + (g.bars.length * (barW + 18) - 18) / 2, top - 18, g.title, { size: 14, weight: 600 }),
        g.bars.map((b, bi) => {
          const x = groupX[gi] + bi * (barW + 18);
          return [
            rect(x, y(b.value), barW, bottom - y(b.value), { fill: b.color, width: 0, rx: 3 }),
            text(x + barW / 2, y(b.value) - 7, `${fmt(b.value)}×`, { size: 13, weight: 600, mono: true }),
            text(x + barW / 2, bottom + 18, b.label, { size: 12, color: ink }),
          ];
        }),
      ]),
      text(left, H - 10, `L_c = ${ctx}, L_f = ${fut}, L_a = ${act}, K = ${steps}`, { anchor: 'start', size: 12, color: muted, mono: true }),
    );
  },
});

const fmt = (v: number) => (v >= 10 ? v.toFixed(0) : v.toFixed(1));

/** About four evenly spaced integer ticks from 0 up to `max`. */
function niceTicks(max: number) {
  const step = [1, 2, 5, 10, 20, 50].find((s) => max / s <= 5) ?? 100;
  const out: number[] = [];
  for (let t = 0; t <= max; t += step) out.push(t);
  return out;
}
