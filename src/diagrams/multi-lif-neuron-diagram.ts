import { defineDiagram } from './lib/define';
import { lifLayer } from './lib/neuron-layers';
import { arrowDefs, svg } from './lib/svg';
import { varColor } from '../lib/palette';

/** Vector view: three inputs fully connected to three LIF neurons, each with its own spike output. */
export default defineDiagram({
  render({ id }) {
    const { defs, ids } = arrowDefs(id, { Win: varColor('Win'), S: varColor('S') });
    return svg(
      {
        width: 700,
        height: 400,
        label: 'Three inputs X[t] fully connected through the input weights Wᵢₙ to three LIF neurons U[t], each emitting spikes S[t].',
      },
      defs,
      lifLayer(ids),
    );
  },
});
