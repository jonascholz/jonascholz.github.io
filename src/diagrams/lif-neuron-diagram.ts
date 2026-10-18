import { defineDiagram } from './lib/define';
import { arrowDefs, circle, line, nodeFill, path, svg, text } from './lib/svg';
import { varColor } from '../lib/palette';

interface Labels {
  input?: string;
  weight?: string;
  state?: string;
  output?: string;
  prevState?: string;
  decay?: string;
}

/** A single LIF neuron: weighted input, membrane state with decay loop, spike output. */
export default defineDiagram<Labels>({
  render({ id, props }) {
    const l = {
      input: 'x[t]',
      weight: 'w',
      state: 'u[t]',
      output: 's[t]',
      prevState: 'u[t-1]',
      decay: 'α',
      ...props,
    };
    const c = { X: varColor('X'), S: varColor('S'), alpha: varColor('alpha'), U: varColor('U'), W: varColor('Win') };
    const { defs, ids } = arrowDefs(id, { X: c.X, S: c.S, alpha: c.alpha });

    const cx = 350;
    const cy = 140;
    const r = 55;
    const len = 90;
    const label = { size: 20, weight: 'bold' as const, mono: true };

    // Decay loop: from the bottom right of the neuron around and back in at the bottom left.
    const a0 = (70 * Math.PI) / 180;
    const a1 = (110 * Math.PI) / 180;
    const loopY = cy + 85;
    const loop = `M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} Q ${cx + 50} ${loopY} ${cx} ${loopY} Q ${cx - 50} ${loopY} ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`;

    const inStart = cx - r - len;
    const outEnd = cx + r + len;

    return svg(
      { width: 700, height: 280, label: 'A LIF neuron with weighted input, a decaying membrane potential and a spike output.' },
      defs,
      line(inStart, cy, cx - r - 5, cy, { color: c.X, width: 2.5, arrow: ids.X }),
      text(inStart - 25, cy + 5, l.input, { ...label, color: c.X }),
      text(inStart + len / 2, cy - 18, l.weight, { ...label, size: 18, color: c.W }),
      circle(cx, cy, r, { fill: nodeFill, width: 2.5 }),
      text(cx, cy + 6, l.state, { ...label, color: c.U }),
      line(cx + r + 5, cy, outEnd, cy, { color: c.S, width: 2.5, arrow: ids.S }),
      text(outEnd + 30, cy + 5, l.output, { ...label, color: c.S }),
      path(loop, { color: c.alpha, width: 2.5, arrow: ids.alpha }),
      text(cx, loopY + 15, l.prevState, { ...label, size: 16, color: c.U }),
      text(cx - 50, loopY - 8, l.decay, { ...label, size: 18, color: c.alpha }),
    );
  },
});
