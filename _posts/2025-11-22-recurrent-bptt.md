---
title: 'Backpropagation for a recurrent LIF layer'
excerpt: "We figure out how BPTT works for a recurrent LIF layer [Read more](/posts/2025/11/bptt/)<br/><img src='/assets/images/single_lif.png'>"
date: 2025-11-22
permalink: /posts/2025/11/recurrent-bptt/
tags:
  - SNN
  - Tutorial
  - bptt
---

{% include mathjax-colors.html %}

<div class="notice--info" markdown="1">
**Note:** Parts of this tutorial are based on the wonderful [snnTorch tutorial by Eshraghian et al.](https://snntorch.readthedocs.io/en/latest/tutorials/tutorial_5.html){:target="_blank"} However, some parts were not entirely clear to me from their tutorial so I made my own. The notation is also mostly consistent with their [2023 paper](https://ieeexplore.ieee.org/abstract/document/10242251/){:target="_blank"}.
</div>

Backpropagation through time (BPTT) is probably the most popular way of training Spiking Neural Networks. Today we will walk through some of the mathematics of the method for the gradient of an input weight. We will focus on the input weights, but you could derive the recurrent weight updates in a similar way.

This post assumes familiarity with the [LIF neuron dynamics](/posts/2025/10/lif-theory/).

## The Setup
Let's begin with a single leaky integrate-and-fire (LIF) neuron with a single incoming connection $$\cWin{W_{in}}$$ and there are no recurrent connections, as shown in [Figure 1](#fig:neuron_diagram).

<details style="background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 10px; margin: 15px 0;">
<summary style="cursor: pointer; font-weight: bold; color: #4a90e2;">Why use capital letters?</summary>
<p style="margin-top: 10px;">Despite the fact that it's a scalar we use a capital letter as though it were a matrix. That's because it works exactly the same either way, so it will be more consistent for later steps.</p>
</details>

<figure id="fig:neuron_diagram">
<div id="lif-neuron-diagram" data-label-input="X[t]" data-label-weight="Wᵢₙ" data-label-state="U[t]" data-label-output="S[t]" data-label-prev-state="U[t-1]" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 1:</strong> Simple LIF neuron setup with input X[t], membrane potential U[t], input weight W<sub>in</sub>, decay α, and output spike S[t].</figcaption>
</figure>

<script src="{{ '/assets/js/lif-diagram.js' | relative_url }}"></script>

In this case we can describe the membrane potential $$\cU{U[t]}$$ as:

\begin{equation}
\cU{U[t]} = \calpha{\alpha} \cU{U[t-1]} + \cWin{W_{in}} \cX{X[t]} - \cS{S[t-1]} \ctheta{\theta}
\label{eq:lif_full}
\end{equation}

where $$\calpha{\alpha}$$ is a decay term, $$\cX{X[t]}$$ is the input at time $$t$$ and $$\ctheta{\theta}$$ is the firing threshold. $$\cS{S[t-1]}$$ is the outgoing spike at time $$t-1$$. Note that if there was a spike at the previous timestep $$t-1$$ we subtract the firing threshold from the membrane potential in order to reset it. This is a simple version of the LIF refractory mechanism. The outgoing spike is defined as 

\begin{equation}
\cS{S[t]} = \Theta(\cU{U[t]} - \ctheta{\theta})
\label{eq:spike_function}
\end{equation}

where $$\Theta$$ is the heaviside function. In other words, $$\cS{S[t]}$$ is equal to 1 (spike) whenever the membrane potential surpasses threshold and 0 (no spike) otherwise. The heaviside function can be seen in [Figure 2](#fig:surrogate_gradient).

We are going to make one simplification to prevent the math from getting out of control and that is to discard the reset term $$-\cS{S[t]} \ctheta{\theta}$$. We will add it back at the end, don't worry about it. This is just because the equations get too long. The simplified equation for the neuron's state is now:

\begin{equation}
\cU{U[t]} = \calpha{\alpha} \cU{U[t-1]} + \cWin{W_{in}} \cX{X[t]}
\label{eq:lif_simplified}
\end{equation}

We also need to define a loss so we can make meaningful changes with respect to the loss. For simplicity, our loss will simply be the difference between our outgoing spike count $$\cyhat{\hat{y}}$$ and a target spike count $$\cytarget{y}$$. Our outgoing spike count $$\cyhat{\hat{y}}$$ is defined as $$\sum_{t=0}^{T} \cS{S[t]}$$. And the loss is defined as follows

\begin{equation}
\cE{E} = \cyhat{\hat{y}} - \cytarget{y}
\label{eq:loss}
\end{equation}


Our goal is to find the weight $$\cWin{W_{in}}$$ that minimizes the loss $$\cE{E}$$. 

## The Gradients

\begin{equation}
\frac{\partial \cE{E}}{\partial \cWin{W_{in}}} = \frac{\partial \cyhat{\hat{y}}}{\partial \cWin{W_{in}}} - \frac{\partial \cytarget{y}}{\partial \cWin{W_{in}}}
\label{eq:loss_derivative}
\end{equation}


First of all, $$\frac{\partial \cytarget{y}}{\partial \cWin{W_{in}}} = 0$$, because $$\cytarget{y}$$ is the label of this data sample. It has nothing to do with the network weights. However, our network's prediction $$\cyhat{\hat{y}}$$ does depend on $$\cWin{W_{in}}$$ so let us expand the term to figure out the derivative. Remember that we defined $$\cyhat{\hat{y}} = \sum_{t=0}^{T} \cS{S[t]}$$. So when we we expand it, it looks like this:


$$\cyhat{\hat{y}} = \cS{S[0]} + \cS{S[1]} + ... + \cS{S[T]}$$


$$\frac{\partial \cyhat{\hat{y}}}{\partial \cWin{W_{in}}} = \frac{\partial \cS{S[0]}}{\partial \cWin{W_{in}}} + \frac{\partial \cS{S[1]}}{\partial \cWin{W_{in}}} + ... + \frac{\partial \cS{S[T]}}{\partial \cWin{W_{in}}}$$


Great, so $$\frac{\partial \cyhat{\hat{y}}}{\partial \cWin{W_{in}}}$$ is just the sum of the spike derivatives $$\sum_{t=0}^{T} \frac{\partial \cS{S[t]}}{\partial \cWin{W_{in}}}$$. If we knew what $$\frac{\partial \cS{S[t]}}{\partial \cWin{W_{in}}}$$ was, we could already find the derivative and be done. Recall that by definition $$\cS{S[t]} = \Theta(\cU{U[t]} - \ctheta{\theta})$$. What we have here is a function within a function. The [chain rule](https://en.wikipedia.org/wiki/Differentiation_rules#Chain_rule) tells us how to handle these cases and brings us to:

\begin{equation}
\frac{\partial \cS{S[t]}}{\partial \cWin{W_{in}}} = \frac{\partial \Theta (\cU{U[t]} - \ctheta{\theta})}{\partial (\cU{U[t]} - \ctheta{\theta})} \cdot \frac{\partial (\cU{U[t]} - \ctheta{\theta})}{\partial \cWin{W_{in}}}
\label{eq:spike_derivative}
\end{equation}


It's the classic outer derivative times inner derivative. Let's start with the inner derivative on the right. In this simple model, $$\ctheta{\theta}$$ is just a constant and its derivative is $$0$$. Thus

\begin{equation}
\frac{\partial (\cU{U[t]} - \ctheta{\theta})}{\partial \cWin{W_{in}}} = \frac{\partial (\cU{U[t]} - 0)}{\partial \cWin{W_{in}}} = \frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}}
\label{eq:d_s_t_basis}
\end{equation}


So the right part is just the derivative of $$\cU{U[t]}$$ and the full equation simplifies to

\begin{equation}
\frac{\partial \cS{S[t]}}{\partial \cWin{W_{in}}} = \frac{\partial \Theta (\cU{U[t]} - \ctheta{\theta})}{\partial (\cU{U[t]} - \ctheta{\theta})} \cdot \frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}}
\label{eq:d_s_t_simplified}
\end{equation}


