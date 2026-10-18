/**
 * The vector view of a LIF layer shared by the BPTT figures: three inputs
 * X[t] fully connected through Wᵢₙ to three neurons U[t] with spike outputs S[t].
 */
import { circle, line, nodeFill, text, type Child } from './svg';
import { varColor } from '../../lib/palette';

export const inputX = 100;
export const neuronX = 350;
export const neuronR = 40;
export const startY = 100;
export const spacing = 120;
/** End of the output arrows. */
export const outputEndX = 550;
export const neuronYs = [0, 1, 2].map((i) => startY + i * spacing);

const subs = ['₀', '₁', '₂'];
const label = { mono: true, weight: 'bold' as const };

/**
 * Inputs, input weights, neurons and outputs. `behind` is drawn after the
 * input weights but before the neurons, e.g. recurrent connections.
 * `arrows` maps 'Win' and 'S' to marker ids from `arrowDefs()`.
 */
export function lifLayer(arrows: { Win: string; S: string }, behind?: Child): Child {
  const c = { X: varColor('X'), Win: varColor('Win'), U: varColor('U'), S: varColor('S') };
  const fromX = inputX - 10;
  const toX = neuronX - neuronR - 5;

  return [
    neuronYs.map((y, i) => text(inputX - 35, y + 5, `X${subs[i]}[t]`, { ...label, size: 14, color: c.X })),
    text(inputX - 35, startY - 30, 'X[t]', { ...label, size: 18, color: c.X }),

    neuronYs.map((from) =>
      neuronYs.map((to) => line(fromX, from, toX, to, { color: c.Win, width: 2.5, arrow: arrows.Win })),
    ),
    text((fromX + toX) / 2, startY - 35, 'Wᵢₙ', { ...label, size: 20, color: c.Win }),

    behind,

    neuronYs.map((y, i) => [
      circle(neuronX, y, neuronR, { fill: nodeFill, width: 2.5 }),
      text(neuronX, y + 5, `U${subs[i]}[t]`, { ...label, size: 16, color: c.U }),
    ]),
    text(neuronX, startY - 50, 'U[t]', { ...label, size: 18, color: c.U }),

    neuronYs.map((y, i) => [
      line(neuronX + neuronR + 5, y, outputEndX, y, { color: c.S, arrow: arrows.S }),
      text(outputEndX + 30, y + 5, `S${subs[i]}[t]`, { ...label, size: 14, color: c.S }),
    ]),
    text(outputEndX + 30, startY - 50, 'S[t]', { ...label, size: 18, color: c.S }),
  ];
}
