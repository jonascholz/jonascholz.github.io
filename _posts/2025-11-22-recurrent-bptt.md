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

<div class="notice--info" markdown="1">
**Note:** Parts of this tutorial are based on the wonderful [snnTorch tutorial by Eshraghian et al.](https://snntorch.readthedocs.io/en/latest/tutorials/tutorial_5.html){:target="_blank"} However, some parts were not entirely clear to me from their tutorial so I made my own. The notation is also mostly consistent with their [2023 paper](https://ieeexplore.ieee.org/abstract/document/10242251/){:target="_blank"}.
</div>

Backpropagation through time (BPTT) is probably the most popular way of training Spiking Neural Networks. Today we will walk through some of the mathematics of the method for a single neuron. I found that writing out the equations becomes too cumbersome when you add more layers and recurrent connections. At least for this 1-neuron setup we can calculate the gradient by hand.

This post assumes familiarity with the [LIF neuron dynamics](/posts/2025/10/lif-theory/).

## The Setup
Let's assume we have a single leaky integrate-and-fire (LIF) neuron with a single incoming connection $$\textcolor{red}{W_{in}}$$ and there are no recurrent connections, as shown in [Figure 1](#fig:neuron_diagram).

<details style="background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 10px; margin: 15px 0;">
<summary style="cursor: pointer; font-weight: bold; color: #4a90e2;">Why use capital letters?</summary>
<p style="margin-top: 10px;">Despite the fact that it's a scalar we use a capital letter as though it were a matrix. That's because it works exactly the same either way, so it will be more consistent for later steps.</p>
</details>

<figure id="fig:neuron_diagram">
<div id="lif-neuron-diagram" data-label-input="X[t]" data-label-weight="Wᵢₙ" data-label-state="U[t]" data-label-output="S[t]" data-label-prev-state="U[t-1]" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 1:</strong> Simple LIF neuron setup with input X[t], membrane potential U[t], input weight W<sub>in</sub>, decay α, and output spike S[t].</figcaption>
</figure>

<script src="{{ '/assets/js/lif-diagram.js' | relative_url }}"></script>

In this case we can describe the membrane potential $$\textcolor{ForestGreen}{U[t]}$$ as:

\begin{equation}
\textcolor{ForestGreen}{U[t]} = \textcolor{blue}{\alpha} \textcolor{ForestGreen}{U[t-1]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[t]} - \textcolor{orange}{S[t-1]} \textcolor{brown}{\theta}
\label{eq:lif_full}
\end{equation}

where $$\textcolor{blue}{\alpha}$$ is a decay term, $$\textcolor{purple}{X[t]}$$ is the input at time $$t$$ and $$\textcolor{brown}{\theta}$$ is the firing threshold. $$\textcolor{orange}{S[t-1]}$$ is the outgoing spike at time $$t-1$$. Note that if there was a spike at the previous timestep $$t-1$$ we subtract the firing threshold from the membrane potential in order to reset it. This is a simple version of the LIF refractory mechanism. The outgoing spike is defined as 

\begin{equation}
\textcolor{orange}{S[t]} = \Theta(\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})
\label{eq:spike_function}
\end{equation}

