document.addEventListener('DOMContentLoaded', function() {
    const u0_slider = document.getElementById('u0_slider');
    const plotDiv = document.getElementById('plot');

    // Exit if plot elements are not on the page
    if (!u0_slider || !plotDiv) {
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
        
        return [trace2, trace1];
    }

    createInteractivePlot({
        plotId: 'plot',
        controls: [
            { sliderId: 'u0_slider', paramName: 'u0' }
        ],
        simulationFunc: run_adlif_simulation,
        tracesFunc: getAdlifTraces,
        simulationParams: {
            a: 20,
            b: 0,
            beta: 0.98,
            spike_times: [],
            w_in: 0
        },
        layoutOptions: {
            xaxis: { title: 'Time (steps)' },
            yaxis: { title: 'Value', range: [-0.5, 1.5] },
            legend: { x: 0.7, y: 0.95 },
            margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 }
        }
    });
});
