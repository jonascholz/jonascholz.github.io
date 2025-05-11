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

<!-- Spiking Neuron Animation
======
<div style="margin-bottom: 10px;">
  <div style="margin-bottom: 5px;">
    <label for="spikeProbability">Input Spike Probability: </label>
    <input type="range" id="spikeProbability" min="1" max="5" value="3" step="1">
    <span id="probabilityValue">3</span>%
  </div>
  <div style="margin-bottom: 5px;">
    <label for="decayRate">Membrane Decay Rate: </label>
    <input type="range" id="decayRate" min="2" max="6" value="4" step="1">
    <span id="decayValue">0.4</span> per frame
  </div>
</div>
<canvas id="neuronCanvas" width="800" height="400"></canvas> -->

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
</script>

<!-- <script src="{{ '/assets/js/neuron-animation.js' | relative_url }}"></script> -->