where $$\Theta$$ is the heaviside function. In other words, $$\textcolor{orange}{S[t]}$$ is equal to 1 (spike) whenever the membrane potential surpasses threshold and 0 (no spike) otherwise. The heaviside function can be seen in [Figure 2](#fig:surrogate_gradient).

We are going to make one simplification to prevent the math from getting out of control and that is to discard the reset term $$-\textcolor{orange}{S[t]} \textcolor{brown}{\theta}$$. We will add it back at the end, don't worry about it. This is just because the equations get too long. The simplified equation for the neuron's state is now:

\begin{equation}
\textcolor{ForestGreen}{U[t]} = \textcolor{blue}{\alpha} \textcolor{ForestGreen}{U[t-1]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[t]}
\label{eq:lif_simplified}
\end{equation}

We also need to define a loss so we can make meaningful changes with respect to the loss. For simplicity, our loss will simply be the difference between our outgoing spike count $$\textcolor{green}{\hat{y}}$$ and a target spike count $$\textcolor{magenta}{y}$$. Our outgoing spike count $$\textcolor{green}{\hat{y}}$$ is defined as $$\sum_{t=0}^{T} \textcolor{orange}{S[t]}$$. And the loss is defined as follows

\begin{equation}
\textcolor{olive}{E} = \textcolor{green}{\hat{y}} - \textcolor{magenta}{y}
\label{eq:loss}
\end{equation}


Our goal is to find the weight $$\textcolor{red}{W_{in}}$$ that minimizes the loss $$\textcolor{olive}{E}$$. 

## The Gradients

\begin{equation}
\frac{\partial \textcolor{olive}{E}}{\partial \textcolor{red}{W_{in}}} = \frac{\partial \textcolor{green}{\hat{y}}}{\partial \textcolor{red}{W_{in}}} - \frac{\partial \textcolor{magenta}{y}}{\partial \textcolor{red}{W_{in}}}
\label{eq:loss_derivative}
\end{equation}


First of all, $$\frac{\partial \textcolor{magenta}{y}}{\partial \textcolor{red}{W_{in}}} = 0$$, because $$\textcolor{magenta}{y}$$ is the label of this data sample. It has nothing to do with the network weights. However, our network's prediction $$\textcolor{green}{\hat{y}}$$ does depend on $$\textcolor{red}{W_{in}}$$ so let us expand the term to figure out the derivative. Remember that we defined $$\textcolor{green}{\hat{y}} = \sum_{t=0}^{T} \textcolor{orange}{S[t]}$$. So when we we expand it, it looks like this:


$$\textcolor{green}{\hat{y}} = \textcolor{orange}{S[0]} + \textcolor{orange}{S[1]} + ... + \textcolor{orange}{S[T]}$$


$$\frac{\partial \textcolor{green}{\hat{y}}}{\partial \textcolor{red}{W_{in}}} = \frac{\partial \textcolor{orange}{S[0]}}{\partial \textcolor{red}{W_{in}}} + \frac{\partial \textcolor{orange}{S[1]}}{\partial \textcolor{red}{W_{in}}} + ... + \frac{\partial \textcolor{orange}{S[T]}}{\partial \textcolor{red}{W_{in}}}$$


Great, so $$\frac{\partial \textcolor{green}{\hat{y}}}{\partial \textcolor{red}{W_{in}}}$$ is just the sum of the spike derivatives $$\sum_{t=0}^{T} \frac{\partial \textcolor{orange}{S[t]}}{\partial \textcolor{red}{W_{in}}}$$. If we knew what $$\frac{\partial \textcolor{orange}{S[t]}}{\partial \textcolor{red}{W_{in}}}$$ was, we could already find the derivative and be done. Recall that by definition $$\textcolor{orange}{S[t]} = \Theta(\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})$$. What we have here is a function within a function. The [chain rule](https://en.wikipedia.org/wiki/Differentiation_rules#Chain_rule) tells us how to handle these cases and brings us to:

\begin{equation}
\frac{\partial \textcolor{orange}{S[t]}}{\partial \textcolor{red}{W_{in}}} = \frac{\partial \Theta (\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})}{\partial (\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})} \cdot \frac{\partial (\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})}{\partial \textcolor{red}{W_{in}}}
\label{eq:spike_derivative}
\end{equation}


It's the classic outer derivative times inner derivative. Let's start with the inner derivative on the right. In this simple model, $$\textcolor{brown}{\theta}$$ is just a constant and its derivative is $$0$$. Thus

\begin{equation}
\frac{\partial (\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})}{\partial \textcolor{red}{W_{in}}} = \frac{\partial (\textcolor{ForestGreen}{U[t]} - 0)}{\partial \textcolor{red}{W_{in}}} = \frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}}
\label{eq:d_s_t_basis}
\end{equation}


So the right part is just the derivative of $$\textcolor{ForestGreen}{U[t]}$$ and the full equation simplifies to

\begin{equation}
\frac{\partial \textcolor{orange}{S[t]}}{\partial \textcolor{red}{W_{in}}} = \frac{\partial \Theta (\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})}{\partial (\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})} \cdot \frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}}
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

Let's use the sigmoid derivative as our surrogate gradient function, i.e., $$\frac{\partial \Theta (\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})}{\partial (\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})} \approx \sigma'(\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})$$. We will treat it as a known quantity. $$\textcolor{brown}{\theta}$$ is just a constant and $$\textcolor{ForestGreen}{U[t]}$$ is known at time $$t$$ so we now know the left side of equation 8. All that's left is $$\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}}$$.

