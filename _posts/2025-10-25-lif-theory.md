---
title: 'Implementing a LIF in theory'
excerpt: "A hand-wavy description of the Leaky Integrate-and-Fire neuron. It follows the conventions of Eshraghian et al. 2023. [Read more](/posts/2025/10/lif-theory/)<br/><img src='/assets/images/lif_functionality.gif'>"
date: 2025-10-25
permalink: /posts/2025/10/lif-theory/
tags:
  - SNN
  - Tutorial
  - LIF
---

<div class="notice--info" markdown="1">
**Note:** This description follows the convention of Eshraghian et al. 2023 ([Training Spiking Neural Networks Using Lessons From Deep Learning](https://ieeexplore.ieee.org/abstract/document/10242251/){:target="_blank"}).
</div>

The Leaky Integrate and Fire (LIF) neuron is one of the greats. Unlike standard artifial neurons, the LIF has a state. If you know RNNs: it's the same but with a worse activation function.

The basic dynamics are shown below in Figure 1. In the uppermost part you see the state $$\cU{u}$$ that changes over time. It increases when spikes come in. These spikes are just inputs and they are either 0 or 1. This is unlike conventional ANNs, which take in continuous floating point values, although you could use floating point inputs here as well. 

Eventually when the integration surpasses a threshold, the neuron fires. We see this in the outgoing spikes. We can also see how the state is leaky all through-out.

<figure id="fig:lif_functionality">
<img src="{{ '/assets/images/lif_functionality.gif' | relative_url }}" alt="LIF neuron functionality" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
<figcaption><strong>Figure 1:</strong> LIF neuron dynamics showing spike arrival, membrane potential evolution, and spike output over time.</figcaption>
</figure>

## The state variable

Formally, the neuron membrane potential $$\cU{u[t]}$$ decays in proportion to $$\calpha{\alpha}$$. Input spikes are denoted as $$\cX{x[t]}$$ and are weighted by $$\cWin{w}$$.  When the membrane potential crosses a threshold $$\ctheta{\theta}$$, the neuron fires a spike and resets.

<figure id="fig:lif_diagram">
<div id="lif-neuron-diagram" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 2:</strong> LIF neuron architecture showing some components of the dynamics equation. Input current x[t] is weighted by w. The firing and reset mechanisms are not shown</figcaption>
</figure>

<script src="{{ '/assets/js/lif-diagram.js' | relative_url }}"></script>


We can describe the membrane potential $$\cU{u[t]}$$ as:

\begin{equation}
\cU{u[t]} = \calpha{\alpha} \cU{u[t-1]} + \cWin{w} \cX{x[t]}
\label{eq:lif_full}
\end{equation}

where the decay $$\calpha{\alpha}$$ is is between 0 and 1. We will need to reset the state as well, which happens on every spike. Let's first see how to describe spikes.

## The spike mechanism

Spikes are emitted whenever a threshold is surpassed ($$\cU{u[t]} \geq \ctheta{\theta}$$). In other words, we output 1 whenever $$\cU{u[t]} \geq \ctheta{\theta}$$ and 0 otherwise. There happens to be a function which does just that:

<figure id="fig:heaviside">
<div id="heaviside-plot" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 3:</strong> The Heaviside step function Θ(x). The function outputs 0 for all negative inputs and 1 for all non-negative inputs.</figcaption>
</figure>

<script src="{{ '/assets/js/heaviside-plot.js' | relative_url }}"></script>

All we have to do is pass $$\cU{u[t]} - \ctheta{\theta}$$ into the heaviside function. If $$\cU{u[t]}$$ is below the threshold, the heaviside function turns it into a 0. If it is equal to or above the threshold, the heaviside function turns it into a 1. Formally:

\begin{equation}
\cS{s[t]} = \Theta(\cU{u[t]} - \ctheta{\theta})
\label{eq:spike_function}
\end{equation}

## The reset term

Now all that's missing is that we reset our state when a spike happens, i.e., when the threshold is surpassed. A soft reset would be to simply subtract the threshold from our state the moment that the threshold is surpassed.

The soft reset will not always reset the state back to 0, but it's simple and often good enough. We can add it by simply adding an additional term to our state equation:

\begin{equation}
\cU{u[t]} = \calpha{\alpha} \cU{u[t-1]} + \cWin{w} \cX{x[t]} - \underbrace{\cS{s[t-1]} \ctheta{\theta}}_{\text{reset}}
\label{eq:lif_with_reset}
\end{equation}

The reset term subtracts the threshold when a spike occurred at the previous timestep.  When there was no spike ($$\cS{s[t-1]} = 0$$), nothing is subtracted. Pretty elegant!

## Vectorizing

So far we've looked at a single neuron with a single incoming connection. In practice, you'll want multiple neurons processing multiple inputs. The good news is that the equations barely change.

Instead of a single membrane potential $$\cU{u[t]}$$, we now have a vector $$\cU{U[t]}$$ where each element represents one neuron. Similarly, our spike output becomes a vector $$\cS{S[t]}$$.

The only notable change is that the weight $$\cWin{w}$$ becomes a weight matrix $$\cWin{W}$$ that connects each input to each neuron. The vectorized equation looks like this:

\begin{equation}
\cU{U[t]} = \calpha{\alpha} \cU{U[t-1]} + \cWin{W} \cX{X[t]} - \cS{S[t-1]} \ctheta{\theta}
\label{eq:lif_vectorized}
\end{equation}

where the outgoing spikes are multiplied by the threshold element-wise. The spike function also applies element-wise:

\begin{equation}
\cS{S[t]} = \Theta(\cU{U[t]} - \ctheta{\theta})
\label{eq:spike_vectorized}
\end{equation}

This vectorized form is what you'll actually implement in code, since it's much more efficient than looping over individual neurons.

But what's the point of this worse RNN model anyway? 

## Efficiency gains
It's all about efficiency and it comes from two factors: 1) LIFs have sparse activation 2) LIFs don't need to multiply inputs by weights.

Many of the neurons are not emitting spikes at every timestep. Since we only need to process spikes, we don't have to do a lot of processing when there are no spikes. This principle is shown below.

<figure id="fig:lif_sparsity">
<img src="{{ '/assets/images/lif_sparsity.png' | relative_url }}" alt="LIF network sparsity" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
<figcaption><strong>Figure 4:</strong> Spiking neural network showing sparse activity patterns across neurons with teal/green neurons active and gray neurons inactive.</figcaption>
</figure>

Moreover, all modern deep learning is based on Multiply-Accumulate (MAC) operations, where we multiply all the inputs by all the weights and add them up. When the inputs are 0 or 1, we don't actually need to multiply. Instead we can use the inputs as flags to choose which weights to add to our state. We can cut the M from the MAC. 