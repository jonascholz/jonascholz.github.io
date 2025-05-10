---
permalink: /
title: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

<!-- NOTE age is calculated dynamically with a script tag at the end of this file -->
I'm a {% raw %}<span id="age"></span>{% endraw %} year old AI Researcher from Germany working towards artificial general intelligence (AGI).

Current projects
======
I'm always looking to collaborate. If you do anything that might lead to AGI, hit me up (jona.scholz[at]kit.de) and let's do it together.

Right now I am focused on Spiking Neural Networks, as those seem better suited for foundation models, but I'm happy if you can convice me otherwise. Here are some things that I am working on:

- Survey on training methods for Spiking Neural Networks
- Studies on credit assignment for local learning rules (e.g. how can we improve DFA mechanism of e-prop)
- Extending Alex's spike-encoding repo [link to repo](https://github.com/Alex-Vasilache/Spike-Encoding)

Why not pursue conventional ANNs?
======
**Feedforward connectivity:** We can not reuse circuits that perform key computations. It may be much more efficient to have loops and other types of recurrence.

**Full activation:** The brain doesn't use every neuron and every connection for every task. Our foundation models would benefit from sparse activations. Only activate neurons that are needed.

Spiking neurons may be better suited to recurrent connectivity and they are built around sparse activations. This might give them advantage in multi-task learning and energy-efficiency. 

Or maybe it doesn't. Right now they don't seem to be great at anything. Perhaps it's just a dead-end. That's what I'm hoping to figure out by the end of 2025.

Spiking Neuron Animation
======
<canvas id="neuronCanvas" width="600" height="200" style="border:1px solid #000000;"></canvas>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    var birthdate = "{{ site.birthdate }}";
    var birthDate = new Date(birthdate);
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    document.getElementById('age').innerText = ""+age;
  });

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
      // Draw neuron body
      ctx.beginPath();
      ctx.arc(neuronX, neuronY, neuronRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'lightblue';
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.stroke();

      // Draw membrane potential visual
      const potentialHeight = (membranePotential / threshold) * (neuronRadius * 1.8);
      ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
      ctx.fillRect(neuronX - neuronRadius / 2, neuronY + neuronRadius - 0.9*neuronRadius - potentialHeight, neuronRadius, potentialHeight);

      // Draw threshold line
      ctx.beginPath();
      ctx.moveTo(neuronX - neuronRadius * 0.7, neuronY + neuronRadius - 0.9*neuronRadius - (neuronRadius * 1.8));
      ctx.lineTo(neuronX + neuronRadius * 0.7, neuronY + neuronRadius - 0.9*neuronRadius - (neuronRadius * 1.8));
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'red';
      ctx.fillText("Threshold", neuronX + neuronRadius * 0.7 + 5, neuronY + neuronRadius - 0.9*neuronRadius - (neuronRadius * 1.8));


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

    // Periodically generate incoming spikes
    setInterval(() => {
      // Add a new spike only if the last one is far enough or gone
      if (!incomingSpikes.length || incomingSpikes[incomingSpikes.length-1].x > inputStartX + 50) {
         incomingSpikes.push({ x: inputStartX, y: inputStartY, active: true });
      }
    }, 2000); // New spike every 2 seconds

    gameLoop();
  });
</script>