To find the derivative of $$\textcolor{ForestGreen}{U[t]}$$, let's remember its definition: $$\textcolor{ForestGreen}{U[t]} = \textcolor{blue}{\alpha} \textcolor{ForestGreen}{U[t-1]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[t]}$$. Since $$\textcolor{ForestGreen}{U[t]}$$ depends on $$\textcolor{red}{W_{in}}$$ and obviously $$\textcolor{red}{W_{in}} \textcolor{purple}{X[t]}$$ depends on $$\textcolor{red}{W_{in}}$$ as well, we get two parts to the derivative:


$$\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \frac{\partial (\textcolor{blue}{\alpha} \textcolor{ForestGreen}{U[t-1]})}{\partial \textcolor{red}{W_{in}}} + \frac{\partial (\textcolor{red}{W_{in}} \textcolor{purple}{X[t]})}{\partial \textcolor{red}{W_{in}}}$$


Once again, $$\textcolor{blue}{\alpha}$$ is a constant, so the first term comes out to $$\textcolor{blue}{\alpha} \frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}}$$. For the second term, obviously the derivative with respect to $$\textcolor{red}{W_{in}}$$ is simply $$\frac{\partial (\textcolor{red}{W_{in}} \textcolor{purple}{X[t]})}{\partial \textcolor{red}{W_{in}}} = \textcolor{purple}{X[t]}$$

And thus the derivative of $$\textcolor{ForestGreen}{U[t]}$$ is:

\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \textcolor{blue}{\alpha} \frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}} + \textcolor{purple}{X[t]}
\label{eq:membrane_derivative_recursive}
\end{equation}


Okay that was straight-forward but now we have a weird recursion because $$\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}}$$ depends on $$\frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}}$$. That one depends on $$\frac{\partial \textcolor{ForestGreen}{U[t-2]}}{\partial \textcolor{red}{W_{in}}}$$ and so on. The recursion ends when we reach the initial state, so let's start there.

## Solving the recursion


The goal is to find the pattern in this recursion and then take its derivative. It will only take a couple of steps, but first let's set an initial state $$\textcolor{ForestGreen}{U[0]} = 0$$ and hence $$\frac{\partial \textcolor{ForestGreen}{U[0]}}{\partial \textcolor{red}{W_{in}}} = 0$$. By definition (equation 3) we know that:


$$\textcolor{ForestGreen}{U[1]} = \textcolor{blue}{\alpha} \textcolor{ForestGreen}{U[0]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[0]}$$


$$ = \textcolor{blue}{\alpha} 0 + \textcolor{red}{W_{in}} \textcolor{purple}{X[1]} $$

$$ = \textcolor{red}{W_{in}} \textcolor{purple}{X[1]} $$


Going one step further, we find that: 


$$\textcolor{ForestGreen}{U[2]} = \textcolor{blue}{\alpha} \textcolor{ForestGreen}{U[1]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[2]}$$


$$= \textcolor{blue}{\alpha} (\textcolor{red}{W_{in}} \textcolor{purple}{X[1]}) + \textcolor{red}{W_{in}} \textcolor{purple}{X[2]}$$


$$= \textcolor{blue}{\alpha} \textcolor{red}{W_{in}} \textcolor{purple}{X[1]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[2]}$$


and another step:


$$\textcolor{ForestGreen}{U[3]} = \textcolor{blue}{\alpha} \textcolor{ForestGreen}{U[2]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[3]}$$


$$ = \textcolor{blue}{\alpha} (\textcolor{blue}{\alpha} \textcolor{red}{W_{in}} \textcolor{purple}{X[1]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[2]}) + \textcolor{red}{W_{in}} \textcolor{purple}{X[3]}$$


$$ = \textcolor{blue}{\alpha}^2 \textcolor{red}{W_{in}} \textcolor{purple}{X[1]} + \textcolor{blue}{\alpha} \textcolor{red}{W_{in}} \textcolor{purple}{X[2]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[3]}$$


To make the pattern more obvious, let me add some exponents: 


