---
title: 'Information content per spike'
excerpt: "How much information does a spike hold? How can we increase the information per spike?  [Read more](/posts/2025/12/spike-info/)<br/><img src='/assets/images/spike_info.png'>"
date: 2025-12-05
permalink: /posts/2025/12/spike-info/
tags:
  - SNN
  - Information Theory
---

In Spiking Neural Networks, all communication happens in discrete spikes. We want to have as few spikes as possible, because every spike consumes energy. In this post we will see how we can maximize the information per spike. 

We assume time is split into discrete steps. For example, we might simulate the neuron for 100ms in steps of 1ms. At every step, the neuron can only be in a spiking or non-spiking state.

## The coinflip example

Let's say a neurons knows the outcome of a coin flip and wants to send this information to another neuron. There are only two outcomes: heads (0) and tails (1). In the simplest case, the neuron only has a single timestep to transmit its signal. So it might decide to send a spike when the outcome is tails but send no spike when the outcome is heads. We see this below in Figure 1.

<figure id="fig:two_neuron_spike">
<div id="two-neuron-spike" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 1:</strong> Two neurons connected by a synapse. When the outcome is "tails", the first neuron sends a spike to the second neuron.</figcaption>
</figure>

<script src="{{ '/assets/js/two-neuron-spike.js' | relative_url }}"></script>

If there is only a single timestep, we can only ever represent these $$2^1$$ states (0, 1). With two timesteps we can represent $$2^2$$ states (00, 01, 10, 11). With three timesteps we have $$2^3$$ states and so on. But how does it change the information we gain per spike?


## Self information
In information theory, every event has an associated information value. Intuitively, the information is higher if the event is more surprising. In the coinflip example, neither outcome is all that surprising. Heads is as likely as tails and there aren't any other outcomes.

Let's consider the question of whether the sun will rise tomorrow. It usually does, so there is almost no surprise when it happens. If I tell you that tomorrow it will rise once more, this carries almost no information. On the other hand, if I tell you that there won't be another sunrise tomorrow, this may come as a shock. There is much more information content in that event.

In general the self-information of an event is higher when the event is less likely. It is lower when the event is very likely. This can be seen below.

<figure id="fig:self_information">
<div id="self-information-plot" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 2:</strong> Self-information as a function of probability. Events with low probability (rare, surprising) have high information content, while events with high probability (common, expected) have low information content.</figcaption>
</figure>

<script src="{{ '/assets/js/self-information-plot.js' | relative_url }}"></script>

This is captured by the following equation:

\begin{equation}
\textcolor{teal}{I(x)} = -\log_2(\textcolor{purple}{p(x)})
\label{eq:self_information}
\end{equation}

where $$\textcolor{teal}{I(x)}$$ is the self-information of event $$x$$ measured in bits, and $$\textcolor{purple}{p(x)}$$ is the probability of that event occurring.

In the system we had, there were two events with probability $$\textcolor{purple}{p(\text{heads})}=\textcolor{purple}{p(\text{tails})}=\textcolor{purple}{0.5}$$. Each event carries the same information $$\textcolor{teal}{I(\text{heads})}=\textcolor{teal}{I(\text{tails})}=-\log_2(\textcolor{purple}{0.5})=1$$ bit.

## Optimizing codes
So far we have encoded events of equal probability. All outcomes are equally likely, and it doesn't really matter whether heads or tails is encoded by a spike. This changes when we use an unfair coin, where heads has a 75% chance and tails a 25% chance. 

Now heads (0) is much more likely than tails (1) and thus 00 is more likely than 11. Somewhere inbetween lie 01 and 10. This is a big opportunity, because it means we can use a shorter code for 00 than for 11.

Heads-heads has a $$0.75 * 0.75$$ chance of occuring and is the most likely outcome of two consecutive coin-flips. We may be able to use a shorter code such as 0 instead of 00, as seen in Figure 3 below. However, in classical systems there is an important caveat: the code has to be prefix-free. 

<figure id="fig:code_length">
<div id="code-length-plot" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 3:</strong> Left: Four possible outcomes of two consecutive unfair coin flips with their probabilities shown as bars. Right: A prefix-free binary tree encoding where more probable outcomes get shorter codes. Green nodes are outcomes (leaves), gray nodes are intermediate decision points.</figcaption>
</figure>

<script src="{{ '/assets/js/code-length-plot.js' | relative_url }}"></script>

A prefix-free encoding has no codes that are prefixes of other codes. For example, let's say we encode heads-heads as 0 and we heads-tails as 00. Now the neuron sends the code 00 to its neighbor and the neighbor has to make sense of it. Did the other guy mean heads-heads TWICE (00) or did he mean heads-tails (00). It's impossible to know unless the neuron already knows when the transmission starts and ends and that it is about to receive the outcome of exactly two coin-flips.

So intuitively encoding it like this may bring us an advantage, but can we measure it?

## Entropy
Entropy is just the expected information for all possible events. In other words:

\begin{equation}
\textcolor{orange}{H(X)} = \mathbb{E}[\textcolor{teal}{I(X)}] = \sum_{x} \textcolor{purple}{p(x)} \cdot \textcolor{teal}{I(x)}
\label{eq:entropy}
\end{equation}

where $$\textcolor{orange}{H(X)}$$ is the entropy of the random variable $$X$$, measuring the average information content in bits.

In the single coin-flip example, each event had a probability of $$\textcolor{purple}{0.5}$$ and it carried $$\textcolor{teal}{1}$$ bit of information. So the entropy was simply:

$$\textcolor{orange}{H(X)} = \textcolor{purple}{\frac{1}{2}} \cdot \textcolor{teal}{1} + \textcolor{purple}{\frac{1}{2}} \cdot \textcolor{teal}{1} = 1 \text{ bit}$$

In other words when one neuron tells the other what the outcome of a coinflip was, the other is expected to gain 1 bit of information.

Let's see what our expected information gain is in the code we just set up. We calculate the entropy for the four outcomes:

$$
\textcolor{orange}{H(X)} = \textcolor{purple}{p(\text{HH})} \cdot \textcolor{teal}{I(\text{HH})} + \textcolor{purple}{p(\text{HT})} \cdot \textcolor{teal}{I(\text{HT})} + \textcolor{purple}{p(\text{TH})} \cdot \textcolor{teal}{I(\text{TH})} + \textcolor{purple}{p(\text{TT})} \cdot \textcolor{teal}{I(\text{TT})}
$$

Substituting the probability values:

$$
\textcolor{orange}{H(X)} = \textcolor{purple}{0.56} \cdot (-\log_2(\textcolor{purple}{0.56})) + \textcolor{purple}{0.19} \cdot (-\log_2(\textcolor{purple}{0.19})) + \textcolor{purple}{0.19} \cdot (-\log_2(\textcolor{purple}{0.19})) + \textcolor{purple}{0.06} \cdot (-\log_2(\textcolor{purple}{0.06}))
$$

Computing the information values:

$$
\textcolor{orange}{H(X)} \approx \textcolor{purple}{0.56} \cdot \textcolor{teal}{0.83} + \textcolor{purple}{0.19} \cdot \textcolor{teal}{2.40} + \textcolor{purple}{0.19} \cdot \textcolor{teal}{2.40} + \textcolor{purple}{0.06} \cdot \textcolor{teal}{4.06} \approx 1.62 \text{ bits}
$$

On average we are sending 1.62 bits. This is not neccessarily 1.62 spikes though.

## WIP
decaying dice function 