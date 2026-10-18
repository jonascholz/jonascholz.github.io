import { defineDiagram } from './lib/define';
import { arrowDefs, circle, group, ink, line, paper, path, rect, svg, text, type TextOpts } from './lib/svg';
import { color, varColor } from '../lib/palette';

/** Theme-aware stand-in for the old lightened node fills. */
const tint = (c: string, pct = 65) => `color-mix(in srgb, ${c} ${pct}%, ${paper})`;
/** Labels on tinted nodes stay white in both themes. */
const onFill = 'white';

/** A perceptron in He et al.'s notation: weighted inputs plus bias, summed into y, then ReLU to the output a. */
export default defineDiagram({
  render({ id }) {
    const c = { x: varColor('x'), w: varColor('w'), b: varColor('b'), y: varColor('y'), act: color('ForestGreen') };
    const { defs, ids } = arrowDefs(id, { w: c.w, b: c.b, y: c.y });

    const inputX = 100;
    const neuronX = 320;
    const neuronY = 160;
    const reluX = 480;
    const outputX = 620;
    const [x1Y, dotsY, xlY] = [70, 130, 190];
    const biasY = 270;
    const nodeR = 28;
    const neuronR = 40;
    const reluW = 80;
    const reluH = 65;

    const label = (x: number, y: number, s: string, o: TextOpts) =>
      text(x, y, s, { size: 18, weight: 'bold', baseline: 'middle', ...o });
    const node = (x: number, y: number, fill: string, s: string, italic = true) => [
      circle(x, y, nodeR, { fill: tint(fill), color: fill }),
      label(x, y, s, { size: 20, italic, color: onFill }),
    ];

    // Input and bias arrows all end just left of the neuron.
    const startX = inputX + nodeR + 5;
    const endX = neuronX - neuronR - 8;
    const midX = (startX + endX) / 2;
    const weight = (y: number, s: string) => {
      const endY = neuronY + (y - neuronY) * 0.2;
      return [
        path(`M ${startX} ${y} L ${endX} ${endY}`, { color: c.w, width: 2.5, arrow: ids.w }),
        label(midX, (y + endY) / 2 - 12, s, { size: 16, italic: true, color: c.w }),
      ];
    };

    // ReLU sketch inside the activation box.
    const base = neuronY + 8;
    const relu = `M ${reluX - 27.5} ${base} L ${reluX} ${base} L ${reluX + 27.5} ${base - 18}`;
    const faint = { color: onFill, width: 1, opacity: 0.5 };

    return svg(
      {
        width: 700,
        height: 320,
        label: 'A perceptron: inputs x₁ to xₗ weighted by w₁ to wₗ and a bias b are summed into y, which passes through a ReLU to give the output a.',
      },
      defs,
      group(
        { style: 'font-family:var(--font-serif)' },
        node(inputX, x1Y, c.x, 'x₁'),
        label(inputX, dotsY, '⋮', { size: 28, weight: 400, color: c.x }),
        node(inputX, xlY, c.x, 'xₗ'),
        node(inputX, biasY, c.b, '1', false),

        circle(neuronX, neuronY, neuronR, { fill: tint(c.y, 12), color: tint(c.y, 50) }),
        label(neuronX, neuronY, 'Σ', { size: 28, color: ink }),

        rect(reluX - reluW / 2, neuronY - reluH / 2, reluW, reluH, { rx: 8, fill: tint(c.act), color: c.act }),
        path(relu, { color: onFill, width: 3 }),
        line(reluX - 30, base, reluX + 30, base, faint),
        line(reluX, neuronY - 22, reluX, neuronY + 25, faint),

        node(outputX, neuronY, c.act, 'a'),

        weight(x1Y, 'w₁'),
        weight(xlY, 'wₗ'),
        path(`M ${startX} ${biasY} Q ${midX} ${biasY - 30} ${endX} ${neuronY + 25}`, { color: c.b, width: 2.5, arrow: ids.b }),
        label(midX, biasY - 50, 'b', { size: 16, italic: true, color: c.b }),

        line(neuronX + neuronR + 5, neuronY, reluX - reluW / 2 - 8, neuronY, { color: c.y, width: 2.5, arrow: ids.y }),
        label((neuronX + neuronR + 5 + reluX - reluW / 2 - 8) / 2, neuronY - 18, 'y', { size: 16, italic: true, color: c.y }),
        line(reluX + reluW / 2 + 5, neuronY, outputX - nodeR - 8, neuronY, { color: c.act, width: 2.5 }),
      ),
    );
  },
});
