document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('mlp-neuron-diagram');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    // SVG dimensions
    const width = 700;
    const height = 320;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '700px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    // Define arrow markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    function createArrowMarker(id, color) {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', id);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3, 0 6');
        polygon.setAttribute('fill', color);
        marker.appendChild(polygon);
        return marker;
    }

    // ========================================
    // Color palette - reads from CSS vars set by mathjax-colors.html
    // ========================================
    const COLOR_NAME_TO_HEX = {
        violet: '#EE82EE', teal: '#008080', orange: '#FFA500', red: '#FF0000',
        blue: '#0000FF', green: '#008000', purple: '#800080', cyan: '#00FFFF',
        magenta: '#FF00FF', yellow: '#FFFF00', pink: '#FFC0CB'
    };

    const styles = getComputedStyle(document.documentElement);
    const getColor = (varName, fallback) => {
        const name = styles.getPropertyValue(varName).trim() || fallback;
        return COLOR_NAME_TO_HEX[name] || name;
    };

    const PALETTE = {
        x: getColor('--math-color-x', 'purple'),
        w: getColor('--math-color-w', 'red'),
        b: getColor('--math-color-b', 'blue'),
        y: getColor('--math-color-y', 'orange'),
        activation: '#047857'  // dark emerald for ReLU/activation
    };

    // Helper to lighten a hex color
    const lighten = (hex, percent = 30) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
        const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
        const b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
        return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
    };

    // Derived colors
    const xColor = PALETTE.x;
    const xColorLight = lighten(PALETTE.x);
    const wColor = PALETTE.w;
    const bColor = PALETTE.b;
    const bColorLight = lighten(PALETTE.b);
    const yColor = PALETTE.y;
    const actColor = PALETTE.activation;
    const actColorLight = lighten(PALETTE.activation);
    const neuronColor = '#fdede0';
    const neuronStroke = '#e9b393';

    defs.appendChild(createArrowMarker('arrowhead-weight', wColor));
    defs.appendChild(createArrowMarker('arrowhead-bias', bColor));
    defs.appendChild(createArrowMarker('arrowhead-y', yColor));

    svg.appendChild(defs);

    // Helper functions
    function createCircle(cx, cy, r, fillColor, strokeColor, strokeWidth = 2) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', strokeWidth);
        return circle;
    }

    function createText(x, y, text, options = {}) {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        textEl.setAttribute('text-anchor', options.anchor || 'middle');
        textEl.setAttribute('dominant-baseline', options.baseline || 'middle');
        textEl.setAttribute('font-family', options.fontFamily || 'serif');
        textEl.setAttribute('font-size', options.fontSize || '18');
        textEl.setAttribute('font-weight', options.fontWeight || 'bold');
        textEl.setAttribute('fill', options.fill || '#333');
        if (options.fontStyle) {
            textEl.setAttribute('font-style', options.fontStyle);
        }
        textEl.textContent = text;
        return textEl;
    }

    function createPath(d, strokeColor, strokeWidth = 2, fillColor = 'none', markerId = null) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', fillColor);
        if (markerId) {
            path.setAttribute('marker-end', `url(#${markerId})`);
        }
        return path;
    }

    function createRect(x, y, w, h, rx, fillColor, strokeColor, strokeWidth = 2) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', w);
        rect.setAttribute('height', h);
        rect.setAttribute('rx', rx);
        rect.setAttribute('ry', rx);
        rect.setAttribute('fill', fillColor);
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', strokeWidth);
        return rect;
    }

    function createLine(x1, y1, x2, y2, color, strokeWidth = 2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        return line;
    }

    // Positions
    const inputX = 100;
    const neuronX = 320;
    const neuronY = 160;
    const reluX = 480;
    const outputX = 620;

    const inputYs = [70, 130, 190]; // y positions for x1, ..., xl
    const biasY = 270; // y position for bias

    const inputRadius = 28;
    const neuronRadius = 40;
    const outputRadius = 28;

    // === Input nodes (x1, ..., xl) ===
    // First input: x1
    svg.appendChild(createCircle(inputX, inputYs[0], inputRadius, xColorLight, xColor));
    svg.appendChild(createText(inputX, inputYs[0], 'x₁', {
        fill: '#fff',
        fontSize: '20',
        fontStyle: 'italic'
    }));

    // Middle: dots indicating more inputs
    svg.appendChild(createText(inputX, inputYs[1], '⋮', {
        fill: xColor,
        fontSize: '28',
        fontWeight: 'normal'
    }));

    // Last input: xl
    svg.appendChild(createCircle(inputX, inputYs[2], inputRadius, xColorLight, xColor));
    svg.appendChild(createText(inputX, inputYs[2], 'xₗ', {
        fill: '#fff',
        fontSize: '20',
        fontStyle: 'italic'
    }));

    // === Bias node (constant 1) ===
    svg.appendChild(createCircle(inputX, biasY, inputRadius, bColorLight, bColor));
    svg.appendChild(createText(inputX, biasY, '1', {
        fill: '#fff',
        fontSize: '20'
    }));

    // === Neuron (Sum) ===
    svg.appendChild(createCircle(neuronX, neuronY, neuronRadius, neuronColor, neuronStroke));
    svg.appendChild(createText(neuronX, neuronY, 'Σ', {
        fill: '#333',
        fontSize: '28'
    }));

    // === ReLU Box ===
    const reluWidth = 80;
    const reluHeight = 65;
    svg.appendChild(createRect(
        reluX - reluWidth / 2,
        neuronY - reluHeight / 2,
        reluWidth,
        reluHeight,
        8,
        actColorLight,
        actColor
    ));

    // ReLU function plot inside the box
    const reluPlotPoints = [];
    for (let px = -0.5; px <= 0.5; px += 0.02) {
        const py = Math.max(0, px * 2);
        const plotX = reluX + px * 55;
        const plotY = neuronY - py * 18 + 8;
        reluPlotPoints.push(`${plotX},${plotY}`);
    }
    const reluPlotPath = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    reluPlotPath.setAttribute('points', reluPlotPoints.join(' '));
    reluPlotPath.setAttribute('stroke', 'white');
    reluPlotPath.setAttribute('stroke-width', '3');
    reluPlotPath.setAttribute('fill', 'none');
    svg.appendChild(reluPlotPath);

    // Axis lines in the ReLU box
    svg.appendChild(createLine(reluX - 30, neuronY + 8, reluX + 30, neuronY + 8, 'rgba(255,255,255,0.5)', 1));
    svg.appendChild(createLine(reluX, neuronY - 22, reluX, neuronY + 25, 'rgba(255,255,255,0.5)', 1));

    // === Output node ===
    svg.appendChild(createCircle(outputX, neuronY, outputRadius, actColorLight, actColor));
    svg.appendChild(createText(outputX, neuronY, 'a', {
        fill: '#fff',
        fontSize: '20',
        fontStyle: 'italic'
    }));

    // === Arrows from inputs to neuron ===
    // Arrow from x1
    const y1 = inputYs[0];
    const startX = inputX + inputRadius + 5;
    const endX = neuronX - neuronRadius - 8;
    const endY1 = neuronY + (y1 - neuronY) * 0.2;

    svg.appendChild(createPath(`M ${startX} ${y1} L ${endX} ${endY1}`, wColor, 2.5, 'none', 'arrowhead-weight'));
    svg.appendChild(createText((startX + endX) / 2, (y1 + endY1) / 2 - 12, 'w₁', {
        fill: wColor,
        fontSize: '16',
        fontStyle: 'italic'
    }));

    // Arrow from xl
    const yl = inputYs[2];
    const endYl = neuronY + (yl - neuronY) * 0.2;

    svg.appendChild(createPath(`M ${startX} ${yl} L ${endX} ${endYl}`, wColor, 2.5, 'none', 'arrowhead-weight'));
    svg.appendChild(createText((startX + endX) / 2, (yl + endYl) / 2 - 12, 'wₗ', {
        fill: wColor,
        fontSize: '16',
        fontStyle: 'italic'
    }));

    // === Arrow from bias to neuron ===
    const biasStartX = inputX + inputRadius + 5;
    const biasEndX = neuronX - neuronRadius - 8;
    const biasEndY = neuronY + 25;

    const biasPathD = `M ${biasStartX} ${biasY} Q ${(biasStartX + biasEndX) / 2} ${biasY - 30} ${biasEndX} ${biasEndY}`;
    svg.appendChild(createPath(biasPathD, bColor, 2.5, 'none', 'arrowhead-bias'));

    // Bias weight label
    svg.appendChild(createText((biasStartX + biasEndX) / 2, biasY - 50, 'b', {
        fill: bColor,
        fontSize: '16',
        fontStyle: 'italic'
    }));

    // === Arrow from neuron to ReLU ===
    const neuronToReluStartX = neuronX + neuronRadius + 5;
    const neuronToReluEndX = reluX - reluWidth / 2 - 8;

    svg.appendChild(createPath(
        `M ${neuronToReluStartX} ${neuronY} L ${neuronToReluEndX} ${neuronY}`,
        yColor, 2.5, 'none', 'arrowhead-y'
    ));

    // Label y (before activation)
    svg.appendChild(createText((neuronToReluStartX + neuronToReluEndX) / 2, neuronY - 18, 'y', {
        fill: yColor,
        fontSize: '16',
        fontStyle: 'italic'
    }));

    // === Arrow from ReLU to output ===
    const reluToOutputStartX = reluX + reluWidth / 2 + 5;
    const reluToOutputEndX = outputX - outputRadius - 8;

    svg.appendChild(createPath(
        `M ${reluToOutputStartX} ${neuronY} L ${reluToOutputEndX} ${neuronY}`,
        actColor, 2.5, 'none', null
    ));

    // Append SVG to container
    container.appendChild(svg);
});
