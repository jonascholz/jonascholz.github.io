import { defineDiagram } from './lib/define';
import { panel, type Point } from './lib/plot';
import { axis, grid, ink, line, svg, text } from './lib/svg';
import { color } from '../lib/palette';

/** Gradient magnitude over depth when every layer scales it by 0.8 (vanishing) or 1.25 (exploding). */
export default defineDiagram({
  render({ id }) {
    const p = panel({ id, x: 80, y: 40, width: 470, height: 300, xDomain: [0, 10], yDomain: [0, 11] });
    const vanishing = color('blue');
    const exploding = color('red');
    const yTicks = [0, 2, 4, 6, 8, 10];
    const curve = (factor: number): Point[] => Array.from({ length: 11 }, (_, l) => [l, factor ** l]);
    const bold = { size: 16, weight: 'bold' as const, color: axis };
    const legendText = { size: 14, weight: 'bold' as const, anchor: 'start' as const, baseline: 'middle' as const };
    const right = p.x + p.width;

    return svg(
      {
        width: 700,
        height: 400,
        label: 'Gradient magnitude over 10 layers: shrinking towards zero when vanishing, growing exponentially when exploding.',
      },
      yTicks.map((t) => line(p.x, p.sy(t), right, p.sy(t), { color: grid, width: 1, dash: '4,4' })),
      p.axes({ xTicks: [0, 2, 4, 6, 8, 10], yTicks }),
      text(p.x + p.width / 2, 390, 'Number of Layers', { ...bold, baseline: 'middle' }),
      text(20, p.y + p.height / 2, 'Gradient Magnitude', { ...bold, baseline: 'middle', rotate: -90 }),

      p.line(curve(0.8), { color: vanishing, width: 3 }),
      p.line(curve(1.25), { color: exploding, width: 3 }),

      // Reference line at the initial magnitude.
      line(p.x, p.sy(1), right, p.sy(1), { color: ink, width: 1.5, dash: '8,4' }),
      text(right + 10, p.sy(1), 'Initial', { size: 11, italic: true, anchor: 'start', baseline: 'middle' }),

      line(right + 20, 100, right + 50, 100, { color: vanishing, width: 3 }),
      text(right + 60, 100, 'Vanishing', { ...legendText, color: vanishing }),
      line(right + 20, 130, right + 50, 130, { color: exploding, width: 3 }),
      text(right + 60, 130, 'Exploding', { ...legendText, color: exploding }),
    );
  },
});
