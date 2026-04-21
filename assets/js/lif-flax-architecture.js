document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('lif-flax-architecture');

    if (!container) {
        return;
    }

    // SVG dimensions
    const width = 400;
    const height = 380;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '400px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    // Helper functions
    function createRect(x, y, width, height, fillColor = 'white', strokeColor = '#333', strokeWidth = 2, rx = 0) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', fillColor);
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', strokeWidth);
        if (rx > 0) {
            rect.setAttribute('rx', rx);
            rect.setAttribute('ry', rx);
        }
        return rect;
    }

    function createText(x, y, text, options = {}) {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        textEl.setAttribute('text-anchor', options.anchor || 'middle');
        textEl.setAttribute('font-family', options.fontFamily || 'monospace');
        textEl.setAttribute('font-size', options.fontSize || '14');
        textEl.setAttribute('font-weight', options.fontWeight || 'normal');
        textEl.setAttribute('fill', options.fill || '#333');
        if (options.fontStyle) {
            textEl.setAttribute('font-style', options.fontStyle);
        }
        textEl.textContent = text;
        return textEl;
    }

    // Main LIF container
    const lifX = 50;
    const lifY = 20;
    const lifWidth = 300;
    const lifHeight = 340;

    // Draw main LIF box
    svg.appendChild(createRect(lifX, lifY, lifWidth, lifHeight, '#f9f9f9', '#333', 3, 8));
    svg.appendChild(createText(lifX + lifWidth / 2, lifY + 25, 'LIF Layer', {
        fontSize: '18',
        fontWeight: 'bold'
    }));

    // Parameters box (inside LIF)
    const paramX = lifX + 20;
    const paramY = lifY + 45;
    const paramWidth = lifWidth - 40;
    const paramHeight = 80;

    svg.appendChild(createRect(paramX, paramY, paramWidth, paramHeight, '#e3f2fd', '#2196f3', 2, 5));
    svg.appendChild(createText(paramX + paramWidth / 2, paramY + 18, 'Parameters', {
        fontSize: '13',
        fontWeight: 'bold',
        fill: '#1976d2'
    }));

    // Parameter items
    const paramItems = [
        { label: 'α (decay)', color: 'blue' },
        { label: 'W (weights)', color: '#e91e63' },
        { label: 'θ (threshold)', color: '#795548' }
    ];

    paramItems.forEach((item, i) => {
        const itemY = paramY + 38 + i * 18;
        svg.appendChild(createText(paramX + 20, itemY, item.label, {
            fontSize: '12',
            anchor: 'start',
            fill: item.color
        }));
    });

    // State box (inside LIF)
    const stateX = lifX + 20;
    const stateY = paramY + paramHeight + 15;
    const stateWidth = paramWidth;
    const stateHeight = 65;

    svg.appendChild(createRect(stateX, stateY, stateWidth, stateHeight, '#e8f5e9', '#4caf50', 2, 5));
    svg.appendChild(createText(stateX + stateWidth / 2, stateY + 18, 'Variables (State)', {
        fontSize: '13',
        fontWeight: 'bold',
        fill: '#2e7d32'
    }));

    // State items
    const stateItems = [
        { label: 'U[t] (membrane potential)', color: 'ForestGreen' },
        { label: 'S[t] (spike output)', color: 'orange' }
    ];

    stateItems.forEach((item, i) => {
        const itemY = stateY + 38 + i * 18;
        svg.appendChild(createText(stateX + 20, itemY, item.label, {
            fontSize: '12',
            anchor: 'start',
            fill: item.color
        }));
    });

    // Methods section - individual boxes
    const methodY = stateY + stateHeight + 15;
    const methodWidth = paramWidth;
    const methodBoxHeight = 28;
    const methodGap = 8;

    const methods = [
        { label: '__init__()', color: '#9c27b0' },
        { label: '__call__(x)', color: '#9c27b0' },
        { label: 'reset()', color: '#9c27b0' }
    ];

    methods.forEach((method, i) => {
        const y = methodY + i * (methodBoxHeight + methodGap);
        svg.appendChild(createRect(paramX, y, methodWidth, methodBoxHeight, '#f3e5f5', method.color, 2, 5));
        svg.appendChild(createText(paramX + methodWidth / 2, y + 18, method.label, {
            fontSize: '13',
            fontWeight: 'bold',
            fill: method.color
        }));
    });

    // Append SVG to container
    container.appendChild(svg);
});
