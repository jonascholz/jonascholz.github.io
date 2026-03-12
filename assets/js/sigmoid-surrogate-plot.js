document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('sigmoid-surrogate-plot');

    if (!container) {
        return;
    }

    var sigmoidColor = '#ff7f0e';
    var derivativeColor = '#1f77b4';

    var width = 800;
    var height = 280;
    var margin = { top: 40, right: 40, bottom: 50, left: 60 };
    var plotWidth = (width - margin.left - margin.right - 40) / 2;
    var plotHeight = height - margin.top - margin.bottom;

    function sigmoid(x, k) {
        return 1.0 / (1.0 + Math.exp(-k * x));
    }

    function sigmoidDerivative(x, k) {
        var s = sigmoid(x, k);
        return k * s * (1 - s);
    }

    function createSVG(k) {
        var xMin = -6, xMax = 6;
        var yMaxLeft = 1.3;

        // Compute max derivative value for y-axis scaling
        var maxDeriv = k * 0.25; // sigmoid derivative peaks at k/4
        var yMaxRight = Math.max(0.5, maxDeriv * 1.3);

        function scaleX(x, offsetX) {
            return offsetX + ((x - xMin) / (xMax - xMin)) * plotWidth;
        }

        function scaleYLeft(y) {
            return margin.top + plotHeight - (y / yMaxLeft) * plotHeight;
        }

        function scaleYRight(y) {
            return margin.top + plotHeight - (y / yMaxRight) * plotHeight;
        }

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svg.style.maxWidth = '800px';
        svg.style.margin = '0 auto';
        svg.style.display = 'block';

        function createPath(d, stroke, strokeWidth) {
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('stroke', stroke);
            path.setAttribute('stroke-width', strokeWidth || 2);
            path.setAttribute('fill', 'none');
            return path;
        }

        function createLine(x1, y1, x2, y2, stroke, strokeWidth, dasharray) {
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', stroke || '#000');
            line.setAttribute('stroke-width', strokeWidth || 1);
            if (dasharray) {
                line.setAttribute('stroke-dasharray', dasharray);
            }
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
        for (var i = xMin; i <= xMax; i += 0.05) {
            xRange.push(i);
        }

        // === Left plot: Sigmoid ===
        var leftPlotX = margin.left;

        // Axes
        svg.appendChild(createLine(scaleX(xMin, leftPlotX), scaleYLeft(0), scaleX(xMax, leftPlotX), scaleYLeft(0), '#999', 1));
        svg.appendChild(createLine(scaleX(0, leftPlotX), scaleYLeft(-0.1), scaleX(0, leftPlotX), scaleYLeft(yMaxLeft), '#999', 1));

        // Dashed line at y=1
        svg.appendChild(createLine(scaleX(xMin, leftPlotX), scaleYLeft(1), scaleX(xMax, leftPlotX), scaleYLeft(1), '#ccc', 1, '4,4'));

        // Sigmoid curve
        var pathD = 'M ' + scaleX(xRange[0], leftPlotX) + ',' + scaleYLeft(sigmoid(xRange[0], k));
        for (var j = 1; j < xRange.length; j++) {
            pathD += ' L ' + scaleX(xRange[j], leftPlotX) + ',' + scaleYLeft(sigmoid(xRange[j], k));
        }
        svg.appendChild(createPath(pathD, sigmoidColor, 2.5));

        // Y-axis ticks
        svg.appendChild(createText(scaleX(0, leftPlotX) - 18, scaleYLeft(1) + 5, '1', { fontSize: '12', fill: '#666' }));
        svg.appendChild(createText(scaleX(0, leftPlotX) - 18, scaleYLeft(0.5) + 5, '.5', { fontSize: '12', fill: '#666' }));
        svg.appendChild(createText(scaleX(0, leftPlotX) - 18, scaleYLeft(0) + 5, '0', { fontSize: '12', fill: '#666' }));

        // Title and x-axis label
        svg.appendChild(createText(leftPlotX + plotWidth / 2, 25, '\u03C3(kx)', { fontSize: '16', fill: '#333' }));
        svg.appendChild(createText(leftPlotX + plotWidth / 2, height - 8, 'x', { fontSize: '14', fill: '#333', fontStyle: 'italic' }));

        // === Right plot: Sigmoid derivative ===
        var rightPlotX = margin.left + plotWidth + 40;

        // Axes
        svg.appendChild(createLine(scaleX(xMin, rightPlotX), scaleYRight(0), scaleX(xMax, rightPlotX), scaleYRight(0), '#999', 1));
        svg.appendChild(createLine(scaleX(0, rightPlotX), scaleYRight(-0.1), scaleX(0, rightPlotX), scaleYRight(yMaxRight), '#999', 1));

        // Derivative curve
        pathD = 'M ' + scaleX(xRange[0], rightPlotX) + ',' + scaleYRight(sigmoidDerivative(xRange[0], k));
        for (var j = 1; j < xRange.length; j++) {
            pathD += ' L ' + scaleX(xRange[j], rightPlotX) + ',' + scaleYRight(sigmoidDerivative(xRange[j], k));
        }
        svg.appendChild(createPath(pathD, derivativeColor, 2.5));

        // Y-axis tick for peak
        var peakVal = k * 0.25;
        svg.appendChild(createText(scaleX(0, rightPlotX) - 22, scaleYRight(peakVal) + 5, peakVal.toFixed(2), { fontSize: '12', fill: '#666' }));
        svg.appendChild(createText(scaleX(0, rightPlotX) - 18, scaleYRight(0) + 5, '0', { fontSize: '12', fill: '#666' }));

        // Title and x-axis label
        svg.appendChild(createText(rightPlotX + plotWidth / 2, 25, '\u03C3\'(kx)', { fontSize: '16', fill: '#333' }));
        svg.appendChild(createText(rightPlotX + plotWidth / 2, height - 8, 'x', { fontSize: '14', fill: '#333', fontStyle: 'italic' }));

        return svg;
    }

    function draw() {
        var slider = document.getElementById('sigmoid-k-slider');
        var valueDisplay = document.getElementById('sigmoid-k-value');
        var k = slider ? parseFloat(slider.value) : 1.0;
        if (valueDisplay) {
            valueDisplay.textContent = k.toFixed(1);
        }
        container.innerHTML = '';
        container.appendChild(createSVG(k));
    }

    draw();

    var slider = document.getElementById('sigmoid-k-slider');
    if (slider) {
        slider.addEventListener('input', draw);
    }
});
