import { defineDiagram } from './lib/define';
import { axis, h, ink, line, nodeFill, svg, text, type TextOpts } from './lib/svg';
import { color, varColor } from '../lib/palette';

/** A rounded box with a translucent tint of `c` and a solid border. */
const box = (x: number, y: number, w: number, hgt: number, c: string, sw: number, rx: number, tint = 0.08) => [
  h('rect', { x, y, width: w, height: hgt, rx, fill: c, opacity: tint }),
  h('rect', { x, y, width: w, height: hgt, rx, fill: 'none', stroke: c, 'stroke-width': sw }),
];

const mono: TextOpts = { mono: true, size: 14 };

/** LIF architecture: parameters and state held by the neuron, and a pure step function that updates them. */
export default defineDiagram({
  render() {
    const blue = color('blue');
    const green = color('green');
    const orange = color('orange');

    // Main LIF container
    const lif = { x: 50, y: 50, w: 300, h: 300 };
    const param = { x: lif.x + 20, y: lif.y + 50, w: lif.w - 40, h: 100 };
    const state = { x: param.x, y: param.y + param.h + 20, w: param.w, h: 100 };
    const step = { x: lif.x + lif.w + 80, y: lif.y + 80, w: 280, h: 200 };

    const params = [
      { label: 'α (decay)', color: varColor('alpha') },
      { label: 'W (weight)', color: varColor('Win') },
      { label: 'θ (threshold)', color: varColor('theta') },
    ];
    const states = [
      { label: 'u[t] (membrane potential)', color: varColor('U') },
      { label: 's[t] (spike output)', color: varColor('S') },
    ];
    const code = [
      'decay = α · u[t-1]',
      'weighted = inputs @ W',
      'reset = s[t-1] · θ',
      'u = decay + weighted - reset',
      's = Θ(u - θ)',
      '',
      'return LIFState(u, s)',
    ];

    // Forward ("uses") and return ("updates") arrows between the LIF box and the step function
    const x0 = lif.x + lif.w;
    const x1 = step.x;
    const ay = lif.y + lif.h / 2;
    const ry = ay + 40;
    const arrow = { color: axis, width: 2 };
    const note: TextOpts = { ...mono, size: 12, color: axis, italic: true };

    return svg(
      {
        width: 800,
        height: 400,
        label: 'LIF neuron architecture: a box holding parameters (α, W, θ) and state (u, s), and a separate step function that uses them and returns the updated state.',
      },
      h('rect', { x: lif.x, y: lif.y, width: lif.w, height: lif.h, rx: 8, fill: nodeFill, stroke: ink, 'stroke-width': 3 }),
      text(lif.x + lif.w / 2, lif.y + 25, 'LIF Neuron', { ...mono, size: 18, weight: 'bold' }),

      box(param.x, param.y, param.w, param.h, blue, 2, 5),
      text(param.x + param.w / 2, param.y + 20, 'Parameters', { ...mono, weight: 'bold', color: blue }),
      params.map((p, i) => text(param.x + 20, param.y + 45 + i * 20, p.label, { ...mono, size: 13, anchor: 'start', color: p.color })),

      box(state.x, state.y, state.w, state.h, green, 2, 5),
      text(state.x + state.w / 2, state.y + 20, 'State', { ...mono, weight: 'bold', color: green }),
      states.map((s, i) => text(state.x + 20, state.y + 45 + i * 20, s.label, { ...mono, size: 13, anchor: 'start', color: s.color })),

      box(step.x, step.y, step.w, step.h, orange, 3, 8),
      text(step.x + step.w / 2, step.y + 25, 'Step Function', { ...mono, size: 16, weight: 'bold', color: orange }),
      text(step.x + 20, step.y + 60, 'def lif_step(params, state, inputs):', { ...mono, size: 11, anchor: 'start' }),
      code.map((c, i) => text(step.x + 40, step.y + 85 + i * 16, c, { ...mono, size: 11, anchor: 'start' })),

      line(x0, ay, x1, ay, arrow),
      h('polygon', { points: `${x1},${ay} ${x1 - 10},${ay - 6} ${x1 - 10},${ay + 6}`, fill: axis }),
      text((x0 + x1) / 2, ay - 10, 'uses', note),

      line(x1, ry, x0, ry, arrow),
      h('polygon', { points: `${x0},${ry} ${x0 + 10},${ry - 6} ${x0 + 10},${ry + 6}`, fill: axis }),
      text((x0 + x1) / 2, ry + 15, 'updates', note),
    );
  },
});
