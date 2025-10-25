document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('heaviside-plot');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    // SVG dimensions
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 40, bottom: 50, left: 60 };
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

    // Create main group with margins
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);

    // Helper functions
    function createLine(x1, y1, x2, y2, color = '#333', strokeWidth = 1.5) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        return line;
    }

    function createCircle(cx, cy, r, fillColor = 'white', strokeColor = '#333', strokeWidth = 2) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', strokeWidth);
        return circle;
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

    // Scale parameters
    const xMin = -3;
    const xMax = 3;
    const yMin = -0.2;
    const yMax = 1.2;

    // Scale functions
    function scaleX(x) {
        return ((x - xMin) / (xMax - xMin)) * plotWidth;
    }

    function scaleY(y) {
        return plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight;
    }

    // Draw axes
    const xAxisY = scaleY(0);
    const yAxisX = scaleX(0);

    // X-axis
    g.appendChild(createLine(0, xAxisY, plotWidth, xAxisY, '#666', 2));

    // Y-axis
    g.appendChild(createLine(yAxisX, 0, yAxisX, plotHeight, '#666', 2));

    // X-axis label
    g.appendChild(createText(plotWidth + 10, xAxisY + 5, 'x', {
        anchor: 'start',
        fontSize: '16',
        fontStyle: 'italic'
    }));

    // Y-axis label
    g.appendChild(createText(yAxisX - 10, -5, 'Θ(x)', {
        anchor: 'end',
        fontSize: '16'
    }));

    // Add tick marks and labels for x-axis
    for (let x = -3; x <= 3; x++) {
        const xPos = scaleX(x);
        if (x !== 0) {
            g.appendChild(createLine(xPos, xAxisY - 5, xPos, xAxisY + 5, '#666', 1.5));
            g.appendChild(createText(xPos, xAxisY + 20, x.toString(), { fontSize: '12' }));
        }
    }

    // Add tick marks and labels for y-axis
    for (let y = 0; y <= 1; y++) {
        const yPos = scaleY(y);
        if (y !== 0) {
            g.appendChild(createLine(yAxisX - 5, yPos, yAxisX + 5, yPos, '#666', 1.5));
            g.appendChild(createText(yAxisX - 15, yPos + 5, y.toString(), {
                fontSize: '12',
                anchor: 'end'
            }));
        } else {
            g.appendChild(createText(yAxisX - 15, yPos + 5, '0', {
                fontSize: '12',
                anchor: 'end'
            }));
        }
    }

    // Draw the Heaviside function
    const stepColor = '#2563eb'; // Blue color

    // Left horizontal line (y = 0 for x < 0)
    g.appendChild(createLine(0, scaleY(0), yAxisX, scaleY(0), stepColor, 3));

    // Right horizontal line (y = 1 for x >= 0)
    g.appendChild(createLine(yAxisX, scaleY(1), plotWidth, scaleY(1), stepColor, 3));

    // Add open circle at (0, 0) to show discontinuity
    g.appendChild(createCircle(yAxisX, scaleY(0), 4, 'white', stepColor, 2));

    // Add filled circle at (0, 1) to show the function value
    g.appendChild(createCircle(yAxisX, scaleY(1), 4, stepColor, stepColor, 2));

    // Append SVG to container
    container.appendChild(svg);
});
