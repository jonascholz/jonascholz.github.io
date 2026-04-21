---
title: 'Adjusting Aurora Initialization'
excerpt: "Initialization methods make some assumptions and for different inputs or different architectures you need some workarounds. [Read more](/posts/2026/03/adjusting-aurora-init/)<br/><img src='/assets/images/lif_variance_across_layers.png'>"
date: 2026-03-25
permalink: /posts/2026/03/adjusting-aurora-init/
tags:
  - He Initialization
  - Aurora Initialization
  - SNNs
references:
  - id: micheli2025
    text: 'A. Micheli, O. Booij, J. van Gemert and N. Tömen, "Deep activity propagation via weight initialization in spiking neural networks," <i>Neuro Inspired Computational Elements (NICE)</i>, Heidelberg, Germany, 2025, pp. 1-9. <a href="https://doi.org/10.1109/NICE65350.2025.11065883">doi:10.1109/NICE65350.2025.11065883</a>'
  - id: he2015
    text: 'K. He, X. Zhang, S. Ren and J. Sun, "Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification," <i>Proceedings of the IEEE International Conference on Computer Vision (ICCV)</i>, December 2015. <a href="https://openaccess.thecvf.com/content_iccv_2015/html/He_Delving_Deep_into_ICCV_2015_paper.html">paper</a>'
---

