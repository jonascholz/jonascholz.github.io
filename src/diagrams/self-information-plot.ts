import { defineDiagram } from './lib/define';
import { linspace, panel } from './lib/plot';
import { grid, h, line, svg, text } from './lib/svg';
import { color } from '../lib/palette';

/** Self-information I(x) = -log2 p(x) as a function of the probability p(x). */
export default defineDiagram({
  render({ id }) {
    const info = color('teal');
    const prob = color('purple');
    const p = panel({ id, x: 60, y: 40, width: 500, height: 200, xDomain: [0, 1], yDomain: [0, 10] });
    const yTicks = linspace(0, 10, 6);
    const span = (c: string, s: string) => h('tspan', { fill: c }, s);

    return svg(
      { width: 600, height: 300, label: 'Self-information in bits falls from about 6.6 at probability 0.01 to 0 at probability 1.' },
      yTicks.map((t) => line(p.x, p.sy(t), p.x + p.width, p.sy(t), { color: grid, width: 1 })),
      p.axes({
        xTicks: [0, 0.25, 0.5, 0.75, 1],
        yTicks,
        xLabel: ['Probability ', span(prob, 'p(x)')],
        yLabel: ['Self-information ', span(info, 'I(x)'), ' [bits]'],
      }),
      p.fn((x) => -Math.log2(x), { from: 0.01, to: 1, color: info, width: 3 }),
      text(300, 25, 'Self-information vs Probability', { size: 16 }),
    );
  },
});
