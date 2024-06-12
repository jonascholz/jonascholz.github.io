---
permalink: /
title: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

<!-- NOTE age is calculated dynamically with a script tag at the end of this file -->
I'm a {% raw %}<span id="age"></span>{% endraw %} year old AI Researcher working towards Artificial General Intelligence. For the most part I was following conventional Deep Learning research, but in the past year I have focused on Spiking Neural Networks due to their biological plausibility, energy efficiency and network scalability.

What I'm up to
======

This website is under development and will be updated slowly over time.

I'm currently working on my Master's Thesis about Actor-Critic Learning in SNNs. Meanwhile I'm employed as a Research Assistant at the FZI and as a Researcher at the University of Hagen. If you are looking to fill a PhD position in Neuromorphic Computing, AI foundation models or anything of the sort, please send me an email.

Thoughts on Deep Learning and Neuromorphic Computing
======
Deep Learning is great, we have seen so many milestones in the last decade, it's incredible. I was and continue to be fascinated by the latest advances, but it seems to me like the current approach has some theoretical limits that are hard to overcome with conventional methods. 

The larger a given network, the higher its computational cost and energy consumption. Ultimately all computations come down to matrix multiplications, where the matrices represent weights of the network. Even if a weight is 0, it will still cause computational costs for the network. This is in contrast to Spiking Neural Networks, where event-based computation becomes a possibility. In this approach, only active neurons will create an event and only events will be processed. Theoretically, there may be a billion neurons, but only a million of them are active and only they are being processed. Surely it won't be quite as ideal in practice, but the approach seems more promising to me.

Eventually I want to create a network that generalizes to many tasks. It should both drive your car and talk to you, whereas these would be completely separate networks right now. Neuromorphic Computing appears to be the path towards that goal. While there are many open problems in the space, I am mostly focused on learning algorithms right now. In my current understanding, learning rules should be local to enable the kind of sparse activation described above. As far as I am aware, most SNN training is done by converting ANNs or training with surrogate gradients. I don't think either of those will suffice for the generalized model I described.

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