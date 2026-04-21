document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('spike-probability-plot');

    if (!container) {
        return;
    }

    const width = 700;
    const height = 340;
    const margin = { top: 30, right: 20, bottom: 50, left: 50 };
    const gap = 60;
    const panelWidth = (width - margin.left - margin.right - gap) / 2;
    const plotHeight = height - margin.top - margin.bottom;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '700px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    function createLine(x1, y1, x2, y2, color, strokeWidth, dashArray) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth || 2);
        if (dashArray) line.setAttribute('stroke-dasharray', dashArray);
        return line;
    }

    function createPath(d, strokeColor, strokeWidth, fillColor) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth || 2);
        path.setAttribute('fill', fillColor || 'none');
        return path;
    }

    function createText(x, y, text, options) {
        options = options || {};
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        el.setAttribute('x', x);
        el.setAttribute('y', y);
        el.setAttribute('text-anchor', options.anchor || 'middle');
        el.setAttribute('dominant-baseline', options.baseline || 'middle');
        el.setAttribute('font-family', options.fontFamily || 'sans-serif');
        el.setAttribute('font-size', options.fontSize || '13');
        el.setAttribute('font-weight', options.fontWeight || 'normal');
        el.setAttribute('fill', options.fill || '#333');
        if (options.fontStyle) el.setAttribute('font-style', options.fontStyle);
        el.textContent = text;
        return el;
    }

    // Colors
    var curveColor = '#3B82F6';
    var thetaColor = '#EF4444';
    var areaFill = 'rgba(59, 130, 246, 0.2)';
    var axisColor = '#888';

    // Shared parameters
    var theta = 1;
    var numPoints = 200;
    var xMin = -2;
    var xMax = 2;
    var xTicks = [-2, -1, 0, 1, 2];

    // Normal PDF
    function normalPDF(x, mu, sigma) {
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) *
            Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    }

    // Shared y-scale: max is the normal peak (~0.399) with padding
    var yMax = normalPDF(0, 0, 1) * 1.15;

    // Helper: build one panel
    function drawPanel(group, panelLeft, title, drawDistribution) {
        var xScale = function (x) { return panelLeft + ((x - xMin) / (xMax - xMin)) * panelWidth; };
        var yScale = function (y) { return margin.top + plotHeight - (y / yMax) * plotHeight; };

        // Axes
        group.appendChild(createLine(panelLeft, margin.top, panelLeft, margin.top + plotHeight, axisColor, 1.5));
        group.appendChild(createLine(panelLeft, margin.top + plotHeight, panelLeft + panelWidth, margin.top + plotHeight, axisColor, 1.5));

        // X-axis ticks
        xTicks.forEach(function (tick) {
            var x = xScale(tick);
            group.appendChild(createLine(x, margin.top + plotHeight, x, margin.top + plotHeight + 5, axisColor, 1));
            group.appendChild(createText(x, margin.top + plotHeight + 18, tick.toString(), { fill: axisColor, fontSize: '11' }));
        });

        // Distribution-specific drawing
        drawDistribution(group, xScale, yScale);

        // Theta dashed line
        group.appendChild(createLine(xScale(theta), margin.top, xScale(theta), margin.top + plotHeight, thetaColor, 2, '6,3'));
        group.appendChild(createText(xScale(theta), margin.top - 5, '\u03B8', { fill: thetaColor, fontSize: '15', fontWeight: 'bold' }));

        // Area label
        group.appendChild(createText(xScale(1.5), margin.top + plotHeight - 9, 'P(y > \u03B8)', { fill: curveColor, fontSize: '12', fontWeight: 'bold' }));

        // Title
        group.appendChild(createText(panelLeft + panelWidth / 2, margin.top - 9, title, { fill: '#333', fontSize: '14', fontWeight: 'bold' }));

        // X-axis label
        group.appendChild(createText(panelLeft + panelWidth / 2, height - 8, 'Membrane Potential y', { fill: axisColor, fontSize: '12' }));
    }

    // --- LEFT PANEL: Normal distribution ---
    var leftGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    drawPanel(leftGroup, margin.left, 'Normal Distribution', function (group, xScale, yScale) {
        // Shaded area: theta to xMax
        var areaPath = 'M ' + xScale(theta) + ' ' + yScale(0);
        for (var i = 0; i <= numPoints; i++) {
            var x = theta + (xMax - theta) * i / numPoints;
            var y = normalPDF(x, 0, 1);
            areaPath += ' L ' + xScale(x) + ' ' + yScale(y);
        }
        areaPath += ' L ' + xScale(xMax) + ' ' + yScale(0) + ' Z';
        group.appendChild(createPath(areaPath, 'none', 0, areaFill));

        // Curve
        var curvePath = '';
        for (var i = 0; i <= numPoints; i++) {
            var x = xMin + (xMax - xMin) * i / numPoints;
            var y = normalPDF(x, 0, 1);
            curvePath += (i === 0 ? 'M' : 'L') + ' ' + xScale(x) + ' ' + yScale(y);
        }
        group.appendChild(createPath(curvePath, curveColor, 2.5));
    });
    svg.appendChild(leftGroup);

    // --- RIGHT PANEL: Uniform distribution U(-2, 2) ---
    var rightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var rightX0 = margin.left + panelWidth + gap;
    var uniformHeight = 1 / (xMax - xMin); // 0.25

    drawPanel(rightGroup, rightX0, 'Uniform Distribution', function (group, xScale, yScale) {
        // Shaded area: theta to xMax
        var areaPath = 'M ' + xScale(theta) + ' ' + yScale(0) +
            ' L ' + xScale(theta) + ' ' + yScale(uniformHeight) +
            ' L ' + xScale(xMax) + ' ' + yScale(uniformHeight) +
            ' L ' + xScale(xMax) + ' ' + yScale(0) + ' Z';
        group.appendChild(createPath(areaPath, 'none', 0, areaFill));

        // Flat line spanning full range
        group.appendChild(createLine(xScale(xMin), yScale(uniformHeight), xScale(xMax), yScale(uniformHeight), curveColor, 2.5));
    });
    svg.appendChild(rightGroup);

    container.appendChild(svg);
});
