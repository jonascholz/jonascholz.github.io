---
title: 'The Batman Derivative'
excerpt: "An interactive look at how gradients flow through a single LIF neuron using surrogate gradients. [Read more](/posts/2026/03/lif-batman-derivative/)<br/><img src='/assets/images/batman_derivative.png'>"
date: 2026-03-12
permalink: /posts/2026/03/lif-batman-derivative/
tags:
  - SNN
  - Tutorial
  - bptt
---

{% include mathjax-colors.html %}

How do you pick the parameters of a LIF? What makes a good gradient? Is batman the right shape for a gradient? 

First a brief reminder of the [BPTT post](/posts/2025/11/recurrent-bptt/), where we did the gradient math. Maybe your intuition is strong enough to understand the plots without it, but you have been warned.

## Setup

We have a single LIF neuron receiving a constant input $\cX{x}$ through a weight $\cWin{w} = 1$. The membrane potential evolves as:

\begin{equation}
\cU{U[t]} = \calpha{\alpha} \cU{U[t-1]} + \cWin{w} \cX{x} - \cS{S[t-1]} \ctheta{\theta}
\label{eq:lif}
\end{equation}

The spike output is $\cS{S[t]} = \Theta(\cU{U[t]} - \ctheta{\theta})$, and we use a triangular surrogate gradient for the derivative of the Heaviside:

\begin{equation}
\tilde{\Theta}'(x) = \text{height} \cdot \max\left(0,\; 1 - \frac{\lvert x \rvert}{\text{width}}\right)
\label{eq:surrogate}
\end{equation}

<figure id="fig:triangular_surrogate">
<div id="triangular-surrogate-plot" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure:</strong> Left: the Heaviside step function used in the forward pass. Right: the triangular surrogate gradient used in the backward pass.</figcaption>
</figure>

<script src="{{ '/assets/js/triangular-surrogate-plot.js' | relative_url }}"></script>

where $\text{height}$ = <input type="number" id="lif-height-input" min="0.1" max="5.0" value="1.0" step="0.1" style="width: 2.5em; border: none; border-bottom: 1px dashed #ccc; text-align: center; font: inherit; color: inherit; background: transparent; padding: 0; -moz-appearance: textfield; appearance: textfield;"> scales the peak amplitude and $\text{width} = 0.5$ is the surrogate width. Using the chain rule, the spike derivative with respect to the input is:

\begin{equation}
\frac{\partial \cS{S[t]}}{\partial \cX{x}} = \tilde{\Theta}'(\cU{U[t]} - \ctheta{\theta}) \cdot \frac{\partial \cU{U[t]}}{\partial \cX{x}}
\label{eq:spike_deriv}
\end{equation}

where the membrane derivative evolves recursively:

\begin{equation}
\frac{\partial \cU{U[t]}}{\partial \cX{x}} = \calpha{\alpha} \frac{\partial \cU{U[t-1]}}{\partial \cX{x}} + \cWin{w} - \frac{\partial \cS{S[t-1]}}{\partial \cX{x}} \ctheta{\theta}
\label{eq:u_deriv}
\end{equation}

## Aside: Height of the surrogate
I always thought of the heaviside activation as a very steep sigmoid. So maybe the sigmoid derivative has a height that we can use for our surrogate derivative.

Unfortunately the sigmoid derivative seems to grow towards infinity. Feel free to play around with that below. I instead opted to choose a value that lines up with a different intuition, but we will get to that at the end.

<figure id="fig:sigmoid_surrogate" style="position: relative;">
<div id="sigmoid-surrogate-plot" style="width: 100%; margin: 2em auto;"></div>
<div style="position: absolute; top: 0; right: 0; display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.85); padding: 4px 8px; border-radius: 4px;">
    <label for="sigmoid-k-slider" style="font-weight: bold; font-style: italic; margin: 0; font-size: 0.9em;">k</label>
    <input type="range" min="0.1" max="10.0" value="1.0" step="0.1" id="sigmoid-k-slider" style="box-shadow: none; width: 120px;">
    <span id="sigmoid-k-value" style="font-size: 0.85em;">1.0</span>
</div>
<figcaption><strong>Figure:</strong> Left: the sigmoid function σ(kx). Right: its derivative σ'(kx). Use the slider to adjust the steepness parameter k.</figcaption>
</figure>

<script src="{{ '/assets/js/sigmoid-surrogate-plot.js' | relative_url }}"></script>


## Interactive Plot

The input is held constant for the first <input type="number" id="lif-cutoff-input" min="1" max="44" value="36" step="1" style="width: 2.5em; border: none; border-bottom: 1px dashed #ccc; text-align: center; font: inherit; color: inherit; background: transparent; padding: 0; -moz-appearance: textfield; appearance: textfield;"> timesteps and then set to zero for the remaining steps. This cutoff is just to see how quickly the membrane potential decays.

