/**
 * Single source of truth for variable colors.
 *
 * - `colors` maps a color name to its light and dark theme value. Light values
 *   match the CSS / MathJax named colors the site has always used.
 * - `variables` maps a semantic variable to a color name. Each entry becomes a
 *   TeX macro (`\cU{...}`, `\cWin{...}`, ...) and is available to diagrams via
 *   `varColor('U')`.
 *
 * Everything resolves to CSS custom properties (`--c-<color>`), so equations
 * and diagrams switch theme together and can never drift apart.
 */

export const colors = {
  purple: { light: '#800080', dark: '#d58cf0' },
  red: { light: '#ff0000', dark: '#ff6b6b' },
  blue: { light: '#0000ff', dark: '#7aa2ff' },
  orange: { light: '#ffa500', dark: '#ffb84d' },
  green: { light: '#008000', dark: '#5cd65c' },
  ForestGreen: { light: '#009b55', dark: '#3ddc97' },
  teal: { light: '#008080', dark: '#3cc6c6' },
  brown: { light: '#a52a2a', dark: '#e08a6e' },
  violet: { light: '#ee82ee', dark: '#f4a6f4' },
  darkcyan: { light: '#008b8b', dark: '#4fd8e0' },
  olive: { light: '#808000', dark: '#c8c84a' },
  magenta: { light: '#ff00ff', dark: '#ff7cff' },
  gray: { light: '#808080', dark: '#a8a8a8' },
  cyan: { light: '#00ffff', dark: '#5ff0ff' },
  goldenrod: { light: '#c8901a', dark: '#f0c75e' },
} as const;

export type ColorName = keyof typeof colors;

export const variables = {
  // Generic ANN notation (He initialization post)
  x: 'purple',
  w: 'red',
  b: 'blue',
  y: 'orange',
  n: 'green',
  // SNN notation (LIF / BPTT posts)
  U: 'ForestGreen',
  S: 'orange',
  X: 'purple',
  Win: 'red',
  Wrec: 'teal',
  alpha: 'blue',
  theta: 'brown',
  D: 'violet',
  p: 'darkcyan',
  E: 'olive',
  yhat: 'green',
  ytarget: 'magenta',
  delta: 'gray',
  // Compute accounting (WAM vs VLA post)
  P: 'red',
  Lc: 'purple',
  Lf: 'blue',
  La: 'orange',
  K: 'ForestGreen',
} as const satisfies Record<string, ColorName>;

export type VariableName = keyof typeof variables;

/** CSS color for a named color, e.g. `color('purple')`. */
export const color = (name: ColorName) => `var(--c-${name})`;

/** CSS color for a semantic variable, e.g. `varColor('U')`. */
export const varColor = (name: VariableName) => color(variables[name]);

/** MathJax macro definitions: `\cU{...}` etc. plus a themeable `\textcolor`. */
export function texMacros(): Record<string, [string, number]> {
  const macros: Record<string, [string, number]> = {
    textcolor: ['\\class{c-#1}{#2}', 2],
  };
  for (const [name, c] of Object.entries(variables)) {
    macros[`c${name}`] = [`\\class{c-${c}}{#1}`, 1];
  }
  return macros;
}

/** CSS custom properties and classes for every palette color, both themes. */
export function paletteCss(): string {
  const entries = Object.entries(colors) as [ColorName, { light: string; dark: string }][];
  const vars = entries.map(([n, v]) => `--c-${n}:light-dark(${v.light},${v.dark});`).join('');
  const classes = entries.map(([n]) => `.c-${n}{color:var(--c-${n})}`).join('');
  return `:root{${vars}}${classes}`;
}
