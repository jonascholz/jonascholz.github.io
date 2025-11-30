document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('surrogate-gradient-plot');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    const sigmoidColor = '#1f77b4'; // Muted blue
    const heavisideColor = '#ff7f0e'; // Safety orange

    // SVG dimensions
    const width = 800;
    const height = 250;
    const margin = { top: 40, right: 40, bottom: 50, left: 50 };
    const plotWidth = (width - margin.left - margin.right - 40) / 2; // 40px gap between plots
    const plotHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '800px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    // Helper functions
    function createPath(d, stroke, strokeWidth = 2, strokeDasharray = '') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', stroke);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        if (strokeDasharray) {
            path.setAttribute('stroke-dasharray', strokeDasharray);
        }
        return path;
    }

    function createLine(x1, y1, x2, y2, stroke = '#000', strokeWidth = 1) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', stroke);
        line.setAttribute('stroke-width', strokeWidth);
        return line;
    }

    function createText(x, y, text, options = {}) {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        textEl.setAttribute('text-anchor', options.anchor || 'middle');
        textEl.setAttribute('font-family', options.fontFamily || 'Arial, sans-serif');
        textEl.setAttribute('font-size', options.fontSize || '14');
        textEl.setAttribute('fill', options.fill || '#333');
        if (options.fontStyle) {
            textEl.setAttribute('font-style', options.fontStyle);
        }
        textEl.textContent = text;
        return textEl;
    }

    // Scale functions
    function scaleX(x, offsetX) {
        return offsetX + ((x + 5) / 10) * plotWidth;
    }

    function scaleY(y) {
        return margin.top + plotHeight - (y / 1.1) * plotHeight;
    }

    // Generate data points
    const xRange = [];
    for (let i = -5; i <= 5; i += 0.1) {
        xRange.push(i);
    }

    // Functions
    const heaviside = (x) => x < 0 ? 0 : 1;
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));
    const sigmoidDeriv = (x) => {
        const s = sigmoid(x);
        return s * (1 - s);
    };

    // Left plot (Functions)
    const leftPlotX = margin.left;

    // Draw axes for left plot
    svg.appendChild(createLine(scaleX(-5, leftPlotX), scaleY(0), scaleX(5, leftPlotX), scaleY(0), '#999', 1));
    svg.appendChild(createLine(scaleX(0, leftPlotX), scaleY(-0.1), scaleX(0, leftPlotX), scaleY(1.1), '#999', 1));

    // Heaviside function (left)
    let pathD = `M ${scaleX(-5, leftPlotX)},${scaleY(0)}`;
    pathD += ` L ${scaleX(0, leftPlotX)},${scaleY(0)}`;
    pathD += ` L ${scaleX(0, leftPlotX)},${scaleY(1)}`;
    pathD += ` L ${scaleX(5, leftPlotX)},${scaleY(1)}`;
    svg.appendChild(createPath(pathD, heavisideColor, 2.5));

    // Sigmoid function (left)
    pathD = `M ${scaleX(xRange[0], leftPlotX)},${scaleY(sigmoid(xRange[0]))}`;
    for (let i = 1; i < xRange.length; i++) {
        pathD += ` L ${scaleX(xRange[i], leftPlotX)},${scaleY(sigmoid(xRange[i]))}`;
    }
    svg.appendChild(createPath(pathD, sigmoidColor, 2.5, '5,5'));

    // Left plot labels
    svg.appendChild(createText(leftPlotX + plotWidth / 2, 25, 'Functions', { fontSize: '16', fill: '#333' }));

    // Right plot (Derivatives)
    const rightPlotX = margin.left + plotWidth + 40;

    // Draw axes for right plot
    svg.appendChild(createLine(scaleX(-5, rightPlotX), scaleY(0), scaleX(5, rightPlotX), scaleY(0), '#999', 1));
    svg.appendChild(createLine(scaleX(0, rightPlotX), scaleY(-0.1), scaleX(0, rightPlotX), scaleY(1.1), '#999', 1));

    // Dirac delta (approximation as vertical line at x=0)
    svg.appendChild(createLine(scaleX(0, rightPlotX), scaleY(0), scaleX(0, rightPlotX), scaleY(1), heavisideColor, 2.5));

    // Sigmoid derivative (right)
    pathD = `M ${scaleX(xRange[0], rightPlotX)},${scaleY(sigmoidDeriv(xRange[0]))}`;
    for (let i = 1; i < xRange.length; i++) {
        pathD += ` L ${scaleX(xRange[i], rightPlotX)},${scaleY(sigmoidDeriv(xRange[i]))}`;
    }
    svg.appendChild(createPath(pathD, sigmoidColor, 2.5, '5,5'));

    // Right plot labels
    svg.appendChild(createText(rightPlotX + plotWidth / 2, 25, 'Derivatives', { fontSize: '16', fill: '#333' }));

    // Legend
    const legendX = width - margin.right - 150;
    const legendY = margin.top + 20;

    // Heaviside legend
    svg.appendChild(createLine(legendX, legendY, legendX + 30, legendY, heavisideColor, 2.5));
    svg.appendChild(createText(legendX + 35, legendY + 5, 'Heaviside (Θ)', { anchor: 'start', fontSize: '12' }));

    // Sigmoid legend
    svg.appendChild(createPath(`M ${legendX},${legendY + 20} L ${legendX + 30},${legendY + 20}`, sigmoidColor, 2.5, '5,5'));
    svg.appendChild(createText(legendX + 35, legendY + 25, 'Sigmoid (σ)', { anchor: 'start', fontSize: '12' }));

    // Append SVG to container
    container.appendChild(svg);
});
