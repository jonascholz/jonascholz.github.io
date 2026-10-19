import { defineDiagram } from './lib/define';
import { legend, panel } from './lib/plot';
import { circle, h, sub, svg, text } from './lib/svg';
import { color, varColor } from '../lib/palette';

/**
 * Training compute of a WAM relative to a VLA with the same size and context,
 * (n_c + n_f + n_a) / (n_c + n_a), as a function of the future frame tokens n_f.
 */
export default defineDiagram({
  params: { ctx: 800, fut: 588, act: 50 },
  render({ id, params }) {
    const { ctx, fut, act } = params;
    const ratio = (nf: number) => (ctx + nf + act) / (ctx + act);
    const xMax = 6000;
    const yMax = Math.max(2, Math.ceil(ratio(xMax)));
    const p = panel({ id, x: 80, y: 15, width: 595, height: 250, xDomain: [0, xMax], yDomain: [0, yMax] });
    const wam = varColor('nf');
    const vla = color('teal');
    const nearAxis = p.sx(fut) < p.x + 70;

    return svg(
      {
        width: 700,
        height: 325,
        label: `Training compute of a WAM relative to a VLA, growing linearly with the number of future frame tokens. At ${fut} future frame tokens it is ${ratio(fut).toFixed(1)} times the VLA.`,
      },
      h('defs', {}, p.clipDef),
      p.axes({ grid: true, xLabel: ['future frame tokens ', sub('n', 'f')], yLabel: 'training compute (VLA = 1)', fontSize: 13 }),
      p.clip(p.fn(() => 1, { color: vla, width: 2.5, dash: '6 5' }), p.fn(ratio, { color: wam, width: 3, samples: 2 })),
      circle(p.sx(fut), p.sy(ratio(fut)), 7, { color: wam, fill: wam }),
      // Label above-left of the marker, or above-right when it sits near the y-axis.
      text(p.sx(fut) + (nearAxis ? 14 : -12), p.sy(ratio(fut)) - 12, `${ratio(fut).toFixed(1)}×`, {
        anchor: nearAxis ? 'start' : 'end',
        size: 14,
        weight: 600,
        mono: true,
      }),
      legend(p.x + 16, p.y + 16, [
        { label: 'WAM', color: wam },
        { label: 'VLA', color: vla, dash: '6 5' },
      ]),
    );
  },
});
