document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('neuronCanvas');
    const ctx = canvas.getContext('2d');
    const probabilitySlider = document.getElementById('spikeProbability');
    const probabilityValue = document.getElementById('probabilityValue');
    const decaySlider = document.getElementById('decayRate');
    const decayValue = document.getElementById('decayValue');

    // Network layout
    const inputLayer = [
        { x: 100, y: 150 },
        { x: 100, y: 250 }
    ];
    const hiddenLayer = [
        { x: 400, y: 100 },
        { x: 400, y: 200 },
        { x: 400, y: 300 }
    ];
    const outputLayer = [
        { x: 700, y: 150 },
        { x: 700, y: 250 }
    ];

    // Connection weights (randomly initialized between 0.3 and 2.5)
    const weights = {
        inputToHidden: [
            [2.0, 0.4, 1.8],  // Input 1 to Hidden 1,2,3
            [0.3, 2.2, 0.5]   // Input 2 to Hidden 1,2,3
        ],
        hiddenToOutput: [
            [2.3, 0.4],  // Hidden 1 to Output 1,2
            [0.5, 2.1],  // Hidden 2 to Output 1,2
            [1.9, 0.6]   // Hidden 3 to Output 1,2
        ]
    };

    // Neuron properties
    const neuronRadius = 20;
    const threshold = 300;
    const resetPotential = 0;
    let decayRate = 0.4;
    const potentialRise = 50;
    const spikeSpeed = 7;
    const spikeRadius = 5;
    const updateInterval = 50; // ms between potential updates

    // Network state
    const neurons = {
        input: [
            { potential: 0, spikes: [] },
            { potential: 0, spikes: [] }
        ],
        hidden: [
            { potential: 0, spikes: [] },
            { potential: 0, spikes: [] },
            { potential: 0, spikes: [] }
        ],
        output: [
            { potential: 0, spikes: [] },
            { potential: 0, spikes: [] }
        ]
    };

    function drawNeuron(x, y, potential, isThreshold) {
        ctx.beginPath();
        ctx.arc(x, y, neuronRadius, 0, Math.PI * 2);
        
        const intensity = Math.min(255, Math.max(0, (potential / threshold) * 255));
        ctx.fillStyle = `rgb(0, ${50 + intensity}, 0)`;
        ctx.fill();

        if (isThreshold) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function drawConnection(startX, startY, endX, endY, weight) {
        const lineWidth = Math.max(1, Math.min(6, weight * 2.5));
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = 'grey';
        ctx.beginPath();
        ctx.moveTo(startX + neuronRadius, startY);
        ctx.lineTo(endX - neuronRadius, endY);
        ctx.stroke();
    }

    function drawSpike(spike) {
        if (spike && spike.active) {
            ctx.beginPath();
            ctx.arc(spike.x, spike.y, spikeRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'orange';
            ctx.fill();
        }
    }

    function updateSpikePosition(spike) {
        if (!spike.active) return;

        const dx = spike.targetX - spike.startX;
        const dy = spike.targetY - spike.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const progress = spike.progress + (spikeSpeed / distance);
        
        if (progress >= 1) {
            spike.active = false;
            if (spike.target) {
                spike.target.potential += potentialRise * spike.weight;
            }
        } else {
            spike.x = spike.startX + dx * progress;
            spike.y = spike.startY + dy * progress;
            spike.progress = progress;
        }
    }

    function updatePotential(neuron) {
        if (neuron.potential > resetPotential) {
            neuron.potential -= decayRate;
        }
        if (neuron.potential < resetPotential) {
            neuron.potential = resetPotential;
        }

        if (neuron.potential >= threshold) {
            neuron.potential = resetPotential;
            return true;
        }
        return false;
    }

    function generateSpike(neuron, startX, startY, targetX, targetY, target, weight) {
        // Only check for recent spikes on this specific connection
        const hasRecentSpike = neuron.spikes.some(s => 
            s.active && s.progress < 0.1 && 
            s.targetX === targetX && s.targetY === targetY
        );
        
        if (!hasRecentSpike) {
            neuron.spikes.push({
                x: startX,
                y: startY,
                startX: startX,
                startY: startY,
                targetX: targetX,
                targetY: targetY,
                target: target,
                weight: weight,
                progress: 0,
                active: true
            });
        }
    }

    function tryGenerateInputSpikes() {
        const probability = parseInt(probabilitySlider.value) / 100;
        
        // Try to generate spikes for both inputs
        neurons.input.forEach((input, i) => {
            if (Math.random() < probability) {
                const startX = inputLayer[i].x;
                const startY = inputLayer[i].y;
                
                // Generate spikes to all hidden neurons
                hiddenLayer.forEach((hidden, j) => {
                    // Only check if there's already a spike on this specific connection
                    const hasRecentSpike = input.spikes.some(s => 
                        s.active && s.progress < 0.1 && 
                        s.targetX === hidden.x && s.targetY === hidden.y
                    );
                    
                    if (!hasRecentSpike) {
                        generateSpike(input, startX, startY, hidden.x, hidden.y, 
                            neurons.hidden[j], weights.inputToHidden[i][j]);
                    }
                });
            }
        });

        setTimeout(tryGenerateInputSpikes, updateInterval);
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        inputLayer.forEach((input, i) => {
            hiddenLayer.forEach((hidden, j) => {
                drawConnection(input.x, input.y, hidden.x, hidden.y, weights.inputToHidden[i][j]);
            });
        });
        hiddenLayer.forEach((hidden, i) => {
            outputLayer.forEach((output, j) => {
                drawConnection(hidden.x, hidden.y, output.x, output.y, weights.hiddenToOutput[i][j]);
            });
        });

        // Update and draw input neurons
        neurons.input.forEach((neuron, i) => {
            neuron.spikes.forEach(updateSpikePosition);
            neuron.spikes = neuron.spikes.filter(s => s.active);
            neuron.spikes.forEach(drawSpike);
            drawNeuron(inputLayer[i].x, inputLayer[i].y, neuron.potential, 
                neuron.potential >= threshold);
        });

        // Update and draw hidden neurons
        neurons.hidden.forEach((neuron, i) => {
            neuron.spikes.forEach(updateSpikePosition);
            neuron.spikes = neuron.spikes.filter(s => s.active);
            neuron.spikes.forEach(drawSpike);
            const fired = updatePotential(neuron);
            if (fired) {
                outputLayer.forEach((output, j) => {
                    generateSpike(neuron, hiddenLayer[i].x, hiddenLayer[i].y, 
                        output.x, output.y, neurons.output[j], weights.hiddenToOutput[i][j]);
                });
            }
            drawNeuron(hiddenLayer[i].x, hiddenLayer[i].y, neuron.potential, 
                neuron.potential >= threshold);
        });

        // Update and draw output neurons
        neurons.output.forEach((neuron, i) => {
            neuron.spikes.forEach(updateSpikePosition);
            neuron.spikes = neuron.spikes.filter(s => s.active);
            neuron.spikes.forEach(drawSpike);
            updatePotential(neuron);
            drawNeuron(outputLayer[i].x, outputLayer[i].y, neuron.potential, 
                neuron.potential >= threshold);
        });

        requestAnimationFrame(gameLoop);
    }

    // Update probability display
    probabilitySlider.addEventListener('input', function() {
        probabilityValue.textContent = this.value;
    });

    // Update decay rate display and value
    decaySlider.addEventListener('input', function() {
        const value = parseInt(this.value) / 10;
        decayValue.textContent = value.toFixed(1);
        decayRate = value;
    });

    // Start generating spikes
    tryGenerateInputSpikes();

    gameLoop();
}); 