We actually have a problem with the left part, because the heaviside function $$\Theta$$ has no proper derivative. 

## Surrogate Gradients

We can estimate the derivative of the heaviside function with the dirac delta function (TODO source), but it's still pretty useless. This is because it's $$0$$ almost everywhere (see figure below), which means this whole equation comes out to $$0$$ most of the time and giving no useful training information.

Instead we use a surrogate gradient function. Intuitively you can think of it like pretending we used a smooth activation function and taking its derivative. The trick is that we didn't actually use a smooth activation function for the forward-pass, but it turns out that the gradient is still useful, even if it didn't come from our original function. You can see this trick in [Figure 2](#fig:surrogate_gradient).

<figure id="fig:surrogate_gradient">
<div id="surrogate-gradient-plot" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 2:</strong> Surrogate gradient concept showing the Heaviside function (left, solid) and its smooth sigmoid approximation (left, dashed), along with their derivatives (right). The Heaviside derivative is the Dirac delta (spike at zero), while the sigmoid derivative provides a smooth, trainable gradient. Note this may not be a technically accurate representation of the Dirac delta.</figcaption>
</figure>

<script src="{{ '/assets/js/surrogate-gradient-plot.js' | relative_url }}"></script>

Let's use the sigmoid derivative as our surrogate gradient function, i.e., $$\frac{\partial \Theta (\cU{U[t]} - \ctheta{\theta})}{\partial (\cU{U[t]} - \ctheta{\theta})} \approx \sigma'(\cU{U[t]} - \ctheta{\theta})$$. We will treat it as a known quantity. $$\ctheta{\theta}$$ is just a constant and $$\cU{U[t]}$$ is known at time $$t$$ so we now know the left side of equation 8. All that's left is $$\frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}}$$.

To find the derivative of $$\cU{U[t]}$$, let's remember its definition: $$\cU{U[t]} = \calpha{\alpha} \cU{U[t-1]} + \cWin{W_{in}} \cX{X[t]}$$. Since $$\cU{U[t]}$$ depends on $$\cWin{W_{in}}$$ and obviously $$\cWin{W_{in}} \cX{X[t]}$$ depends on $$\cWin{W_{in}}$$ as well, we get two parts to the derivative:


$$\frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}} = \frac{\partial (\calpha{\alpha} \cU{U[t-1]})}{\partial \cWin{W_{in}}} + \frac{\partial (\cWin{W_{in}} \cX{X[t]})}{\partial \cWin{W_{in}}}$$


