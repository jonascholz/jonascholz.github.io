import { defineDiagram } from './lib/define';
import { banana, feather } from './lib/objects';
import { axis, grid, group, h, ink, muted, rect, svg, text, translate } from './lib/svg';

/**
 * Next-frame prediction needs physics: a falling banana speeds up, a feather
 * drifts at a slow, steady pace. Three observed frames plus the predicted one.
 */
export default defineDiagram({
  render() {
    const W = 720;
    const H = 330;
    const frameW = 128;
    const frameH = 112;
    const gap = 14;
    const x0 = 112;
    const rows = [
      { label: 'Banana', y: 34, draw: banana, offsets: [0, 7, 28, 63], sway: [0, 0, 0, 0] },
      { label: 'Feather', y: 172, draw: feather, offsets: [0, 9, 18, 27], sway: [0, 6, -2, 5] },
    ];
    const frames = ['t − 2', 't − 1', 't', 't + 1 ?'];

    return svg(
      {
        width: W,
        height: H,
        label:
          'Three observed frames and a predicted fourth for a falling banana and a falling feather. The banana covers more distance in every frame, the feather drifts down slowly at a steady pace.',
      },
      rows.map((row) => [
        text(x0 - 16, row.y + frameH / 2, row.label, { anchor: 'end', size: 14, weight: 600, baseline: 'middle' }),
        frames.map((_, i) => {
          const x = x0 + i * (frameW + gap);
          const predicted = i === frames.length - 1;
          return translate(
            x,
            row.y,
            rect(0, 0, frameW, frameH, { color: predicted ? muted : axis, width: 1.5, dash: predicted ? '5 4' : undefined, rx: 6 }),
            group({ opacity: predicted ? 0.45 : 1 }, row.draw(frameW / 2 + row.sway[i], 18 + row.offsets[i])),
          );
        }),
      ]),
      frames.map((label, i) =>
        text(x0 + i * (frameW + gap) + frameW / 2, H - 8, label, { size: 13, color: i === frames.length - 1 ? muted : ink, italic: true }),
      ),
      h('line', { x1: x0, y1: H - 26, x2: x0 + 4 * (frameW + gap) - gap, y2: H - 26, stroke: grid, 'stroke-width': 1 }),
    );
  },
});
