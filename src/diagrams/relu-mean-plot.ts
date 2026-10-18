import { defineDiagram } from './lib/define';
import { panel } from './lib/plot';
import { axis, grid, line, svg, text } from './lib/svg';
import { color } from '../lib/palette';

/** ReLU on inputs between -1 and 1. */
export default defineDiagram({
  render({ id }) {
    const p = panel({ id, x: 80, y: 40, width: 470, height: 300, xDomain: [-1, 1], yDomain: [0, 1] });
    const xTicks = [-1, -0.5, 0, 0.5, 1];
    const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1];
    const dashed = { color: grid, width: 1, dash: '4,4' };
    const bold = { size: 16, weight: 'bold' as const, color: axis, baseline: 'middle' as const };
    const fixed = (v: number) => (v < 0 ? `−${(-v).toFixed(1)}` : v.toFixed(1));

    return svg(
      { width: 700, height: 400, label: 'The ReLU function for inputs from −1 to 1: zero for negative inputs, the identity for positive ones.' },
      yTicks.map((t) => line(p.x, p.sy(t), p.x + p.width, p.sy(t), dashed)),
      xTicks.map((t) => line(p.sx(t), p.y, p.sx(t), p.y + p.height, dashed)),
      p.axes({ xTicks, yTicks, format: fixed }),
      text(p.x + p.width / 2, 390, 'Input Value', bold),
      text(20, p.y + p.height / 2, 'ReLU Output', { ...bold, rotate: -90 }),
      p.fn((x) => Math.max(0, x), { color: color('ForestGreen'), width: 3 }),
    );
  },
});
