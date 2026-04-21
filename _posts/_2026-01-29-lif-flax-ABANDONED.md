---
title: 'Implementing a LIF in flax'
excerpt: "Flax gives us a nice way to use classes for our neural networks like other frameworks. Here we upgrade our jax implementation to flax implementation. [Read more](/posts/2026/01/lif-flax/)<br/><img src='/assets/images/jax_vs_flax.png'>"
date: 2026-01-30
permalink: /posts/2026/01/lif-flax/
tags:
  - LIF
  - JAX
  - Flax
---


In a prior [tutorial](/posts/2025/10/lif-jax/) we implemented a LIF in JAX, which we described as a fancy version of numpy that also does gradients and some other things. 

This tutorial presents an implementation in the much more convenient [flax](https://github.com/google/flax). 

## Quick refresher
As we recall, the LIF's state $$\cU{U[t]}$$ is governed by the following equation:

$$
\begin{aligned}
\cU{U[t]} &= \underbrace{\calpha{\alpha} \cU{U[t-1]}}_{\text{decayed state}} + \underbrace{\cWin{W} \cX{X[t]}}_{\text{weighted input}} - \underbrace{\cS{S[t-1]} \ctheta{\theta}}_{\text{reset}}
\end{aligned}
$$

Additionally, the firing mechanism is defined as:

$$
\cS{S[t]} = \underbrace{\Theta}_{\text{heaviside}}(\cU{U[t]} - \ctheta{\theta})
$$

## The thing about flax
Normally everything in JAX is stateless. You have some data and pass that to a function. The function returns new data. This is different from PyTorch for example, where you have an instance of a network and its state can change over time. 

This is shown in the diagram below. Note however, that this is really just for convenience. Under the hood flax is using JAX and is therefore just as stateless. They have a bunch of workarounds to make it seem stateful.

<figure id="fig:mutability">
<div id="mutability-diagram" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 1:</strong> Comparison of JAX's functional approach (top) where functions return new data without modifying the original, versus Flax/PyTorch's class-based approach (bottom) where methods modify the object's internal state. NOTE under the hood flax still uses the functional approach above.</figcaption>
</figure>

<script src="{{ '/assets/js/mutability-diagram.js' | relative_url }}"></script>

## The basic architecture
The architecture of our LIF is the same as before, but the code will be slightly simpler.

<figure id="fig:lif_architecture">
<div id="lif-flax-architecture" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 2:</strong> LIF Layer architecture in Flax. Parameters (blue) are learned during training. Variables (green) hold the neuron state. Methods (purple) handle initialization, forward pass, and state reset.</figcaption>
</figure>

<script src="{{ '/assets/js/lif-flax-architecture.js' | relative_url }}"></script> 

We will have some parameters such as weights that don't change during a forward pass. There are also variables for the state, which can change every step in the forward pass. Finally, we have the methods. Previously these were just losely lying around in the script but now we get to put them into the class. Nice!

## Setup and variables
