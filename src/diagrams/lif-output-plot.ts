import { defineDiagram } from './lib/define';
import { lifDefaults, lifParams, simulate, sweepPlot } from './lib/lif-sim';
import { varColor } from '../lib/palette';

/** Firing rate (spikes / 50 timesteps) swept over the input x ∈ [−1, 1]. The surrogate does not affect the forward pass. */
export default defineDiagram({
  params: lifParams('x', 'theta', 'alpha'),
  render({ id, params }) {
    const rate = (x: number) => simulate({ ...lifDefaults, ...params, x, steps: 50 }).rate;
    return sweepPlot({
      id,
      label: 'Average firing rate of the LIF neuron as a function of the constant input value.',
      f: rate,
      yDomain: (ys) => {
        const max = Math.max(...ys);
        return [0, max + (max * 0.1 || 0.05)];
      },
      yLabel: 'Firing rate',
      color: varColor('S'),
      marker: { x: params.x, color: varColor('X') },
    });
  },
});
