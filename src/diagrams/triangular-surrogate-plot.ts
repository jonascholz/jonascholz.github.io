import { defineDiagram } from './lib/define';
import { panel, type Point } from './lib/plot';
import { axis, h, svg, text } from './lib/svg';
import { lifParams } from './lib/lif-sim';
import { color } from '../lib/palette';

/** Surrogate half-width shown in this figure (fixed, independent of the width slider). */
const W = 0.5;

/** Forward pass Θ(x) next to the triangular or boxcar surrogate Θ̃'(x) used in the backward pass. */
export default defineDiagram({
  params: lifParams('surrogate', 'height'),
  render({ id, params }) {
    const peak = params.height;
    const box = params.surrogate === 'boxcar';
    const frame = { y: 40, width: 280, height: 170, xDomain: [-2, 2] as [number, number] };
    const fwd = panel({ id: `${id}-fwd`, x: 40, ...frame, yDomain: [-0.1, 1.2] });
    const bwd = panel({ id: `${id}-bwd`, x: 390, ...frame, yDomain: [-0.1, Math.max(1.2, peak * 1.2)] });

    const step: Point[] = [[-2, 0], [0, 0], [0, 1], [2, 1]];
    const sg: Point[] = box
      ? [[-2, 0], [-W, 0], [-W, peak], [W, peak], [W, 0], [2, 0]]
      : [[-2, 0], [-W, 0], [0, peak], [W, 0], [2, 0]];
    const widthTick = (v: number) => (v === W ? 'width' : '−width');
    const title = (p: typeof fwd, s: string) => text(p.x + p.width / 2, 22, s, { size: 16 });

    return svg(
      {
        width: 700,
        height: 250,
        label: `Left: the Heaviside step function. Right: the ${params.surrogate} surrogate gradient with peak ${peak} and width ${W}.`,
      },
      h('defs', {}, bwd.clipDef),
      fwd.axes({ mode: 'origin', xTicks: [], yTicks: [1], xLabel: 'x', fontSize: 13 }),
      text(fwd.sx(0) - 9, fwd.sy(0) + 21, '0', { size: 13, color: axis, anchor: 'end' }),
      fwd.line(step, { color: color('orange') }),
      title(fwd, 'Forward: Θ(x)'),
      bwd.axes({ mode: 'origin', xTicks: [-W, W], yTicks: box ? [] : [peak], xFormat: widthTick, yFormat: (v) => v.toFixed(1), xLabel: 'x', fontSize: 13 }),
      // The box covers the y axis, so its height is labeled at its left edge.
      box && text(bwd.sx(-W) - 8, bwd.sy(peak) + 4.5, peak.toFixed(1), { size: 13, color: axis, anchor: 'end' }),
      bwd.clip(bwd.line(sg, { color: color('blue') })),
      title(bwd, "Backward: Θ̃'(x)"),
    );
  },
});
