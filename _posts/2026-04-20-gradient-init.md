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

We want to find conditions on the boxcar surrogate gradient such that the gradient of the loss w.r.t. a weight has unit variance.

## Setup
If the input is some random variable then the gradient will be a random variable. We assume that all the gradients in a layer come from the same distribution. 

Thus we consider the gradient w.r.t. a single weight $\cWin{W^l_{jk}}$, connecting neuron $k$ in layer $l-1$ to neuron $j$ in layer $l$. From the BPTT derivation (ignoring the reset term):

$$\frac{\partial \cE{E}}{\partial \cWin{W^l_{jk}}} = \sum_{t=0}^{T} \cD{\sigma'}\left(\cU{U^l_j[t]} - \ctheta{\theta}\right) \cdot \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S^{l-1}_k[i]}$$

where $\cD{\sigma'}$ is the surrogate gradient, $\cU{U^l_j[t]}$ is the membrane potential of neuron $j$ in layer $l$, $\cS{S^{l-1}_k[i]} \in \{0,1\}$ is the spike output of the upstream neuron, $\calpha{\alpha}$ is the decay constant, and $\ctheta{\theta}$ is the firing threshold.

## Stationarity argument

This builds on the previous post where we attempted to derive weights such that $\text{Var}(\cU{U^l_j[t]}) = 1$. We will take that as a given. Supposedly we also have a constant spike rate $\cp{p}$ throughout space and time, the statistics are the same at every timestep. If the gradient has unit variance at timestep $t$, it will have unit variance at every other timestep. It therefore suffices to find the condition under which a single timestep's contribution has unit variance.

A single timestep's contribution to the gradient[^notation] is:

$$\frac{\partial \cE{E[t]}}{\partial \cWin{W^l_{jk}}} = \cD{\sigma'}\left(\cU{U^l_j[t]} - \ctheta{\theta}\right) \cdot \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S^{l-1}_k[i]}$$

And we want this thing to have unit variance:

$$\text{Var}\left(\frac{\partial \cE{E[t]}}{\partial \cWin{W^l_{jk}}}\right) = \text{Var}(\cD{\sigma'}\left(\cU{U^l_j[t]} - \ctheta{\theta}\right) \cdot \underbrace{\sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S^{l-1}_k[i]}}_{\text{filtered spike train}}) = 1 \label{eq:unit_var_condition}$$

## Applying the product variance formula

**Assumption:** $\cD{\sigma'}\left(\cU{U^l_j[t]} - \ctheta{\theta}\right)$ and the filtered spike train are treated as independent. This is a wide-network approximation: $\cU{U^l_j[t]}$ is a sum over all neurons $k'$ in layer $l-1$, so any single $\cS{S^{l-1}_k}$ has negligible influence on it.

For two independent random variables $A$ and $B$:

$$\text{Var}(AB) = \text{Var}(A)\,\text{Var}(B) + \text{Var}(A)\,\mathbb{E}[B]^2 + \text{Var}(B)\,\mathbb{E}[A]^2$$

Letting $A = \cD{\sigma'}\left(\cU{U^l_j[t]} - \ctheta{\theta}\right)$ and $B = \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S^{l-1}_k[i]}$, our condition becomes:

\begin{equation}
\text{Var}(\cD{\sigma'})\,\text{Var}(B) + \text{Var}(\cD{\sigma'})\,\mathbb{E}[B]^2 + \text{Var}(B)\,\mathbb{E}[\cD{\sigma'}]^2 = 1
\label{eq:product_var_condition}
\end{equation}

To apply this we need to know $\mathbb{E}[B]$ and $\text{Var}(B)$.

## Characterising the filtered spike train

Since $\cS{S^{l-1}_k[i]}$ is Bernoulli with spike rate $\cp{p}$, and the spikes at different timesteps are independent, the mean and variance of the filtered spike train are:

$$\mathbb{E}\!\left[\sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S^{l-1}_k[i]}\right] = \cp{p} \cdot \frac{1 - \calpha{\alpha}^t}{1 - \calpha{\alpha}}$$

<details>
<summary>Derivation of the mean</summary>

By linearity of expectation we can bring the sum outside:

$$\mathbb{E}\!\left[\sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S^{l-1}_k[i]}\right] = \sum_{i=1}^{t} \mathbb{E}\!\left[\calpha{\alpha}^{t-i} \cS{S^{l-1}_k[i]}\right]$$

The weight $\calpha{\alpha}^{t-i}$ is a deterministic constant, so it is independent of $\cS{S^{l-1}_k[i]}$ and the expectation factors:

$$= \sum_{i=1}^{t} \mathbb{E}\!\left[\calpha{\alpha}^{t-i}\right] \mathbb{E}\!\left[\cS{S^{l-1}_k[i]}\right]$$

$$= \sum_{i=1}^{t} \calpha{\alpha}^{t-i}\, \mathbb{E}\!\left[\cS{S^{l-1}_k[i]}\right]$$

Since $\cS{S^{l-1}_k[i]} \sim \text{Bernoulli}(\cp{p})$, we have $\mathbb{E}[\cS{S^{l-1}_k[i]}] = \cp{p}$:

$$= \sum_{i=1}^{t} \calpha{\alpha}^{t-i}\, \cp{p}$$

$$= \cp{p} \sum_{i=1}^{t} \calpha{\alpha}^{t-i}$$

Substituting $j = t - i$ (so $j$ runs from $0$ to $t-1$):

$$= \cp{p} \sum_{j=0}^{t-1} \calpha{\alpha}^{j}$$

Applying the geometric series formula $\sum_{j=0}^{n-1} r^j = \frac{1 - r^n}{1 - r}$ with $r = \calpha{\alpha}$ and $n = t$:

$$= \cp{p} \cdot \frac{1 - \calpha{\alpha}^t}{1 - \calpha{\alpha}}$$

</details>

$$\text{Var}\!\left(\sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S^{l-1}_k[i]}\right) = \cp{p}(1-\cp{p}) \cdot \frac{1 - \calpha{\alpha}^{2t}}{1 - \calpha{\alpha}^2}$$

<details>
<summary>Derivation of the variance</summary>

Since the spikes are independent across timesteps, the variance of the sum is just the sum of the individual variances:

$$\text{Var}\!\left(\sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cS{S^{l-1}_k[i]}\right) = \sum_{i=1}^{t} \text{Var}\!\left(\calpha{\alpha}^{t-i} \cS{S^{l-1}_k[i]}\right)$$

The weight $\calpha{\alpha}^{t-i}$ is a deterministic constant, so $\text{Var}(c X) = c^2\,\text{Var}(X)$ gives:

$$= \sum_{i=1}^{t} \calpha{\alpha}^{2(t-i)}\, \text{Var}\!\left(\cS{S^{l-1}_k[i]}\right)$$

Since we happen to know that $\text{Var}(\cS{S^{l-1}_k[i]}) = \cp{p}(1-\cp{p})$:

$$= \sum_{i=1}^{t} \calpha{\alpha}^{2(t-i)}\, \cp{p}(1-\cp{p})$$

$$= \cp{p}(1-\cp{p}) \sum_{i=1}^{t} \calpha{\alpha}^{2(t-i)}$$

$$= \cp{p}(1-\cp{p}) \sum_{j=0}^{t-1} \calpha{\alpha}^{2j}$$

Applying the geometric series formula with $r = \calpha{\alpha}^2$ and $n = t$:

$$= \cp{p}(1-\cp{p}) \cdot \frac{1 - \calpha{\alpha}^{2t}}{1 - \calpha{\alpha}^2}$$

</details>

These are exact for any $t$. As $t \to \infty$ they converge to $\frac{\cp{p}}{1-\calpha{\alpha}}$ and $\frac{\cp{p}(1-\cp{p})}{1-\calpha{\alpha}^2}$ respectively. The plot below shows how quickly the mean converges for different values of $\calpha{\alpha}$.

<div id="geometric-convergence-plot"></div>
<script src="{{ '/assets/js/geometric-convergence-plot.js' | relative_url }}"></script>

For the remainder of the derivation we work in the stationary regime $t \to \infty$, so:

$$\mathbb{E}[B] = \frac{\cp{p}}{1-\calpha{\alpha}}, \qquad \text{Var}(B) = \frac{\cp{p}(1-\cp{p})}{1-\calpha{\alpha}^2}$$

Substituting into the product variance condition:

\begin{equation}
\text{Var}(\cD{\sigma'}) \cdot \frac{\cp{p}(1-\cp{p})}{1-\calpha{\alpha}^2} + \text{Var}(\cD{\sigma'}) \cdot \frac{\cp{p}^2}{(1-\calpha{\alpha})^2} + \frac{\cp{p}(1-\cp{p})}{1-\calpha{\alpha}^2} \cdot \mathbb{E}[\cD{\sigma'}]^2 = 1
\label{eq:intermediate_condition}
\end{equation}

## Characterising the boxcar surrogate gradient

The boxcar surrogate gradient takes value $h$ within a window of width $w$ centred on $\ctheta{\theta}$, and $0$ elsewhere:

$$\cD{\sigma'}\left(\cU{U^l_j[t]} - \ctheta{\theta}\right) = h \cdot \mathbf{1}\left[\left|\cU{U^l_j[t]} - \ctheta{\theta}\right| < \tfrac{w}{2}\right]$$

Since $\cU{U^l_j[t]}$ is approximately Gaussian with $\text{Var}(\cU{U}) = 1$ and mean $\mathbb{E}[\cU{U}]$, we have $\cU{U^l_j} - \ctheta{\theta} \sim \mathcal{N}(\cdelta{\delta}, 1)$ where $\cdelta{\delta} = \mathbb{E}[\cU{U}] - \ctheta{\theta} < 0$.

The spike rate satisfies $\cp{p} = P(\cU{U} > \ctheta{\theta}) = \Phi(-\cdelta{\delta})$, so $\cdelta{\delta} = -\Phi^{-1}(\cp{p})$. Substituting, the probability that the boxcar is active is:

$$q = \Phi\left(\tfrac{w}{2} + \Phi^{-1}(\cp{p})\right) - \Phi\left(-\tfrac{w}{2} + \Phi^{-1}(\cp{p})\right)$$

So $q$ depends only on the known spike rate $\cp{p}$ and the boxcar width $w$. Since $\cD{\sigma'}$ is a scaled Bernoulli taking value $h$ with probability $q$:

$$\mathbb{E}[\cD{\sigma'}] = hq, \qquad \text{Var}(\cD{\sigma'}) = h^2 q(1-q)$$

## Final condition

Substituting into the product variance condition:

$$h^2 q(1-q) \cdot \frac{\cp{p}(1-\cp{p})}{1-\calpha{\alpha}^2} + h^2 q(1-q) \cdot \frac{\cp{p}^2}{(1-\calpha{\alpha})^2} + \frac{\cp{p}(1-\cp{p})}{1-\calpha{\alpha}^2} \cdot h^2 q^2 = 1$$

where the first two terms come from $\text{Var}(\cD{\sigma'})$ times $\text{Var}(B)$ and $\mathbb{E}[B]^2$ respectively, and the third from $\text{Var}(B)$ times $\mathbb{E}[\cD{\sigma'}]^2$.

The first and third terms share the factor $\frac{\cp{p}(1-\cp{p})}{1-\calpha{\alpha}^2}$ with coefficients $(1-q)$ and $q$, which sum to 1. Factoring out $h^2 q$:

$$h^2 q \left[ \frac{\cp{p}(1-\cp{p})}{1-\calpha{\alpha}^2} + (1-q)\,\frac{\cp{p}^2}{(1-\calpha{\alpha})^2} \right] = 1$$

Solving for $h$:

\begin{equation}
h = \frac{1}{\sqrt{q \left[ \dfrac{\cp{p}(1-\cp{p})}{1-\calpha{\alpha}^2} + (1-q)\,\dfrac{\cp{p}^2}{(1-\calpha{\alpha})^2} \right]}}
\label{eq:h_final}
\end{equation}

This gives the required boxcar height $h$ as a function of the boxcar width $w$ (via $q$) and the known network constants $\cp{p}$ and $\calpha{\alpha}$.

[^notation]: The notation here is a bit messed up because E is not really a function of time. It's a single term that includes a sum over time. If anyone complains I'll rewrite it.

{% include references.html %}
