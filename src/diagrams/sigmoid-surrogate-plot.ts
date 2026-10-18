import { defineDiagram } from './lib/define';
import { panel } from './lib/plot';
import { axis, grid, line, svg, text } from './lib/svg';
import { color } from '../lib/palette';

const sigmoid = (x: number, k: number) => 1 / (1 + Math.exp(-k * x));

/** The sigmoid σ(kx) and its derivative, whose peak k/4 grows without bound as k increases. */
export default defineDiagram({
  params: { k: 1 },
  render({ id, params: { k } }) {
    const peak = k / 4;
    const yMax = Math.max(0.5, peak * 1.3);
    const frame = { y: 40, width: 280, height: 180, xDomain: [-6, 6] as [number, number] };
    const left = panel({ id: `${id}-sig`, x: 45, ...frame, yDomain: [-0.1, 1.3] });
    const right = panel({ id: `${id}-der`, x: 395, ...frame, yDomain: [-yMax / 13, yMax] });
    const title = (p: typeof left, s: string) => text(p.x + p.width / 2, 22, s, { size: 16 });
    const xTicks = [-4, -2, 2, 4];
    // Zero label below left of the origin, clear of the curves.
    const zero = (p: typeof left) => text(p.sx(0) - 9, p.sy(0) + 21, '0', { size: 13, color: axis, anchor: 'end' });

    return svg(
      { width: 700, height: 260, label: `Left: the sigmoid σ(kx) for k = ${k}. Right: its derivative, peaking at k/4 = ${peak.toFixed(2)}.` },
      line(left.sx(-6), left.sy(1), left.sx(6), left.sy(1), { color: grid, width: 1.5, dash: '4 4' }),
      left.axes({ mode: 'origin', xTicks, yTicks: [0.5, 1], yFormat: (v) => (v === 0.5 ? '.5' : '1'), xLabel: 'x', fontSize: 13 }),
      left.fn((x) => sigmoid(x, k), { color: color('orange') }),
      zero(left),
      title(left, 'σ(kx)'),
      right.axes({ mode: 'origin', xTicks, yTicks: [peak], yFormat: (v) => v.toFixed(2), xLabel: 'x', fontSize: 13 }),
      right.fn((x) => k * sigmoid(x, k) * (1 - sigmoid(x, k)), { color: color('blue'), samples: 400 }),
      zero(right),
      title(right, "σ'(kx)"),
    );
  },
});
