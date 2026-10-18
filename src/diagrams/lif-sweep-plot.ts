import { defineDiagram } from './lib/define';
import { lifParams, padded, simulate, sweepPlot } from './lib/lif-sim';
import { color, varColor } from '../lib/palette';

/** Average surrogate spike derivative over 50 timesteps, swept over the input x ∈ [−1, 1]. */
export default defineDiagram({
  params: lifParams('surrogate', 'height', 'x', 'theta', 'alpha', 'width', 'reset'),
  render({ id, params }) {
    const avgGrad = (x: number) => simulate({ ...params, x, steps: 50 }).avgGrad;
    return sweepPlot({
      id,
      label: 'Average surrogate spike derivative as a function of the constant input value.',
      f: avgGrad,
      yDomain: (ys) => padded(Math.min(...ys), Math.max(...ys)),
      yLabel: 'Average gradient',
      color: color('blue'),
      marker: { x: params.x, color: varColor('X') },
    });
  },
});
