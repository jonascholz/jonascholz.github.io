import { defineDiagram } from './lib/define';
import { legend, panel } from './lib/plot';
import { line, svg, text } from './lib/svg';
import { color } from '../lib/palette';

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

/** Heaviside vs. sigmoid (left) and their derivatives, Dirac delta vs. smooth surrogate (right). */
export default defineDiagram({
  render({ id }) {
    const heaviside = color('orange');
    const sig = color('blue');
    const dashed = { color: sig, dash: '5,5' };
    // The y domain starts at -0.1 so the vertical axis pokes below the x axis.
    const opts = { y: 40, width: 335, height: 174.5, xDomain: [-5, 5] as [number, number], yDomain: [-0.1, 1.1] as [number, number] };
    const left = panel({ id: `${id}-fn`, x: 50, ...opts });
    const right = panel({ id: `${id}-grad`, x: 425, ...opts });
    const axes = { mode: 'origin' as const, xTicks: [], yTicks: [] };

    return svg(
      {
        width: 800,
        height: 250,
        label:
          'Left: the Heaviside step function and its smooth sigmoid approximation. Right: their derivatives, a spike at zero for the Heaviside and a smooth bump for the sigmoid.',
      },
      left.axes(axes),
      left.line([[-5, 0], [0, 0], [0, 1], [5, 1]], { color: heaviside }),
      left.fn(sigmoid, dashed),
      text(left.x + left.width / 2, 25, 'Functions', { size: 16 }),

      right.axes(axes),
      // Dirac delta, drawn as a unit spike at zero.
      line(right.sx(0), right.sy(0), right.sx(0), right.sy(1), { color: heaviside, width: 2.5 }),
      right.fn((x) => sigmoid(x) * (1 - sigmoid(x)), dashed),
      text(right.x + right.width / 2, 25, 'Derivatives', { size: 16 }),

      legend(610, 60, [
        { label: 'Heaviside (Θ)', color: heaviside },
        { label: 'Sigmoid (σ)', color: sig, dash: '5,5' },
      ]),
    );
  },
});
