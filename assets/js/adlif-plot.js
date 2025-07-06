document.addEventListener('DOMContentLoaded', function() {
    const u0_slider = document.getElementById('u0_slider');
    const u0_value_span = document.getElementById('u0_value');
    const plotDiv = document.getElementById('plot');

    // Exit if plot elements are not on the page
    if (!u0_slider || !u0_value_span || !plotDiv) {
        return;
    }

    function getAdlifTraces({ u, w, s }) {
        const time = Array.from({ length: u.length }, (_, i) => i);

        const trace1 = {
            x: time,
            y: u,
            mode: 'lines',
            name: 'u(t) (Membrane Potential)',
            line: {color: '#2ca02c'}
        };

        const trace2 = {
            x: time,
            y: w,
            mode: 'lines',
            name: 'w(t) (Adaptive Current)',
            line: {color: '#d62728', dash: 'dash'},
        };
        
        const spike_times = time.filter((t, i) => s[i] === 1);
        const spike_heights = spike_times.map(() => 1.5); 

        const trace3 = {
            x: spike_times,
            y: spike_heights,
            mode: 'markers',
            name: 'Spikes S(t)',
            marker: { symbol: 'triangle-up', color: '#ff7f0e', size: 10 }
        };

        return [trace2, trace1, trace3];
    }

    createInteractivePlot({
        plotId: 'plot',
        controls: [
            { sliderId: 'u0_slider', valueSpanId: 'u0_value', paramName: 'u0' }
        ],
        simulationFunc: run_adlif_simulation,
        tracesFunc: getAdlifTraces,
        layoutOptions: {
            title: 'AdLIF Neuron Dynamics',
            xaxis: { title: 'Time (steps)' },
            yaxis: { title: 'Value', range: [-0.5, 1.5] },
            legend: { x: 0.7, y: 0.95 },
            margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 }
        }
    });
});
