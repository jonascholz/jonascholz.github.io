(function () {
    const container = document.getElementById('spike-timing-diagram');
    if (!container) return;

    const width = 500;
    const height = 120;
    const margin = { left: 50, right: 30, top: 20, bottom: 35 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const tMax = 100;
    const spikeT = 78;
    // Animation: cursor runs from 0 to tMax over `duration` ms, then pauses before looping
    const duration = 2600;
    const pauseAfter = 800;

    function tx(t) {
        return margin.left + (t / tMax) * plotW;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', '100%');
    svg.style.maxWidth = `${width}px`;
    svg.style.margin = '0 auto';
    svg.style.display = 'block';

    function el(tag, attrs) {
        const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        return e;
    }

    const g = el('g', {});

    // Axis
    g.appendChild(el('line', {
        x1: margin.left, y1: margin.top + plotH,
        x2: margin.left + plotW, y2: margin.top + plotH,
        stroke: '#333', 'stroke-width': '2'
    }));
    // Arrow head
    g.appendChild(el('polygon', {
        points: `${margin.left + plotW + 8},${margin.top + plotH} ${margin.left + plotW},${margin.top + plotH - 4} ${margin.left + plotW},${margin.top + plotH + 4}`,
        fill: '#333'
    }));
    // Axis label
    const axisLabel = el('text', {
        x: margin.left + plotW + 14, y: margin.top + plotH + 4,
        'font-family': 'serif', 'font-style': 'italic',
        'font-size': '14', fill: '#333', 'dominant-baseline': 'middle'
    });
    axisLabel.textContent = 't';
    g.appendChild(axisLabel);

    // Tick marks
    [0, 25, 50, 75, 100].forEach(t => {
        const x = tx(t);
        g.appendChild(el('line', {
            x1: x, y1: margin.top + plotH, x2: x, y2: margin.top + plotH + 5,
            stroke: '#333', 'stroke-width': '1'
        }));
        const lbl = el('text', {
            x, y: margin.top + plotH + 16,
            'text-anchor': 'middle', 'font-family': 'Arial, sans-serif',
            'font-size': '11', fill: '#666'
        });
        lbl.textContent = t;
        g.appendChild(lbl);
    });

    // Spike (hidden initially)
    const spikeX = tx(spikeT);
    const spikeTop = margin.top + 4;
    const spikeBase = margin.top + plotH;

    const spikeLine = el('line', {
        x1: spikeX, y1: spikeBase, x2: spikeX, y2: spikeTop,
        stroke: 'orange', 'stroke-width': '2.5', 'stroke-linecap': 'round',
        opacity: '0'
    });
    g.appendChild(spikeLine);

    const spikeTip = el('circle', {
        cx: spikeX, cy: spikeTop, r: '3', fill: 'orange', opacity: '0'
    });
    g.appendChild(spikeTip);

    const spikeLabel = el('text', {
        x: spikeX, y: margin.top + plotH + 28,
        'text-anchor': 'middle', 'font-family': 'Arial, sans-serif',
        'font-size': '11', fill: 'orange', opacity: '0'
    });
    spikeLabel.textContent = 'value = 78';
    g.appendChild(spikeLabel);

    // Moving cursor
    const cursor = el('line', {
        x1: margin.left, y1: margin.top,
        x2: margin.left, y2: margin.top + plotH,
        stroke: '#aaa', 'stroke-width': '1.5', 'stroke-dasharray': '4 3'
    });
    g.appendChild(cursor);

    svg.appendChild(g);
    container.appendChild(svg);

    // Animation loop
    let startTime = null;
    let spikeVisible = false;

    function animate(ts) {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;

        if (elapsed < duration) {
            const progress = elapsed / duration;
            const currentT = progress * tMax;
            const x = tx(currentT);

            cursor.setAttribute('x1', x);
            cursor.setAttribute('x2', x);

            if (!spikeVisible && currentT >= spikeT) {
                spikeVisible = true;
                spikeLine.setAttribute('opacity', '1');
                spikeTip.setAttribute('opacity', '1');
                spikeLabel.setAttribute('opacity', '1');
            }
            requestAnimationFrame(animate);
        } else {
            // Hold at end, then reset
            setTimeout(() => {
                cursor.setAttribute('x1', margin.left);
                cursor.setAttribute('x2', margin.left);
                spikeLine.setAttribute('opacity', '0');
                spikeTip.setAttribute('opacity', '0');
                spikeLabel.setAttribute('opacity', '0');
                spikeVisible = false;
                startTime = null;
                requestAnimationFrame(animate);
            }, pauseAfter);
        }
    }

    requestAnimationFrame(animate);
})();