$$\textcolor{ForestGreen}{U[3]} = \textcolor{blue}{\alpha}^2 \textcolor{red}{W_{in}} \textcolor{purple}{X[1]} + \textcolor{blue}{\alpha}^1 \textcolor{red}{W_{in}} \textcolor{purple}{X[2]} + \textcolor{blue}{\alpha}^0 \textcolor{red}{W_{in}} \textcolor{purple}{X[3]}$$


In general, we find that


$$\textcolor{ForestGreen}{U[t]} = \textcolor{blue}{\alpha}^{t-1} \textcolor{red}{W_{in}} \textcolor{purple}{X[1]} + \textcolor{blue}{\alpha}^{t-2} \textcolor{red}{W_{in}} \textcolor{purple}{X[2]} + ... + \textcolor{blue}{\alpha}^{t-t} \textcolor{red}{W_{in}} \textcolor{purple}{X[t]}$$

$$ = \sum_{i=1}^{t} \textcolor{blue}{\alpha}^{t-i} \textcolor{red}{W_{in}} \textcolor{purple}{X[i]}$$


Since the derivative of the sum is just the sum of the derivatives, we get the following equation:

\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \sum_{i=1}^{t} \textcolor{blue}{\alpha}^{t-i} \textcolor{purple}{X[i]}
\label{eq:membrane_derivative_closed}
\end{equation}

## Putting it all together
To recap, we were trying to find the following derivative:

\begin{equation}
\frac{\partial \textcolor{olive}{E}}{\partial \textcolor{red}{W_{in}}} = \frac{\partial \textcolor{olive}{E}}{\partial \textcolor{green}{\hat{y}}} \cdot \frac{\partial \textcolor{green}{\hat{y}}}{\partial \textcolor{red}{W_{in}}}
\end{equation}

Expanding $$\frac{\partial \textcolor{green}{\hat{y}}}{\partial \textcolor{red}{W_{in}}}$$ using the chain rule through the spikes and membrane potentials:

\begin{equation}
\frac{\partial \textcolor{olive}{E}}{\partial \textcolor{red}{W_{in}}} = \frac{\partial \textcolor{olive}{E}}{\partial \textcolor{green}{\hat{y}}} \cdot \sum_{t=0}^T \left[\frac{\partial \textcolor{orange}{S[t]}}{\partial \textcolor{ForestGreen}{U[t]}} \cdot \frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}}\right]
\end{equation}

And we were able to resolve it to this:


\begin{equation}
\frac{\partial \textcolor{olive}{E}}{\partial \textcolor{red}{W_{in}}} = \sum_{t=0}^{T} \sigma'(\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta}) \cdot \sum_{i=1}^{t} \textcolor{blue}{\alpha}^{t-i} \textcolor{purple}{X[i]}
\label{eq:final_gradient}
\end{equation}


So that's all the computations for the single neuron when we disregard the reset term. Let's add that back.

## The reset term (optional)
The reset term is part of $$\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}}$$. As per equation \ref{eq:lif_full}, it is a term that gets subtracted from the membrane potential: $$-\textcolor{orange}{S[t-1]}\textcolor{brown}{\theta}$$.

The derivative is $$\frac{\partial (-\textcolor{orange}{S[t-1]}\textcolor{brown}{\theta})}{\partial \textcolor{red}{W_{in}}}$$ and we already know how to compute it for the case of $$\textcolor{orange}{S[t]}$$. We can now extend equation \ref{eq:membrane_derivative_closed} to include the reset term:

\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \sum_{i=1}^{t} \textcolor{blue}{\alpha}^{t-i} \textcolor{purple}{X[i]} - \textcolor{brown}{\theta} \frac{\partial (\textcolor{orange}{S[t-1]})}{\partial \textcolor{red}{W_{in}}}
\end{equation}

We already know how to compute $$\frac{\partial \textcolor{orange}{S[t-1]}}{\partial \textcolor{red}{W_{in}}}$$ from our earlier derivation (just shift the time index):

\begin{equation}
\frac{\partial \textcolor{orange}{S[t-1]}}{\partial \textcolor{red}{W_{in}}} = \sigma'(\textcolor{ForestGreen}{U[t-1]} - \textcolor{brown}{\theta}) \cdot \sum_{i=1}^{t-1} \textcolor{blue}{\alpha}^{t-1-i} \textcolor{purple}{X[i]}
\end{equation}