<!-- <div class="notice--info" markdown="1">
**Note:** This post is based on the paper [Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification](https://openaccess.thecvf.com/content_iccv_2015/html/He_Delving_Deep_into_ICCV_2015_paper.html){:target="_blank"} by He et al. (2015). My angle is a bit different, because He et al. were fixing the Glorot initialization and studying PReLU activations. I don't cover any of that.
</div> -->

Aurora initialization {% include cite.html key="micheli2025" %} is pretty cool. It makes it so Spiking Neural Networks have stable variance at the first timestep. After that it kinda breaks, so we still need a better method, but it's a step forward.

In any case, Aurora initialization assumes the inputs are normally distributed currents or spike trains with a particular frequency. Let's analyze in more detail.

## Aurora initialization
Aurora Micheli et al. adapt Kaiming He initialization {% include cite.html key="he2015" %} for SNNs. In the original, the authors wanted to fix vanishing and exploding gradients for networks with ReLU activations. Basically, gradients propagate through many layers during backpropagation and this can scale the gradients, causing them to grow or shrink. If the gradients get scaled by some value < 1 at every layer, for example, then they will become vanishingly small.

One way to solve this is to make the variance of neuron's pre-activations (before applying the activation function) equal to 1, as shown in Figure 1. If we achieve that, the forward propagation is stable and it turns out the backward propagation is as well. 

<figure>
<img src="{{ '/assets/images/lif_variance_across_layers.png' | relative_url }}" alt="LIF variance across layers" style="width: 100%; max-width: 700px; margin: 2em auto; display: block;">
<figcaption>Figure 1. Relatively stable variance across 100 layers. Good enough for our purposes.</figcaption>
</figure>

<div class="notice--info" markdown="1">
**Note:** Since Aurora initialization breaks down after the first timestep, there is more work to do! Somebody has got to figure out a method that's stable across time.
</div>

## How Aurora does it
They start from equation 9 in the He et al. paper {% include cite.html key="he2015" %}. You can find out more about it in my [other blogpost](/posts/2025/12/he-initialization/). In any case, it states that:

\begin{equation}
\text{Var}[\cy{y_l}] = \cn{n_l} \text{Var}[\cw{w_l}] E[\cx{x_l}^2]
\label{eq:variance_yl_he}
\end{equation}

where $\cy{y_l}$ is the pre-activations of the neurons in layer $l$ (before they pass through the ReLU function), $\cw{w_l}$ is the weight vector of layer $l$, $\cn{n_l}$ is the number of inputs into layer $l$ and $\cx{x_l}$ are the inputs into layer $l$.

Aurora then proceeds to resolve the term on the right, the $E[\cx{x_l}^2]$. Remember that $\cx{x_l}$ is what comes into layer $l$. It is the spikes of the previous layer. There are only two cases when it comes to spikes: either the voltage was too low to spike or it was high enough. We can use the law of total expectation to write this out:

$$
E[\cx{x_l}^2] = E[\cx{x_l}^2 \mid \cy{y_{l-1}} \leq \ctheta{\theta}] \cdot P(\cy{y_{l-1}} \leq \ctheta{\theta}) + E[\cx{x_l}^2 \mid \cy{y_{l-1}} > \ctheta{\theta}] \cdot P(\cy{y_{l-1}} > \ctheta{\theta})
$$

Since a neuron that doesn't spike outputs $\cx{x_l} = 0$ and a neuron that does spike outputs $\cx{x_l} = 1$, we can resolve the conditional expectations:

$$
E[\cx{x_l}^2] = 0 \cdot P(\cy{y_{l-1}} \leq \ctheta{\theta}) + 1 \cdot P(\cy{y_{l-1}} > \ctheta{\theta})
$$

and that simplifies to:

\begin{equation}
E[\cx{x_l}^2] = P(\cy{y_{l-1}} > \ctheta{\theta})
\label{eq:expected_x_squared}
\end{equation}

So now we can substitute that back into the original equation

\begin{equation}
\text{Var}[\cy{y_l}] = \cn{n_l} \text{Var}[\cw{w_l}] \cdot P(\cy{y_{l-1}} > \ctheta{\theta})
\label{eq:variance_yl_substituted}
\end{equation}

And if you want to use this for initialization, you just rearrange for $\text{Var}[\cw{w_l}]$. Then you can sample weights from a normal distribution using mean zero and that variance. (It actually takes the standard deviation for most random number generators, but that's just the square root of the variance)

## Accounting for uniform input distributions
The initialization depends on the spike probability $P(\cy{y_{l-1}} > \ctheta{\theta})$. It's the probability that the membrane potential is greater than the threshold. Clearly, this value can differ between a normal distribution and a uniform distribution.

<div id="spike-probability-plot" style="width: 100%; margin: 2em auto;"></div>

<script src="{{ '/assets/js/spike-probability-plot.js' | relative_url }}"></script>

The area under the curve looks a bit complicated for the normal distribution. Fortunately Aurora already figured out that if the inputs are sampled from N(0, 1) it should be

\begin{equation}
P_{\text{normal}}(\cy{u_0} > \ctheta{\theta}) = \int_{\ctheta{\theta}}^{\infty} \frac{1}{\sqrt{2\pi}} e^{-\frac{\cy{u_0}^2}{2}} \, d\cy{u_0}
\label{eq:spike_prob_normal}
\end{equation}

The area under the curve for the uniform distribution is much more straight-forward. 

$$
\begin{align}
P_{\text{uniform}}(\cy{u_0} > \ctheta{\theta}) &= \int_{\ctheta{\theta}}^{b} \frac{1}{b - a} \, d\cy{u_0} \\
&= \frac{b - \ctheta{\theta}}{b - a}
\end{align}
$$

<figure>
<img src="{{ '/assets/images/spike_rates_comparison_exaggerated.png' | relative_url }}" alt="" style="width: 100%; max-width: 700px; margin: 2em auto; display: block;">
<figcaption>An example of how the spike rates may differ. I purposely messed up the scaling a little to exaggerate the difference. Otherwise no difference was visible. Even if the input spike rate is different, the resulting spike rates are nearly the same. </figcaption>
</figure>

<div id="network-structure-plot" style="width: 100%; margin: 2em auto;"></div>

<script src="{{ '/assets/js/network-structure-plot.js' | relative_url }}"></script>

<explanation of threshold scaling based on uniform/normal spike rate>


## Accounting for skip connections

<div id="network-structure-skips-plot" style="width: 100%; margin: 2em auto;"></div>

<plot of how skip connections change network structure>

{% include references.html %}