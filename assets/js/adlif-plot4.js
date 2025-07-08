document.addEventListener('DOMContentLoaded', function() {
    const plotDiv = document.getElementById('plot4');
    if (!plotDiv) return;

    let w_trace_visible = 'legendonly'; // Initial state
    const t_steps = 200;
    let spikes_enabled = true;

    function generateSpikeTimes(freq) {
        if (freq === 0) return [];
        const interval = t_steps / freq;
        const spike_events = [];
        for (let t = interval; t < t_steps; t += interval) {
            spike_events.push(Math.round(t));
        }
        return spike_events.flatMap(t => [t, t + 2, t + 4]);
    }

    function getSpikeResponseTraces({ u, w, s }) {
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
        plotId: 'plot4',
        controls: [
            { sliderId: 'frequency_slider_4', paramName: 'frequency', valueSpanId: 'frequency_value_4' }
        ],
        simulationFunc: run_adlif_simulation,
        tracesFunc: getSpikeResponseTraces,
        simulationParams: (params) => {
            const all_spike_times = generateSpikeTimes(params.frequency);
            return {
                ...params,
                u0: 1.0,
                a: 55,
                b: 0,
                beta: 0.98,
                alpha: 0.98,
                w_in: 0.3,
                spike_times: spikes_enabled ? all_spike_times : [],
                all_spike_times: all_spike_times
            };
        },
        layoutOptions: {
            xaxis: { title: 'Time (steps)', range: [0, 200] },
            yaxis: { title: 'Value', range: [-0.7, 1.0] },
            legend: { x: 0.7, y: 0.95 },
            margin: { l: 50, r: 50, b: 50, t: 0, pad: 4 }
        }
    });

    if (plotDiv && plotDiv.on) {
        plotDiv.on('plotly_legendclick', (data) => {
            if (data.fullData[data.curveNumber].name === 'w(t) (Adaptive Current)') {
                w_trace_visible = w_trace_visible === true ? 'legendonly' : true;
            }
        });
    }

    const spikeInputArea = document.getElementById('spike-input-area-4');
    const toggleButton = document.getElementById('toggle-spikes-4');

    function drawSpikeMarkers(spike_times) {
        if (!spikeInputArea) return;
        spikeInputArea.innerHTML = '';
        const areaWidth = spikeInputArea.clientWidth;
        if (areaWidth === 0) return;

        const markerColor = spikes_enabled ? '#1f77b4' : '#cccccc';

        spike_times.forEach(t => {
            const marker = document.createElement('div');
            marker.style.position = 'absolute';
            marker.style.left = `${(t / t_steps) * 100}%`;
            marker.style.top = '0';
            marker.style.width = '2px';
            marker.style.height = '100%';
            marker.style.backgroundColor = markerColor;
            marker.title = `Spike at t=${t}`;
            spikeInputArea.appendChild(marker);
        });
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            spikes_enabled = !spikes_enabled;
            plotController.update();
        });
    }

    plotController.update();
    setTimeout(() => {
        const params = plotController.getParams();
        drawSpikeMarkers(params.all_spike_times);
    }, 100);

    window.addEventListener('resize', () => {
        const params = plotController.getParams();
        drawSpikeMarkers(params.all_spike_times);
    });

    plotController.onUpdate(newParams => {
        drawSpikeMarkers(newParams.all_spike_times);
    });
});
