import { defineDiagram } from './lib/define';
import { banana } from './lib/objects';
import { arrowDefs, axis, nodeFill, path, rect, svg, text } from './lib/svg';
import { color } from '../lib/palette';

interface Props {
  prompt?: string;
  answer?: string;
}

/** A vision language model takes an image and a text prompt and answers in text. */
export default defineDiagram<Props>({
  render({ id, props }) {
    const { prompt = 'What is shown in the image?', answer = 'A banana.' } = props;
    const W = 720;
    const H = 230;
    const model = { x: 300, y: 70, w: 130, h: 80 };
    const { defs, ids } = arrowDefs(id, { axis });
    const bubble = (x: number, y: number, w: number, label: string) => [
      rect(x, y, w, 44, { fill: nodeFill, color: axis, width: 1.5, rx: 12 }),
      text(x + w / 2, y + 27, label, { size: 14 }),
    ];

    return svg(
      {
        width: W,
        height: H,
        label: `A vision language model receives an image of a banana and the prompt "${prompt}" and answers "${answer}".`,
      },
      defs,
      // Inputs: the image and the prompt
      rect(20, 16, 150, 110, { fill: 'none', color: axis, width: 1.5, rx: 6 }),
      banana(95, 66, 1.4),
      text(95, 142, 'image', { size: 12, color: axis }),
      bubble(20, 164, 240, prompt),
      path(`M172 71 C 230 71 250 100 ${model.x - 6} 104`, { color: axis, width: 1.5, arrow: ids.axis }),
      path(`M262 186 C 280 186 280 130 ${model.x - 6} 124`, { color: axis, width: 1.5, arrow: ids.axis }),
      // Model
      rect(model.x, model.y, model.w, model.h, { fill: 'none', color: color('teal'), width: 2, rx: 10 }),
      text(model.x + model.w / 2, model.y + model.h / 2 + 6, 'VLM', { size: 17, weight: 600, color: color('teal') }),
      // Output
      path(`M${model.x + model.w + 4} 110 L ${W - 214} 110`, { color: axis, width: 1.5, arrow: ids.axis }),
      bubble(W - 206, 88, 186, answer),
      text(W - 113, 150, 'text', { size: 12, color: axis }),
    );
  },
});
