---
title: "WIP Training SNNs"
excerpt: "Biggest blunder in my career so far. Many more to come. [Learn more](/projects/01_training_snns)<br/><img src='/assets/images/loss_landscapes.png'>"
collection: projects
tags: 
    - SNN
    - Neuromorphic Computing
    - Gradients
references:
  - id: maass1996
    text: 'W. Maass, "Lower bounds for the computational power of networks of spiking neurons," <i>Neural Computation</i>, vol. 8, no. 1, pp. 1-40, 1996.'
  - id: li2018
    text: 'H. Li, Z. Xu, G. Taylor, C. Studer and T. Goldstein, "Visualizing the loss landscape of neural nets," <i>Advances in Neural Information Processing Systems</i>, vol. 31, 2018.'
  - id: neftci2019
    text: 'E. O. Neftci, H. Mostafa and F. Zenke, "Surrogate gradient learning in spiking neural networks," <i>IEEE Signal Processing Magazine</i>, vol. 36, no. 6, pp. 51-63, 2019.'
  - id: pascanu2013
    text: 'R. Pascanu, T. Mikolov and Y. Bengio, "On the difficulty of training recurrent neural networks," <i>International Conference on Machine Learning (ICML)</i>, PMLR, 2013.'
  - id: bellec2020
    text: 'G. Bellec et al., "A solution to the learning dilemma for recurrent networks of spiking neurons," <i>Nature Communications</i>, vol. 11, no. 1, p. 3625, 2020.'
  - id: kaiser2020
    text: 'J. Kaiser, H. Mostafa and E. Neftci, "Synaptic plasticity dynamics for deep continuous local learning (DECOLLE)," <i>Frontiers in Neuroscience</i>, vol. 14, p. 424, 2020.'
---

Spiking Neural Networks are more energy-efficient than conventional neural networks, allegedly. That's because in conventional neural networks, all neurons are active. In an SNN on the other hand, only a small fraction of neurons are active, just as they are in real brains. 

Additionally, neurons communicate in discrete spikes (0 or 1) and therefore send much more efficient signals. Neuromorphic hardware leverages this property and only processes synpatic operations (i.e. when spikes are sent), which can happen at any time over some fixed simulation window.

![Sparse activation in SNNs](/assets/images/sparse_activation.png)

The only problem is, SNNs are bad at performing any real-world tasks. If somebody could make them work well then they would have the efficiency of Neuromorphic Computing with the capabilities of modern Deep Learning.

## SNN Learning rules
If you give an SNN enough time, it can express anything that an RNN can via rate coding. RNNs are supposedly Turing complete under dubious circumstances {% include cite.html key="maass1996" %}. 

So then it must be the training that falls short. How are SNNs trained anyway? Well, there are many biologically inspired rules. I even tried one out during [my Master's thesis](/projects/02_cartpole/). However, Neftci et al. {% include cite.html key="neftci2019" %} showed that LIFs (the most common spiking neurons) map to RNNs and so we can just use Backpropagation through time. 

BPTT is known to have some problems {% include cite.html key="pascanu2013" %} so we might as well consider some alternatives. There's a very interesting one called e-prop {% include cite.html key="bellec2020" %}, that carries a kind of eligibility forward in time and then uses the loss signal to make weight changes at the end. There's another one called DECOLLE {% include cite.html key="kaiser2020" %} which is interesting because it has local losses for every layer.

There are many more. In fact, I tried to write a survey on the most promising learning rules. Ultimately I found that anything biologically inspired is only relevant for neuroscientists, because these rules don't work well for practical use. And it makes sense: all of the biologically inspired learning rules must also calculate a gradient of some sort, just one that is harder to describe mathematically. Why not start from the mathematics then instead of taking a detour across biological parallels? Moreover, BPTT kept coming out on top for gradient-based learning, since verything else was just an approximation.

## The architecture
What architecture should we go with though? SNNs are simulated over time and we only process spikes. We could have connections going backwards to previous layers if we wanted to.

![Recurrent SNN architecture](/assets/images/recurrence.png)

In my early experiments, having recurrence within a layer helped, but backward connections did not. However, this turned out to be more complicated because the initialization scheme needs to account for the amount of connections or the activations are skewed and the gradients explode. In fact, it's far more complicated and we will come back to it later.

## Loss Landscapes
For every set of parameters there is an associated loss. If we change the parameters slightly, we get a different loss. This defines a geometric loss landscape that gets traversed during training. Our goal is to land in a minimum. Perhaps the cleaner way to study architectures is through the lens of their loss landscapes.

![Loss landscapes](/assets/images/loss_landscapes.png)

I plotted some loss landscapes (as per {% include cite.html key="li2018" %}) and observed which ones were associated with good network performance. Note however, that loss landscapes give a weirdly smoothed look since the actual parameter space could have a million dimensions and we only see two. There are also a ton of caveats and other things to address. Especially since spiking neurons don't have a proper gradient. Therefore it might be more instructive to study the gradient of the loss w.r.t a single parameter rather than weirdly aggregated landscapes.

## LIF Gradients
Ah but the gradients of LIF neurons are a mess no matter what. I covered this in a blogpost (TODO link recurrent-bptt).

WIP

## Shattered Gradients
WIP

## Vanishing/Exploding Gradients
WIP

{% include references.html %}