Substituting this into the full gradient, we get the complete version of equation \ref{eq:final_gradient} with the reset term included:

\begin{equation}
\frac{\partial \textcolor{olive}{E}}{\partial \textcolor{red}{W_{in}}} = \sum_{t=0}^{T} \sigma'(\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta}) \cdot \left(\sum_{i=1}^{t} \textcolor{blue}{\alpha}^{t-i} \textcolor{purple}{X[i]} - \textcolor{brown}{\theta} \sigma'(\textcolor{ForestGreen}{U[t-1]} - \textcolor{brown}{\theta}) \cdot \sum_{j=1}^{t-1} \textcolor{blue}{\alpha}^{t-1-j} \textcolor{purple}{X[j]}\right)
\label{eq:final_gradient_with_reset}
\end{equation}

If you are like me then this is starting to look messy to you. Funnily enough we probably don't need the reset term anyway. Apparently [Zenke et al.](https://direct.mit.edu/neco/article/33/4/899/97482/The-Remarkable-Robustness-of-Surrogate-Gradient), show that it is not only useless but sometimes even harmful. 

## The vector view
We can also interpret this notation differently: $$\textcolor{ForestGreen}{U[t]}$$ is a vector of membrane potentials. $$\textcolor{red}{W_{in}}$$ is a matrix of input weights. $$\textcolor{blue}{\alpha}$$, $$\textcolor{brown}{\theta}$$, $$\textcolor{purple}{X[t]}$$ and $$\textcolor{orange}{S[t]}$$ all are vectors, too. In this view, everything still works out exactly them same, except some multiplications are actually element-wise products and others are dot products. This view is shown in the figure below.

<figure id="fig:multi_neuron_diagram">
<div id="multi-lif-neuron-diagram" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 3:</strong> Vector view with 3 LIF neurons. Multiple inputs X[t] (X₀[t], X₁[t], X₂[t]) fully connect to all neurons via weight matrix W<sub>in</sub>. Each neuron has its own membrane potential U[t] (U₀[t], U₁[t], U₂[t]) and produces spikes S[t] (S₀[t], S₁[t], S₂[t]).</figcaption>
</figure>

<script src="{{ '/assets/js/multi-lif-diagram.js' | relative_url }}"></script>

## Adding recurrent weights
Let's add another term to account for spikes coming from other neurons in the same layer so they can influence each other.

\begin{equation}
\textcolor{ForestGreen}{U[t]} = \textcolor{blue}{\alpha} \textcolor{ForestGreen}{U[t-1]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[t]} + \underbrace{\textcolor{teal}{W_{rec}}\textcolor{orange}{S[t-1]}}_{\text{recurrent spikes}} - \textcolor{orange}{S[t-1]} \textcolor{brown}{\theta}
\label{eq:lif_full_with_rec}
\end{equation}

where $$\textcolor{teal}{W_{rec}}$$ is the recurrent weight matrix connecting neuron outputs back to neuron inputs. This is shown in the figure below.

<figure id="fig:recurrent_neuron_diagram">
<div id="recurrent-lif-neuron-diagram" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 4:</strong> Vector view with recurrent connections. In addition to the input weights W<sub>in</sub>, each neuron's output S[t-1] connects back to all neurons via the recurrent weight matrix W<sub>rec</sub> (weird green-blue color). The curved connections show the fully recurrent connectivity.</figcaption>
</figure>

<script src="{{ '/assets/js/recurrent-lif-diagram.js' | relative_url }}"></script>

Note that the derivative of a sum is just the sum of derivatives. Hence we only need to find the derivative of this additional term and add it to the derivative we came up with previously. The term we have to differentiate is $$\frac{\partial (\textcolor{teal}{W_{rec}} \textcolor{orange}{S[t-1]})}{\partial \textcolor{red}{W_{in}}}$$ but notice that $$\frac{\partial \textcolor{teal}{W_{rec}}}{\partial \textcolor{red}{W_{in}}} = 0$$, i.e., it's constant w.r.t. $$\textcolor{red}{W_{in}}$$. Thus

