/** Small everyday objects for diagrams, each drawn around its own center. */
import { h, ink, nodeFill, path, translate } from './svg';
import { color } from '../../lib/palette';

/** A banana lying on its side, roughly 44 × 20, centered on (x, y). */
export function banana(x: number, y: number, scale = 1) {
  return translate(
    x,
    y,
    h(
      'g',
      { transform: `scale(${scale})` },
      path('M-21 -4 Q-2 16 21 -6 Q4 4 -21 -4 Z', { fill: color('goldenrod'), color: ink, width: 1.5 }),
      path('M21 -6 L24 -10', { color: ink, width: 2.5, cap: 'round' }),
    ),
  );
}

/** A feather tilted slightly, roughly 40 × 14, centered on (x, y). */
export function feather(x: number, y: number) {
  return translate(
    x,
    y,
    h(
      'g',
      { transform: 'rotate(-12)' },
      path('M-20 0 Q0 -10 20 0 Q0 10 -20 0 Z', { fill: nodeFill, color: color('gray'), width: 1.5 }),
      path('M-24 0 L20 0', { color: color('gray'), width: 1.5, cap: 'round' }),
    ),
  );
}
