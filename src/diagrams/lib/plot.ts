/**
 * Function plots and charts on top of the SVG builder.
 * A `panel` is one plotting area with its own scales; figures may hold several.
 */
import { scaleLinear, type ScaleLinear } from 'd3-scale';
import { line as d3line, area as d3area, curveLinear, curveStepAfter } from 'd3-shape';
import { axis as axisColor, grid as gridColor, h, line, path, text, type Child, type StrokeOpts } from './svg';

export type Point = [number, number];

export interface PanelOpts {
  /** Unique id (used for the clip path). */
  id: string;
  /** Plot area in SVG coordinates. */
  x: number;
  y: number;
  width: number;
  height: number;
  xDomain: [number, number];
  yDomain: [number, number];
}

export interface AxesOpts {
  /** `origin`: axes cross at (0, 0) like a math textbook; `frame`: left and bottom edges. */
  mode?: 'origin' | 'frame';
  xTicks?: number[] | number;
  yTicks?: number[] | number;
  xLabel?: Child;
  yLabel?: Child;
  format?: (v: number) => string;
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  /** Draw light grid lines at the ticks. */
  grid?: boolean;
  /** Hide the tick label at 0 (useful in `origin` mode). */
  hideZero?: boolean;
  fontSize?: number;
}

const defaultFormat = (v: number) => {
  const r = Math.round(v * 1000) / 1000;
  return r < 0 ? `−${Math.abs(r)}` : String(r);
};

export interface Panel extends PanelOpts {
  sx: ScaleLinear<number, number>;
  sy: ScaleLinear<number, number>;
  /** Polyline through data points. */
  line(points: Point[], o?: StrokeOpts & { step?: boolean }): Child;
  /** Sampled function y = f(x) over the x domain (or `from`/`to`). */
  fn(f: (x: number) => number, o?: StrokeOpts & { samples?: number; from?: number; to?: number }): Child;
  /** Filled area between y = f(x) and y = 0 (or `base`). */
  area(points: Point[], o: { fill: string; opacity?: number; base?: number }): Child;
  axes(o?: AxesOpts): Child;
  /** Wrap children in the panel's clip path. */
  clip(...children: Child[]): Child;
  /** The `<clipPath>` definition; place inside `<defs>`. */
  clipDef: Child;
}

