document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('neuronCanvas');
    const ctx = canvas.getContext('2d');

    // Neuron properties
    let membranePotential = 0;
    const threshold = 100;
    const resetPotential = 0;
    const decayRate = 0.5; // Potential decay per frame
    const potentialRise = 35; // Potential increase per spike

    // Neuron position and size
    const neuronX = canvas.width / 2;
    const neuronY = canvas.height / 2;
    const neuronRadius = 30;

    // Input connection
    const inputStartX = 50;
    const inputStartY = neuronY;
    const inputEndX = neuronX - neuronRadius;
    const inputEndY = neuronY;

    // Output connection
    const outputStartX = neuronX + neuronRadius;
    const outputStartY = neuronY;
    const outputEndX = canvas.width - 50;
    const outputEndY = neuronY;

    let incomingSpikes = []; // { x, y, active }
    let outgoingSpike = null; // { x, y, active }
    const spikeSpeed = 5;
    const spikeRadius = 5;

    function drawNeuron() {
      // Draw neuron body with color based on membrane potential
      ctx.beginPath();
      ctx.arc(neuronX, neuronY, neuronRadius, 0, Math.PI * 2);
      
      // Calculate color intensity based on membrane potential
      const intensity = Math.min(255, Math.max(0, (membranePotential / threshold) * 255));
      ctx.fillStyle = `rgb(0, ${intensity}, 0)`; // Green color
      ctx.fill();

      // Only draw outline if threshold is surpassed
      if (membranePotential >= threshold) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw connections
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'grey';
      ctx.beginPath();
      ctx.moveTo(inputStartX, inputStartY);
      ctx.lineTo(inputEndX, inputEndY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(outputStartX, outputStartY);
      ctx.lineTo(outputEndX, outputEndY);
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

    function updateIncomingSpikes() {
      for (let i = incomingSpikes.length - 1; i >= 0; i--) {
        let spike = incomingSpikes[i];
        if (spike.active) {
          spike.x += spikeSpeed;
          if (spike.x >= inputEndX - spikeRadius) { // Spike reaches neuron
            membranePotential += potentialRise;
            spike.active = false; // Deactivate spike
          }
        }
      }
      // Remove inactive spikes
      incomingSpikes = incomingSpikes.filter(s => s.active || s.x < inputEndX - spikeRadius);
    }

    function updateOutgoingSpike() {
      if (outgoingSpike && outgoingSpike.active) {
        outgoingSpike.x += spikeSpeed;
        if (outgoingSpike.x >= outputEndX) {
          outgoingSpike.active = false; // Deactivate spike at end of axon
        }
      }
    }

    function updatePotential() {
      // Decay potential
      if (membranePotential > resetPotential) {
        membranePotential -= decayRate;
      }
      if (membranePotential < resetPotential) {
        membranePotential = resetPotential;
      }

      // Check for firing
      if (membranePotential >= threshold) {
        membranePotential = resetPotential; // Reset potential
        // Create an outgoing spike
        if (!outgoingSpike || !outgoingSpike.active) { // Fire only if no active outgoing spike
             outgoingSpike = { x: outputStartX + spikeRadius, y: outputStartY, active: true };
        }
      }
    }

    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      updatePotential();
      updateIncomingSpikes();
      updateOutgoingSpike();

      drawNeuron();
      incomingSpikes.forEach(drawSpike);
      drawSpike(outgoingSpike);

      requestAnimationFrame(gameLoop);
    }

    // Generate random spikes
    function generateRandomSpike() {
      if (!incomingSpikes.length || incomingSpikes[incomingSpikes.length-1].x > inputStartX + 50) {
        incomingSpikes.push({ x: inputStartX, y: inputStartY, active: true });
      }
      // Schedule next spike with random delay between 1 and 4 seconds
      setTimeout(generateRandomSpike, Math.random() * 1000 + 300);
    }

    // Start generating random spikes
    generateRandomSpike();

    gameLoop();
}); 