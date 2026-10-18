import { defineDiagram } from './lib/define';
import { lifParams, padded, simulate, zeroLines } from './lib/lif-sim';
import { h, line, path, svg, type Child } from './lib/svg';
import { panel, type Point } from './lib/plot';
import { color, varColor } from '../lib/palette';

const STEPS = 45;

/** One LIF neuron over time: membrane potential with spikes (top) and the surrogate spike derivative dS/dx (bottom). */
export default defineDiagram({
  params: lifParams('surrogate', 'height', 'cutoff', 'x', 'theta', 'alpha', 'width', 'reset'),
  render({ id, params }) {
    const cutoff = Math.round(params.cutoff);
    const { u, dS, spikes } = simulate({ ...params, cutoff, steps: STEPS });
    const series = (ys: number[]): Point[] => ys.map((y, t) => [t, y]);
    const c = { U: varColor('U'), S: varColor('S'), theta: color('gray'), dS: color('blue'), cutoff: color('violet') };

    const frame = { x: 75, width: 600, height: 190, xDomain: [0, STEPS - 1] as [number, number] };
    const top = panel({ id: `${id}-u`, y: 15, ...frame, yDomain: padded(Math.min(0, ...u), Math.max(params.theta, ...u), 0.06) });
    const bot = panel({ id: `${id}-ds`, y: 235, ...frame, yDomain: padded(Math.min(0, ...dS), Math.max(0, ...dS), 0.06, 1) });

    // Spikes as x markers on the membrane trace.
    const cross = (t: number): Child => {
      const [cx, cy, r] = [top.sx(t), top.sy(u[t]), 5.5];
      return path(`M${cx - r},${cy - r}L${cx + r},${cy + r}M${cx - r},${cy + r}L${cx + r},${cy - r}`, { color: c.S, width: 3 });
    };
    const cutX = top.sx(cutoff);

    return svg(
      { width: 700, height: 480, label: 'Membrane potential with threshold and spikes over time, and the surrogate spike derivative over time.' },
      h('defs', {}, top.clipDef, bot.clipDef),
      top.axes({ grid: true, xFormat: () => '', yLabel: 'Membrane potential', fontSize: 13 }),
      zeroLines(top),
      top.clip(
        top.line([[0, params.theta], [STEPS - 1, params.theta]], { color: c.theta, width: 2, dash: '6 5' }),
        top.line(series(u), { color: c.U, width: 3 }),
      ),
      spikes.map(cross),
      bot.axes({ grid: true, xLabel: 'Timestep', yLabel: 'Spike derivative', fontSize: 13 }),
      zeroLines(bot),
      bot.clip(bot.line(series(dS), { color: c.dS, width: 3 })),
      line(cutX, top.y, cutX, bot.y + bot.height, { color: c.cutoff, width: 2, dash: '2 4' }),
    );
  },
});
