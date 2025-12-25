document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('self-information-plot');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    const curveColor = '#1f77b4'; // Muted blue

    // SVG dimensions
    const width = 600;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '600px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    // Helper functions
    function createPath(d, stroke, strokeWidth = 2) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', stroke);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
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
        textEl.textContent = text;
        return textEl;
    }

    // Scale functions
    function scaleX(p) {
        // p ranges from 0 to 1
        return margin.left + p * plotWidth;
    }

    function scaleY(info) {
        // info ranges from 0 to ~10 (we'll cap the display)
        const maxInfo = 10;
        const clampedInfo = Math.min(info, maxInfo);
        return margin.top + plotHeight - (clampedInfo / maxInfo) * plotHeight;
    }

    // Self-information function: I(p) = -log2(p) = log2(1/p)
    function selfInformation(p) {
        if (p <= 0) return Infinity;
        return -Math.log2(p);
    }

    // Generate data points (from 0.01 to 1)
    const pRange = [];
    for (let p = 0.01; p <= 1; p += 0.01) {
        pRange.push(p);
    }

    // Draw axes
    svg.appendChild(createLine(margin.left, margin.top + plotHeight, margin.left + plotWidth, margin.top + plotHeight, '#999', 2));
    svg.appendChild(createLine(margin.left, margin.top, margin.left, margin.top + plotHeight, '#999', 2));

    // Draw self-information curve
    let pathD = `M ${scaleX(pRange[0])},${scaleY(selfInformation(pRange[0]))}`;
    for (let i = 1; i < pRange.length; i++) {
        pathD += ` L ${scaleX(pRange[i])},${scaleY(selfInformation(pRange[i]))}`;
    }
    svg.appendChild(createPath(pathD, curveColor, 3));

    // X-axis labels (probability)
    svg.appendChild(createText(margin.left, margin.top + plotHeight + 20, '0', { fontSize: '12', anchor: 'middle' }));
    svg.appendChild(createText(margin.left + plotWidth * 0.25, margin.top + plotHeight + 20, '0.25', { fontSize: '12', anchor: 'middle' }));
    svg.appendChild(createText(margin.left + plotWidth * 0.5, margin.top + plotHeight + 20, '0.5', { fontSize: '12', anchor: 'middle' }));
    svg.appendChild(createText(margin.left + plotWidth * 0.75, margin.top + plotHeight + 20, '0.75', { fontSize: '12', anchor: 'middle' }));
    svg.appendChild(createText(margin.left + plotWidth, margin.top + plotHeight + 20, '1', { fontSize: '12', anchor: 'middle' }));

    // X-axis title
    svg.appendChild(createText(margin.left + plotWidth / 2, margin.top + plotHeight + 45, 'Probability p(x)', { fontSize: '14', fill: '#333' }));

    // Y-axis labels (information in bits)
    for (let i = 0; i <= 10; i += 2) {
        const y = scaleY(i);
        svg.appendChild(createText(margin.left - 10, y + 5, i.toString(), { fontSize: '12', anchor: 'end' }));
        // Grid lines
        svg.appendChild(createLine(margin.left, y, margin.left + plotWidth, y, '#e0e0e0', 1));
    }

    // Y-axis title
    const yAxisTitle = createText(20, margin.top + plotHeight / 2, 'Self-information I(x) [bits]', { fontSize: '14', fill: '#333', anchor: 'middle' });
    yAxisTitle.setAttribute('transform', `rotate(-90, 20, ${margin.top + plotHeight / 2})`);
    svg.appendChild(yAxisTitle);

    // Title
    svg.appendChild(createText(width / 2, 25, 'Self-information vs Probability', { fontSize: '16', fill: '#333' }));

    // Append SVG to container
    container.appendChild(svg);
});