Once again, $$\calpha{\alpha}$$ is a constant, so the first term comes out to $$\calpha{\alpha} \frac{\partial \cU{U[t-1]}}{\partial \cWin{W_{in}}}$$. For the second term, obviously the derivative with respect to $$\cWin{W_{in}}$$ is simply $$\frac{\partial (\cWin{W_{in}} \cX{X[t]})}{\partial \cWin{W_{in}}} = \cX{X[t]}$$

And thus the derivative of $$\cU{U[t]}$$ is:

\begin{equation}
\frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}} = \calpha{\alpha} \frac{\partial \cU{U[t-1]}}{\partial \cWin{W_{in}}} + \cX{X[t]}
\label{eq:membrane_derivative_recursive}
\end{equation}


Okay that was straight-forward but now we have a weird recursion because $$\frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}}$$ depends on $$\frac{\partial \cU{U[t-1]}}{\partial \cWin{W_{in}}}$$. That one depends on $$\frac{\partial \cU{U[t-2]}}{\partial \cWin{W_{in}}}$$ and so on. The recursion ends when we reach the initial state, so let's start there.

## Solving the recursion


The goal is to find the pattern in this recursion and then take its derivative. It will only take a couple of steps, but first let's set an initial state $$\cU{U[0]} = 0$$ and hence $$\frac{\partial \cU{U[0]}}{\partial \cWin{W_{in}}} = 0$$. By definition (equation 3) we know that:


$$\cU{U[1]} = \calpha{\alpha} \cU{U[0]} + \cWin{W_{in}} \cX{X[0]}$$


$$ = \calpha{\alpha} 0 + \cWin{W_{in}} \cX{X[1]} $$

$$ = \cWin{W_{in}} \cX{X[1]} $$


Going one step further, we find that: 


$$\cU{U[2]} = \calpha{\alpha} \cU{U[1]} + \cWin{W_{in}} \cX{X[2]}$$


$$= \calpha{\alpha} (\cWin{W_{in}} \cX{X[1]}) + \cWin{W_{in}} \cX{X[2]}$$


$$= \calpha{\alpha} \cWin{W_{in}} \cX{X[1]} + \cWin{W_{in}} \cX{X[2]}$$


and another step:


$$\cU{U[3]} = \calpha{\alpha} \cU{U[2]} + \cWin{W_{in}} \cX{X[3]}$$


$$ = \calpha{\alpha} (\calpha{\alpha} \cWin{W_{in}} \cX{X[1]} + \cWin{W_{in}} \cX{X[2]}) + \cWin{W_{in}} \cX{X[3]}$$


$$ = \calpha{\alpha}^2 \cWin{W_{in}} \cX{X[1]} + \calpha{\alpha} \cWin{W_{in}} \cX{X[2]} + \cWin{W_{in}} \cX{X[3]}$$


To make the pattern more obvious, let me add some exponents: 


