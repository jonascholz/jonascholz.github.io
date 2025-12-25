document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('squared-relu-plot');

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
    const reluColor = '#0891b2'; // cyan
    const meanColor = '#ef4444'; // red
    const axisColor = '#666';
    const gridColor = '#e5e7eb';

    // Generate (ReLU(x))² data
    const numPoints = 100;
    const reluData = [];
    for (let i = 0; i <= numPoints; i++) {
        const x = -1 + (2 * i / numPoints); // Range from -1 to 1
        const reluX = Math.max(0, x); // ReLU(x)
        const y = reluX * reluX; // (ReLU(x))²
        reluData.push({ x, y });
    }

    // Calculate mean of (ReLU(x))² outputs for inputs in [-1, 1]
    // For uniform distribution in [-1, 1]:
    // - Half the inputs (-1 to 0) output 0
    // - Half the inputs (0 to 1) output x² with mean 1/3
    // Overall mean = 0.5 * 0 + 0.5 * (1/3) = 1/6
    const meanValue = 1/6;

    // Scales
    const minX = -1;
    const maxX = 1;
    const minY = 0;
    const maxY = 1;
    const xScale = (x) => margin.left + ((x - minX) / (maxX - minX)) * plotWidth;
    const yScale = (y) => margin.top + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;

    // Create a group for the plot area
    const plotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Add background
    svg.appendChild(createRect(0, 0, width, height, '#ffffff'));

    // Draw grid lines (horizontal)
    const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    yTicks.forEach(tick => {
        const y = yScale(tick);
        plotGroup.appendChild(createLine(margin.left, y, margin.left + plotWidth, y, gridColor, 1, '4,4'));
    });

    // Draw grid lines (vertical)
    const xTicksGrid = [-1, -0.5, 0, 0.5, 1.0];
    xTicksGrid.forEach(tick => {
        const x = xScale(tick);
        plotGroup.appendChild(createLine(x, margin.top, x, margin.top + plotHeight, gridColor, 1, '4,4'));
    });

    // Draw axes
    plotGroup.appendChild(createLine(margin.left, margin.top, margin.left, margin.top + plotHeight, axisColor, 2));
    plotGroup.appendChild(createLine(margin.left, margin.top + plotHeight, margin.left + plotWidth, margin.top + plotHeight, axisColor, 2));

    // X-axis ticks and labels
    xTicksGrid.forEach(tick => {
        const x = xScale(tick);
        plotGroup.appendChild(createLine(x, margin.top + plotHeight, x, margin.top + plotHeight + 6, axisColor, 2));
        plotGroup.appendChild(createText(x, margin.top + plotHeight + 25, tick.toFixed(1), {
            fill: axisColor,
            fontSize: '12'
        }));
    });

    // X-axis label
    plotGroup.appendChild(createText(
        margin.left + plotWidth / 2,
        height - 10,
        'Input Value',
        { fill: axisColor, fontSize: '16', fontWeight: 'bold' }
    ));

    // Y-axis ticks and labels
    yTicks.forEach(tick => {
        const y = yScale(tick);
        plotGroup.appendChild(createLine(margin.left - 6, y, margin.left, y, axisColor, 2));
        plotGroup.appendChild(createText(
            margin.left - 15,
            y,
            tick.toFixed(1),
            { anchor: 'end', fill: axisColor, fontSize: '12' }
        ));
    });

    // Y-axis label
    const yLabelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    yLabelGroup.setAttribute('transform', `translate(20, ${margin.top + plotHeight / 2}) rotate(-90)`);
    yLabelGroup.appendChild(createText(
        0, 0,
        'Output',
        { fill: axisColor, fontSize: '16', fontWeight: 'bold' }
    ));
    plotGroup.appendChild(yLabelGroup);

    // Draw (ReLU(x))² curve
    const reluPath = reluData.map((d, i) => {
        const x = xScale(d.x);
        const y = yScale(d.y);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    plotGroup.appendChild(createPath(reluPath, reluColor, 3));

    // Draw mean value line
    const meanY = yScale(meanValue);
    plotGroup.appendChild(createLine(margin.left, meanY, margin.left + plotWidth, meanY, meanColor, 2, '8,4'));
    plotGroup.appendChild(createText(
        margin.left + plotWidth + 10,
        meanY,
        'Mean',
        { anchor: 'start', fill: meanColor, fontSize: '11', fontStyle: 'italic' }
    ));

    // Legend
    const legendX = margin.left + plotWidth + 20;
    const legendY = margin.top + 60;
    const legendSpacing = 30;

    // (ReLU(x))² legend
    plotGroup.appendChild(createLine(legendX, legendY, legendX + 30, legendY, reluColor, 3));
    plotGroup.appendChild(createText(legendX + 40, legendY, '(ReLU(x))²', {
        anchor: 'start',
        baseline: 'middle',
        fill: reluColor,
        fontSize: '14',
        fontWeight: 'bold'
    }));

    // Mean legend
    plotGroup.appendChild(createLine(legendX, legendY + legendSpacing, legendX + 30, legendY + legendSpacing, meanColor, 2, '8,4'));
    plotGroup.appendChild(createText(legendX + 40, legendY + legendSpacing, 'Mean ≈ 0.17', {
        anchor: 'start',
        baseline: 'middle',
        fill: meanColor,
        fontSize: '14',
        fontWeight: 'bold'
    }));

    svg.appendChild(plotGroup);
    container.appendChild(svg);
});
