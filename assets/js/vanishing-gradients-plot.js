document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('vanishing-gradients-plot');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    // SVG dimensions
    const width = 700;
    const height = 400;
    const margin = { top: 40, right: 150, bottom: 60, left: 80 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '700px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    // Helper functions
    function createLine(x1, y1, x2, y2, color, strokeWidth = 2, dashArray = null) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        if (dashArray) {
            line.setAttribute('stroke-dasharray', dashArray);
        }
        return line;
    }

    function createPath(d, strokeColor, strokeWidth = 2, fillColor = 'none') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', fillColor);
        return path;
    }

    function createText(x, y, text, options = {}) {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        textEl.setAttribute('text-anchor', options.anchor || 'middle');
        textEl.setAttribute('dominant-baseline', options.baseline || 'middle');
        textEl.setAttribute('font-family', options.fontFamily || 'sans-serif');
        textEl.setAttribute('font-size', options.fontSize || '14');
        textEl.setAttribute('font-weight', options.fontWeight || 'normal');
        textEl.setAttribute('fill', options.fill || '#333');
        if (options.fontStyle) {
            textEl.setAttribute('font-style', options.fontStyle);
        }
        textEl.textContent = text;
        return textEl;
    }

    function createRect(x, y, w, h, fillColor, strokeColor = null, strokeWidth = 0) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', w);
        rect.setAttribute('height', h);
        rect.setAttribute('fill', fillColor);
        if (strokeColor) {
            rect.setAttribute('stroke', strokeColor);
            rect.setAttribute('stroke-width', strokeWidth);
        }
        return rect;
    }

    // Colors
    const vanishingColor = '#3b82f6'; // blue
    const explodingColor = '#ef4444'; // red
    const axisColor = '#666';
    const gridColor = '#e5e7eb';

    // Data parameters
    const numLayers = 10;
    const vanishingFactor = 0.8;  // Each layer multiplies gradient by 0.8
    const explodingFactor = 1.25; // Each layer multiplies gradient by 1.25

    // Generate data
    const vanishingData = [];
    const explodingData = [];

    for (let layer = 0; layer <= numLayers; layer++) {
        vanishingData.push({
            x: layer,
            y: Math.pow(vanishingFactor, layer)
        });
        explodingData.push({
            x: layer,
            y: Math.pow(explodingFactor, layer)
        });
    }

    // Scales
    const xScale = (x) => margin.left + (x / numLayers) * plotWidth;
    const maxY = 11;  // Fixed y-axis limit
    const minY = 0;
    const yScale = (y) => margin.top + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;

    // Create a group for the plot area
    const plotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Add background
    svg.appendChild(createRect(0, 0, width, height, '#ffffff'));

    // Draw grid lines (horizontal)
    const yTicks = [0, 2, 4, 6, 8, 10];
    yTicks.forEach(tick => {
        const y = yScale(tick);
        if (y >= margin.top && y <= margin.top + plotHeight) {
            plotGroup.appendChild(createLine(margin.left, y, margin.left + plotWidth, y, gridColor, 1, '4,4'));
        }
    });

    // Draw axes
    plotGroup.appendChild(createLine(margin.left, margin.top, margin.left, margin.top + plotHeight, axisColor, 2));
    plotGroup.appendChild(createLine(margin.left, margin.top + plotHeight, margin.left + plotWidth, margin.top + plotHeight, axisColor, 2));

    // X-axis ticks and labels
    for (let i = 0; i <= 4; i++) {
        const x = margin.left + (i / 4) * plotWidth;
        const layer = Math.round((i / 4) * numLayers);

        plotGroup.appendChild(createLine(x, margin.top + plotHeight, x, margin.top + plotHeight + 6, axisColor, 2));
        plotGroup.appendChild(createText(x, margin.top + plotHeight + 25, layer.toString(), {
            fill: axisColor,
            fontSize: '12'
        }));
    }

    // X-axis label
    plotGroup.appendChild(createText(
        margin.left + plotWidth / 2,
        height - 10,
        'Number of Layers',
        { fill: axisColor, fontSize: '16', fontWeight: 'bold' }
    ));

    // Y-axis ticks and labels
    yTicks.forEach(tick => {
        const y = yScale(tick);
        if (y >= margin.top && y <= margin.top + plotHeight) {
            plotGroup.appendChild(createLine(margin.left - 6, y, margin.left, y, axisColor, 2));
            plotGroup.appendChild(createText(
                margin.left - 15,
                y,
                tick.toString(),
                { anchor: 'end', fill: axisColor, fontSize: '12' }
            ));
        }
    });

    // Y-axis label
    const yLabelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    yLabelGroup.setAttribute('transform', `translate(20, ${margin.top + plotHeight / 2}) rotate(-90)`);
    yLabelGroup.appendChild(createText(
        0, 0,
        'Gradient Magnitude',
        { fill: axisColor, fontSize: '16', fontWeight: 'bold' }
    ));
    plotGroup.appendChild(yLabelGroup);

    // Draw vanishing gradient line
    const vanishingPath = vanishingData.map((d, i) => {
        const x = xScale(d.x);
        const y = yScale(d.y);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    plotGroup.appendChild(createPath(vanishingPath, vanishingColor, 3));

    // Draw exploding gradient line
    const explodingPath = explodingData.map((d, i) => {
        const x = xScale(d.x);
        const y = yScale(d.y);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    plotGroup.appendChild(createPath(explodingPath, explodingColor, 3));

    // Reference line at y=1
    const y1 = yScale(1);
    plotGroup.appendChild(createLine(margin.left, y1, margin.left + plotWidth, y1, '#000', 1.5, '8,4'));
    plotGroup.appendChild(createText(
        margin.left + plotWidth + 10,
        y1,
        'Initial',
        { anchor: 'start', fill: '#000', fontSize: '11', fontStyle: 'italic' }
    ));

    // Legend
    const legendX = margin.left + plotWidth + 20;
    const legendY = margin.top + 60;
    const legendSpacing = 30;

    // Vanishing legend
    plotGroup.appendChild(createLine(legendX, legendY, legendX + 30, legendY, vanishingColor, 3));
    plotGroup.appendChild(createText(legendX + 40, legendY, 'Vanishing', {
        anchor: 'start',
        baseline: 'middle',
        fill: vanishingColor,
        fontSize: '14',
        fontWeight: 'bold'
    }));

    // Exploding legend
    plotGroup.appendChild(createLine(legendX, legendY + legendSpacing, legendX + 30, legendY + legendSpacing, explodingColor, 3));
    plotGroup.appendChild(createText(legendX + 40, legendY + legendSpacing, 'Exploding', {
        anchor: 'start',
        baseline: 'middle',
        fill: explodingColor,
        fontSize: '14',
        fontWeight: 'bold'
    }));

    svg.appendChild(plotGroup);
    container.appendChild(svg);
});
