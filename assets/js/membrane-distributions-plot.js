document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('membrane-distributions-plot');

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

    var theta = 1;
    var numPoints = 300;
    var xMin = -3;
    var xMax = 3;
    var xTicks = [-2, -1, 0, 1, 2];

    function normalPDF(x, mu, sigma) {
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) *
            Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    }

    // Error function approximation (Abramowitz & Stegun)
    function erf(x) {
        var t = 1 / (1 + 0.3275911 * Math.abs(x));
        var poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
        var result = 1 - poly * Math.exp(-x * x);
        return x >= 0 ? result : -result;
    }

    function normalCDF(x) {
        return 0.5 * (1 + erf(x / Math.sqrt(2)));
    }

    // Skew-normal PDF: f(x; mu, sigma, alpha) = 2/sigma * phi((x-mu)/sigma) * Phi(alpha*(x-mu)/sigma)
    function skewNormalPDF(x, mu, sigma, alpha) {
        var t = (x - mu) / sigma;
        return (2 / sigma) * normalPDF(t, 0, 1) * normalCDF(alpha * t);
    }

    // Shared y-scale based on normal N(0,1) peak
    var yMax = normalPDF(0, 0, 1) * 1.15;

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

        drawDistribution(group, xScale, yScale);

        // Theta dashed line
        group.appendChild(createLine(xScale(theta), margin.top, xScale(theta), margin.top + plotHeight, thetaColor, 2, '6,3'));
        group.appendChild(createText(xScale(theta), margin.top - 5, '\u03B8', { fill: thetaColor, fontSize: '15', fontWeight: 'bold' }));

        // Area label
        group.appendChild(createText(xScale(2.4), margin.top + plotHeight - 21, 'P(U > \u03B8)', { fill: curveColor, fontSize: '12', fontWeight: 'bold' }));

        // Title
        group.appendChild(createText(panelLeft + panelWidth / 2, margin.top - 22, title, { fill: '#333', fontSize: '14', fontWeight: 'bold' }));

        // X-axis label
        group.appendChild(createText(panelLeft + panelWidth / 2, height - 8, 'Membrane Potential U', { fill: axisColor, fontSize: '12' }));
    }

    // --- LEFT PANEL: Normal distribution N(0, 1) ---
    var leftGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    drawPanel(leftGroup, margin.left, 'Normal Distribution', function (group, xScale, yScale) {
        var areaPath = 'M ' + xScale(theta) + ' ' + yScale(0);
        for (var i = 0; i <= numPoints; i++) {
            var x = theta + (xMax - theta) * i / numPoints;
            var y = normalPDF(x, 0, 1);
            areaPath += ' L ' + xScale(x) + ' ' + yScale(y);
        }
        areaPath += ' L ' + xScale(xMax) + ' ' + yScale(0) + ' Z';
        group.appendChild(createPath(areaPath, 'none', 0, areaFill));

        var curvePath = '';
        for (var i = 0; i <= numPoints; i++) {
            var x = xMin + (xMax - xMin) * i / numPoints;
            var y = normalPDF(x, 0, 1);
            curvePath += (i === 0 ? 'M' : 'L') + ' ' + xScale(x) + ' ' + yScale(y);
        }
        group.appendChild(createPath(curvePath, curveColor, 2.5));
    });
    svg.appendChild(leftGroup);

    // --- RIGHT PANEL: Skew-normal (wider, heavy left tail) ---
    // sigma=1.4 makes it wider; alpha=-4 introduces left skew (heavy left tail)
    var rightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var rightX0 = margin.left + panelWidth + gap;
    var skewMu = 0.4;
    var skewSigma = 1.2;
    var skewAlpha = -1.5;

    drawPanel(rightGroup, rightX0, 'Actual Distribution', function (group, xScale, yScale) {
        var areaPath = 'M ' + xScale(theta) + ' ' + yScale(0);
        for (var i = 0; i <= numPoints; i++) {
            var x = theta + (xMax - theta) * i / numPoints;
            var y = skewNormalPDF(x, skewMu, skewSigma, skewAlpha);
            areaPath += ' L ' + xScale(x) + ' ' + yScale(y);
        }
        areaPath += ' L ' + xScale(xMax) + ' ' + yScale(0) + ' Z';
        group.appendChild(createPath(areaPath, 'none', 0, areaFill));

        var curvePath = '';
        for (var i = 0; i <= numPoints; i++) {
            var x = xMin + (xMax - xMin) * i / numPoints;
            var y = skewNormalPDF(x, skewMu, skewSigma, skewAlpha);
            curvePath += (i === 0 ? 'M' : 'L') + ' ' + xScale(x) + ' ' + yScale(y);
        }
        group.appendChild(createPath(curvePath, curveColor, 2.5));
    });
    svg.appendChild(rightGroup);

    container.appendChild(svg);
});
