import { defineDiagram } from './lib/define';
import { legend, panel, type Point } from './lib/plot';
import { circle, h, svg, text } from './lib/svg';
import { color, varColor } from '../lib/palette';

/** Video frames per latent frame (Wan2.1 VAE, 4× temporal compression). */
const FRAMES_PER_LATENT = 4;
/** Tokens per latent frame: 3 cameras × 196 tokens at 224×224 (16×16 pixels per token). */
const TOKENS_PER_LATENT = 3 * 196;

/** Future frame tokens n_f for a number of predicted future timesteps (one video frame each). */
export const futureTokens = (frames: number) => Math.ceil(frames / FRAMES_PER_LATENT) * TOKENS_PER_LATENT;

/**
 * Training compute of a WAM relative to a VLA with the same size and context,
 * (n_c + n_f + n_a) / (n_c + n_a), over the number of predicted future timesteps.
 */
export default defineDiagram({
  params: { ctx: 800, frames: 4, act: 50 },
  render({ id, params }) {
    const { ctx, frames, act } = params;
    const ratio = (t: number) => (ctx + futureTokens(t) + act) / (ctx + act);
    const xMax = 64;
    const yMax = Math.max(2, Math.ceil(ratio(xMax)));
    const p = panel({ id, x: 80, y: 15, width: 595, height: 250, xDomain: [0, xMax], yDomain: [0, yMax] });
    const wam = varColor('nf');
    const vla = color('teal');
    const steps: Point[] = Array.from({ length: xMax + 1 }, (_, t) => [t, ratio(t)]);

    return svg(
      {
        width: 700,
        height: 345,
        label: `Training compute of a WAM relative to a VLA over the number of predicted future timesteps. Every 4 timesteps add ${TOKENS_PER_LATENT} tokens. At ${frames} timesteps (${futureTokens(frames)} tokens) it is ${ratio(frames).toFixed(1)} times the VLA.`,
      },
      h('defs', {}, p.clipDef),
      p.axes({ grid: true, xTicks: [0, 8, 16, 24, 32, 40, 48, 56, 64], xLabel: 'future timesteps', yLabel: 'training compute (VLA = 1)', fontSize: 13 }),
      p.clip(p.fn(() => 1, { color: vla, width: 2.5, dash: '6 5' }), p.line(steps, { color: wam, width: 3, step: true })),
      circle(p.sx(frames), p.sy(ratio(frames)), 7, { color: wam, fill: wam }),
      legend(p.x + 16, p.y + 16, [
        { label: 'WAM', color: wam },
        { label: 'VLA', color: vla, dash: '6 5' },
      ]),
      text(p.x, 338, `${frames} future timesteps → n_f = ${futureTokens(frames)} tokens → ${ratio(frames).toFixed(1)}× the VLA`, { anchor: 'start', size: 13, mono: true }),
    );
  },
});
