// Two-neuron spike visualization
(function() {
    const container = document.getElementById('two-neuron-spike');
    if (!container) return;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 30 400 230');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.maxWidth = '400px';
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    const neuronRadius = 25;
    const neuron1X = 80;
    const neuron2X = 280;

    // Arrow marker (shared)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#333');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Helper function to draw one scenario
    function drawScenario(yOffset, hasSpike, label) {
        const neuron1Y = yOffset + 75;
        const neuron2Y = yOffset + 75;

        // Connection line (arrow)
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arrow.setAttribute('x1', neuron1X + neuronRadius);
        arrow.setAttribute('y1', neuron1Y);
        arrow.setAttribute('x2', neuron2X - neuronRadius);
        arrow.setAttribute('y2', neuron2Y);
        arrow.setAttribute('stroke', '#333');
        arrow.setAttribute('stroke-width', '2');
        arrow.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(arrow);

        // Spike indicator (if needed)
        if (hasSpike) {
            const spikeX = (neuron1X + neuron2X) / 2;
            const spikeY = neuron1Y - 20;
            const spike = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            spike.setAttribute('x1', spikeX);
            spike.setAttribute('y1', spikeY - 25);
            spike.setAttribute('x2', spikeX);
            spike.setAttribute('y2', spikeY);
            spike.setAttribute('stroke', '#e74c3c');
            spike.setAttribute('stroke-width', '3');
            spike.setAttribute('stroke-linecap', 'round');
            svg.appendChild(spike);
        }

        // Neuron 1
        const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle1.setAttribute('cx', neuron1X);
        circle1.setAttribute('cy', neuron1Y);
        circle1.setAttribute('r', neuronRadius);
        circle1.setAttribute('fill', '#3498db');
        circle1.setAttribute('stroke', '#2c3e50');
        circle1.setAttribute('stroke-width', '2');
        svg.appendChild(circle1);

        // Neuron 2
        const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle2.setAttribute('cx', neuron2X);
        circle2.setAttribute('cy', neuron2Y);
        circle2.setAttribute('r', neuronRadius);
        circle2.setAttribute('fill', '#3498db');
        circle2.setAttribute('stroke', '#2c3e50');
        circle2.setAttribute('stroke-width', '2');
        svg.appendChild(circle2);

        // Label text on the right
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', neuron2X + neuronRadius + 20);
        text.setAttribute('y', neuron2Y + 5);
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('font-size', '18');
        text.setAttribute('fill', '#2c3e50');
        text.textContent = label;
        svg.appendChild(text);
    }

    // Draw both scenarios
    drawScenario(0, false, 'heads');  // No spike for heads
    drawScenario(140, true, 'tails'); // Spike for tails

    container.appendChild(svg);
})();
