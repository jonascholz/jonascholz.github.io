import { defineDiagram } from './lib/define';
import { lifParams, simulate, zeroLines } from './lib/lif-sim';
import { h, svg } from './lib/svg';
import { legend, linspace, panel, type Point } from './lib/plot';
import { color, varColor } from '../lib/palette';

// Fixed neuron for this figure (see the caption).
const ALPHA = 0.96;
const THETA = 0.5;
const WIDTH = 1;
const HEIGHT = 0.15;
const STEPS = 50;

/** Analytical LIF rate 1/T, where T solves x (1 − α^T) / (1 − α) = θ. */
function analyticRate(x: number) {
  if (x <= 0 || x / (1 - ALPHA) <= THETA) return 0;
  const ratio = 1 - (THETA * (1 - ALPHA)) / x;
  return ratio <= 0 ? 0 : Math.log(ALPHA) / Math.log(ratio);
}

/** ReLU derivative of the analytical rate: 0 below threshold, 1 above. */
const analyticDeriv = (x: number) => (x / (1 - ALPHA) <= THETA ? 0 : 1);

/** Spiking LIF rate and average surrogate gradient against the analytical LIF transfer function and its derivative. */
export default defineDiagram({
  params: lifParams('surrogate'),
  render({ id, params }) {
    const xs = linspace(-0.2, 1, 500);
    const sims = xs.map((x) =>
      simulate({ x, theta: THETA, alpha: ALPHA, width: WIDTH, height: HEIGHT, surrogate: params.surrogate, reset: true, steps: STEPS }),
    );
    const pts = (f: (i: number) => number): Point[] => xs.map((x, i) => [x, f(i)]);
    const rate = pts((i) => sims[i].rate);
    const grad = pts((i) => sims[i].avgGrad);
    const maxRate = Math.max(...xs.map(analyticRate));
    const gradMax = Math.max(1, ...grad.map((p) => p[1]));
    const gradMin = Math.min(0, ...grad.map((p) => p[1]));

    const frame = { y: 15, width: 255, height: 245, xDomain: [-0.2, 1] as [number, number] };
    const left = panel({ id: `${id}-rate`, x: 75, ...frame, yDomain: [-0.05 * maxRate, 1.05 * maxRate] });
    const right = panel({ id: `${id}-grad`, x: 420, ...frame, yDomain: [gradMin - 0.05 * gradMax, 1.08 * gradMax] });
    const c = { rate: varColor('S'), grad: color('blue') };
    const xTicks = [0, 0.5, 1];

    return svg(
      { width: 700, height: 375, label: 'Spiking firing rate versus the analytical LIF transfer function, and the average surrogate gradient versus its derivative.' },
      h('defs', {}, left.clipDef, right.clipDef),
      left.axes({ grid: true, xTicks, xLabel: 'Input value', yLabel: 'Firing rate', fontSize: 13 }),
      zeroLines(left),
      left.clip(
        left.fn(analyticRate, { color: c.rate, width: 2, dash: '7 5', samples: 500 }),
        left.line(rate, { color: c.rate, width: 3 }),
      ),
      legend(left.x + 20, 335, [
        { label: 'Spike rate', color: c.rate },
        { label: 'ReLU', color: c.rate, dash: '7 5' },
      ], 13),
      right.axes({ grid: true, xTicks, xLabel: 'Input value', yLabel: 'Derivative', fontSize: 13 }),
      zeroLines(right),
      right.clip(
        right.fn(analyticDeriv, { color: c.grad, width: 2, dash: '7 5', samples: 500 }),
        right.line(grad, { color: c.grad, width: 3 }),
      ),
      legend(right.x + 20, 335, [
        { label: 'Surrogate gradient', color: c.grad },
        { label: 'ReLU derivative', color: c.grad, dash: '7 5' },
      ], 13),
    );
  },
});