\begin{equation}
\frac{\partial (\textcolor{teal}{W_{rec}} \textcolor{orange}{S[t-1]})}{\partial \textcolor{red}{W_{in}}} = \textcolor{teal}{W_{rec}} \frac{\partial \textcolor{orange}{S[t-1]}}{\partial \textcolor{red}{W_{in}}}
\end{equation}

## The single layer view
WIP

## fuck it, let me write this from scratch

\begin{equation}
\frac{\partial \textcolor{olive}{E}}{\partial \textcolor{red}{W_{in}}} = \frac{\partial \textcolor{olive}{E}}{\partial \textcolor{green}{\hat{y}}} \cdot \sum_{t=0}^T \left[\frac{\partial \textcolor{orange}{S[t]}}{\partial \textcolor{ForestGreen}{U[t]}} \cdot \frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}}\right]
\end{equation}


\begin{equation}
\textcolor{ForestGreen}{U[t]} = \textcolor{blue}{\alpha} \textcolor{ForestGreen}{U[t-1]} + \textcolor{red}{W_{in}} \textcolor{purple}{X[t]} + \textcolor{teal}{W_{rec}}\textcolor{orange}{S[t-1]} - \textcolor{orange}{S[t-1]} \textcolor{brown}{\theta}
\label{eq:lif_full_with_rec_repeat}
\end{equation}


\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \textcolor{blue}{\alpha} \frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}} + \textcolor{purple}{X[t]} + \textcolor{teal}{W_{rec}} \frac{\partial \textcolor{orange}{S[t-1]}}{\partial \textcolor{red}{W_{in}}} -  \frac{\partial \textcolor{orange}{S[t-1]}}{\partial \textcolor{red}{W_{in}}} \textcolor{brown}{\theta}
\label{eq:u_derivative_with_rec_abstract}
\end{equation}

\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \textcolor{blue}{\alpha} \frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}} + \textcolor{purple}{X[t]} + \textcolor{teal}{W_{rec}} \frac{\partial \textcolor{orange}{S[t-1]}}{\partial \textcolor{ForestGreen}{U[t-1]}} \frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}} - \textcolor{brown}{\theta} \frac{\partial \textcolor{orange}{S[t-1]}}{\partial \textcolor{ForestGreen}{U[t-1]}} \frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}}
\label{eq:u_derivative_with_rec_expanded}
\end{equation}

\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \left[\textcolor{blue}{\alpha} + \textcolor{teal}{W_{rec}} \frac{\partial \textcolor{orange}{S[t-1]}}{\partial \textcolor{ForestGreen}{U[t-1]}} - \textcolor{brown}{\theta} \frac{\partial \textcolor{orange}{S[t-1]}}{\partial \textcolor{ForestGreen}{U[t-1]}}\right] \frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}} + \textcolor{purple}{X[t]}
\label{eq:u_derivative_with_rec_factored}
\end{equation}

\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \left[\textcolor{blue}{\alpha} + (\textcolor{teal}{W_{rec}} - \textcolor{brown}{\theta}) \sigma'(\textcolor{ForestGreen}{U[t-1]} - \textcolor{brown}{\theta})\right] \frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}} + \textcolor{purple}{X[t]}
\label{eq:u_derivative_with_rec_surrogate}
\end{equation}

Expanding $$\frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}}$$ one more step:

\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \left[\textcolor{blue}{\alpha} + (\textcolor{teal}{W_{rec}} - \textcolor{brown}{\theta}) \sigma'(\textcolor{ForestGreen}{U[t-1]} - \textcolor{brown}{\theta})\right] \left[\left[\textcolor{blue}{\alpha} + (\textcolor{teal}{W_{rec}} - \textcolor{brown}{\theta}) \sigma'(\textcolor{ForestGreen}{U[t-2]} - \textcolor{brown}{\theta})\right] \frac{\partial \textcolor{ForestGreen}{U[t-2]}}{\partial \textcolor{red}{W_{in}}} + \textcolor{purple}{X[t-1]}\right] + \textcolor{purple}{X[t]}
\label{eq:u_derivative_expanded_once}
\end{equation}

Distributing the brackets:

