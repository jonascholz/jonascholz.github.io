document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('code-length-plot');

    // Exit if the container is not on the page
    if (!container) {
        return;
    }

    // SVG dimensions
    const width = 700;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '700px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    // Helper functions
    function createLine(x1, y1, x2, y2, stroke = '#333', strokeWidth = 2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', stroke);
        line.setAttribute('stroke-width', strokeWidth);
        return line;
    }

    function createCircle(cx, cy, r, fill = '#fff', stroke = '#333', strokeWidth = 2) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', fill);
        circle.setAttribute('stroke', stroke);
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
        if (options.fontWeight) {
            textEl.setAttribute('font-weight', options.fontWeight);
        }
        textEl.textContent = text;
        return textEl;
    }

    function createRect(x, y, width, height, fill = '#3498db', stroke = '#2c3e50', strokeWidth = 1) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', fill);
        rect.setAttribute('stroke', stroke);
        rect.setAttribute('stroke-width', strokeWidth);
        return rect;
    }

    // Outcomes and probabilities
    const outcomes = [
        { name: 'Heads-Heads', prob: 0.75 * 0.75, code: '0' },
        { name: 'Heads-Tails', prob: 0.75 * 0.25, code: '10' },
        { name: 'Tails-Heads', prob: 0.25 * 0.75, code: '110' },
        { name: 'Tails-Tails', prob: 0.25 * 0.25, code: '111' }
    ];

    // Left side: Outcomes and probabilities
    const leftX = 50;
    const startY = 80;
    const rowHeight = 60;
    const barMaxWidth = 150;

    svg.appendChild(createText(leftX + 100, 30, 'Outcomes & Probabilities', { fontSize: '16', fontWeight: 'bold' }));

    outcomes.forEach((outcome, i) => {
        const y = startY + i * rowHeight;
        const barWidth = outcome.prob * barMaxWidth;

        // Probability bar
        svg.appendChild(createRect(leftX, y, barWidth, 30, '#3498db', '#2c3e50', 2));

        // Outcome name
        svg.appendChild(createText(leftX + barMaxWidth + 10, y + 20, outcome.name, { anchor: 'start', fontSize: '13' }));

        // Probability value (at end of bar)
        svg.appendChild(createText(leftX + barWidth + 5, y + 20, outcome.prob.toFixed(2), { fontSize: '12', fill: '#333', fontWeight: 'bold', anchor: 'start' }));
    });

    // Right side: Binary tree encoding
    const treeStartX = 450;
    const treeStartY = 60;
    const nodeRadius = 20;
    const levelHeight = 70;
    const levelWidth = [0, 60, 40, 30]; // Width between nodes at each level

    // Tree structure: [x, y, label, isLeaf, outcome]
    const nodes = [
        { x: treeStartX, y: treeStartY, label: '', isLeaf: false },
        // Level 1
        { x: treeStartX - 70, y: treeStartY + levelHeight, label: 'HH', isLeaf: true, code: '0' },
        { x: treeStartX + 70, y: treeStartY + levelHeight, label: '', isLeaf: false },
        // Level 2
        { x: treeStartX + 70 - 50, y: treeStartY + levelHeight * 2, label: 'HT', isLeaf: true, code: '10' },
        { x: treeStartX + 70 + 50, y: treeStartY + levelHeight * 2, label: '', isLeaf: false },
        // Level 3
        { x: treeStartX + 70 + 50 - 35, y: treeStartY + levelHeight * 3, label: 'TH', isLeaf: true, code: '110' },
        { x: treeStartX + 70 + 50 + 35, y: treeStartY + levelHeight * 3, label: 'TT', isLeaf: true, code: '111' }
    ];

    // Draw edges with labels
    const edges = [
        { from: 0, to: 1, label: '0' },
        { from: 0, to: 2, label: '1' },
        { from: 2, to: 3, label: '0' },
        { from: 2, to: 4, label: '1' },
        { from: 4, to: 5, label: '0' },
        { from: 4, to: 6, label: '1' }
    ];

    svg.appendChild(createText(treeStartX, 30, 'Binary Tree Encoding', { fontSize: '16', fontWeight: 'bold' }));

    edges.forEach(edge => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        svg.appendChild(createLine(fromNode.x, fromNode.y, toNode.x, toNode.y, '#666', 2));

        // Edge label
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        const offsetX = edge.label === '0' ? -10 : 10;
        svg.appendChild(createText(midX + offsetX, midY - 5, edge.label, { fontSize: '14', fill: '#e74c3c', fontWeight: 'bold' }));
    });

    // Draw nodes
    nodes.forEach(node => {
        const fillColor = node.isLeaf ? '#2ecc71' : '#ecf0f1';
        svg.appendChild(createCircle(node.x, node.y, nodeRadius, fillColor, '#2c3e50', 2));

        if (node.label) {
            svg.appendChild(createText(node.x, node.y + 5, node.label, { fontSize: '12', fontWeight: 'bold' }));
        }

        if (node.isLeaf && node.code) {
            svg.appendChild(createText(node.x, node.y + 35, node.code, { fontSize: '11', fill: '#e74c3c', fontWeight: 'bold' }));
        }
    });

    // Append SVG to container
    container.appendChild(svg);
});
