document.addEventListener('DOMContentLoaded', function() {
    const u0_slider = document.getElementById('u0_slider');
    const u0_value_span = document.getElementById('u0_value');
    const plotDiv = document.getElementById('plot');

    // Exit if plot elements are not on the page
    if (!u0_slider || !u0_value_span || !plotDiv) {
        return;
    }

    function update_plot() {
        const u0 = parseFloat(u0_slider.value);
        u0_value_span.textContent = u0.toFixed(2);

        // Ensure run_adlif_simulation is available
        if (typeof run_adlif_simulation !== 'function') {
            console.error('run_adlif_simulation is not defined. Make sure adlif.js is loaded.');
            return;
        }

        const { u, w, s } = run_adlif_simulation({ u0 });
        const time = Array.from({ length: 200 }, (_, i) => i);

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

        const layout = {
            title: 'AdLIF Neuron Dynamics',
            xaxis: { title: 'Time (steps)' },
            yaxis: { title: 'Value', range: [-0.5, 1.5] },
            legend: { x: 0.7, y: 0.95 }
        };

        Plotly.react('plot', [trace2, trace1, trace3], layout);
    }

    u0_slider.addEventListener('input', update_plot);

    // Initial plot
    update_plot();
});
