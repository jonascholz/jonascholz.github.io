document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('recurrent-lif-neuron-diagram');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    // SVG dimensions
    const width = 700;
    const height = 450;

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

    defs.appendChild(createArrowMarker('arrowhead-purple', 'purple'));
    defs.appendChild(createArrowMarker('arrowhead-orange', 'orange'));
    defs.appendChild(createArrowMarker('arrowhead-red', 'red'));
    defs.appendChild(createArrowMarker('arrowhead-teal', 'teal'));
    svg.appendChild(defs);

    // Helper functions
    function createLine(x1, y1, x2, y2, color = '#333', strokeWidth = 2, hasArrow = false, opacity = 1, markerOverride = null) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('opacity', opacity);
        if (hasArrow) {
            const markerId = markerOverride || color.toLowerCase();
            line.setAttribute('marker-end', `url(#arrowhead-${markerId})`);
        }
        return line;
    }

    function createPath(d, color = '#333', strokeWidth = 2, hasArrow = false, opacity = 1, markerOverride = null) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', opacity);
        if (hasArrow) {
            const markerId = markerOverride || color.toLowerCase();
            path.setAttribute('marker-end', `url(#arrowhead-${markerId})`);
        }
        return path;
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
    const inputX = 100;
    const neuronX = 350;
    const outputX = 620;
    const neuronRadius = 40;
    const verticalSpacing = 120;
    const startY = 100;

    // Subscript characters
    const subscripts = ['₀', '₁', '₂'];

    // Input positions (3 inputs)
    const inputPositions = [
        { x: inputX, y: startY },
        { x: inputX, y: startY + verticalSpacing },
        { x: inputX, y: startY + verticalSpacing * 2 }
    ];

    // Neuron positions (3 neurons)
    const neuronPositions = [
        { x: neuronX, y: startY },
        { x: neuronX, y: startY + verticalSpacing },
        { x: neuronX, y: startY + verticalSpacing * 2 }
    ];

    // Draw input labels (no incoming arrows)
    inputPositions.forEach((pos, i) => {
        svg.appendChild(createText(pos.x - 35, pos.y + 5, `X${subscripts[i]}[t]`, { fill: 'purple', fontSize: '14', anchor: 'middle' }));
    });

    // Overall input label
    svg.appendChild(createText(inputX - 35, startY - 30, 'X[t]', { fill: 'purple', fontSize: '18' }));

    // Draw connections from inputs to neurons (full connectivity)
    const connectionStartX = inputX - 10;
    const connectionEndX = neuronX - neuronRadius - 5;
    inputPositions.forEach((inputPos) => {
        neuronPositions.forEach((neuronPos) => {
            svg.appendChild(createLine(connectionStartX, inputPos.y, connectionEndX, neuronPos.y, 'red', 2.5, true, 1));
        });
    });

    // Weight label (W_in) - centered on actual arrow positions
    svg.appendChild(createText((connectionStartX + connectionEndX) / 2, startY - 35, 'Wᵢₙ', { fill: 'red', fontSize: '20' }));

    // Define output arrow end position (used by both output arrows and recurrent connections)
    const arrowEndX = outputX - 70;

    // Draw recurrent connections (before neurons so they appear behind)
    // Each neuron connects to all OTHER neurons (no self-connections)
    const recurrentColor = 'teal'; // Teal
    neuronPositions.forEach((fromNeuron, i) => {
        neuronPositions.forEach((toNeuron, j) => {
            if (i !== j) {
                const isAdjacent = Math.abs(i - j) === 1;

                if (isAdjacent) {
                    // Adjacent neurons: straight connections with horizontal offset
                    let startX, startY, endX, endY;
                    const horizontalOffset = 8;
                    const arrowTipOffset = 3;

                    if (i < j) {
                        // Going down: offset to the right
                        startX = fromNeuron.x + horizontalOffset;
                        startY = fromNeuron.y + neuronRadius;
                        endX = toNeuron.x + horizontalOffset;
                        endY = toNeuron.y - neuronRadius - arrowTipOffset;
                    } else {
                        // Going up: offset to the left
                        startX = fromNeuron.x - horizontalOffset;
                        startY = fromNeuron.y - neuronRadius;
                        endX = toNeuron.x - horizontalOffset;
                        endY = toNeuron.y + neuronRadius + arrowTipOffset;
                    }

                    svg.appendChild(createLine(startX, startY, endX, endY, recurrentColor, 2, true, 1.0, 'teal'));
                } else {
                    // Non-adjacent neurons: connect via right side
                    const dy = toNeuron.y - fromNeuron.y;
                    const distance = Math.abs(dy);

                    // Start point on right side of source neuron
                    const verticalOffsetFactor = (i < j) ? -0.1 : 0.1;
                    const startAngle = Math.atan2(dy, distance) * verticalOffsetFactor;
                    const startX = fromNeuron.x + neuronRadius;
                    const startY = fromNeuron.y + neuronRadius * Math.sin(startAngle);

                    // End point on right side of target neuron
                    const endAngle = Math.atan2(-dy, distance) * verticalOffsetFactor;
                    const endX = toNeuron.x + neuronRadius;
                    const endY = toNeuron.y + neuronRadius * Math.sin(endAngle);

                    // Control point - different offsets for bidirectional separation
                    const curveOffset = (i < j) ? 160 : 100;
                    const controlX = neuronX + neuronRadius + curveOffset;
                    const controlY = (startY + endY) / 2;

                    const pathD = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;
                    svg.appendChild(createPath(pathD, recurrentColor, 2, true, 1.0, 'teal'));
                }
            }
        });
    });

    // Recurrent weight label (moved up by ~40% of plot height)
    svg.appendChild(createText(neuronX + neuronRadius + 60, startY + verticalSpacing * 0.2, 'Wᵣₑ꜀', { fill: recurrentColor, fontSize: '18' }));

    // Draw neurons (on top of recurrent connections)
    neuronPositions.forEach((pos, i) => {
        svg.appendChild(createCircle(pos.x, pos.y, neuronRadius, '#f0f8ff', '#333', 2.5));
        svg.appendChild(createText(pos.x, pos.y + 5, `U${subscripts[i]}[t]`, { fill: 'ForestGreen', fontSize: '16' }));
    });

    // Overall neuron label
    svg.appendChild(createText(neuronX, startY - 50, 'U[t]', { fill: 'ForestGreen', fontSize: '18' }));

    // Draw output arrows and labels
    neuronPositions.forEach((neuronPos, i) => {
        const startX = neuronPos.x + neuronRadius + 5;
        svg.appendChild(createLine(startX, neuronPos.y, arrowEndX, neuronPos.y, 'orange', 2, true));
        svg.appendChild(createText(arrowEndX + 30, neuronPos.y + 5, `S${subscripts[i]}[t]`, { fill: 'orange', fontSize: '14', anchor: 'middle' }));
    });

    // Overall output label
    svg.appendChild(createText(arrowEndX + 30, startY - 50, 'S[t]', { fill: 'orange', fontSize: '18' }));

    // Append SVG to container
    container.appendChild(svg);
});
