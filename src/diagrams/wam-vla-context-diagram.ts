import { defineDiagram } from './lib/define';
import { h, ink, muted, rect, svg, text } from './lib/svg';
import { varColor } from '../lib/palette';

interface Props {
  /** Token counts drawn to scale. */
  context?: number;
  future?: number;
  actions?: number;
}

/**
 * The token sequence of a VLA and of a WAM with the same context, drawn to
 * scale. Clean conditioning tokens are solid, tokens the model denoises are
 * hatched. The WAM adds noisy future frames next to the noisy actions.
 */
export default defineDiagram<Props>({
  render({ id, props }) {
    const { context = 800, future = 588, actions = 50 } = props;
    const W = 720;
    const x0 = 64;
    const scale = (W - x0 - 24) / (context + future + actions);
    const barH = 40;

    const C = { context: varColor('Lc'), future: varColor('Lf'), actions: varColor('La') };
    const hatch = (key: keyof typeof C) =>
      h(
        'pattern',
        { id: `${id}-hatch-${key}`, width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
        h('rect', { width: 7, height: 7, fill: C[key], opacity: 0.18 }),
        h('line', { x1: 0, y1: 0, x2: 0, y2: 7, stroke: C[key], 'stroke-width': 2.5 }),
      );

    type Block = { key: keyof typeof C; tokens: number; label: string; noisy: boolean };
    const row = (y: number, name: string, blocks: Block[]) => {
      let x = x0;
      return [
        text(x0 - 12, y + barH / 2, name, { anchor: 'end', size: 15, weight: 600, baseline: 'middle' }),
        blocks.map((b) => {
          const w = b.tokens * scale;
          const node = [
            rect(x, y, w, barH, {
              fill: b.noisy ? `url(#${id}-hatch-${b.key})` : C[b.key],
              color: C[b.key],
              width: 1.5,
              rx: 3,
            }),
            text(x + w / 2, y + barH + 18, b.label, { size: 12, color: C[b.key] }),
            text(x + w / 2, y + barH + 34, `${b.tokens}`, { size: 12, color: muted, mono: true }),
          ];
          x += w;
          return node;
        }),
      ];
    };

    const ctx: Block = { key: 'context', tokens: context, label: 'text + current images', noisy: false };
    const act: Block = { key: 'actions', tokens: actions, label: 'actions', noisy: true };
    const fut: Block = { key: 'future', tokens: future, label: 'future frames', noisy: true };

    return svg(
      {
        width: W,
        height: 250,
        label: `Token sequences drawn to scale. The VLA sees ${context} clean context tokens and denoises ${actions} action tokens. The WAM sees the same context and denoises ${future} future frame tokens in addition to the ${actions} action tokens.`,
      },
      h('defs', {}, hatch('future'), hatch('actions')),
      row(20, 'VLA', [ctx, act]),
      row(126, 'WAM', [ctx, fut, act]),
      rect(x0, 222, 14, 14, { fill: ink, width: 0, rx: 2 }),
      text(x0 + 22, 233, 'clean, used as conditioning', { anchor: 'start', size: 12, color: muted }),
      rect(x0 + 230, 222, 14, 14, { fill: `url(#${id}-hatch-actions)`, color: varColor('La'), width: 1, rx: 2 }),
      text(x0 + 252, 233, 'noisy, denoised by the model', { anchor: 'start', size: 12, color: muted }),
    );
  },
});
