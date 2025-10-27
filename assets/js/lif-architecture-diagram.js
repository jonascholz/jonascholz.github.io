document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('lif-architecture-diagram');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    // SVG dimensions
    const width = 800;
    const height = 400;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '800px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    // Helper functions
    function createRect(x, y, width, height, fillColor = 'white', strokeColor = '#333', strokeWidth = 2, rx = 0) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', fillColor);
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', strokeWidth);
        if (rx > 0) {
            rect.setAttribute('rx', rx);
            rect.setAttribute('ry', rx);
        }
        return rect;
    }

    function createText(x, y, text, options = {}) {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        textEl.setAttribute('text-anchor', options.anchor || 'middle');
        textEl.setAttribute('font-family', options.fontFamily || 'monospace');
        textEl.setAttribute('font-size', options.fontSize || '14');
        textEl.setAttribute('font-weight', options.fontWeight || 'normal');
        textEl.setAttribute('fill', options.fill || '#333');
        if (options.fontStyle) {
            textEl.setAttribute('font-style', options.fontStyle);
        }
        textEl.textContent = text;
        return textEl;
    }

    function createLine(x1, y1, x2, y2, color = '#333', strokeWidth = 2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        return line;
    }

    // Main LIF container
    const lifX = 50;
    const lifY = 50;
    const lifWidth = 300;
    const lifHeight = 300;

    // Draw main LIF box
    svg.appendChild(createRect(lifX, lifY, lifWidth, lifHeight, '#f9f9f9', '#333', 3, 8));
    svg.appendChild(createText(lifX + lifWidth / 2, lifY + 25, 'LIF Neuron', {
        fontSize: '18',
        fontWeight: 'bold'
    }));

    // Parameters box (inside LIF)
    const paramX = lifX + 20;
    const paramY = lifY + 50;
    const paramWidth = lifWidth - 40;
    const paramHeight = 100;

    svg.appendChild(createRect(paramX, paramY, paramWidth, paramHeight, '#e3f2fd', '#2196f3', 2, 5));
    svg.appendChild(createText(paramX + paramWidth / 2, paramY + 20, 'Parameters', {
        fontSize: '14',
        fontWeight: 'bold',
        fill: '#1976d2'
    }));

    // Parameter items
    const paramItems = [
        { label: 'α (decay)', color: 'blue' },
        { label: 'w (weight)', color: 'red' },
        { label: 'θ (threshold)', color: 'brown' }
    ];

    paramItems.forEach((item, i) => {
        const itemY = paramY + 45 + i * 20;
        svg.appendChild(createText(paramX + 20, itemY, item.label, {
            fontSize: '13',
            anchor: 'start',
            fill: item.color
        }));
    });

    // State box (inside LIF)
    const stateX = lifX + 20;
    const stateY = paramY + paramHeight + 20;
    const stateWidth = paramWidth;
    const stateHeight = 100;

    svg.appendChild(createRect(stateX, stateY, stateWidth, stateHeight, '#e8f5e9', '#4caf50', 2, 5));
    svg.appendChild(createText(stateX + stateWidth / 2, stateY + 20, 'State', {
        fontSize: '14',
        fontWeight: 'bold',
        fill: '#2e7d32'
    }));

    // State items
    const stateItems = [
        { label: 'u[t] (membrane potential)', color: 'ForestGreen' },
        { label: 's[t] (spike output)', color: 'orange' }
    ];

    stateItems.forEach((item, i) => {
        const itemY = stateY + 45 + i * 20;
        svg.appendChild(createText(stateX + 20, itemY, item.label, {
            fontSize: '13',
            anchor: 'start',
            fill: item.color
        }));
    });

    // Step function box (separate, to the right)
    const stepX = lifX + lifWidth + 80;
    const stepY = lifY + 80;
    const stepWidth = 280;
    const stepHeight = 200;

    svg.appendChild(createRect(stepX, stepY, stepWidth, stepHeight, '#fff3e0', '#ff9800', 3, 8));
    svg.appendChild(createText(stepX + stepWidth / 2, stepY + 25, 'Step Function', {
        fontSize: '16',
        fontWeight: 'bold',
        fill: '#e65100'
    }));

    // Step function content
    svg.appendChild(createText(stepX + 20, stepY + 60, 'def step(params, state, x):', {
        fontSize: '12',
        anchor: 'start',
        fontFamily: 'Courier New, monospace',
        fill: '#333'
    }));

    const stepLines = [
        '    # Update membrane potential',
        '    u = α·u[t-1] + w·x[t]',
        '',
        '    # Generate spike',
        '    s = Θ(u - θ)',
        '',
        '    return state, s'
    ];

    stepLines.forEach((line, i) => {
        const lineY = stepY + 85 + i * 16;
        svg.appendChild(createText(stepX + 20, lineY, line, {
            fontSize: '11',
            anchor: 'start',
            fontFamily: 'Courier New, monospace',
            fill: line.trim().startsWith('#') ? '#666' : '#333'
        }));
    });

    // Arrow from LIF to Step function
    const arrowStartX = lifX + lifWidth;
    const arrowY = lifY + lifHeight / 2; // Use same Y for horizontal arrow
    const arrowEndX = stepX;

    // Draw arrow line
    svg.appendChild(createLine(arrowStartX, arrowY, arrowEndX, arrowY, '#666', 2));

    // Draw arrow head
    const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowHead.setAttribute('points', `${arrowEndX},${arrowY} ${arrowEndX - 10},${arrowY - 6} ${arrowEndX - 10},${arrowY + 6}`);
    arrowHead.setAttribute('fill', '#666');
    svg.appendChild(arrowHead);

    // Arrow label
    svg.appendChild(createText((arrowStartX + arrowEndX) / 2, arrowY - 10, 'uses', {
        fontSize: '12',
        fill: '#666',
        fontStyle: 'italic'
    }));

    // Return arrow from Step function back to LIF
    const returnArrowStartX = stepX;
    const returnArrowY = arrowY + 40; // Offset below the forward arrow
    const returnArrowEndX = lifX + lifWidth;

    // Draw return arrow line
    svg.appendChild(createLine(returnArrowStartX, returnArrowY, returnArrowEndX, returnArrowY, '#666', 2));

    // Return arrow head
    const returnArrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    returnArrowHead.setAttribute('points', `${returnArrowEndX},${returnArrowY} ${returnArrowEndX + 10},${returnArrowY - 6} ${returnArrowEndX + 10},${returnArrowY + 6}`);
    returnArrowHead.setAttribute('fill', '#666');
    svg.appendChild(returnArrowHead);

    // Return arrow label
    svg.appendChild(createText((returnArrowStartX + returnArrowEndX) / 2, returnArrowY + 15, 'updates', {
        fontSize: '12',
        fill: '#666',
        fontStyle: 'italic'
    }));

    // Append SVG to container
    container.appendChild(svg);
});
