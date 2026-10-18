/**
 * Build-time MathJax (CHTML output). Nothing math-related runs in the browser:
 * pages ship pre-rendered markup plus one cached stylesheet and the TeX fonts.
 */
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AssistiveMmlHandler } from 'mathjax-full/js/a11y/assistive-mml.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { texMacros } from './palette';

export const FONT_URL = '/mathjax/fonts';
export const STYLESHEET_URL = '/mathjax/chtml.css';

const adaptor = liteAdaptor();
AssistiveMmlHandler(RegisterHTMLHandler(adaptor));

const packages = AllPackages.filter((p: string) => p !== 'bussproofs');

/**
 * A fresh converter per page. Equation numbers (`tags: 'ams'`) and labels
 * accumulate across calls, exactly like a single page in browser MathJax.
 */
export function createConverter() {
  const tex = new TeX({ packages, tags: 'ams', useLabelIds: true, macros: texMacros() });
  const chtml = new CHTML({ fontURL: FONT_URL, adaptiveCSS: false });
  const doc = mathjax.document('', { InputJax: tex, OutputJax: chtml });
  return {
    toHtml(source: string, display: boolean): string {
      return adaptor.outerHTML(doc.convert(source, { display }));
    },
    labels(): Record<string, { tag: string; id: string }> {
      return tex.parseOptions.tags.allLabels;
    },
  };
}

/** The complete (non-adaptive) CHTML stylesheet, shared by every page. */
export function stylesheet(): string {
  const chtml = new CHTML({ fontURL: FONT_URL, adaptiveCSS: false });
  const doc = mathjax.document('', { InputJax: new TeX({ packages: ['base'] }), OutputJax: chtml });
  doc.convert('x', { display: false });
  return adaptor.textContent(chtml.styleSheet(doc) as any);
}
