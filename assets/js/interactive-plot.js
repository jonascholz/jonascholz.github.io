function createInteractivePlot({
    plotId,
    controls,
    simulationFunc,
    tracesFunc,
    layoutOptions
}) {
    const plotDiv = document.getElementById(plotId);
    if (!plotDiv) return;

    const controlElements = controls.map(c => ({
        slider: document.getElementById(c.sliderId),
        span: document.getElementById(c.valueSpanId),
        paramName: c.paramName,
        value: 0
    }));

    if (controlElements.some(c => !c.slider || !c.span)) {
        console.error("One or more control elements not found for plot:", plotId);
        return;
    }

    function update_plot() {
        const simParams = {};
        controlElements.forEach(c => {
            const value = parseFloat(c.slider.value);
            if (c.span) {
                c.span.textContent = value.toFixed(2);
            }
            simParams[c.paramName] = value;
        });

        if (typeof simulationFunc !== 'function') {
            console.error('Simulation function is not defined for plot:', plotId);
            return;
        }

        const simData = simulationFunc(simParams);
        const traces = tracesFunc(simData);

        function getLayout() {
            const isMobile = window.innerWidth <= 768;
            const baseLayout = {
                ...layoutOptions,
                title: isMobile ? '' : layoutOptions.title,
                showlegend: !isMobile && (layoutOptions.showlegend !== false),
            };
            return baseLayout;
        }

        Plotly.react(plotId, traces, getLayout());
    }

    controlElements.forEach(c => {
        c.slider.addEventListener('input', update_plot);
    });

    window.addEventListener('resize', function() {
        if (document.getElementById(plotId).data) {
            const isMobile = window.innerWidth <= 768;
            Plotly.relayout(plotId, {
                showlegend: !isMobile && (layoutOptions.showlegend !== false),
                title: isMobile ? '' : layoutOptions.title
            });
        }
    });

    update_plot();
}
