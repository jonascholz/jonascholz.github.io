document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('lif-neuron-diagram');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    // Labels (configurable via data attributes, with lowercase defaults)
    const labels = {
        input: container.dataset.labelInput || 'x[t]',
        weight: container.dataset.labelWeight || 'w',
        state: container.dataset.labelState || 'u[t]',
        output: container.dataset.labelOutput || 's[t]',
        prevState: container.dataset.labelPrevState || 'u[t-1]',
        decay: container.dataset.labelDecay || 'α'
    };

    // SVG dimensions
    const width = 700;
    const height = 280;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '700px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    // Define arrow markers for different colors
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Helper to create colored arrow markers
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

    // Create markers for each color
    defs.appendChild(createArrowMarker('arrowhead-purple', 'purple'));
    defs.appendChild(createArrowMarker('arrowhead-orange', 'orange'));
    defs.appendChild(createArrowMarker('arrowhead-blue', 'blue'));

    svg.appendChild(defs);

    // Helper functions
    function createLine(x1, y1, x2, y2, color = '#333', strokeWidth = 2, hasArrow = false) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        if (hasArrow) {
            const markerColor = color.toLowerCase();
            line.setAttribute('marker-end', `url(#arrowhead-${markerColor})`);
        }
        return line;
    }

    function createCircle(cx, cy, r, fillColor = 'white', strokeColor = '#333', strokeWidth = 2) {
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
        textEl.setAttribute('font-family', options.fontFamily || 'monospace');
        textEl.setAttribute('font-size', options.fontSize || '16');
        textEl.setAttribute('font-weight', options.fontWeight || 'bold');
        textEl.setAttribute('fill', options.fill || '#333');
        if (options.fontStyle) {
            textEl.setAttribute('font-style', options.fontStyle);
        }
        textEl.textContent = text;
        return textEl;
    }

    function createPath(d, color = '#333', strokeWidth = 2, hasArrow = false, fillColor = 'none') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', fillColor);
        if (hasArrow) {
            const markerColor = color.toLowerCase();
            path.setAttribute('marker-end', `url(#arrowhead-${markerColor})`);
        }
        return path;
    }

    // Positions
    const neuronX = 350;
    const neuronY = 140;
    const neuronRadius = 55;
    const arrowLength = 90;

    // Input arrow (from left) - x[t]
    const inputStartX = neuronX - neuronRadius - arrowLength;
    const inputEndX = neuronX - neuronRadius - 5;
    svg.appendChild(createLine(inputStartX, neuronY, inputEndX, neuronY, 'purple', 2.5, true));

    // Input label
    svg.appendChild(createText(inputStartX - 25, neuronY + 5, labels.input, { fill: 'purple', fontSize: '20' }));

    // Weight label on input arrow
    svg.appendChild(createText(inputStartX + arrowLength/2, neuronY - 18, labels.weight, { fill: 'red', fontSize: '18' }));

    // Neuron circle
    svg.appendChild(createCircle(neuronX, neuronY, neuronRadius, '#f0f8ff', '#333', 2.5));

    // Neuron label (membrane potential)
    svg.appendChild(createText(neuronX, neuronY + 6, labels.state, { fill: 'ForestGreen', fontSize: '20' }));

    // Output arrow (to right) - s[t]
    const outputStartX = neuronX + neuronRadius + 5;
    const outputEndX = neuronX + neuronRadius + arrowLength;
    svg.appendChild(createLine(outputStartX, neuronY, outputEndX, neuronY, 'orange', 2.5, true));

    // Output label
    svg.appendChild(createText(outputEndX + 30, neuronY + 5, labels.output, { fill: 'orange', fontSize: '20' }));

    // Decay/recurrent connection (curved arrow from bottom back to neuron)
    const decayStartAngle = 70 * Math.PI / 180;  // Start from bottom-right
    const decayEndAngle = 110 * Math.PI / 180;   // End at bottom-left
    const decayRadius = 85;

    const decayStartX = neuronX + neuronRadius * Math.cos(decayStartAngle);
    const decayStartY = neuronY + neuronRadius * Math.sin(decayStartAngle);
    const decayEndX = neuronX + neuronRadius * Math.cos(decayEndAngle);
    const decayEndY = neuronY + neuronRadius * Math.sin(decayEndAngle);

    // Control points for smooth curve
    const controlY = neuronY + decayRadius;
    const pathD = `M ${decayStartX} ${decayStartY} Q ${neuronX + 50} ${controlY} ${neuronX} ${controlY} Q ${neuronX - 50} ${controlY} ${decayEndX} ${decayEndY}`;

    svg.appendChild(createPath(pathD, 'blue', 2.5, true));

    // Previous state label on the decay curve
    svg.appendChild(createText(neuronX, controlY + 15, labels.prevState, { fill: 'ForestGreen', fontSize: '16' }));

    // Alpha (decay) label
    svg.appendChild(createText(neuronX - 50, controlY - 8, labels.decay, { fill: 'blue', fontSize: '18' }));

    // Append SVG to container
    container.appendChild(svg);
});
