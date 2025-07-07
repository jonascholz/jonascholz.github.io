document.addEventListener('DOMContentLoaded', function() {
    let last_s = []; // Variable to store the last spike train
    let w_trace_visible = 'legendonly'; // Initial state

    function getSpikeResponseTraces({ u, w, s, spike_times }) {
        last_s = s; // Store the spike train
        const time = Array.from({ length: u.length }, (_, i) => i);

        const trace_u = {
            x: time,
            y: u,
            mode: 'lines',
            name: 'u(t) (Membrane Potential)',
            line: {color: '#2ca02c'}
        };

        const trace_w = {
            x: time,
            y: w,
            mode: 'lines',
            name: 'w(t) (Adaptive Current)',
            line: {color: '#d62728', dash: 'dash'},
            visible: w_trace_visible
        };
        
        const spike_out_times = [];
        const spike_out_u = [];
        for (let i = 0; i < s.length; i++) {
            if (s[i] === 1) {
                spike_out_times.push(i);
                spike_out_u.push(u[i]);
            }
        }

        const trace_s_out = {
            x: spike_out_times,
            y: spike_out_u,
            mode: 'markers',
            name: 'Output Spike',
            marker: {
                symbol: 'x-thin',
                color: 'orange',
                size: 8,
                line: {
                    width: 2
                }
            }
        };

        return [trace_u, trace_w, trace_s_out];
    }

    const plotController = createInteractivePlot({
        plotId: 'plot3',
        controls: [],
        simulationFunc: run_adlif_simulation,
        tracesFunc: getSpikeResponseTraces,
        simulationParams: {
            u0: 1.0,
            a: 20,
            b: 0,
            beta: 0.98,
            alpha: 0.98,
            spike_times: [120],
            w_in: 0.4
        },
        layoutOptions: {
            xaxis: { title: 'Time (steps)', range: [0, 200] },
            yaxis: { title: 'Value', range: [-0.55, 1.0] },
            legend: { x: 0.7, y: 0.95 },
            margin: { l: 50, r: 50, b: 50, t: 0, pad: 4 }
        }
    });

    const spikeInputArea = document.getElementById('spike-input-area');
    const plotDiv = document.getElementById('plot3');
    const t_steps = 200; // Total time steps in the simulation

    if (plotDiv) {
        plotDiv.on('plotly_legendclick', (data) => {
            if (data.fullData[data.curveNumber].name === 'w(t) (Adaptive Current)') {
                // Toggle the visibility state based on its current value
                w_trace_visible = w_trace_visible === true ? 'legendonly' : true;
            }
        });
    }

    function drawSpikeMarkers(spike_times) {
        if (!spikeInputArea) return;
        spikeInputArea.innerHTML = ''; // Clear existing markers
        const areaWidth = spikeInputArea.clientWidth;
        if (areaWidth === 0) return; // Avoid division by zero

        spike_times.forEach(t => {
            const marker = document.createElement('div');
            marker.style.position = 'absolute';
            marker.style.left = `${(t / t_steps) * 100}%`;
            marker.style.top = '0';
            marker.style.width = '2px';
            marker.style.height = '100%';
            marker.style.backgroundColor = '#1f77b4';
            marker.title = `Spike at t=${t}`;
            spikeInputArea.appendChild(marker);
        });
    }

    setTimeout(() => {
        drawSpikeMarkers(plotController.getParams().spike_times);
        plotController.update(); // This will call getSpikeResponseTraces and populate last_s
    }, 100);

    let isDragging = false;

    function updateSpikePosition(event) {
        const rect = spikeInputArea.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const areaWidth = spikeInputArea.clientWidth;
        let new_spike_time = Math.round((x / areaWidth) * t_steps);
        new_spike_time = Math.max(0, Math.min(t_steps, new_spike_time));

        if (new_spike_time !== plotController.getParams().spike_times[0]) {
            plotController.setParam('spike_times', [new_spike_time]);
            plotController.update();
            drawSpikeMarkers([new_spike_time]);
        }
    }

    spikeInputArea.addEventListener('mousedown', (event) => {
        isDragging = true;
        updateSpikePosition(event);
    });

    spikeInputArea.addEventListener('mousemove', (event) => {
        if (isDragging) {
            updateSpikePosition(event);
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    spikeInputArea.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    window.addEventListener('resize', () => {
        drawSpikeMarkers(plotController.getParams().spike_times);
    });
});
