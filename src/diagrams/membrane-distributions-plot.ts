import { defineDiagram } from './lib/define';
import { linspace, panel, type Point } from './lib/plot';
import { axis, line, svg, text } from './lib/svg';
import { varColor } from '../lib/palette';

const pdf = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

/** A standard normal membrane potential distribution; the area above θ is the spike probability. */
export default defineDiagram({
  render({ id }) {
    const theta = 1;
    const p = panel({ id, x: 50, y: 20, width: 430, height: 230, xDomain: [-3, 3], yDomain: [0, pdf(0) * 1.15] });
    const c = { U: varColor('U'), p: varColor('p'), theta: varColor('theta') };
    const tail: Point[] = linspace(theta, 3, 200).map((x) => [x, pdf(x)]);
    const tx = p.sx(theta);

    return svg(
      {
        width: 500,
        height: 300,
        label: 'A normal distribution of the membrane potential U with threshold θ = 1; the shaded area above θ is the spike probability P(U > θ).',
      },
      p.area(tail, { fill: c.p, opacity: 0.2 }),
      p.axes({ xTicks: [-2, -1, 0, 1, 2], yTicks: [], fontSize: 11 }),
      p.fn(pdf, { color: c.U }),
      line(tx, p.y, tx, p.y + p.height, { color: c.theta, width: 2, dash: '6,3' }),
      text(tx + 9, p.y + 15, 'θ', { color: c.theta, size: 15, weight: 'bold' }),
      text(p.sx(2.4), p.y + p.height - 29, 'P(U > θ)', { color: c.p, size: 12, weight: 'bold' }),
      text(p.x + p.width / 2, 296, 'Membrane Potential U', { color: axis, size: 12 }),
    );
  },
});
