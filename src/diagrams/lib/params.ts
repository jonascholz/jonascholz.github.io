/**
 * Page-level parameter store shared by `<Param>` controls, `<Show>` blocks and
 * interactive diagrams. Controls write values; listeners re-render, batched
 * to one update per animation frame.
 */
import type { ParamValue } from './define';

const values = new Map<string, ParamValue>();
const listeners = new Map<string, Set<() => void>>();
const pending = new Set<() => void>();
let scheduled = false;

function flush() {
  scheduled = false;
  const run = [...pending];
  pending.clear();
  for (const fn of run) fn();
}

export function setParam(name: string, value: ParamValue) {
  if (values.get(name) === value) return;
  values.set(name, value);
  for (const fn of listeners.get(name) ?? []) pending.add(fn);
  if (!scheduled && pending.size) {
    scheduled = true;
    requestAnimationFrame(flush);
  }
}

export function getParams<Q extends Record<string, ParamValue>>(defaults: Q): Q {
  const out: Record<string, ParamValue> = { ...defaults };
  for (const k of Object.keys(defaults)) if (values.has(k)) out[k] = values.get(k)!;
  return out as Q;
}

export function getParam(name: string): ParamValue | undefined {
  return values.get(name);
}

export function subscribe(names: string[], fn: () => void) {
  for (const n of names) {
    if (!listeners.has(n)) listeners.set(n, new Set());
    listeners.get(n)!.add(fn);
  }
}
