document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('triangular-surrogate-plot');

    if (!container) {
        return;
    }

    const heavisideColor = '#ff7f0e';
    const surrogateColor = '#1f77b4';

    const width = 800;
    const height = 250;
    const margin = { top: 40, right: 40, bottom: 50, left: 50 };
    const plotWidth = (width - margin.left - margin.right - 40) / 2;
    const plotHeight = height - margin.top - margin.bottom;

    var w = 0.5; // surrogate width

    function createSVG(peakHeight) {
        var xMin = -2, xMax = 2;
        var yMaxScale = 1.2;

        function scaleX(x, offsetX) {
            return offsetX + ((x - xMin) / (xMax - xMin)) * plotWidth;
        }

        function scaleY(y) {
            return margin.top + plotHeight - (y / yMaxScale) * plotHeight;
        }

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svg.style.maxWidth = '800px';
        svg.style.margin = '0 auto';
        svg.style.display = 'block';

        function createPath(d, stroke, strokeWidth, strokeDasharray) {
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('stroke', stroke);
            path.setAttribute('stroke-width', strokeWidth || 2);
            path.setAttribute('fill', 'none');
            if (strokeDasharray) {
                path.setAttribute('stroke-dasharray', strokeDasharray);
            }
            return path;
        }

        function createLine(x1, y1, x2, y2, stroke, strokeWidth) {
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', stroke || '#000');
            line.setAttribute('stroke-width', strokeWidth || 1);
            return line;
        }

        function createText(x, y, text, options) {
            options = options || {};
            var textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
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

        var xRange = [];
        for (var i = xMin; i <= xMax; i += 0.02) {
            xRange.push(i);
        }

        // === Left plot: Forward pass (Heaviside) ===
        var leftPlotX = margin.left;

        svg.appendChild(createLine(scaleX(xMin, leftPlotX), scaleY(0), scaleX(xMax, leftPlotX), scaleY(0), '#999', 1));
        svg.appendChild(createLine(scaleX(0, leftPlotX), scaleY(-0.1), scaleX(0, leftPlotX), scaleY(yMaxScale), '#999', 1));

        var pathD = 'M ' + scaleX(xMin, leftPlotX) + ',' + scaleY(0);
        pathD += ' L ' + scaleX(0, leftPlotX) + ',' + scaleY(0);
        pathD += ' L ' + scaleX(0, leftPlotX) + ',' + scaleY(1);
        pathD += ' L ' + scaleX(xMax, leftPlotX) + ',' + scaleY(1);
        svg.appendChild(createPath(pathD, heavisideColor, 2.5));

        svg.appendChild(createText(scaleX(0, leftPlotX) - 15, scaleY(1) + 5, '1', { fontSize: '12', fill: '#666' }));
        svg.appendChild(createText(scaleX(0, leftPlotX) - 15, scaleY(0) + 5, '0', { fontSize: '12', fill: '#666' }));
        svg.appendChild(createText(leftPlotX + plotWidth / 2, 25, 'Forward: \u0398(x)', { fontSize: '16', fill: '#333' }));
        svg.appendChild(createText(leftPlotX + plotWidth / 2, height - 8, 'x', { fontSize: '14', fill: '#333', fontStyle: 'italic' }));

        // === Right plot: Backward pass (Triangular surrogate) ===
        var rightPlotX = margin.left + plotWidth + 40;

        svg.appendChild(createLine(scaleX(xMin, rightPlotX), scaleY(0), scaleX(xMax, rightPlotX), scaleY(0), '#999', 1));
        svg.appendChild(createLine(scaleX(0, rightPlotX), scaleY(-0.1), scaleX(0, rightPlotX), scaleY(yMaxScale), '#999', 1));

        var surrogateType = (function () {
            var sel = document.getElementById('surrogate-type-select');
            return sel ? sel.value : 'triangular';
        })();

        function triangular(x) {
            if (Math.abs(x) > w) return 0;
            return peakHeight * (1 - Math.abs(x) / w);
        }

        function boxcar(x) {
            if (Math.abs(x) > w) return 0;
            return peakHeight;
        }

        var surrogateFn = surrogateType === 'boxcar' ? boxcar : triangular;

        pathD = 'M ' + scaleX(xRange[0], rightPlotX) + ',' + scaleY(surrogateFn(xRange[0]));
        for (var j = 1; j < xRange.length; j++) {
            pathD += ' L ' + scaleX(xRange[j], rightPlotX) + ',' + scaleY(surrogateFn(xRange[j]));
        }
        svg.appendChild(createPath(pathD, surrogateColor, 2.5));

        svg.appendChild(createText(scaleX(w, rightPlotX), scaleY(0) + 18, 'width', { fontSize: '12', fill: '#666', fontStyle: 'italic' }));
        svg.appendChild(createText(scaleX(-w, rightPlotX), scaleY(0) + 18, '-width', { fontSize: '12', fill: '#666', fontStyle: 'italic' }));

        // Y-axis tick for peak height
        svg.appendChild(createText(scaleX(0, rightPlotX) - 20, scaleY(peakHeight) + 5, peakHeight.toFixed(1), { fontSize: '12', fill: '#666' }));

        svg.appendChild(createText(rightPlotX + plotWidth / 2, 25, 'Backward: \u0398\u0303\'(x)', { fontSize: '16', fill: '#333' }));
        svg.appendChild(createText(rightPlotX + plotWidth / 2, height - 8, 'x', { fontSize: '14', fill: '#333', fontStyle: 'italic' }));

        return svg;
    }

    function draw() {
        var heightInput = document.getElementById('lif-height-input');
        var peakHeight = heightInput ? Math.max(0.1, parseFloat(heightInput.value) || 1.0) : 1.0;
        container.innerHTML = '';
        container.appendChild(createSVG(peakHeight));
    }

    draw();

    // Listen for height input changes
    var heightInput = document.getElementById('lif-height-input');
    if (heightInput) {
        heightInput.addEventListener('input', draw);
    }

    // Listen for surrogate type changes
    var surrogateSelect = document.getElementById('surrogate-type-select');
    if (surrogateSelect) {
        surrogateSelect.addEventListener('change', draw);
    }
});
