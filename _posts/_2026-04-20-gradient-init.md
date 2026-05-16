---
title: '[DONT READ YET] Working Notes: Gradient Variance in a Feedforward SNN'
excerpt: "Stable membrane potential variance is not enough -- gradients still vanish. Here we set up the backward-pass analysis and find what the surrogate gradient needs to satisfy. [Read more](/posts/2026/04/gradient-init/)<br/><img src='/assets/images/lif_variance_across_layers.png'>"
date: 2026-04-20
permalink: /posts/2026/04/gradient-init/
tags:
  - He Initialization
  - Aurora Initialization
  - SNNs
  - Gradient Flow
references:
  - id: micheli2025
    text: 'A. Micheli, O. Booij, J. van Gemert and N. Tömen, "Deep activity propagation via weight initialization in spiking neural networks," <i>Neuro Inspired Computational Elements (NICE)</i>, Heidelberg, Germany, 2025, pp. 1-9. <a href="https://doi.org/10.1109/NICE65350.2025.11065883">doi:10.1109/NICE65350.2025.11065883</a>'
  - id: he2015
    text: 'K. He, X. Zhang, S. Ren and J. Sun, "Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification," <i>Proceedings of the IEEE International Conference on Computer Vision (ICCV)</i>, December 2015. <a href="https://openaccess.thecvf.com/content_iccv_2015/html/He_Delving_Deep_into_ICCV_2015_paper.html">paper</a>'
---

In artifical neural networks, gradients are propagated across many layers. This propagation is actually a series of multiplications, as per the chain rule. If we consistently multiply by a factor smaller than 1, the gradient will quickly vanish to zero. On the other hand, if we consistently multiply by a large factor, the gradient will explode in size.

We want to make sure that the gradients at any given layer don't scale the gradient signal up or down. The natural object to track is the gradient of the loss w.r.t. each weight, since those are the quantities that drive learning. We want the variance of these weight gradients to stay roughly constant across layers.

## Model

We consider a feedforward network of LIF neurons. In a given layer, the membrane potential evolves as:

\begin{equation}
\cU{U[t]} = \calpha{\alpha} \cU{U[t-1]} + \cWin{W} \cS{S_\text{pre}[t]} - \cS{S[t-1]} \ctheta{\theta}
\label{eq:lif}
\end{equation}

where $\calpha{\alpha} \in (0, 1)$ is the decay constant, $\cWin{W}$ is the weight matrix connecting the previous layer, $\cS{S_\text{pre}[t]}$ is the spike vector of the previous layer, and the last term resets the membrane potential after a spike. The layer fires whenever the membrane potential crosses threshold:

\begin{equation}
\cS{S[t]} = \Theta\left(\cU{U[t]} - \ctheta{\theta}\right)
\label{eq:spike}
\end{equation}

## Setup
Consider a single weight $\cWin{w}$. We want to understand $\text{Var}\left(\frac{\partial \cE{E}}{\partial \cWin{w}}\right)$ and ensure it is stable across layers.

By the chain rule, the weight gradient factors through the spike and the membrane potential:

$$\frac{\partial \cE{E}}{\partial \cWin{w}} = \frac{\partial \cE{E}}{\partial \cS{S[t]}} \cdot \frac{\partial \cS{S[t]}}{\partial \cU{U[t]}} \cdot \frac{\partial \cU{U[t]}}{\partial \cWin{w}}$$

Since $\cS{S[t]} = \Theta\left(\cU{U[t]} - \ctheta{\theta}\right)$ is a Heaviside step function its true derivative is unusable for learning, so the surrogate gradient $\cD{\sigma'}$ replaces it (ignoring the reset term). For the last factor, $\cU{U[t]}$ accumulates inputs through the leak, so $\cWin{w}$ influences $\cU{U[t]}$ at every past timestep. Unrolling \eqref{eq:lif} [as derived in the [BPTT post](/posts/2025/11/recurrent-bptt/)] gives:

\begin{equation}
\frac{\partial \cU{U[t]}}{\partial \cWin{w}} = \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S_\text{pre}[i]}
\label{eq:du_dw}
\end{equation}

Substituting both and summing over all timesteps:

\begin{equation}
\frac{\partial \cE{E}}{\partial \cWin{w}} = \sum_{t=0}^{T} \frac{\partial \cE{E}}{\partial \cS{S[t]}} \cdot \cD{\sigma'}\left(\cU{U[t]} - \ctheta{\theta}\right) \cdot \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S_\text{pre}[i]}
\label{eq:weight_grad}
\end{equation}

where $\frac{\partial \cE{E}}{\partial \cS{S[t]}}$ is the error signal incoming from the layer above. This is the quantity whose variance we want to analyze.

## Variance

We want the variance of the weight gradient to equal 1 across every layer. If it is consistently less than 1, gradients vanish; if consistently greater than 1, they explode. Writing the target condition explicitly:

\begin{equation}
\text{Var}\left(\frac{\partial \cE{E}}{\partial \cWin{w}}\right) = \text{Var}\left(\sum_{t=0}^{T} \frac{\partial \cE{E}}{\partial \cS{S[t]}} \cdot \cD{\sigma'}\left(\cU{U[t]} - \ctheta{\theta}\right) \cdot \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S_\text{pre}[i]}\right) = 1
\label{eq:var_target}
\end{equation}

To make progress we need to simplify the inner sum $\sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S_\text{pre}[i]}$.

Dropping the reset term from \eqref{eq:lif}:

$$\cU{U[t]} \approx \calpha{\alpha} \cU{U[t-1]} + \cWin{w} \cS{S_\text{pre}[t]}$$

Substituting the same expression for $\cU{U[t-1]}$:

$$\cU{U[t]} = \calpha{\alpha} \left(\calpha{\alpha} \cU{U[t-2]} + \cWin{w} \cS{S_\text{pre}[t-1]}\right) + \cWin{w} \cS{S_\text{pre}[t]} = \calpha{\alpha}^2 \cU{U[t-2]} + \calpha{\alpha} \cWin{w} \cS{S_\text{pre}[t-1]} + \cWin{w} \cS{S_\text{pre}[t]}$$

Repeating for $\cU{U[t-2]}$ and so on, with $\cU{U[0]} = 0$:

$$\cU{U[t]} \approx \cWin{w} \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S_\text{pre}[i]}$$

So:

\begin{equation}
\sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S_\text{pre}[i]} = \frac{\cU{U[t]}}{\cWin{w}}
\label{eq:inner_sum_as_u}
\end{equation}

Substituting into \eqref{eq:weight_grad}:

\begin{equation}
\frac{\partial \cE{E}}{\partial \cWin{w}} = \frac{1}{\cWin{w}} \sum_{t=0}^{T} \frac{\partial \cE{E}}{\partial \cS{S[t]}} \cdot \cD{\sigma'}\left(\cU{U[t]} - \ctheta{\theta}\right) \cdot \cU{U[t]}
\label{eq:weight_grad_simplified}
\end{equation}

The statistics of $\cU{U[t]}$ are exactly what the forward pass analysis controls: under the initialization from the [LIF init post](/posts/2026/04/lif-init/), $\text{Var}(\cU{U[t]}) = 1$.

{% include references.html %}
