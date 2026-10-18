import type { Child } from './svg';

export type ParamValue = number | string | boolean;

export interface RenderContext<P, Q> {
  /** Unique per diagram instance; prefix for any ids inside the SVG. */
  id: string;
  /** Static configuration from the post, e.g. labels. */
  props: P;
  /** Current values of the page params this diagram listens to. */
  params: Q;
}

export interface Diagram<P = Record<string, never>, Q extends Record<string, ParamValue> = Record<string, never>> {
  /**
   * Page params (set by `<Param>` controls) this diagram reacts to, with the
   * defaults used for the build-time render. Diagrams without params are
   * static SVG and ship no JavaScript.
   */
  params?: Q;
  render(ctx: RenderContext<P, Q>): Child;
}

export const defineDiagram = <P = Record<string, never>, Q extends Record<string, ParamValue> = Record<string, never>>(
  d: Diagram<P, Q>,
) => d;
