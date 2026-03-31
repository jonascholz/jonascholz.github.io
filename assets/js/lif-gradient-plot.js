document.addEventListener('DOMContentLoaded', function () {
    const plotDiv = document.getElementById('lif-gradient-plot');
    const sweepDiv = document.getElementById('lif-sweep-plot');
    const outputDiv = document.getElementById('lif-output-plot');
    const inputSlider = document.getElementById('lif-input-slider');
    const thresholdSlider = document.getElementById('lif-threshold-slider');
    const alphaSlider = document.getElementById('lif-alpha-slider');
    const widthSlider = document.getElementById('lif-width-slider');
    const cutoffInput = document.getElementById('lif-cutoff-input');
    const heightInput = document.getElementById('lif-height-input');
    const resetToggle = document.getElementById('lif-reset-toggle');
    const inputValue = document.getElementById('lif-input-value');
    const thresholdValue = document.getElementById('lif-threshold-value');
    const alphaValue = document.getElementById('lif-alpha-value');
    const widthValue = document.getElementById('lif-width-value');

    if (!plotDiv || !inputSlider || !thresholdSlider || !alphaSlider || !widthSlider) return;

    var N_TIMESTEPS = 45;
    var SWEEP_TIMESTEPS = 50;
    var N_INPUTS = 250;

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

    function heaviside(x) {
        return x > 0 ? 1 : 0;
    }

    function simulate(inputVal, threshold, alpha, width, height, includeReset, nTimesteps, inputCutoff) {
        var u = 0;
        var w = 1;
        var s = 0;

        var uHistory = [0];
        var spikeTimes = [];
        var uDerivatives = [0];
        var sDerivatives = [0];

        for (var t = 1; t < nTimesteps; t++) {
            var x = t < inputCutoff ? inputVal : 0;
            u = alpha * u + w * x - s * threshold;
            var resetTerm = includeReset ? sDerivatives[t - 1] * threshold : 0;
            var uDeriv = alpha * uDerivatives[t - 1] + w - resetTerm;
            uHistory.push(u);
            s = heaviside(u - threshold);
            var sDeriv = surrogateDerivative(u - threshold, width, height) * uDeriv;
            sDerivatives.push(sDeriv);
            if (s) spikeTimes.push(t);
            uDerivatives.push(uDeriv);
        }

        return { uHistory: uHistory, sDerivatives: sDerivatives, spikeTimes: spikeTimes };
    }

    function computeSweep(threshold, alpha, width, height, includeReset) {
        var inputs = [];
        var gradients = [];
        for (var i = 0; i < N_INPUTS; i++) {
            var inputVal = -1 + (2 * i) / (N_INPUTS - 1);
            inputs.push(inputVal);
            var result = simulate(inputVal, threshold, alpha, width, height, includeReset, SWEEP_TIMESTEPS, SWEEP_TIMESTEPS);
            var sum = 0;
            for (var j = 0; j < result.sDerivatives.length; j++) {
                sum += result.sDerivatives[j];
            }
            gradients.push(sum / SWEEP_TIMESTEPS);
        }
        return { inputs: inputs, gradients: gradients };
    }

    function updatePlot() {
        var x = parseFloat(inputSlider.value);
        var threshold = parseFloat(thresholdSlider.value);
        var alpha = parseFloat(alphaSlider.value);
        var width = parseFloat(widthSlider.value);
        var height = heightInput ? Math.max(0.1, parseFloat(heightInput.value) || 1.0) : 1.0;
        var inputCutoff = cutoffInput ? Math.max(1, Math.min(44, parseInt(cutoffInput.value) || 36)) : 36;
        var includeReset = resetToggle.checked;

        inputValue.textContent = x.toFixed(2);
        thresholdValue.textContent = threshold.toFixed(2);
        alphaValue.textContent = alpha.toFixed(2);
        widthValue.textContent = width.toFixed(2);

        // First plot: single neuron over time
        var result = simulate(x, threshold, alpha, width, height, includeReset, N_TIMESTEPS, inputCutoff);
        var time = Array.from({ length: result.uHistory.length }, function (_, i) { return i; });

        var traceU = {
            x: time,
            y: result.uHistory,
            mode: 'lines',
            name: 'U[t]',
            line: { color: '#2ca02c', width: 3 },
            xaxis: 'x',
            yaxis: 'y'
        };

        var traceThreshold = {
            x: [0, N_TIMESTEPS - 1],
            y: [threshold, threshold],
            mode: 'lines',
            name: 'Threshold θ',
            line: { color: 'gray', width: 2, dash: 'dash' },
            xaxis: 'x',
            yaxis: 'y'
        };

        var spikeX = result.spikeTimes;
        var spikeY = result.spikeTimes.map(function (t) { return result.uHistory[t]; });
        var traceSpikes = {
            x: spikeX,
            y: spikeY,
            mode: 'markers',
            name: 'Spikes',
            marker: { color: '#2ca02c', size: 12, symbol: 'x', line: { width: 3 } },
            xaxis: 'x',
            yaxis: 'y'
        };

        var traceSDeriv = {
            x: time,
            y: result.sDerivatives,
            mode: 'lines',
            name: '∂S/∂x',
            line: { color: '#1f77b4', width: 3 },
            xaxis: 'x2',
            yaxis: 'y2'
        };

        var cutoffLineShape = {
            type: 'line',
            x0: inputCutoff, x1: inputCutoff,
            y0: 0, y1: 1,
            yref: 'paper',
            line: { color: '#e377c2', width: 2, dash: 'dot' }
        };

        var layout1 = {
            grid: { rows: 2, columns: 1, subplots: [['xy'], ['x2y2']] },
            xaxis: { title: '', showticklabels: false, zeroline: false },
            yaxis: { title: 'Membrane potential', zeroline: true, gridcolor: '#e5e7eb' },
            xaxis2: { title: 'Timestep', anchor: 'y2', zeroline: false },
            yaxis2: { title: 'Spike derivative', anchor: 'x2', zeroline: true, gridcolor: '#e5e7eb' },
            shapes: [cutoffLineShape],
            showlegend: false,
            margin: { l: 60, r: 30, b: 50, t: 20, pad: 4 },
            plot_bgcolor: '#fff',
            paper_bgcolor: '#fff'
        };

        Plotly.react('lif-gradient-plot', [traceU, traceThreshold, traceSpikes, traceSDeriv], layout1, { displayModeBar: false });

        // Second plot: average gradient sweep
        if (!sweepDiv) return;

        var sweep = computeSweep(threshold, alpha, width, height, includeReset);

        var traceSweep = {
            x: sweep.inputs,
            y: sweep.gradients,
            mode: 'lines',
            name: 'Avg gradient',
            line: { color: '#1f77b4', width: 3 }
        };

        // Find the average gradient at the current x value
        var currentResult = simulate(x, threshold, alpha, width, height, includeReset, SWEEP_TIMESTEPS, SWEEP_TIMESTEPS);
        var currentSum = 0;
        for (var j = 0; j < currentResult.sDerivatives.length; j++) {
            currentSum += currentResult.sDerivatives[j];
        }
        var currentAvgGrad = currentSum / SWEEP_TIMESTEPS;

        var traceMarker = {
            x: [x],
            y: [currentAvgGrad],
            mode: 'markers',
            name: 'Current x',
            marker: { color: 'purple', size: 12, symbol: 'circle', line: { width: 2, color: 'purple' } }
        };

        var yMin = sweep.gradients[0];
        var yMax = sweep.gradients[0];
        for (var k = 1; k < sweep.gradients.length; k++) {
            if (sweep.gradients[k] < yMin) yMin = sweep.gradients[k];
            if (sweep.gradients[k] > yMax) yMax = sweep.gradients[k];
        }
        var yPad = (yMax - yMin) * 0.1 || 0.1;

        var layout2 = {
            xaxis: { title: 'Input value', zeroline: true, gridcolor: '#e5e7eb' },
            yaxis: { title: 'Average gradient', zeroline: true, gridcolor: '#e5e7eb', range: [yMin - yPad, yMax + yPad] },
            showlegend: false,
            margin: { l: 60, r: 30, b: 50, t: 20, pad: 4 },
            plot_bgcolor: '#fff',
            paper_bgcolor: '#fff'
        };

        Plotly.react('lif-sweep-plot', [traceSweep, traceMarker], layout2, { displayModeBar: false });

        // Third plot: output (firing rate) sweep
        if (!outputDiv) return;

        var outputInputs = [];
        var outputRates = [];
        for (var oi = 0; oi < N_INPUTS; oi++) {
            var oInputVal = -1 + (2 * oi) / (N_INPUTS - 1);
            outputInputs.push(oInputVal);
            var oResult = simulate(oInputVal, threshold, alpha, width, height, includeReset, SWEEP_TIMESTEPS, SWEEP_TIMESTEPS);
            outputRates.push(oResult.spikeTimes.length / SWEEP_TIMESTEPS);
        }

        var traceOutput = {
            x: outputInputs,
            y: outputRates,
            mode: 'lines',
            name: 'Firing rate',
            line: { color: '#2ca02c', width: 3 }
        };

        var currentSpikes = simulate(x, threshold, alpha, width, height, includeReset, SWEEP_TIMESTEPS, SWEEP_TIMESTEPS);
        var currentRate = currentSpikes.spikeTimes.length / SWEEP_TIMESTEPS;

        var traceOutputMarker = {
            x: [x],
            y: [currentRate],
            mode: 'markers',
            name: 'Current x',
            marker: { color: 'purple', size: 12, symbol: 'circle', line: { width: 2, color: 'purple' } }
        };

        var oYMin = 0;
        var oYMax = outputRates[0];
        for (var ok = 1; ok < outputRates.length; ok++) {
            if (outputRates[ok] > oYMax) oYMax = outputRates[ok];
        }
        var oYPad = oYMax * 0.1 || 0.05;

        var layout3 = {
            xaxis: { title: 'Input value', zeroline: true, gridcolor: '#e5e7eb' },
            yaxis: { title: 'Firing rate', zeroline: true, gridcolor: '#e5e7eb', range: [oYMin, oYMax + oYPad] },
            showlegend: false,
            margin: { l: 60, r: 30, b: 50, t: 20, pad: 4 },
            plot_bgcolor: '#fff',
            paper_bgcolor: '#fff'
        };

        Plotly.react('lif-output-plot', [traceOutput, traceOutputMarker], layout3, { displayModeBar: false });
    }

    inputSlider.addEventListener('input', updatePlot);
    thresholdSlider.addEventListener('input', updatePlot);
    alphaSlider.addEventListener('input', updatePlot);
    widthSlider.addEventListener('input', updatePlot);
    if (cutoffInput) cutoffInput.addEventListener('input', updatePlot);
    if (heightInput) heightInput.addEventListener('input', updatePlot);
    resetToggle.addEventListener('change', updatePlot);

    var surrogateSelect = document.getElementById('surrogate-type-select');
    if (surrogateSelect) surrogateSelect.addEventListener('change', updatePlot);

    updatePlot();
});