$$\cU{U[3]} = \calpha{\alpha}^2 \cWin{W_{in}} \cX{X[1]} + \calpha{\alpha}^1 \cWin{W_{in}} \cX{X[2]} + \calpha{\alpha}^0 \cWin{W_{in}} \cX{X[3]}$$


In general, we find that


$$\cU{U[t]} = \calpha{\alpha}^{t-1} \cWin{W_{in}} \cX{X[1]} + \calpha{\alpha}^{t-2} \cWin{W_{in}} \cX{X[2]} + ... + \calpha{\alpha}^{t-t} \cWin{W_{in}} \cX{X[t]}$$

$$ = \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cWin{W_{in}} \cX{X[i]}$$


Since the derivative of the sum is just the sum of the derivatives, we get the following equation:

\begin{equation}
\frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}} = \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cX{X[i]}
\label{eq:membrane_derivative_closed}
\end{equation}

## Putting it all together
To recap, we were trying to find the following derivative:

\begin{equation}
\frac{\partial \cE{E}}{\partial \cWin{W_{in}}} = \frac{\partial \cE{E}}{\partial \cyhat{\hat{y}}} \cdot \frac{\partial \cyhat{\hat{y}}}{\partial \cWin{W_{in}}}
\end{equation}

Expanding $$\frac{\partial \cyhat{\hat{y}}}{\partial \cWin{W_{in}}}$$ using the chain rule through the spikes and membrane potentials:

\begin{equation}
\frac{\partial \cE{E}}{\partial \cWin{W_{in}}} = \frac{\partial \cE{E}}{\partial \cyhat{\hat{y}}} \cdot \sum_{t=0}^T \left[\frac{\partial \cS{S[t]}}{\partial \cU{U[t]}} \cdot \frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}}\right]
\end{equation}

And we were able to resolve it to this:


\begin{equation}
\frac{\partial \cE{E}}{\partial \cWin{W_{in}}} = \sum_{t=0}^{T} \sigma'(\cU{U[t]} - \ctheta{\theta}) \cdot \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cX{X[i]}
\label{eq:final_gradient}
\end{equation}


So that's all the computations for the single neuron when we disregard the reset term. Let's add that back.

## The reset term (optional)
The reset term is part of $$\frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}}$$. As per equation \ref{eq:lif_full}, it is a term that gets subtracted from the membrane potential: $$-\cS{S[t-1]}\ctheta{\theta}$$.

The derivative is $$\frac{\partial (-\cS{S[t-1]}\ctheta{\theta})}{\partial \cWin{W_{in}}}$$ and we already know how to compute it for the case of $$\cS{S[t]}$$. We can now extend equation \ref{eq:membrane_derivative_closed} to include the reset term:

\begin{equation}
\frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}} = \sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cX{X[i]} - \ctheta{\theta} \frac{\partial (\cS{S[t-1]})}{\partial \cWin{W_{in}}}
\end{equation}

We already know how to compute $$\frac{\partial \cS{S[t-1]}}{\partial \cWin{W_{in}}}$$ from our earlier derivation (just shift the time index):

\begin{equation}
\frac{\partial \cS{S[t-1]}}{\partial \cWin{W_{in}}} = \sigma'(\cU{U[t-1]} - \ctheta{\theta}) \cdot \sum_{i=1}^{t-1} \calpha{\alpha}^{t-1-i} \cX{X[i]}
\end{equation}

Substituting this into the full gradient, we get the complete version of equation \ref{eq:final_gradient} with the reset term included:

\begin{equation}
\frac{\partial \cE{E}}{\partial \cWin{W_{in}}} = \sum_{t=0}^{T} \sigma'(\cU{U[t]} - \ctheta{\theta}) \cdot \left(\sum_{i=1}^{t} \calpha{\alpha}^{t-i} \cX{X[i]} - \ctheta{\theta} \sigma'(\cU{U[t-1]} - \ctheta{\theta}) \cdot \sum_{j=1}^{t-1} \calpha{\alpha}^{t-1-j} \cX{X[j]}\right)
\label{eq:final_gradient_with_reset}
\end{equation}

If you are like me then this is starting to look messy to you. Funnily enough we probably don't need the reset term anyway. Apparently [Zenke et al.](https://direct.mit.edu/neco/article/33/4/899/97482/The-Remarkable-Robustness-of-Surrogate-Gradient), show that it is not only useless but sometimes even harmful. 

