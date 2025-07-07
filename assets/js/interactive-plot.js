function createInteractivePlot({
    plotId,
    controls,
    simulationFunc,
    tracesFunc,
    layoutOptions,
    simulationParams = {}
}) {
    const plotDiv = document.getElementById(plotId);
    if (!plotDiv) return;

    const controlElements = controls && controls.length > 0 ? controls.map(c => ({
        slider: document.getElementById(c.sliderId),
        span: document.getElementById(c.valueSpanId),
        paramName: c.paramName,
    })) : [];

    if (controlElements.some(c => !c.slider)) {
        console.error("One or more slider elements not found for plot:", plotId);
        return;
    }

    function get_current_params() {
        const dynamicParams = {};
        controlElements.forEach(c => {
            const value = parseFloat(c.slider.value);
            dynamicParams[c.paramName] = value;
        });
        return { ...simulationParams, ...dynamicParams };
    }

    function update_plot() {
        const current_params = get_current_params();
        
        // Update value spans if they exist
        controlElements.forEach(c => {
            if (c.span) {
                c.span.textContent = parseFloat(c.slider.value).toFixed(2);
            }
        });

        const simResults = simulationFunc(current_params);
        const tracesData = { ...current_params, ...simResults };
        const traces = tracesFunc(tracesData);

        function getLayout() {
            const isMobile = window.innerWidth <= 768;
            const { title, ...rest } = layoutOptions; // Destructure to remove title
            const baseLayout = {
                ...rest,
                showlegend: !isMobile && (layoutOptions.showlegend !== false),
            };
            return baseLayout;
        }

        Plotly.react(plotId, traces, getLayout(), {displayModeBar: false});
    }

    controlElements.forEach(c => {
        c.slider.addEventListener('input', update_plot);
    });

    window.addEventListener('resize', function() {
        if (document.getElementById(plotId).data) {
            const isMobile = window.innerWidth <= 768;
            Plotly.relayout(plotId, {
                showlegend: !isMobile && (layoutOptions.showlegend !== false)
            });
        }
    });

    update_plot(); // Initial plot

    return {
        update: update_plot,
        getParams: get_current_params,
        setParam: function(key, value) {
            simulationParams[key] = value;
        },
        getPlotDiv: function() { return plotDiv; }
    };
}
