document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('two-layer-network-diagram');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    // SVG dimensions
    const width = 800;
    const height = 200;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '800px';
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
    defs.appendChild(createArrowMarker('arrowhead-purple-2l', 'purple'));
    defs.appendChild(createArrowMarker('arrowhead-orange-2l', 'orange'));
    defs.appendChild(createArrowMarker('arrowhead-black-2l', '#333'));

    svg.appendChild(defs);

    // Helper functions
    function createLine(x1, y1, x2, y2, color = '#333', strokeWidth = 2, markerId = null) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        if (markerId) {
            line.setAttribute('marker-end', `url(#${markerId})`);
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

    // Positions
    const centerY = 100;
    const neuronRadius = 40;
    const arrowLength = 80;

    // First neuron position
    const neuron1X = 200;
    // Second neuron position
    const neuron2X = 550;

    // Input X[t]
    const inputStartX = 40;
    svg.appendChild(createText(inputStartX, centerY + 5, 'X[t]', { fill: 'purple', fontSize: '18' }));

    // Arrow from X[t] to first neuron
    const arrow1StartX = inputStartX + 45;
    const arrow1EndX = neuron1X - neuronRadius - 5;
    svg.appendChild(createLine(arrow1StartX, centerY, arrow1EndX, centerY, 'purple', 2.5, 'arrowhead-purple-2l'));

    // Wᵢₙ label
    svg.appendChild(createText((arrow1StartX + arrow1EndX) / 2, centerY - 15, 'Wᵢₙ', { fill: 'red', fontSize: '16' }));

    // First neuron circle
    svg.appendChild(createCircle(neuron1X, centerY, neuronRadius, '#f0f8ff', '#333', 2.5));

    // First neuron label U₀[t]
    svg.appendChild(createText(neuron1X, centerY + 5, 'U₀[t]', { fill: 'ForestGreen', fontSize: '18' }));

    // Arrow from first neuron to S₀[t]
    const spike1StartX = neuron1X + neuronRadius + 5;
    const spike1EndX = spike1StartX + 50;
    svg.appendChild(createLine(spike1StartX, centerY, spike1EndX, centerY, 'orange', 2.5, 'arrowhead-orange-2l'));

    // S₀[t] label
    svg.appendChild(createText(spike1EndX + 35, centerY + 5, 'S₀[t]', { fill: 'orange', fontSize: '18' }));

    // Arrow from S₀[t] to second neuron
    const arrow2StartX = spike1EndX + 75;
    const arrow2EndX = neuron2X - neuronRadius - 5;
    svg.appendChild(createLine(arrow2StartX, centerY, arrow2EndX, centerY, '#333', 2.5, 'arrowhead-black-2l'));

    // Wₕ label (h for hidden)
    svg.appendChild(createText((arrow2StartX + arrow2EndX) / 2, centerY - 15, 'Wₕ', { fill: 'red', fontSize: '16' }));

    // Second neuron circle
    svg.appendChild(createCircle(neuron2X, centerY, neuronRadius, '#f0f8ff', '#333', 2.5));

    // Second neuron label U₁[t]
    svg.appendChild(createText(neuron2X, centerY + 5, 'U₁[t]', { fill: 'DarkBlue', fontSize: '18' }));

    // Arrow from second neuron to S₁[t]
    const spike2StartX = neuron2X + neuronRadius + 5;
    const spike2EndX = spike2StartX + 50;
    svg.appendChild(createLine(spike2StartX, centerY, spike2EndX, centerY, 'orange', 2.5, 'arrowhead-orange-2l'));

    // S₁[t] label
    svg.appendChild(createText(spike2EndX + 35, centerY + 5, 'S₁[t]', { fill: 'orange', fontSize: '18' }));

    // Append SVG to container
    container.appendChild(svg);
});