## The vector view
We can also interpret this notation differently: $$\cU{U[t]}$$ is a vector of membrane potentials. $$\cWin{W_{in}}$$ is a matrix of input weights. $$\calpha{\alpha}$$, $$\ctheta{\theta}$$, $$\cX{X[t]}$$ and $$\cS{S[t]}$$ all are vectors, too. In this view, everything still works out exactly them same, except some multiplications are actually element-wise products and others are dot products. This view is shown in the figure below.

<figure id="fig:multi_neuron_diagram">
<div id="multi-lif-neuron-diagram" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 3:</strong> Vector view with 3 LIF neurons. Multiple inputs X[t] (X₀[t], X₁[t], X₂[t]) fully connect to all neurons via weight matrix W<sub>in</sub>. Each neuron has its own membrane potential U[t] (U₀[t], U₁[t], U₂[t]) and produces spikes S[t] (S₀[t], S₁[t], S₂[t]).</figcaption>
</figure>

<script src="{{ '/assets/js/multi-lif-diagram.js' | relative_url }}"></script>

## Adding recurrent weights
Let's add another term to account for spikes coming from other neurons in the same layer so they can influence each other.

\begin{equation}
\cU{U[t]} = \calpha{\alpha} \cU{U[t-1]} + \cWin{W_{in}} \cX{X[t]} + \underbrace{\cWrec{W_{rec}}\cS{S[t-1]}}_{\text{recurrent spikes}} - \cS{S[t-1]} \ctheta{\theta}
\label{eq:lif_full_with_rec}
\end{equation}

where $$\cWrec{W_{rec}}$$ is the recurrent weight matrix connecting neuron outputs back to neuron inputs. This is shown in the figure below.

<figure id="fig:recurrent_neuron_diagram">
<div id="recurrent-lif-neuron-diagram" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 4:</strong> Vector view with recurrent connections. In addition to the input weights W<sub>in</sub>, each neuron's output S[t-1] connects back to all neurons via the recurrent weight matrix W<sub>rec</sub> (weird green-blue color). The curved connections show the fully recurrent connectivity.</figcaption>
</figure>

<script src="{{ '/assets/js/recurrent-lif-diagram.js' | relative_url }}"></script>

Note that the derivative of a sum is just the sum of derivatives. Hence we only need to find the derivative of this additional term and add it to the derivative we came up with previously. The term we have to differentiate is $$\frac{\partial (\cWrec{W_{rec}} \cS{S[t-1]})}{\partial \cWin{W_{in}}}$$ but notice that $$\frac{\partial \cWrec{W_{rec}}}{\partial \cWin{W_{in}}} = 0$$, i.e., it's constant w.r.t. $$\cWin{W_{in}}$$. Thus

\begin{equation}
\frac{\partial (\cWrec{W_{rec}} \cS{S[t-1]})}{\partial \cWin{W_{in}}} = \cWrec{W_{rec}} \frac{\partial \cS{S[t-1]}}{\partial \cWin{W_{in}}}
\end{equation}

We can add this back into the original equation and write out all the terms, but doing that only gave me very long and unreadable expressions. Therefore I want to provide the abstract equation:

\begin{equation}
\frac{\partial \cU{U[t]}}{\partial \cWin{W_{in}}} = \calpha{\alpha} \frac{\partial \cU{U[t-1]}}{\partial \cWin{W_{in}}} + \cX{X[t]} + \cWrec{W_{rec}} \frac{\partial \cS{S[t-1]}}{\partial \cWin{W_{in}}} - \ctheta{\theta} \frac{\partial \cS{S[t-1]}}{\partial \cWin{W_{in}}}
\label{eq:u_derivative_abstract_with_reset}
\end{equation}

And that's basically it. Equation 8 showed us how to resolve partial s[t] / w_in. the derivative of partial u[t-1] / partial w_in can be resolved recursively with Equation 19. It just takes some recursion and a lot of patience, or an autodiff framework of your choice.

## The single layer view
When you think about it, any neural network can be seen as a single layer, where only particular neurons connect. We draw it in a feed-forward layout, but we could draw all the neurons in a vertical stack if we wanted to. There are only two key differences then: 1) Most of the possible connections are not formed 2) There is a 1-timestep delay whenever we propagate from one layer to another. This single layer view is shown in the figure below.

<figure id="fig:single_layer_view">
<img src="{{ '/assets/images/single-layer-view.png' | relative_url }}" alt="Single layer view of neural network" style="width: 100%; max-width: 700px; margin: 2em auto; display: block;">
<figcaption><strong>Figure 5:</strong> Single layer view showing how a multi-layer feedforward network (left) can be equivalently viewed as a single recurrent layer (right) with specific connection patterns and time delays.</figcaption>
</figure>
