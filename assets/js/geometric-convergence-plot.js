document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('geometric-convergence-plot');
    if (!container) return;

    var width = 700;
    var height = 380;
    var margin = { top: 30, right: 160, bottom: 60, left: 65 };
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.style.maxWidth = '700px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    function createLine(x1, y1, x2, y2, color, strokeWidth, dashArray) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth || 2);
        if (dashArray) line.setAttribute('stroke-dasharray', dashArray);
        return line;
    }

    function createPath(d, stroke, strokeWidth) {
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', stroke);
        path.setAttribute('stroke-width', strokeWidth || 2);
        path.setAttribute('fill', 'none');
        return path;
    }

    function createText(x, y, text, opts) {
        opts = opts || {};
        var el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        el.setAttribute('x', x); el.setAttribute('y', y);
        el.setAttribute('text-anchor', opts.anchor || 'middle');
        el.setAttribute('dominant-baseline', opts.baseline || 'middle');
        el.setAttribute('font-family', 'sans-serif');
        el.setAttribute('font-size', opts.fontSize || '13');
        el.setAttribute('font-weight', opts.fontWeight || 'normal');
        el.setAttribute('fill', opts.fill || '#333');
        el.textContent = text;
        return el;
    }

    function createRect(x, y, w, h, fill) {
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x); rect.setAttribute('y', y);
        rect.setAttribute('width', w); rect.setAttribute('height', h);
        rect.setAttribute('fill', fill);
        return rect;
    }

    var axisColor = '#666';
    var gridColor = '#e5e7eb';

    // alpha values and corresponding blue shades
    var series = [
        { alpha: 0.70, color: '#bfdbfe', label: '\u03b1 = 0.70' },
        { alpha: 0.80, color: '#93c5fd', label: '\u03b1 = 0.80' },
        { alpha: 0.90, color: '#3b82f6', label: '\u03b1 = 0.90' },
        { alpha: 0.95, color: '#1d4ed8', label: '\u03b1 = 0.95' },
        { alpha: 0.99, color: '#1e1b4b', label: '\u03b1 = 0.99' },
    ];

    var tMax = 100;
    var xScale = function (t) { return margin.left + (t / tMax) * plotWidth; };
    var yScale = function (v) { return margin.top + plotHeight - v * plotHeight; };

    svg.appendChild(createRect(0, 0, width, height, '#ffffff'));

    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Grid
    [0, 0.25, 0.5, 0.75, 1.0].forEach(function (v) {
        g.appendChild(createLine(margin.left, yScale(v), margin.left + plotWidth, yScale(v), gridColor, 1, '4,4'));
    });

    // Axes
    g.appendChild(createLine(margin.left, margin.top, margin.left, margin.top + plotHeight, axisColor, 2));
    g.appendChild(createLine(margin.left, margin.top + plotHeight, margin.left + plotWidth, margin.top + plotHeight, axisColor, 2));

    // X ticks
    [0, 20, 40, 60, 80, 100].forEach(function (t) {
        var x = xScale(t);
        g.appendChild(createLine(x, margin.top + plotHeight, x, margin.top + plotHeight + 5, axisColor, 1));
        g.appendChild(createText(x, margin.top + plotHeight + 18, String(t), { fill: axisColor, fontSize: '12' }));
    });

    // X label
    g.appendChild(createText(margin.left + plotWidth / 2, height - 8, 'timestep t', { fill: axisColor, fontSize: '14', fontWeight: 'bold' }));

    // Y ticks
    [0, 0.25, 0.5, 0.75, 1.0].forEach(function (v) {
        var y = yScale(v);
        g.appendChild(createLine(margin.left - 5, y, margin.left, y, axisColor, 1));
        g.appendChild(createText(margin.left - 10, y, v.toFixed(2), { anchor: 'end', fill: axisColor, fontSize: '12' }));
    });

    // Y label
    var yLabelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    yLabelG.setAttribute('transform', 'translate(15,' + (margin.top + plotHeight / 2) + ') rotate(-90)');
    yLabelG.appendChild(createText(0, 0, 'fraction of asymptotic mean', { fill: axisColor, fontSize: '13', fontWeight: 'bold' }));
    g.appendChild(yLabelG);

    // Curves: convergence of mean = 1 - alpha^t
    series.forEach(function (s) {
        var pts = [];
        for (var t = 1; t <= tMax; t++) {
            var v = 1 - Math.pow(s.alpha, t);
            pts.push((t === 1 ? 'M' : 'L') + ' ' + xScale(t).toFixed(2) + ' ' + yScale(v).toFixed(2));
        }
        g.appendChild(createPath(pts.join(' '), s.color, 2.5));
    });

    // Legend
    var lx = margin.left + plotWidth + 15;
    var ly = margin.top + 20;
    series.forEach(function (s, i) {
        var y = ly + i * 28;
        g.appendChild(createLine(lx, y, lx + 25, y, s.color, 2.5));
        g.appendChild(createText(lx + 32, y, s.label, { anchor: 'start', fill: s.color, fontSize: '13', fontWeight: 'bold' }));
    });

    svg.appendChild(g);
    container.appendChild(svg);
});
