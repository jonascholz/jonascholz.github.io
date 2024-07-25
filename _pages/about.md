---
permalink: /
title: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

<!-- NOTE age is calculated dynamically with a script tag at the end of this file -->
I'm a {% raw %}<span id="age"></span>{% endraw %} year old AI Researcher working towards a more general Artificial Intelligence. For the most part I was following conventional Deep Learning research, but in the past year I have focused on Spiking Neural Networks due to their biological plausibility, energy efficiency and network scalability.

What I'm up to
======

I'm currently working on my Master's Thesis about a Learning Algorithm for SNNs. Meanwhile I'm employed as a Research Assistant at the FZI and as a Researcher at the University of Hagen. If you are looking to fill a PhD position in Neuromorphic Computing, AI foundation models or anything of the sort, please send me an email. 

Thoughts on Deep Learning and Neuromorphic Computing
======
Deep Learning is great, we have seen so many milestones in the last decade, it's incredible. I was and continue to be fascinated by the latest advances, but it seems to me like the current approach has theoretical limits that are hard to overcome. Particularly the synchronous nature of ANNs, where all layers are involved in all calculations. This does not seem scalable, especially when training a single network on a large variety of tasks.

I want to create an AI that generalizes to many tasks and can be run without a nuclear power plant and thousands of GPUs. To that end, Neuromorphic Computing appears to be pretty promising. While there are many open problems in the space, I am mostly focused on learning algorithms right now. In my current view, learning should be local to enable sparse activations not just during inference but also during training. As far as I am aware, most SNN training is done by converting ANNs or training with surrogate gradients. It appears to me that neither of those will meet the constraints I described.

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