(function () {
    const container = document.getElementById('rate-vs-latency-diagram');
    if (!container) return;

    const W = 720, H = 300;
    const midX = W / 2;

    const C = {
        spike: 'orange',
        latency: '#2196F3',
        deriv: '#e53935',
        text: '#333',
        dim: '#999',
        divider: '#ddd',
        bracket: '#aaa',
        axis: '#555'
    };

    function mkEl(tag, attrs) {
        const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        return e;
    }

    const svg = mkEl('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%' });
    svg.style.maxWidth = `${W}px`;
    svg.style.display = 'block';
    svg.style.margin = '0 auto';

    const defs = mkEl('defs', {});
    svg.appendChild(defs);

    function addMarker(id, color, reverse) {
        const m = mkEl('marker', { id, markerWidth: '9', markerHeight: '9', refX: reverse ? '1' : '8', refY: '3', orient: 'auto' });
        m.appendChild(mkEl('polygon', { points: reverse ? '9 0, 0 3, 9 6' : '0 0, 9 3, 0 6', fill: color }));
        defs.appendChild(m);
    }

    addMarker('arr-axis', C.axis, false);
    addMarker('arr-latency-fwd', C.latency, false);
    addMarker('arr-latency-rev', C.latency, true);
    addMarker('arr-deriv', C.deriv, false);

    function seg(x1, y1, x2, y2, attrs) {
        svg.appendChild(mkEl('line', { x1, y1, x2, y2, ...attrs }));
    }

    function txt(x, y, s, attrs) {
        const t = mkEl('text', {
            x, y,
            'font-family': 'serif',
            'font-size': '14',
            fill: C.text,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            ...attrs
        });
        t.textContent = s;
        svg.appendChild(t);
    }

    // Vertical divider
    seg(midX, 8, midX, H - 8, { stroke: C.divider, 'stroke-width': '1.5' });

    // Headers
    txt(midX / 2, 22, 'Rate Coding', { 'font-size': '15', 'font-weight': 'bold', 'font-family': 'Arial, sans-serif' });
    txt(midX * 1.5, 22, 'Latency Coding', { 'font-size': '15', 'font-weight': 'bold', 'font-family': 'Arial, sans-serif' });

    // ── ROW 1: Spike visualizations ──
    const axY = 100, spikeH = 44;
    const lx1 = 28, lx2 = midX - 28;
    const rx1 = midX + 28, rx2 = W - 28;
    const lLen = lx2 - lx1, rLen = rx2 - rx1;

    // Left axis
    seg(lx1, axY, lx2 + 16, axY, { stroke: C.axis, 'stroke-width': '2', 'marker-end': 'url(#arr-axis)' });
    txt(lx2 + 24, axY, 't', { 'font-style': 'italic', 'font-size': '13', fill: C.axis, 'text-anchor': 'start' });

    // Rate coding spikes
    const rateSpikes = [0.07, 0.17, 0.28, 0.39, 0.51, 0.62, 0.74, 0.85, 0.93];
    rateSpikes.forEach(p => {
        const sx = lx1 + p * lLen;
        seg(sx, axY, sx, axY - spikeH, { stroke: C.spike, 'stroke-width': '2' });
    });

    // Averaging bracket
    const bY = axY - spikeH - 10;
    const bx1 = lx1 + 0.03 * lLen, bx2 = lx1 + 0.97 * lLen;
    seg(bx1, bY, bx2, bY, { stroke: C.bracket, 'stroke-width': '1.5' });
    seg(bx1, bY, bx1, bY + 7, { stroke: C.bracket, 'stroke-width': '1.5' });
    seg(bx2, bY, bx2, bY + 7, { stroke: C.bracket, 'stroke-width': '1.5' });
    txt((bx1 + bx2) / 2, bY - 11, 'average over T', { 'font-size': '11', fill: C.bracket, 'font-family': 'Arial, sans-serif' });

    // Right axis
    seg(rx1, axY, rx2 + 16, axY, { stroke: C.axis, 'stroke-width': '2', 'marker-end': 'url(#arr-axis)' });
    txt(rx2 + 24, axY, 't', { 'font-style': 'italic', 'font-size': '13', fill: C.axis, 'text-anchor': 'start' });

    // Single spike
    const ssX = rx1 + 0.65 * rLen;
    seg(ssX, axY, ssX, axY - spikeH, { stroke: C.spike, 'stroke-width': '2.5' });

    // Latency double arrow
    const arrY = axY - spikeH / 2;
    seg(rx1 + 4, arrY, ssX - 4, arrY, {
        stroke: C.latency, 'stroke-width': '1.8',
        'marker-end': 'url(#arr-latency-fwd)',
        'marker-start': 'url(#arr-latency-rev)'
    });
    txt((rx1 + ssX) / 2, arrY - 13, 'latency', { 'font-size': '12', fill: C.latency, 'font-family': 'Arial, sans-serif', 'font-style': 'italic' });

    // Output formulas
    txt(midX / 2, 125, 'output = ⟨s(t)⟩', { 'font-size': '14' });
    txt(midX * 1.5, 125, 'output = delay(spike)', { 'font-size': '14' });

    // Separator
    seg(16, 142, W - 16, 142, { stroke: C.divider, 'stroke-width': '1' });

    // ── ROW 2: Formulas + derivatives ──
    txt(midX / 2, 163, '1/T · Σk s(tk)', { 'font-size': '14' });
    txt(midX * 1.5, 163, 'tspike − t₀', { 'font-size': '14' });

    txt(midX / 2, 184, 'differentiate w.r.t. each spike', { 'font-size': '11', fill: C.dim, 'font-family': 'Arial, sans-serif' });
    txt(midX * 1.5, 184, 'differentiate w.r.t. one spike', { 'font-size': '11', fill: C.dim, 'font-family': 'Arial, sans-serif' });

    // Mini spike trains + derivative arrows
    const mY = 236, mH = 22;
    const mlLen = lLen, mrLen = rLen;

    seg(lx1, mY, lx2 + 10, mY, { stroke: '#888', 'stroke-width': '1.5' });
    rateSpikes.forEach(p => {
        const sx = lx1 + p * mlLen;
        seg(sx, mY, sx, mY - mH, { stroke: C.spike, 'stroke-width': '1.5' });
        seg(sx, mY + 5, sx, mY + 20, { stroke: C.deriv, 'stroke-width': '1.5', 'marker-end': 'url(#arr-deriv)' });
    });
    txt(midX / 2, mY + 34, '∂L/∂s(tk) for each k', { 'font-size': '12', fill: C.deriv, 'font-family': 'Arial, sans-serif' });

    seg(rx1, mY, rx2 + 10, mY, { stroke: '#888', 'stroke-width': '1.5' });
    const mssX = rx1 + 0.65 * mrLen;
    seg(mssX, mY, mssX, mY - mH, { stroke: C.spike, 'stroke-width': '2' });
    seg(mssX, mY + 5, mssX, mY + 20, { stroke: C.deriv, 'stroke-width': '2', 'marker-end': 'url(#arr-deriv)' });
    txt(midX * 1.5, mY + 34, '∂L/∂tspike', { 'font-size': '12', fill: C.deriv, 'font-family': 'Arial, sans-serif' });

    container.appendChild(svg);
})();
