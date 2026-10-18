import { defineDiagram } from './lib/define';
import { lifLayer, neuronR, neuronX, neuronYs, spacing, startY } from './lib/neuron-layers';
import { arrowDefs, line, path, svg, text, type Child } from './lib/svg';
import { varColor } from '../lib/palette';

/** The vector view of a LIF layer with recurrent weights between all pairs of neurons. */
export default defineDiagram({
  render({ id }) {
    const rec = varColor('Wrec');
    const { defs, ids } = arrowDefs(id, { Win: varColor('Win'), S: varColor('S'), Wrec: rec });
    const o = { color: rec, arrow: ids.Wrec };

    // Every neuron connects to every other neuron (no self connections).
    const links: Child[] = [];
    neuronYs.forEach((from, i) =>
      neuronYs.forEach((to, j) => {
        if (i === j) return;
        if (Math.abs(i - j) === 1) {
          // Neighbors: straight vertical arrows, downward on the right, upward on the left.
          const down = i < j;
          const x = neuronX + (down ? 8 : -8);
          const s = down ? 1 : -1;
          links.push(line(x, from + s * neuronR, x, to - s * (neuronR + 3), o));
        } else {
          // Outer pair: curves around the right side, the two directions bulging differently.
          const dy = to - from;
          const f = i < j ? -0.1 : 0.1;
          const y0 = from + neuronR * Math.sin(Math.atan2(dy, Math.abs(dy)) * f);
          const y1 = to + neuronR * Math.sin(Math.atan2(-dy, Math.abs(dy)) * f);
          const cx = neuronX + neuronR + (i < j ? 160 : 100);
          links.push(path(`M ${neuronX + neuronR} ${y0} Q ${cx} ${(y0 + y1) / 2} ${neuronX + neuronR} ${y1}`, o));
        }
      }),
    );

    return svg(
      {
        width: 700,
        height: 450,
        label:
          'Three inputs X[t] connected through Wᵢₙ to three LIF neurons U[t] with spike outputs S[t]; recurrent weights Wᵣₑ꜀ connect every neuron to every other neuron.',
      },
      defs,
      lifLayer(
        ids,
        [links, text(neuronX + neuronR + 60, startY + spacing * 0.2, 'Wᵣₑ꜀', { size: 18, weight: 'bold', mono: true, color: rec })],
      ),
    );
  },
});
