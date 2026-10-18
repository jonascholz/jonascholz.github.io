import { defineDiagram } from './lib/define';
import { panel } from './lib/plot';
import { circle, h, svg } from './lib/svg';
import { color } from '../lib/palette';

/** The Heaviside step function Θ(x). */
export default defineDiagram({
  render({ id }) {
    const p = panel({ id, x: 60, y: 20, width: 500, height: 230, xDomain: [-3, 3], yDomain: [-0.2, 1.2] });
    const step = color('blue');
    return svg(
      { width: 600, height: 300, label: 'The Heaviside step function: 0 for negative inputs, 1 otherwise.' },
      p.axes({ mode: 'origin', xTicks: [-3, -2, -1, 1, 2, 3], yTicks: [1], xLabel: 'x', yLabel: 'Θ(x)' }),
      p.line([[-3, 0], [0, 0]], { color: step, width: 3 }),
      p.line([[0, 1], [3, 1]], { color: step, width: 3 }),
      circle(p.sx(0), p.sy(0), 4, { color: step }),
      circle(p.sx(0), p.sy(1), 4, { color: step, fill: step }),
      h('text', { x: p.sx(0) - 9, y: p.sy(0) + 16, 'text-anchor': 'end', 'font-size': 12, fill: 'var(--d-axis)' }, '0'),
    );
  },
});
