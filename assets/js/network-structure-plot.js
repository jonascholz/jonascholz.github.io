function drawNetworkStructure(containerId, options) {
    options = options || {};
    var showSkips = options.showSkips || false;

    var container = document.getElementById(containerId);
    if (!container) return;

    var width = 700;
    var height = showSkips ? 310 : 280;

    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.style.maxWidth = '700px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    function createCircle(cx, cy, r, fill, stroke, strokeWidth) {
        var c = document.createElementNS(ns, 'circle');
        c.setAttribute('cx', cx);
        c.setAttribute('cy', cy);
        c.setAttribute('r', r);
        c.setAttribute('fill', fill || 'white');
        c.setAttribute('stroke', stroke || '#333');
        c.setAttribute('stroke-width', strokeWidth || 2);
        return c;
    }

    function createLine(x1, y1, x2, y2, color, strokeWidth, dashArray) {
        var line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color || '#999');
        line.setAttribute('stroke-width', strokeWidth || 1.5);
        if (dashArray) line.setAttribute('stroke-dasharray', dashArray);
        return line;
    }

    function createText(x, y, text, opts) {
        opts = opts || {};
        var t = document.createElementNS(ns, 'text');
        t.setAttribute('x', x);
        t.setAttribute('y', y);
        t.setAttribute('text-anchor', opts.anchor || 'middle');
        t.setAttribute('font-family', opts.fontFamily || 'monospace');
        t.setAttribute('font-size', opts.fontSize || '13');
        t.setAttribute('font-weight', opts.fontWeight || 'normal');
        t.setAttribute('fill', opts.fill || '#333');
        t.textContent = text;
        return t;
    }

    function createPath(d, stroke, strokeWidth, fill, dashArray) {
        var path = document.createElementNS(ns, 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', stroke || '#333');
        path.setAttribute('stroke-width', strokeWidth || 2);
        path.setAttribute('fill', fill || 'none');
        if (dashArray) path.setAttribute('stroke-dasharray', dashArray);
        return path;
    }

    // Layout
    var neuronR = 14;
    var layerX = [90, 230, 370, 510, 610];
    var layerLabels = ['Input\ncurrent', 'Input\nlayer', 'Hidden\nlayer 1', 'Hidden\nlayer 2', 'Output\nlayer'];
    var layerCounts = [3, 3, 4, 4, 2];
    var topY = 40;
    var botY = 230;

    function neuronPositions(layerIdx) {
        var count = layerCounts[layerIdx];
        var x = layerX[layerIdx];
        var positions = [];
        var totalHeight = botY - topY;
        var spacing = count > 1 ? totalHeight / (count - 1) : 0;
        var startY = count > 1 ? topY : (topY + botY) / 2;
        for (var i = 0; i < count; i++) {
            positions.push({ x: x, y: startY + i * spacing });
        }
        return positions;
    }

    var allPositions = layerCounts.map(function (_, i) { return neuronPositions(i); });

    // Input current -> Input layer: 1:1 connections
    for (var i = 0; i < layerCounts[0]; i++) {
        var from = allPositions[0][i];
        var to = allPositions[1][i];
        svg.appendChild(createLine(from.x + neuronR, from.y, to.x - neuronR, to.y, '#7b1fa2', 2));
    }

    // Fully connected layers
    for (var layer = 1; layer < layerX.length - 1; layer++) {
        var fromPositions = allPositions[layer];
        var toPositions = allPositions[layer + 1];
        for (var fi = 0; fi < fromPositions.length; fi++) {
            for (var tj = 0; tj < toPositions.length; tj++) {
                svg.appendChild(createLine(
                    fromPositions[fi].x + neuronR, fromPositions[fi].y,
                    toPositions[tj].x - neuronR, toPositions[tj].y,
                    '#999', 1
                ));
            }
        }
    }

    // Draw neurons (on top of FC connections)
    var layerColors = ['#f3e5f5', '#e8eaf6', '#e8f5e9', '#e8f5e9', '#fff3e0'];
    var layerStrokes = ['#7b1fa2', '#3f51b5', '#4caf50', '#4caf50', '#ef6c00'];

    for (var layer = 0; layer < layerX.length; layer++) {
        var positions = allPositions[layer];
        for (var ni = 0; ni < positions.length; ni++) {
            svg.appendChild(createCircle(positions[ni].x, positions[ni].y, neuronR, layerColors[layer], layerStrokes[layer], 2));
        }
    }

    // Skip connections: drawn on top of neurons
    if (showSkips) {
        var skipColor = '#e91e63';
        for (var layer = 1; layer < layerX.length - 2; layer++) {
            var srcPositions = allPositions[layer];
            var dstPositions = allPositions[layer + 1];
            var minCount = Math.min(srcPositions.length, dstPositions.length);
            for (var si = 0; si < minCount; si++) {
                var src = srcPositions[si];
                var dst = dstPositions[si];
                var startX = src.x - neuronR;
                var endX = dst.x - neuronR;
                var arcMidX = (startX + endX) / 2;
                var arcDrop = 30 + si * 10;
                var d = 'M' + startX + ',' + src.y +
                    ' Q' + arcMidX + ',' + (Math.max(src.y, dst.y) + arcDrop) +
                    ' ' + endX + ',' + dst.y;
                svg.appendChild(createPath(d, skipColor, 1.5, 'none', '5,3'));
            }
        }
    }

    // Connection type symbols
    var symbolY = topY - 18;

    // Current waveform symbol between input current and input layer
    (function () {
        var midX = (layerX[0] + layerX[1]) / 2;
        var w = 36;
        var h = 10;
        var startX = midX - w / 2;
        var d = 'M' + startX + ',' + symbolY;
        var steps = 40;
        for (var i = 0; i <= steps; i++) {
            var t = i / steps;
            var px = startX + t * w;
            var py = symbolY - Math.sin(t * Math.PI * 3) * h;
            d += ' L' + px.toFixed(1) + ',' + py.toFixed(1);
        }
        svg.appendChild(createPath(d, '#7b1fa2', 2));
    })();

    // Spike train symbols between FC layers
    for (var layer = 1; layer < layerX.length - 1; layer++) {
        var midX = (layerX[layer] + layerX[layer + 1]) / 2;
        var trainW = 36;
        var spikeH = 14;
        var baseY = symbolY + 4;
        var startX = midX - trainW / 2;
        svg.appendChild(createLine(startX, baseY, startX + trainW, baseY, '#666', 1.5));
        var spikeTimes = [0.1, 0.3, 0.35, 0.6, 0.85];
        for (var s = 0; s < spikeTimes.length; s++) {
            var sx = startX + spikeTimes[s] * trainW;
            svg.appendChild(createLine(sx, baseY, sx, baseY - spikeH, '#666', 1.5));
        }
    }

    // Layer labels at bottom
    for (var layer = 0; layer < layerX.length; layer++) {
        var lines = layerLabels[layer].split('\n');
        for (var li = 0; li < lines.length; li++) {
            svg.appendChild(createText(layerX[layer], botY + 30 + li * 16, lines[li], {
                fontSize: '12',
                fill: '#555'
            }));
        }
    }

    // Skip legend
    if (showSkips) {
        var legendY = botY + 65;
        svg.appendChild(createLine(width / 2 - 50, legendY, width / 2 - 20, legendY, '#e91e63', 1.5, '5,3'));
        svg.appendChild(createText(width / 2 + 20, legendY + 4, 'skip connection', {
            fontSize: '12', fill: '#e91e63', anchor: 'start'
        }));
    }

    container.appendChild(svg);
}

document.addEventListener('DOMContentLoaded', function () {
    drawNetworkStructure('network-structure-plot');
    drawNetworkStructure('network-structure-skips-plot', { showSkips: true });
});
