document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('mutability-diagram');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    // Colors
    const colors = {
        blue: '#4a90e2',
        blueDark: '#1565c0',
        blueLight: '#e3f2fd',
        blueMid: '#bbdefb',
        orange: '#f39c12',
        orangeDark: '#e65100',
        orangeLight: '#fff3e0',
        gray: '#666',
        grayLight: '#ccc'
    };

    // SVG dimensions
    const width = 600;
    const height = 280;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.width = '100%';
    svg.style.maxWidth = '600px';
    svg.style.margin = '1em auto';
    svg.style.display = 'block';
    svg.style.fontFamily = "'Courier New', monospace";

    // Define arrow markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    function createArrowMarker(id, color) {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', id);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '5');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        path.setAttribute('fill', color);
        marker.appendChild(path);
        return marker;
    }

    defs.appendChild(createArrowMarker('arrowBlue', colors.blue));
    defs.appendChild(createArrowMarker('arrowOrange', colors.orange));
    svg.appendChild(defs);

    // Helper functions
    function createRect(x, y, w, h, fill, stroke, strokeWidth = 2, rx = 6) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', w);
        rect.setAttribute('height', h);
        rect.setAttribute('rx', rx);
        rect.setAttribute('fill', fill);
        rect.setAttribute('stroke', stroke);
        rect.setAttribute('stroke-width', strokeWidth);
        return rect;
    }

    function createText(x, y, content, options = {}) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', options.anchor || 'middle');
        text.setAttribute('font-size', options.fontSize || '13');
        text.setAttribute('fill', options.fill || '#333');
        if (options.fontWeight) text.setAttribute('font-weight', options.fontWeight);
        if (options.fontStyle) text.setAttribute('font-style', options.fontStyle);
        text.textContent = content;
        return text;
    }

    function createLine(x1, y1, x2, y2, stroke, strokeWidth = 1, dashArray = null) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', stroke);
        line.setAttribute('stroke-width', strokeWidth);
        if (dashArray) line.setAttribute('stroke-dasharray', dashArray);
        return line;
    }

    function createPath(d, stroke, strokeWidth = 2, fill = 'none', markerEnd = null) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', stroke);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', fill);
        if (markerEnd) path.setAttribute('marker-end', markerEnd);
        return path;
    }

    // === JAX Section (centered) ===
    svg.appendChild(createText(300, 25, 'JAX (Functional)', {
        fontWeight: 'bold', fontSize: '16', fill: colors.blueDark
    }));

    // Data box
    svg.appendChild(createRect(140, 45, 80, 50, colors.blueLight, colors.blue));
    svg.appendChild(createText(180, 75, 'data', { fill: colors.blueDark }));

    // Arrow to function
    svg.appendChild(createPath('M 225 70 L 250 70', colors.blue, 2, 'none', 'url(#arrowBlue)'));

    // Function box
    svg.appendChild(createRect(260, 45, 80, 50, colors.blueMid, colors.blue));
    svg.appendChild(createText(300, 75, 'function', { fill: colors.blueDark }));

    // Arrow to new data
    svg.appendChild(createPath('M 345 70 L 370 70', colors.blue, 2, 'none', 'url(#arrowBlue)'));

    // New data box
    svg.appendChild(createRect(380, 45, 80, 50, colors.blueLight, colors.blue));
    svg.appendChild(createText(420, 75, 'new data', { fill: colors.blueDark }));

    // Immutable note
    svg.appendChild(createText(300, 120, 'Original data unchanged', {
        fontSize: '11', fill: colors.gray, fontStyle: 'italic'
    }));

    // === Divider ===
    svg.appendChild(createLine(20, 145, 580, 145, colors.grayLight, 1, '5,5'));

    // === Flax/PyTorch Section (centered) ===
    svg.appendChild(createText(300, 175, 'Flax / PyTorch (Class-based)', {
        fontWeight: 'bold', fontSize: '16', fill: colors.orangeDark
    }));

    // Single class box with state
    svg.appendChild(createRect(230, 200, 140, 50, colors.orangeLight, colors.orange));
    svg.appendChild(createText(300, 232, 'class state', { fill: colors.orangeDark }));

    // Self-referential loop arrow (pointing left back into box)
    svg.appendChild(createPath('M 370 210 C 430 210 430 240 380 240', colors.orange, 2, 'none', 'url(#arrowOrange)'));

    // Method label
    svg.appendChild(createText(425, 225, '.method()', {
        fontSize: '12', fill: colors.orangeDark, anchor: 'start'
    }));

    // Mutable note
    svg.appendChild(createText(300, 270, 'State modified in-place', {
        fontSize: '11', fill: colors.gray, fontStyle: 'italic'
    }));

    // Append SVG to container
    container.appendChild(svg);
});
