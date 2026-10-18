/**
 * A single LIF neuron with constant input and its surrogate gradient,
 * shared by the plots of the Batman derivative post.
 */
import { panel, linspace, type Panel } from './plot';
import { axis, circle, h, line, svg, type Child } from './svg';

/** Page param defaults shared by all LIF plots (the initial control values). */
export const lifDefaults = {
  surrogate: 'triangular',
  height: 1,
  cutoff: 36,
  x: 0.16,
  theta: 0.5,
  alpha: 0.8,
  width: 0.5,
  reset: true,
};

/** The subset of `lifDefaults` a diagram depends on. */
export const lifParams = <K extends keyof typeof lifDefaults>(...keys: K[]) =>
  Object.fromEntries(keys.map((k) => [k, lifDefaults[k]])) as Pick<typeof lifDefaults, K>;

/** Surrogate derivative of the Heaviside: triangle or box of half-width `width` and peak `height`. */
export function surrogate(type: string, x: number, width: number, height: number) {
  if (Math.abs(x) > width) return 0;
  return type === 'boxcar' ? height : height * (1 - Math.abs(x) / width);
}

export interface LifOpts {
  x: number;
  theta: number;
  alpha: number;
  width: number;
  height: number;
  surrogate: string;
  /** Include the reset term in the gradient recursion. */
  reset: boolean;
  steps: number;
  /** Input is x before this timestep and 0 afterwards (defaults to `steps`). */
  cutoff?: number;
}

export interface LifResult {
  /** Membrane potential U[t], U[0] = 0. */
  u: number[];
  /** Surrogate spike derivative dS[t]/dx. */
  dS: number[];
  /** Timesteps with a spike. */
  spikes: number[];
  /** Spike count / steps. */
  rate: number;
  /** Sum of dS[t]/dx / steps. */
  avgGrad: number;
}

/** Simulate U[t] = α U[t-1] + w x - S[t-1] θ (w = 1) alongside the BPTT recursion for dU/dx and dS/dx. */
export function simulate(o: LifOpts): LifResult {
  const cutoff = o.cutoff ?? o.steps;
  const u = [0];
  const dU = [0];
  const dS = [0];
  const spikes: number[] = [];
  let ut = 0;
  let s = 0;
  for (let t = 1; t < o.steps; t++) {
    const x = t < cutoff ? o.x : 0;
    ut = o.alpha * ut + x - s * o.theta;
    const du = o.alpha * dU[t - 1] + 1 - (o.reset ? dS[t - 1] * o.theta : 0);
    s = ut - o.theta > 0 ? 1 : 0;
    u.push(ut);
    dU.push(du);
    dS.push(surrogate(o.surrogate, ut - o.theta, o.width, o.height) * du);
    if (s) spikes.push(t);
  }
  const sum = dS.reduce((a, b) => a + b, 0);
  return { u, dS, spikes, rate: spikes.length / o.steps, avgGrad: sum / o.steps };
}

/** Pad a [min, max] range by a fraction of its span (or by `fallback` if it is flat). */
export function padded(min: number, max: number, frac = 0.1, fallback = 0.1): [number, number] {
  const pad = (max - min) * frac || fallback;
  return [min - pad, max + pad];
}

/** Light line at y = 0 and x = 0 (Plotly's zero lines). */
export function zeroLines(p: Panel): Child {
  const inX = p.xDomain[0] < 0 && p.xDomain[1] > 0;
  const inY = p.yDomain[0] < 0 && p.yDomain[1] > 0;
  return [
    inY && line(p.x, p.sy(0), p.x + p.width, p.sy(0), { color: axis, width: 1 }),
    inX && line(p.sx(0), p.y, p.sx(0), p.y + p.height, { color: axis, width: 1 }),
  ];
}

export interface SweepOpts {
  id: string;
  label: string;
  /** Simulated quantity for one input value x. */
  f: (x: number) => number;
  /** y range from the sampled values. */
  yDomain: (ys: number[]) => [number, number];
  yLabel: string;
  color: string;
  /** Current input value, marked with a dot. */
  marker: { x: number; color: string };
  from?: number;
  to?: number;
  samples?: number;
}

/** A quantity of the LIF simulation swept over the input value x. */
export function sweepPlot(o: SweepOpts): Child {
  const xs = linspace(o.from ?? -1, o.to ?? 1, o.samples ?? 250);
  const ys = xs.map(o.f);
  const p = panel({ id: o.id, x: 80, y: 15, width: 595, height: 250, xDomain: [xs[0], xs[xs.length - 1]], yDomain: o.yDomain(ys) });
  return svg(
    { width: 700, height: 325, label: o.label },
    h('defs', {}, p.clipDef),
    p.axes({ grid: true, xLabel: 'Input value', yLabel: o.yLabel, fontSize: 13 }),
    zeroLines(p),
    p.clip(p.line(xs.map((x, i) => [x, ys[i]]), { color: o.color, width: 3 })),
    circle(p.sx(o.marker.x), p.sy(o.f(o.marker.x)), 7, { color: o.marker.color, fill: o.marker.color }),
  );
}