export function panel(o: PanelOpts): Panel {
  const sx = scaleLinear().domain(o.xDomain).range([o.x, o.x + o.width]);
  const sy = scaleLinear().domain(o.yDomain).range([o.y + o.height, o.y]);
  const clipId = `${o.id}-clip`;

  const toPath = (points: Point[], step = false) =>
    d3line<Point>()
      .x((p) => sx(p[0]))
      .y((p) => sy(p[1]))
      .defined((p) => Number.isFinite(p[1]))
      .curve(step ? curveStepAfter : curveLinear)(points) ?? '';

  const ticks = (spec: number[] | number | undefined, scale: ScaleLinear<number, number>) =>
    Array.isArray(spec) ? spec : scale.ticks(spec ?? 5);

  return {
    ...o,
    sx,
    sy,
    clipDef: h('clipPath', { id: clipId }, h('rect', { x: o.x, y: o.y, width: o.width, height: o.height })),
    clip: (...children) => h('g', { 'clip-path': `url(#${clipId})` }, ...children),

    line: (points, s = {}) => path(toPath(points, s.step), { width: 2.5, ...s }),

    fn(f, s = {}) {
      const from = s.from ?? o.xDomain[0];
      const to = s.to ?? o.xDomain[1];
      const n = s.samples ?? 300;
      const pts: Point[] = Array.from({ length: n + 1 }, (_, i) => {
        const x = from + ((to - from) * i) / n;
        return [x, f(x)];
      });
      return path(toPath(pts), { width: 2.5, ...s });
    },

    area(points, s) {
      const d =
        d3area<Point>()
          .x((p) => sx(p[0]))
          .y0(sy(s.base ?? 0))
          .y1((p) => sy(p[1]))(points) ?? '';
      return h('path', { d, fill: s.fill, opacity: s.opacity ?? 0.25, stroke: 'none' });
    },

    axes(a = {}) {
      const mode = a.mode ?? 'frame';
      const fs = a.fontSize ?? 12;
      const fx = a.xFormat ?? a.format ?? defaultFormat;
      const fy = a.yFormat ?? a.format ?? defaultFormat;
      const ax = mode === 'origin' ? sy(Math.min(Math.max(0, o.yDomain[0]), o.yDomain[1])) : o.y + o.height;
      const ay = mode === 'origin' ? sx(Math.min(Math.max(0, o.xDomain[0]), o.xDomain[1])) : o.x;
      const out: Child[] = [];

      const xt = ticks(a.xTicks, sx);
      const yt = ticks(a.yTicks, sy);

      if (a.grid) {
        for (const t of xt) out.push(line(sx(t), o.y, sx(t), o.y + o.height, { color: gridColor, width: 1 }));
        for (const t of yt) out.push(line(o.x, sy(t), o.x + o.width, sy(t), { color: gridColor, width: 1 }));
      }

      out.push(line(o.x, ax, o.x + o.width, ax, { color: axisColor, width: 1.5 }));
      out.push(line(ay, o.y, ay, o.y + o.height, { color: axisColor, width: 1.5 }));

      for (const t of xt) {
        if (a.hideZero && t === 0) continue;
        out.push(line(sx(t), ax, sx(t), ax + 5, { color: axisColor, width: 1 }));
        out.push(text(sx(t), ax + 8 + fs, fx(t), { size: fs, color: axisColor }));
      }
      for (const t of yt) {
        if (a.hideZero && t === 0) continue;
        out.push(line(ay - 5, sy(t), ay, sy(t), { color: axisColor, width: 1 }));
        out.push(text(ay - 9, sy(t) + fs * 0.35, fy(t), { size: fs, color: axisColor, anchor: 'end' }));
      }

      if (a.xLabel !== undefined) {
        out.push(
          mode === 'origin'
            ? text(o.x + o.width + 8, ax + 5, a.xLabel, { size: fs + 3, anchor: 'start', italic: true })
            : text(o.x + o.width / 2, o.y + o.height + 2.6 * fs + 8, a.xLabel, { size: fs + 1 }),
        );
      }
      if (a.yLabel !== undefined) {
        out.push(
          mode === 'origin'
            ? text(ay - 10, o.y - 6, a.yLabel, { size: fs + 3, anchor: 'end' })
            : text(o.x - 3.6 * fs - 6, o.y + o.height / 2, a.yLabel, { size: fs + 1, rotate: -90 }),
        );
      }
      return h('g', {}, ...out);
    },
  };
}

export interface LegendItem {
  label: Child;
  color: string;
  dash?: string;
  /** Draw a filled swatch instead of a line. */
  swatch?: boolean;
}

/** A vertical legend whose top-left corner is at (x, y). */
export function legend(x: number, y: number, items: LegendItem[], fontSize = 12): Child {
  return h(
    'g',
    {},
    ...items.map((it, i) => {
      const cy = y + i * (fontSize + 8);
      return [
        it.swatch
          ? h('rect', { x, y: cy - 5, width: 18, height: 10, fill: it.color, opacity: 0.6, rx: 2 })
          : line(x, cy, x + 22, cy, { color: it.color, width: 2.5, dash: it.dash }),
        text(x + 28, cy + fontSize * 0.35, it.label, { size: fontSize, anchor: 'start' }),
      ];
    }),
  );
}

/** Evenly spaced values from `from` to `to` inclusive. */
export const linspace = (from: number, to: number, n: number) =>
  Array.from({ length: n }, (_, i) => from + ((to - from) * i) / (n - 1));
