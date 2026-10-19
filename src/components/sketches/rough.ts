/**
 * Hand-drawn wobble for the sketches, baked into the geometry at build time.
 *
 * Every shape is sampled into points, each point is pushed around by a smooth
 * noise field and a smooth curve is drawn back through them. Because the
 * displacement depends only on position, a fill and its outline wobble
 * together, and the result is a plain vector path that stays crisp at any
 * size (an SVG displacement filter would move rasterized pixels instead).
 */

type Point = [number, number];

/** Max distance between resampled points, in viewBox units. */
const STEP = 3;

export interface Rough {
  /** An SVG path (M, L, H, V, C, A, Z and their relative forms). */
  path(d: string): string;
  rect(x: number, y: number, width: number, height: number, rx?: number): string;
  circle(cx: number, cy: number, r: number): string;
}

/**
 * A roughener with its own noise field. `amount` is the largest displacement
 * and `wavelength` the typical size of a wobble, both in viewBox units.
 */
export function rough(seed: number, { amount = 1.4, wavelength = 28 } = {}): Rough {
  const field = noise(seed, wavelength);
  const draw = (subpaths: { points: Point[]; closed: boolean }[]) =>
    subpaths
      .map(({ points, closed }) => smooth(resample(points, closed).map(([x, y]) => {
        const [dx, dy] = field(x, y);
        return [x + amount * dx, y + amount * dy] as Point;
      }), closed))
      .join('');

  return {
    path: (d) => draw(parsePath(d)),
    rect: (x, y, w, h, rx = 0) => draw([{ points: roundedRect(x, y, w, h, Math.min(rx, w / 2, h / 2)), closed: true }]),
    circle: (cx, cy, r) => draw([{ points: arcPoints(cx, cy, r, 0, 2 * Math.PI).slice(0, -1), closed: true }]),
  };
}

/* ---------- Noise ---------- */

/** Two smooth fields in [-1, 1] (for x and y), each a sum of a few plane waves at two octaves. */
function noise(seed: number, wavelength: number) {
  let s = seed * 9301 + 49297;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const waves = (n: number, k: number, weight: number) =>
    Array.from({ length: n }, () => {
      const angle = rand() * 2 * Math.PI;
      return { kx: k * Math.cos(angle), ky: k * Math.sin(angle), phase: rand() * 2 * Math.PI, weight };
    });
  const k = (2 * Math.PI) / wavelength;
  const make = () => [...waves(3, k, 0.65 / 3), ...waves(3, 2 * k, 0.35 / 3)];
  const fx = make();
  const fy = make();
  const sum = (ws: ReturnType<typeof make>, x: number, y: number) =>
    ws.reduce((acc, w) => acc + w.weight * Math.sin(w.kx * x + w.ky * y + w.phase), 0);
  return (x: number, y: number): Point => [sum(fx, x, y), sum(fy, x, y)];
}

/* ---------- Geometry ---------- */

function arcPoints(cx: number, cy: number, r: number, from: number, to: number): Point[] {
  const n = Math.max(2, Math.ceil((Math.abs(to - from) * r) / STEP));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}

function roundedRect(x: number, y: number, w: number, h: number, r: number): Point[] {
  if (r <= 0) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const q = Math.PI / 2;
  return [
    ...arcPoints(x + w - r, y + r, r, -q, 0),
    ...arcPoints(x + w - r, y + h - r, r, 0, q),
    ...arcPoints(x + r, y + h - r, r, q, 2 * q),
    ...arcPoints(x + r, y + r, r, 2 * q, 3 * q),
  ];
}

/** Insert points so no segment is longer than STEP; original vertices are kept. */
function resample(points: Point[], closed: boolean): Point[] {
  const out: Point[] = [];
  const n = closed ? points.length : points.length - 1;
  for (let i = 0; i < n; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[(i + 1) % points.length];
    const parts = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / STEP));
    for (let j = 0; j < parts; j++) out.push([ax + ((bx - ax) * j) / parts, ay + ((by - ay) * j) / parts]);
  }
  if (!closed) out.push(points[points.length - 1]);
  return out;
}

