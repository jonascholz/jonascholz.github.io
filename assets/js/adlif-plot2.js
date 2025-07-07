document.addEventListener('DOMContentLoaded', function() {
    function run_adlif_simulation_with_fixed_u0(params) {
        return run_adlif_simulation({ ...params, u0: 1.0 });
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
        plotId: 'plot2',
        controls: [
            { sliderId: 'beta_slider', valueSpanId: 'beta_value', paramName: 'beta' },
            { sliderId: 'a_slider', valueSpanId: 'a_value', paramName: 'a' }
        ],
        simulationFunc: run_adlif_simulation_with_fixed_u0,
        tracesFunc: getAdlifTraces,
        layoutOptions: {
            xaxis: { title: 'Time (steps)' },
            yaxis: { title: 'Value', range: [-0.5, 2.0] },
            legend: { x: 0.7, y: 0.95 },
            margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 }
        }
    });
});
