// QIF Interactive Plot
(function () {
    const container = document.getElementById('qif-interactive-plot');
    if (!container) return;

    // Parameters
    const width = Math.min(600, container.clientWidth || 600);
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Simulation parameters
    const dt = 0.1;
    const tMax = 100;
    const currentStart = 10;
    const currentEnd = 30;
    const uMax = 3; // Max U value for plot (if it exceeds, we'll see it go off)

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.display = 'block';
    svg.style.margin = '0 auto';

    container.appendChild(svg);

    // Create main group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);

    // Scales
    const xScale = (t) => (t / tMax) * plotWidth;
    const yScale = (u) => plotHeight - ((u + 0.5) / (uMax + 0.5)) * plotHeight;

    // Draw axes
    function drawAxes() {
        // X axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', 0);
        xAxis.setAttribute('y1', plotHeight);
        xAxis.setAttribute('x2', plotWidth);
        xAxis.setAttribute('y2', plotHeight);
        xAxis.setAttribute('stroke', '#333');
        xAxis.setAttribute('stroke-width', '2');
        g.appendChild(xAxis);

        // Y axis
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', 0);
        yAxis.setAttribute('y1', 0);
        yAxis.setAttribute('x2', 0);
        yAxis.setAttribute('y2', plotHeight);
        yAxis.setAttribute('stroke', '#333');
        yAxis.setAttribute('stroke-width', '2');
        g.appendChild(yAxis);

        // X axis label
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', plotWidth / 2);
        xLabel.setAttribute('y', plotHeight + 40);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '14');
        xLabel.setAttribute('fill', '#333');
        xLabel.textContent = 'Time';
        g.appendChild(xLabel);

        // Y axis label
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', -plotHeight / 2);
        yLabel.setAttribute('y', -40);
        yLabel.setAttribute('text-anchor', 'middle');
        yLabel.setAttribute('font-size', '14');
        yLabel.setAttribute('fill', '#333');
        yLabel.setAttribute('transform', `rotate(-90, 0, 0)`);
        yLabel.textContent = 'Membrane Potential U';
        g.appendChild(yLabel);

        // Add tick marks for Y axis
        const yTicks = [0, 1, 2, 3];
        yTicks.forEach(tick => {
            const y = yScale(tick);
            const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tickLine.setAttribute('x1', -5);
            tickLine.setAttribute('y1', y);
            tickLine.setAttribute('x2', 0);
            tickLine.setAttribute('y2', y);
            tickLine.setAttribute('stroke', '#333');
            tickLine.setAttribute('stroke-width', '1');
            g.appendChild(tickLine);

            const tickText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tickText.setAttribute('x', -10);
            tickText.setAttribute('y', y + 4);
            tickText.setAttribute('text-anchor', 'end');
            tickText.setAttribute('font-size', '12');
            tickText.setAttribute('fill', '#333');
            tickText.textContent = tick;
            g.appendChild(tickText);
        });

        // Add tick marks for X axis
        const xTicks = [0, 25, 50, 75, 100];
        xTicks.forEach(tick => {
            const x = xScale(tick);
            const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tickLine.setAttribute('x1', x);
            tickLine.setAttribute('y1', plotHeight);
            tickLine.setAttribute('x2', x);
            tickLine.setAttribute('y2', plotHeight + 5);
            tickLine.setAttribute('stroke', '#333');
            tickLine.setAttribute('stroke-width', '1');
            g.appendChild(tickLine);

            const tickText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tickText.setAttribute('x', x);
            tickText.setAttribute('y', plotHeight + 18);
            tickText.setAttribute('text-anchor', 'middle');
            tickText.setAttribute('font-size', '12');
            tickText.setAttribute('fill', '#333');
            tickText.textContent = tick;
            g.appendChild(tickText);
        });

        // Add shaded region for current injection period
        const currentRegion = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        currentRegion.setAttribute('x', xScale(currentStart));
        currentRegion.setAttribute('y', 0);
        currentRegion.setAttribute('width', xScale(currentEnd) - xScale(currentStart));
        currentRegion.setAttribute('height', plotHeight);
        currentRegion.setAttribute('fill', '#e8d5f8');
        currentRegion.setAttribute('opacity', '0.3');
        g.insertBefore(currentRegion, g.firstChild);

        // Add legend
        const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legendGroup.setAttribute('transform', `translate(${plotWidth - 120}, 15)`);

        // Membrane potential legend
        const uLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        uLine.setAttribute('x1', 0);
        uLine.setAttribute('y1', 0);
        uLine.setAttribute('x2', 30);
        uLine.setAttribute('y2', 0);
        uLine.setAttribute('stroke', '#228B22');
        uLine.setAttribute('stroke-width', '2.5');
        legendGroup.appendChild(uLine);

        const uText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        uText.setAttribute('x', 35);
        uText.setAttribute('y', 4);
        uText.setAttribute('font-size', '12');
        uText.setAttribute('fill', '#333');
        uText.textContent = 'U(t)';
        legendGroup.appendChild(uText);

        // Current legend
        const iLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        iLine.setAttribute('x1', 0);
        iLine.setAttribute('y1', 20);
        iLine.setAttribute('x2', 30);
        iLine.setAttribute('y2', 20);
        iLine.setAttribute('stroke', '#800080');
        iLine.setAttribute('stroke-width', '2');
        iLine.setAttribute('stroke-dasharray', '5,3');
        legendGroup.appendChild(iLine);

        const iText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        iText.setAttribute('x', 35);
        iText.setAttribute('y', 24);
        iText.setAttribute('font-size', '12');
        iText.setAttribute('fill', '#333');
        iText.textContent = 'I(t)';
        legendGroup.appendChild(iText);

        g.appendChild(legendGroup);
    }

    // Simulate QIF neuron
    function simulateQIF(current) {
        const u = [0]; // Start at 0
        const t = [0];

        let currentU = 0;
        let currentT = 0;

        while (currentT < tMax && currentU < 10) { // Stop if U gets too large
            const inCurrent = (currentT >= currentStart && currentT <= currentEnd) ? current : 0;
            const dudt = currentU * (currentU - 1) + inCurrent;
            currentU = currentU + dudt * dt;
            currentT = currentT + dt;

            u.push(currentU);
            t.push(currentT);
        }

        return { t, u };
    }

    // Plot paths
    let plotPath = null;
    let currentPath = null;

    function updatePlot(current) {
        // Remove old paths if they exist
        if (plotPath) {
            plotPath.remove();
        }
        if (currentPath) {
            currentPath.remove();
        }

        // Create current injection visualization (stepped function)
        const currentPathD = `
            M ${xScale(0)} ${yScale(0)}
            L ${xScale(currentStart)} ${yScale(0)}
            L ${xScale(currentStart)} ${yScale(current)}
            L ${xScale(currentEnd)} ${yScale(current)}
            L ${xScale(currentEnd)} ${yScale(0)}
            L ${xScale(tMax)} ${yScale(0)}
        `;

        currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        currentPath.setAttribute('d', currentPathD);
        currentPath.setAttribute('fill', 'none');
        currentPath.setAttribute('stroke', '#800080'); // Purple
        currentPath.setAttribute('stroke-width', '2');
        currentPath.setAttribute('stroke-dasharray', '5,3');
        g.appendChild(currentPath);

        // Simulate
        const data = simulateQIF(current);

        // Create membrane potential path
        let pathD = '';
        for (let i = 0; i < data.t.length; i++) {
            const x = xScale(data.t[i]);
            const y = yScale(data.u[i]);

            if (i === 0) {
                pathD += `M ${x} ${y}`;
            } else {
                pathD += ` L ${x} ${y}`;
            }

            // Stop drawing if we go off the plot
            if (data.u[i] > uMax) break;
        }

        plotPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        plotPath.setAttribute('d', pathD);
        plotPath.setAttribute('fill', 'none');
        plotPath.setAttribute('stroke', '#228B22'); // ForestGreen
        plotPath.setAttribute('stroke-width', '2.5');
        g.appendChild(plotPath);

        // Update current value display
        currentValueText.textContent = current.toFixed(3);
    }

    // Draw axes first
    drawAxes();

    // Create slider control
    const controlsDiv = document.createElement('div');
    controlsDiv.style.marginTop = '10px';
    controlsDiv.style.textAlign = 'center';

    const sliderContainer = document.createElement('div');
    sliderContainer.style.display = 'flex';
    sliderContainer.style.alignItems = 'center';
    sliderContainer.style.justifyContent = 'center';
    sliderContainer.style.gap = '10px';
    sliderContainer.style.marginBottom = '5px';

    const sliderLabel = document.createElement('span');
    sliderLabel.style.fontSize = '14px';
    sliderLabel.innerHTML = '<span style="color: #800080; font-style: italic;">I</span> = ';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '0.5';
    slider.step = '0.001';
    slider.value = '0.25';
    slider.style.width = '60%';
    slider.style.maxWidth = '300px';

    const currentValueText = document.createElement('span');
    currentValueText.style.fontWeight = 'bold';
    currentValueText.style.color = '#800080';
    currentValueText.style.fontSize = '14px';
    currentValueText.style.minWidth = '50px';

    const hint = document.createElement('div');
    hint.style.marginTop = '5px';
    hint.style.fontSize = '12px';
    hint.style.color = '#666';
    hint.style.fontStyle = 'italic';
    hint.textContent = 'Try values around 0.268 to see the critical transition!';

    sliderContainer.appendChild(sliderLabel);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(currentValueText);
    controlsDiv.appendChild(sliderContainer);
    controlsDiv.appendChild(hint);
    container.appendChild(controlsDiv);

    // Initialize plot
    updatePlot(parseFloat(slider.value));

    // Update on slider change
    slider.addEventListener('input', function () {
        updatePlot(parseFloat(this.value));
    });
})();