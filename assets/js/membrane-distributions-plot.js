document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('membrane-distributions-plot');

    if (!container) {
        return;
    }

    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const panelWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '500px';
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

    var curveColor = '#3B82F6';
    var thetaColor = '#EF4444';
    var areaFill = 'rgba(59, 130, 246, 0.2)';
    var axisColor = '#888';

    var theta = 1;
    var numPoints = 300;
    var xMin = -3;
    var xMax = 3;
    var xTicks = [-2, -1, 0, 1, 2];

    function normalPDF(x, mu, sigma) {
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) *
            Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    }

    var yMax = normalPDF(0, 0, 1) * 1.15;
    var xScale = function (x) { return margin.left + ((x - xMin) / (xMax - xMin)) * panelWidth; };
    var yScale = function (y) { return margin.top + plotHeight - (y / yMax) * plotHeight; };

    // Axes
    svg.appendChild(createLine(margin.left, margin.top, margin.left, margin.top + plotHeight, axisColor, 1.5));
    svg.appendChild(createLine(margin.left, margin.top + plotHeight, margin.left + panelWidth, margin.top + plotHeight, axisColor, 1.5));

    // X-axis ticks
    xTicks.forEach(function (tick) {
        var x = xScale(tick);
        svg.appendChild(createLine(x, margin.top + plotHeight, x, margin.top + plotHeight + 5, axisColor, 1));
        svg.appendChild(createText(x, margin.top + plotHeight + 18, tick.toString(), { fill: axisColor, fontSize: '11' }));
    });

    // Shaded area (U > theta)
    var areaPath = 'M ' + xScale(theta) + ' ' + yScale(0);
    for (var i = 0; i <= numPoints; i++) {
        var x = theta + (xMax - theta) * i / numPoints;
        var y = normalPDF(x, 0, 1);
        areaPath += ' L ' + xScale(x) + ' ' + yScale(y);
    }
    areaPath += ' L ' + xScale(xMax) + ' ' + yScale(0) + ' Z';
    svg.appendChild(createPath(areaPath, 'none', 0, areaFill));

    // Curve
    var curvePath = '';
    for (var i = 0; i <= numPoints; i++) {
        var x = xMin + (xMax - xMin) * i / numPoints;
        var y = normalPDF(x, 0, 1);
        curvePath += (i === 0 ? 'M' : 'L') + ' ' + xScale(x) + ' ' + yScale(y);
    }
    svg.appendChild(createPath(curvePath, curveColor, 2.5));

    // Theta dashed line
    svg.appendChild(createLine(xScale(theta), margin.top, xScale(theta), margin.top + plotHeight, thetaColor, 2, '6,3'));
    svg.appendChild(createText(xScale(theta) + 9, margin.top + 10, 'θ', { fill: thetaColor, fontSize: '15', fontWeight: 'bold' }));

    // Area label
    svg.appendChild(createText(xScale(2.4), margin.top + plotHeight - 33, 'P(U > θ)', { fill: curveColor, fontSize: '12', fontWeight: 'bold' }));

    // X-axis label
    svg.appendChild(createText(margin.left + panelWidth / 2, height - 8, 'Membrane Potential U', { fill: axisColor, fontSize: '12' }));

    container.appendChild(svg);
});