Use the sliders to adjust the input value $\cX{x}$, firing threshold $\ctheta{\theta}$, decay factor $\calpha{\alpha}$, and surrogate width $\text{width}$. The toggle controls whether the reset term $-\frac{\partial \cS{S[t-1]}}{\partial \cX{x}} \ctheta{\theta}$ is included in the gradient computation.

<figure id="fig:lif_gradients">
<div id="lif-gradient-plot" style="width: 100%; height: 500px;"></div>
<figcaption><strong>Figure 1:</strong> Top: membrane potential (green) with threshold (dashed gray) and spike markers. Bottom: surrogate spike derivative ∂S/∂x over time.</figcaption>
</figure>

<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; align-items: end; margin: 20px 0;">
    <div style="display: flex; flex-direction: column; align-items: center;">
        <label for="lif-input-slider" style="color: purple; font-weight: bold;">x</label>
        <input type="range" min="0.01" max="0.8" value="0.16" step="0.01" id="lif-input-slider" style="box-shadow: none;">
        <span id="lif-input-value" style="color: purple;">0.10</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <label for="lif-threshold-slider" style="color: brown; font-weight: bold;">θ</label>
        <input type="range" min="0.1" max="1.5" value="0.5" step="0.05" id="lif-threshold-slider" style="box-shadow: none;">
        <span id="lif-threshold-value" style="color: brown;">0.50</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <label for="lif-alpha-slider" style="color: blue; font-weight: bold;">α</label>
        <input type="range" min="0.5" max="0.99" value="0.8" step="0.01" id="lif-alpha-slider" style="box-shadow: none;">
        <span id="lif-alpha-value" style="color: blue;">0.80</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <label for="lif-width-slider" style="color: gray; font-weight: bold;">width</label>
        <input type="range" min="0.1" max="2.0" value="0.5" step="0.05" id="lif-width-slider" style="box-shadow: none;">
        <span id="lif-width-value" style="color: gray;">0.50</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <label for="lif-reset-toggle" style="font-weight: bold; font-size: 0.85em;">Reset term</label>
        <input type="checkbox" id="lif-reset-toggle" checked style="margin-top: 6px; width: 18px; height: 18px;">
    </div>
</div>

<figure id="fig:lif_sweep">
<div id="lif-sweep-plot" style="width: 100%; height: 350px;"></div>
<figcaption><strong>Figure 2:</strong> Average spike derivative as a function of input value, sweeping $\cX{x} \in [-1, 1]$. The purple marker shows the current slider position.</figcaption>
</figure>

<script src="https://cdn.plot.ly/plotly-2.20.0.min.js"></script>
<script src="{{ '/assets/js/lif-gradient-plot.js' | relative_url }}"></script>

Figure 2 is pretty much the sum of the middle plot with the spike derivatives. 

The output of network is the sum of its spikes, in this particular case. Thus the derivative is the sum of derivatives of every spike output with respect to the input current.

## Analysis
Now what should this gradient look like? The gradient is supposed to capture: how does the output change when the input changes? Let's see how the actual output looks for different inputs.

<figure id="fig:lif_output">
<div id="lif-output-plot" style="width: 100%; height: 350px;"></div>
<figcaption><strong>Figure 3:</strong> Average firing rate (total spikes / timesteps) as a function of input value. The purple marker shows the current slider position.</figcaption>
</figure>

If this looks a lot like a ReLU, it's because standard MLPs are just simplified rate coded neurons. Our LIF neuron is using rate coding here (it's output value is the spike rate) and thus I'd argue they should have the same derivative. We can see this below.

<figure id="fig:lif_rate_comparison">
<div id="lif-rate-comparison-plot" style="width: 100%; height: 400px;"></div>
<figcaption><strong>Figure 4:</strong> Left: the spiking neuron's firing rate (solid) approximates the analytical LIF transfer function (dashed). Right: the average surrogate gradient (solid) approximates the derivative of the LIF transfer function (dashed). Parameters: $\calpha{\alpha} = 0.96$, $\ctheta{\theta} = 0.5$, $\text{width} = 1$, $\text{height} = 0.15$.</figcaption>
</figure>

<script src="{{ '/assets/js/lif-rate-comparison.js' | relative_url }}"></script>

## Conclusion
So in conclusion, if your LIF network is rate coded, it might make sense intuitively to model it after standard MLPs. You ought to choose the parameters in a way that the total derivative over time is mostly zero and sometimes one. The area of ones is between 0 and the LIF threshold.

This is all just speculation though. And besides, rate coded LIFs might not be the way to go. Latency coding is much more efficient and really leverages the advantages of LIFs. We will look at that in some future blogpost.

## Acknowledgements

Thanks to [@Alex](https://alex-vasilache.github.io/) for coining the term of the Batman derivative and for his input on how to shape gradients.