\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \left[\textcolor{blue}{\alpha} + (\textcolor{teal}{W_{rec}} - \textcolor{brown}{\theta}) \sigma'(\textcolor{ForestGreen}{U[t-1]} - \textcolor{brown}{\theta})\right] \left[\textcolor{blue}{\alpha} + (\textcolor{teal}{W_{rec}} - \textcolor{brown}{\theta}) \sigma'(\textcolor{ForestGreen}{U[t-2]} - \textcolor{brown}{\theta})\right] \frac{\partial \textcolor{ForestGreen}{U[t-2]}}{\partial \textcolor{red}{W_{in}}} + \left[\textcolor{blue}{\alpha} + (\textcolor{teal}{W_{rec}} - \textcolor{brown}{\theta}) \sigma'(\textcolor{ForestGreen}{U[t-1]} - \textcolor{brown}{\theta})\right] \textcolor{purple}{X[t-1]} + \textcolor{purple}{X[t]}
\label{eq:u_derivative_distributed}
\end{equation}

Notice how the similar bracketed terms $$\left[\textcolor{blue}{\alpha} + (\textcolor{teal}{W_{rec}} - \textcolor{brown}{\theta}) \sigma'(\textcolor{ForestGreen}{U[\cdot]} - \textcolor{brown}{\theta})\right]$$ appear repeatedly, just with different time indices. This motivates introducing a shorthand notation.

## Solving the recursion

To simplify notation, let's define $$\textcolor{Maroon}{\beta[t]} = \textcolor{blue}{\alpha} + (\textcolor{teal}{W_{rec}} - \textcolor{brown}{\theta}) \sigma'(\textcolor{ForestGreen}{U[t]} - \textcolor{brown}{\theta})$$. Then our equation becomes:

\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \textcolor{Maroon}{\beta[t-1]} \frac{\partial \textcolor{ForestGreen}{U[t-1]}}{\partial \textcolor{red}{W_{in}}} + \textcolor{purple}{X[t]}
\label{eq:u_derivative_beta}
\end{equation}

Now let's expand this recursively, starting with the initial condition $$\frac{\partial \textcolor{ForestGreen}{U[0]}}{\partial \textcolor{red}{W_{in}}} = 0$$:

$$\frac{\partial \textcolor{ForestGreen}{U[1]}}{\partial \textcolor{red}{W_{in}}} = \textcolor{Maroon}{\beta[0]} \cdot 0 + \textcolor{purple}{X[1]} = \textcolor{purple}{X[1]}$$

$$\frac{\partial \textcolor{ForestGreen}{U[2]}}{\partial \textcolor{red}{W_{in}}} = \textcolor{Maroon}{\beta[1]} \frac{\partial \textcolor{ForestGreen}{U[1]}}{\partial \textcolor{red}{W_{in}}} + \textcolor{purple}{X[2]} = \textcolor{Maroon}{\beta[1]} \textcolor{purple}{X[1]} + \textcolor{purple}{X[2]}$$

$$\frac{\partial \textcolor{ForestGreen}{U[3]}}{\partial \textcolor{red}{W_{in}}} = \textcolor{Maroon}{\beta[2]} \frac{\partial \textcolor{ForestGreen}{U[2]}}{\partial \textcolor{red}{W_{in}}} + \textcolor{purple}{X[3]}$$

$$= \textcolor{Maroon}{\beta[2]} (\textcolor{Maroon}{\beta[1]} \textcolor{purple}{X[1]} + \textcolor{purple}{X[2]}) + \textcolor{purple}{X[3]}$$

$$= \textcolor{Maroon}{\beta[2]\beta[1]} \textcolor{purple}{X[1]} + \textcolor{Maroon}{\beta[2]} \textcolor{purple}{X[2]} + \textcolor{purple}{X[3]}$$

The pattern becomes clear. In general:

\begin{equation}
\frac{\partial \textcolor{ForestGreen}{U[t]}}{\partial \textcolor{red}{W_{in}}} = \sum_{i=1}^{t} \left(\prod_{j=i}^{t-1} \textcolor{Maroon}{\beta[j]}\right) \textcolor{purple}{X[i]}
\label{eq:u_derivative_pattern}
\end{equation}

where the product $$\prod_{j=i}^{t-1} \textcolor{Maroon}{\beta[j]} = \textcolor{Maroon}{\beta[t-1]\beta[t-2]\cdots\beta[i]}$$, and by convention, the product is 1 when $$i = t$$.