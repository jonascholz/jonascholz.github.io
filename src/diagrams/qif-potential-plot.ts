import { defineDiagram } from './lib/define';
import { legend, panel, type Point } from './lib/plot';
import { circle, h, line, muted, paper, svg, text } from './lib/svg';
import { color, varColor } from '../lib/palette';

const T_MAX = 5;

/** Euler simulation of dU/dt = U(U - 1) without input current. */
function simulate(u0: number, dt = 0.01): Point[] {
  const pts: Point[] = [[0, u0]];
  let u = u0;
  let t = 0;
  while (t < T_MAX && u < 10 && u > -2) {
    u += u * (u - 1) * dt;
    t += dt;
    pts.push([t, u]);
  }
  return pts;
}

/** QIF membrane potential from an initial value u0: decays below the threshold U = 1, explodes above it. */
export default defineDiagram({
  params: { u0: 0.5 },
  render({ id, params }) {
    const u0 = Number(params.u0);
    const U = varColor('U');
    const thr = color('red');
    const p = panel({ id, x: 60, y: 20, width: 520, height: 270, xDomain: [0, T_MAX], yDomain: [-0.5, 4] });

    return svg(
      { width: 600, height: 350, label: `QIF membrane potential over time starting from U0 = ${u0.toFixed(2)}, with the threshold at U = 1.` },
      h('defs', {}, p.clipDef),
      line(p.x, p.sy(0), p.x + p.width, p.sy(0), { color: muted, width: 1 }),
      p.axes({ xTicks: [0, 1, 2, 3, 4, 5], yTicks: [0, 1, 2, 3, 4], xLabel: 'Time', yLabel: 'Membrane Potential U' }),
      line(p.x, p.sy(1), p.x + p.width, p.sy(1), { color: thr, width: 1.5, dash: '8,4' }),
      text(p.x + p.width - 5, p.sy(1) - 5, 'threshold (U = 1)', { size: 12, anchor: 'end', color: thr }),
      legend(p.x + p.width - 100, p.y + 15, [{ label: 'U(t)', color: U }]),
      p.clip(p.line(simulate(u0), { color: U })),
      circle(p.sx(0), p.sy(u0), 6, { fill: U, color: paper }),
    );
  },
});
