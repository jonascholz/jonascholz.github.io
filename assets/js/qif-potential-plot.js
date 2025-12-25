// QIF Potential Evolution Plot - Initial U slider
(function () {
    const container = document.getElementById('qif-potential-plot');
    if (!container) return;

    // Parameters
    const width = Math.min(600, container.clientWidth || 600);
    const height = 350;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Simulation parameters
    const dt = 0.01;
    const tMax = 5;
    const uMin = -0.5;
    const uMax = 4;

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
    const yScale = (u) => plotHeight - ((u - uMin) / (uMax - uMin)) * plotHeight;

    // Draw axes
    function drawAxes() {
        // X axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', 0);
        xAxis.setAttribute('y1', yScale(0));
        xAxis.setAttribute('x2', plotWidth);
        xAxis.setAttribute('y2', yScale(0));
        xAxis.setAttribute('stroke', '#999');
        xAxis.setAttribute('stroke-width', '1');
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

        // Bottom axis line
        const bottomAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        bottomAxis.setAttribute('x1', 0);
        bottomAxis.setAttribute('y1', plotHeight);
        bottomAxis.setAttribute('x2', plotWidth);
        bottomAxis.setAttribute('y2', plotHeight);
        bottomAxis.setAttribute('stroke', '#333');
        bottomAxis.setAttribute('stroke-width', '2');
        g.appendChild(bottomAxis);

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
        const yTicks = [0, 1, 2, 3, 4];
        yTicks.forEach(tick => {
            const y = yScale(tick);
            if (y < 0 || y > plotHeight) return;

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
        const xTicks = [0, 1, 2, 3, 4, 5];
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

        // Add threshold line at U = 1
        const thresholdLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        thresholdLine.setAttribute('x1', 0);
        thresholdLine.setAttribute('y1', yScale(1));
        thresholdLine.setAttribute('x2', plotWidth);
        thresholdLine.setAttribute('y2', yScale(1));
        thresholdLine.setAttribute('stroke', '#e74c3c');
        thresholdLine.setAttribute('stroke-width', '1.5');
        thresholdLine.setAttribute('stroke-dasharray', '8,4');
        g.appendChild(thresholdLine);

        // Threshold label
        const thresholdLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        thresholdLabel.setAttribute('x', plotWidth - 5);
        thresholdLabel.setAttribute('y', yScale(1) - 5);
        thresholdLabel.setAttribute('text-anchor', 'end');
        thresholdLabel.setAttribute('font-size', '12');
        thresholdLabel.setAttribute('fill', '#e74c3c');
        thresholdLabel.textContent = 'threshold (U = 1)';
        g.appendChild(thresholdLabel);

        // Add legend
        const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legendGroup.setAttribute('transform', `translate(${plotWidth - 100}, 15)`);

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

        g.appendChild(legendGroup);
    }

    // Simulate QIF neuron with given initial U (no current)
    function simulateQIF(u0) {
        const u = [u0];
        const t = [0];

        let currentU = u0;
        let currentT = 0;

        while (currentT < tMax && currentU < 10 && currentU > -2) {
            // dU/dt = U(U - 1) (no current)
            const dudt = currentU * (currentU - 1);
            currentU = currentU + dudt * dt;
            currentT = currentT + dt;

            u.push(currentU);
            t.push(currentT);
        }

        return { t, u };
    }

    // Plot path and initial point
    let plotPath = null;
    let initialDot = null;

    function updatePlot(u0) {
        // Remove old elements if they exist
        if (plotPath) plotPath.remove();
        if (initialDot) initialDot.remove();

        // Simulate
        const data = simulateQIF(u0);

        // Create membrane potential path
        let pathD = '';
        for (let i = 0; i < data.t.length; i++) {
            const x = xScale(data.t[i]);
            const y = yScale(data.u[i]);

            // Clamp y to plot bounds for drawing
            const clampedY = Math.max(0, Math.min(plotHeight, y));

            if (i === 0) {
                pathD += `M ${x} ${clampedY}`;
            } else {
                pathD += ` L ${x} ${clampedY}`;
            }

            // Stop drawing if we go off the plot
            if (data.u[i] > uMax || data.u[i] < uMin) break;
        }

        plotPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        plotPath.setAttribute('d', pathD);
        plotPath.setAttribute('fill', 'none');
        plotPath.setAttribute('stroke', '#228B22');
        plotPath.setAttribute('stroke-width', '2.5');
        g.appendChild(plotPath);

        // Draw initial value dot
        initialDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        initialDot.setAttribute('cx', xScale(0));
        initialDot.setAttribute('cy', yScale(u0));
        initialDot.setAttribute('r', 6);
        initialDot.setAttribute('fill', '#228B22');
        initialDot.setAttribute('stroke', '#fff');
        initialDot.setAttribute('stroke-width', '2');
        g.appendChild(initialDot);

        // Update value display
        currentValueText.textContent = u0.toFixed(2);
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
    sliderLabel.innerHTML = '<span style="color: #228B22; font-style: italic;">U</span><sub>0</sub> = ';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '-0.3';
    slider.max = '1.5';
    slider.step = '0.01';
    slider.value = '0.5';
    slider.style.width = '60%';
    slider.style.maxWidth = '300px';

    const currentValueText = document.createElement('span');
    currentValueText.style.fontWeight = 'bold';
    currentValueText.style.color = '#228B22';
    currentValueText.style.fontSize = '14px';
    currentValueText.style.minWidth = '50px';

    const hint = document.createElement('div');
    hint.style.marginTop = '5px';
    hint.style.fontSize = '12px';
    hint.style.color = '#666';
    hint.style.fontStyle = 'italic';
    hint.textContent = 'Try values above and below 1.0 to see the threshold behavior!';

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
