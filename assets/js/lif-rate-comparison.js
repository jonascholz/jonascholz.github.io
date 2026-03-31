document.addEventListener('DOMContentLoaded', function () {
    var compDiv = document.getElementById('lif-rate-comparison-plot');
    if (!compDiv) return;

    var ALPHA = 0.96;
    var THETA = 0.5;
    var WIDTH = 1.0;
    var N_TIMESTEPS = 50;
    var N_INPUTS = 500;

    var HEIGHT = 0.15;

    function heaviside(x) {
        return x > 0 ? 1 : 0;
    }

    function triangularDerivative(x, width, height) {
        if (Math.abs(x) > width) return 0;
        return height * (1 - Math.abs(x) / width);
    }

    function boxcarDerivative(x, width, height) {
        if (Math.abs(x) > width) return 0;
        return height;
    }

    function surrogateDerivative(x, width, height) {
        var sel = document.getElementById('surrogate-type-select');
        if (sel && sel.value === 'boxcar') return boxcarDerivative(x, width, height);
        return triangularDerivative(x, width, height);
    }

    // Simulate spiking LIF
    function simulate(inputVal, height) {
        var u = 0;
        var s = 0;
        var spikes = 0;
        var uDerivatives = [0];
        var sDerivatives = [0];

        for (var t = 1; t < N_TIMESTEPS; t++) {
            u = ALPHA * u + inputVal - s * THETA;
            var resetTerm = sDerivatives[t - 1] * THETA;
            var uDeriv = ALPHA * uDerivatives[t - 1] + 1 - resetTerm;
            s = heaviside(u - THETA);
            var sDeriv = surrogateDerivative(u - THETA, WIDTH, height) * uDeriv;
            sDerivatives.push(sDeriv);
            uDerivatives.push(uDeriv);
            spikes += s;
        }

        var gradSum = 0;
        for (var j = 0; j < sDerivatives.length; j++) {
            gradSum += sDerivatives[j];
        }

        return {
            firingRate: spikes / N_TIMESTEPS,
            avgGradient: gradSum / N_TIMESTEPS
        };
    }

    // Analytical LIF firing rate: 1/T where T satisfies x*(1 - alpha^T)/(1 - alpha) = theta
    function analyticalFiringRate(x) {
        if (x <= 0) return 0;
        var xSteady = x / (1 - ALPHA);
        if (xSteady <= THETA) return 0;
        var ratio = 1 - THETA * (1 - ALPHA) / x;
        if (ratio <= 0) return 0;
        var T = Math.log(ratio) / Math.log(ALPHA);
        return 1 / T;
    }

    // ReLU derivative of the analytical firing rate: 0 below threshold, 1 above
    function reluDerivative(x) {
        var xSteady = x / (1 - ALPHA);
        if (xSteady <= THETA) return 0;
        return 1;
    }

    function draw() {
        var height = HEIGHT;

        var inputs = [];
        var spikeRates = [];
        var avgGradients = [];
        var analyticRates = [];

        for (var i = 0; i < N_INPUTS; i++) {
            var x = -0.2 + (1.2 * i) / (N_INPUTS - 1);
            inputs.push(x);
            var result = simulate(x, height);
            spikeRates.push(result.firingRate);
            avgGradients.push(result.avgGradient);
            analyticRates.push(analyticalFiringRate(x));
        }

        var analyticDerivs = inputs.map(reluDerivative);

        var traceSpikeRate = {
            x: inputs,
            y: spikeRates,
            mode: 'lines',
            name: 'Spike rate',
            line: { color: '#2ca02c', width: 3 },
            xaxis: 'x',
            yaxis: 'y'
        };

        var traceAnalytic = {
            x: inputs,
            y: analyticRates,
            mode: 'lines',
            name: 'ReLU',
            line: { color: '#2ca02c', width: 2, dash: 'dash' },
            xaxis: 'x',
            yaxis: 'y'
        };

        var traceAvgGrad = {
            x: inputs,
            y: avgGradients,
            mode: 'lines',
            name: 'Surrogate gradient',
            line: { color: '#1f77b4', width: 3 },
            xaxis: 'x2',
            yaxis: 'y2'
        };

        var traceAnalyticDeriv = {
            x: inputs,
            y: analyticDerivs,
            mode: 'lines',
            name: 'ReLU derivative',
            line: { color: '#1f77b4', width: 2, dash: 'dash' },
            xaxis: 'x2',
            yaxis: 'y2'
        };

        var layout = {
            grid: { rows: 1, columns: 2, subplots: [['xy', 'x2y2']] },
            xaxis: { title: 'Input value', zeroline: true, gridcolor: '#e5e7eb' },
            yaxis: { title: 'Firing rate', zeroline: true, gridcolor: '#e5e7eb' },
            xaxis2: { title: 'Input value', anchor: 'y2', zeroline: true, gridcolor: '#e5e7eb' },
            yaxis2: { title: 'Derivative', anchor: 'x2', zeroline: true, gridcolor: '#e5e7eb' },
            showlegend: true,
            legend: { orientation: 'h', y: -0.25, x: 0.5, xanchor: 'center' },
            margin: { l: 60, r: 30, b: 80, t: 20, pad: 4 },
            plot_bgcolor: '#fff',
            paper_bgcolor: '#fff'
        };

        Plotly.react('lif-rate-comparison-plot',
            [traceSpikeRate, traceAnalytic, traceAvgGrad, traceAnalyticDeriv],
            layout, { displayModeBar: false });
    }

    draw();

    var surrogateSelect = document.getElementById('surrogate-type-select');
    if (surrogateSelect) surrogateSelect.addEventListener('change', draw);
});