/** A Catmull-Rom spline through the points, as cubic Bézier path data. */
function smooth(p: Point[], closed: boolean): string {
  const f = (v: number) => String(Math.round(v * 100) / 100);
  const at = (i: number) => (closed ? p[(i + p.length) % p.length] : p[Math.max(0, Math.min(p.length - 1, i))]);
  const segments = closed ? p.length : p.length - 1;
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < segments; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

/* ---------- Path parsing ---------- */

/** Split path data into polylines; curves and arcs are sampled. */
function parsePath(d: string): { points: Point[]; closed: boolean }[] {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  const subpaths: { points: Point[]; closed: boolean }[] = [];
  let current: Point[] = [];
  let x = 0;
  let y = 0;
  let cmd = '';
  let i = 0;
  const num = () => Number(tokens[i++]);
  const finish = (closed: boolean) => {
    if (current.length > 1) subpaths.push({ points: current, closed });
    current = [];
  };

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case 'M':
        finish(false);
        x = ox + num();
        y = oy + num();
        current = [[x, y]];
        cmd = rel ? 'l' : 'L'; // further pairs are line-tos
        break;
      case 'L':
        x = ox + num();
        y = oy + num();
        current.push([x, y]);
        break;
      case 'H':
        x = ox + num();
        current.push([x, y]);
        break;
      case 'V':
        y = oy + num();
        current.push([x, y]);
        break;
      case 'C': {
        const [x1, y1, x2, y2, ex, ey] = [ox + num(), oy + num(), ox + num(), oy + num(), ox + num(), oy + num()];
        const [sx, sy] = [x, y];
        for (let t = 1; t <= 8; t++) {
          const u = t / 8;
          const v = 1 - u;
          current.push([
            v * v * v * sx + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * ex,
            v * v * v * sy + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * ey,
          ]);
        }
        [x, y] = [ex, ey];
        break;
      }
      case 'A': {
        const [rx, ry, rot, large, sweep] = [num(), num(), num(), num(), num()];
        const [ex, ey] = [ox + num(), oy + num()];
        current.push(...ellipticArc(x, y, rx, ry, rot, large, sweep, ex, ey));
        [x, y] = [ex, ey];
        break;
      }
      case 'Z': {
        const start = current[0];
        finish(true);
        if (start) [x, y] = start;
        break;
      }
      default:
        throw new Error(`rough: unsupported path command "${cmd}" in "${d}"`);
    }
  }
  finish(false);
  return subpaths;
}

/** Points along an SVG elliptical arc (endpoint parameterization, SVG spec F.6.5), excluding the start. */
function ellipticArc(x1: number, y1: number, rx: number, ry: number, rotDeg: number, large: number, sweep: number, x2: number, y2: number): Point[] {
  const phi = (rotDeg * Math.PI) / 180;
  const [cos, sin] = [Math.cos(phi), Math.sin(phi)];
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;
  const scale = Math.max(1, Math.sqrt((x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry)));
  rx *= scale;
  ry *= scale;
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (k * rx * y1p) / ry;
  const cyp = (-k * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const angle = (ux: number, uy: number) => Math.atan2(uy, ux);
  const t1 = angle((x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = angle((-x1p - cxp) / rx, (-y1p - cyp) / ry) - t1;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  const n = Math.max(2, Math.ceil((Math.abs(dt) * Math.max(rx, ry)) / STEP));
  return Array.from({ length: n }, (_, i) => {
    const t = t1 + (dt * (i + 1)) / n;
    const [ex, ey] = [rx * Math.cos(t), ry * Math.sin(t)];
    return [cos * ex - sin * ey + cx, sin * ex + cos * ey + cy];
  });
}
