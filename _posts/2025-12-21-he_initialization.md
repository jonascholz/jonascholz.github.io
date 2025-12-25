---
title: 'A forward pass through He initialization'
excerpt: "We go through some insights from He et al. to initialize weights. This builds the foundation for a follow-up blogposts, which analyzes the same situation for Spiking Neural Networks. [Read more](/posts/2025/12/spike-info/)<br/><img src='/assets/images/vanishing_gradients.png'>"
date: 2025-12-21  
permalink: /posts/2025/12/he-initialization/
tags:
  - He Initialization
  - ANN
  - ReLU
---
{% include mathjax-colors.html %}

<div class="notice--info" markdown="1">
**Note:** This post is based on the paper [Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification](https://openaccess.thecvf.com/content_iccv_2015/html/He_Delving_Deep_into_ICCV_2015_paper.html){:target="_blank"} by He et al. (2015). My angle is a bit different, because He et al. were fixing the Glorot initialization and studying PReLU activations. I don't cover any of that.
</div>

As gradients propagate across the layers of a network they get vanishingly small or explode to big values (see Figure 1).

Fortunately, if we just initialize the weights correctly, we can avoid the vanishing and exploding, at least at first. This may not solve the problem completely, but it's a step in the right direction. It also provides hints as to how we might solve this problem properly.

He et al. form all their theories around initializing with a normal distribution. The mean is assumed to be zero so they are really just figuring out what the layerwise variance needs to be for weight initialization.

<figure id="fig:vanishing_gradients">
<div id="vanishing-gradients-plot" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 1:</strong> Illustration of vanishing and exploding gradients as they propagate through network layers. Without proper initialization, gradients can either shrink exponentially (vanishing) or grow exponentially (exploding), making training unstable.</figcaption>
</figure>

<script src="{{ '/assets/js/vanishing-gradients-plot.js' | relative_url }}"></script>

To figure out the variance, they study how it changes in a forward pass. We will see this shortly. Afterwards we will see how to keep it constant throughout and do the same for the backward pass.


## The Variance of a Forward Pass
Let's see how we can choose the variances. Assume the following notation shown in Figure 2 for a single perceptron (artificial neuron):

<figure id="fig:neuron_setup">
<div id="mlp-neuron-diagram" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 2:</strong> Illustration of a perceptron in the notation of He et al. Inputs x₁, ..., xₗ are weighted by w₁, ..., wₗ, summed with bias b to produce y, then passed through ReLU to produce output a.</figcaption>
</figure>

<script src="{{ '/assets/js/mlp-neuron-diagram.js' | relative_url }}"></script>

We will get to the activation function on the right part of the diagram. Let's just focus on the stuff before that. We can write the weighted sum going into a neuron as follows:

\begin{equation}
\cy{y} = \sum_{i=1}^{\cn{n}} \cw{w_i} \cx{x_i} + \cb{b}
\label{eq:yl}
\end{equation}

where $$\cy{y}$$ is the output before the activation function, $$\cn{n}$$ is the number of inputs, $$\cw{w_i}$$ are the weights, $$\cx{x_i}$$ are the inputs, and $$\cb{b}$$ is the bias. 

All neurons in one layer receive the same inputs. Their weights are initialized by the same scheme. Hence the variance for all neurons in a layer $$l$$ is the same:

$$
\text{Var}[\cy{y_l^{(1)}}] = \text{Var}[\cy{y_l^{(2)}}] = \cdots = \text{Var}[\cy{y_l^{(d)}}]
$$

We can understand the layer's variance by understanding a single neuron's variance. In the following $$\cy{y_l}$$ stands for the weighted input sum of one particular neuron in layer $$l$$. In the they start with the equation you see below, but you can also expand the toggle to see how I think they got there.

<details>
<summary>How they probably proceeded</summary>

$$
\text{Var}[\cy{y}] = \text{Var}\left[\sum_{i=1}^{\cn{n}} \cw{w_i} \cx{x_i} + \cb{b}\right]
$$

It turns out that if there's a constant in the variance equation, you can safely remove it. Intuitively I think of constants as shifting the distribution. 

Imagine the normal distribution centered at 0. When you add a constant offset of +2 the distribution shifts but the shape is the same. Points sampled will have the same squared distance to the mean. It's the mean that changes. So it's safe to say:

$$
\text{Var}[\cy{y}] = \text{Var}\left[\sum_{i=1}^{\cn{n}} \cw{w_i} \cx{x_i}\right]
$$

Apparently the variance of a sum is a sum of variances and some covariances. You can read more about it on wikipedia <a href="https://en.wikipedia.org/wiki/Bienaym%C3%A9%27s_identity">(Bienaymé's identity)</a>.

$$
\text{Var}[\cy{y}] = \sum_{i=1}^{\cn{n}} \text{Var}[\cw{w_i} \cx{x_i}] + \sum_{i,j=1, i \neq j}^{\cn{n}} \text{Cov}[\cw{w_i} \cx{x_i}, \cw{w_j} \cx{x_j}]
$$

It looks like we made it worse but fortunately the covariance term comes out to 0 under one of the paper's assumptions: the weights and inputs of a layer are independent. Now obviously the weights of one layer and the inputs of the next layer would not be independent. The outputs of one layer, which depend on the weights, are the input of the next. However, if we are not considering the next and just look at weights and inputs for that layer, they are independent. Moreover, this is only true during initialization. This probably changes during training, but we only care about initialization at this stage. Let's see how this property helps us: 

$$\text{Cov}[\cw{w_i} \cx{x_i}, \cw{w_j} \cx{x_j}] = E[\cw{w_i} \cx{x_i} \cw{w_j} \cx{x_j}] - E[\cw{w_i} \cx{x_i}] E[\cw{w_j} \cx{x_j}]$$

And now we use the first assumption, the weights are sampled independently of other weights and inputs. The same holds for the distribution of inputs. According to <a href="https://en.wikipedia.org/wiki/Independence_(probability_theory)#Expectation_and_covariance">Wikipedia</a> this tells us the following:

$$E[\cw{w_i} \cx{x_i}] =  E[\cw{w_i}]  E[\cx{x_i}]$$

And by the same logic, let's first expand the right side of our covariance equation:

$$\text{Cov}[\cw{w_i} \cx{x_i}, \cw{w_j} \cx{x_j}] = E[\cw{w_i} \cx{x_i} \cw{w_j} \cx{x_j}] - E[\cw{w_i}] E[\cx{x_i}] E[\cw{w_j}] E[\cx{x_j}]$$

And we can expand the left side in the same way:

$$\text{Cov}[\cw{w_i} \cx{x_i}, \cw{w_j} \cx{x_j}] = E[\cw{w_i}] E[\cx{x_i}] E[\cw{w_j}] E[\cx{x_j}] - E[\cw{w_i}] E[\cx{x_i}] E[\cw{w_j}] E[\cx{x_j}] = 0$$

So going back to our original equation, we now see that the sum of covariances is a sum of zeros:

$$
\text{Var}[\cy{y}] = \sum_{i=1}^{\cn{n}} \text{Var}[\cw{w_i} \cx{x_i}] + 0
$$

The final term on the right looks much like the one we started with but that other term was the variance of a sum. Now we have the sum of variances. 

Importantly, the variance of a weight/input pair is the same as any other because of their independence. We just have $\cn{n}$ the same variance for all input/weight pairs in the layer.

</p>
</details>

And so we arrive at equation 8 of the He et al. paper:

\begin{equation}
\text{Var}[\cy{y_l}] = \cn{n_l} \cdot \text{Var}[\cw{w_l} \cx{x_l}]
\label{eq:variance_yl}
\end{equation}

Note that we want to figure out how variance of $\cy{y_l}$ changes with respect to the variance of $\cw{w_l}$. We still have to separate it from the $\cx{x_l}$, which depend on the previous layer. He et al. skip a couple of steps to get to the next equation you see below. My guess of what happens is inbetween.

<details>
<summary>If you care, expand this</summary>

Let's expand the equation with the definition of variance:

$$
\text{Var}[\cw{w_l} \cx{x_l}] = E[(\cw{w_l} \cx{x_l})^2] - (E[\cw{w_l} \cx{x_l}])^2
$$

Expanding the squared terms:

$$
\text{Var}[\cw{w_l} \cx{x_l}] = E[\cw{w_l}^2 \cx{x_l}^2] - (E[\cw{w_l} \cx{x_l}])^2
$$

Using independence of weights and inputs (same assumption as before), we can factor the expectations:

$$
\text{Var}[\cw{w_l} \cx{x_l}] = E[\cw{w_l}^2] E[\cx{x_l}^2] - (E[\cw{w_l}] E[\cx{x_l}])^2
$$

Now, He et al. assume the weights have zero mean: $E[\cw{w_l}] = 0$. So we can eliminate  $E[\cw{w_l}]$. Note however, that this does not apply to  $E[\cw{w_l}^2]$! For that one it's the same weight times itself. This is not independent at all! So in most cases $E[\cw{w_l}^2] \neq E[\cw{w_l}]^2 $. Anyway, we are now down to this

Now to be consistent with the formulation of He et al., we use the definition of variance: $\text{Var}[\cw{w_l}] = E[\cw{w_l}^2] - (E[\cw{w_l}])^2 = E[\cw{w_l}^2]$. Under our assumptions we can therefore rewrite the equation as:

\begin{align}
\text{Var}[\cw{w_l} \cx{x_l}] &= E[\cw{w_l}^2] E[\cx{x_l}^2] - 0 \\
&= \text{Var}[\cw{w_l}] E[\cx{x_l}^2]
\end{align}

Now we just have to put that back into the original equation


</details>

And we land on this equation (eq 9 in the He et al. paper), which separates out the $\cx{x_l}$:

\begin{equation}
\text{Var}[\cy{y_l}] = \cn{n_l} \text{Var}[\cw{w_l}] E[\cx{x_l}^2]
\label{eq:variance_yl_factored}
\end{equation}

Note that the $\cx{x_l}$ are the previous layers output. We have to expand the equation further to see what they are, but these values pass through an activation function.


## Aside: ReLU activations

Keep in mind for what's to come that we are assuming ReLU activations. If the inputs are centered around 0, then there's a 50% chance of getting an output = 0. There's also a 50% chance of getting an output > 0. This will be relevant later.

<figure id="fig:relu_mean">
<div id="relu-mean-plot" style="width: 100%; margin: 2em auto;"></div>
<figcaption><strong>Figure 3:</strong> ReLU activation function for input values between -1 and 1.</figcaption>
</figure>

<script src="{{ '/assets/js/relu-mean-plot.js' | relative_url }}"></script>

## Resolving the Expectation of $\cx{x_l^2}$
Once again, we get a very brief explanation. Here's my understanding of what's happening

There's a thing called the <a href="https://en.wikipedia.org/wiki/Law_of_total_expectation">law of total expectation</a>. It lets us partition a random variable into some conditionals of a related variable.

<details>
<summary>Law of total expectation?</summary>
Here's Gemini's example: How long it takes to get to work depends on the weather. So the commute time $\cx{X}$ is a random variable that is conditioned on the weather random variable.

We can consider the case of ${\cy{rain}}$, which happens 20% of the time. On these days, the commute takes 45 minutes. The remaining 80% we have $\cy{sunny}$ days with 30 minute commutes. It makes intuitive sense then that we can break $E[\cx{X}]$ into these conditions. 

$$E[\cx{X}] = E[\cx{X} | \cy{Rain}] \cdot P(\cy{Rain}) + E[\cx{X} | \cy{Sun}] \cdot P(\cy{Sun})$$

So in our case

$$E[\cx{X}] = 45 \cdot 0.2 + 30 \cdot 0.8 = 33$$

Thanks Gemini!

</details>

With the law of total expectation we can break the $\cx{x_l}$ into cases where the pre-activation is greater than zero and cases where it's not. Because ReLU resolves neatly into these cases, we will be able to simplify it from there.

\begin{equation}
E[\cx{x_l}^2] = E[\cx{x_l}^2 \mid \cy{y_{l-1}} > 0] \cdot P(\cy{y_{l-1}} > 0) + E[\cx{x_l}^2 \mid \cy{y_{l-1}} \leq 0] \cdot P(\cy{y_{l-1}} \leq 0)
\label{eq:total_expectation_xl}
\end{equation}

For the part on the right, ReLU turns values less than or equal to zero into zero. Hence in that case 

$$E[\cx{x_l}^2 \mid \cy{y_{l-1}} \leq 0] = E[\cx{x_l} \cdot \cx{x_l} \mid \cy{y_{l-1}} \leq 0] = E[0 \cdot 0 \mid \cy{y_{l-1}} \leq 0]$$ 

And we can rewrite the full equation as follows

$$
\begin{aligned}
E[\cx{x_l}^2] &= E[\cx{x_l}^2 \mid \cy{y_{l-1}} > 0] \cdot P(\cy{y_{l-1}} > 0) + 0 \cdot P(\cy{y_{l-1}} \leq 0) \\
&= E[\cx{x_l}^2 \mid \cy{y_{l-1}} > 0] \cdot P(\cy{y_{l-1}} > 0)
\end{aligned}
$$

In fact, if $\cy{y_{l-1}} > 0$ then the ReLU's output is identical to its input. In other words $\cx{x_l} = \cy{y_l}$.

\begin{equation}
E[\cx{x_l}^2] = E[\cy{y_l}^2 \mid \cy{y_{l-1}} > 0] \cdot P(\cy{y_{l-1}} > 0)
\label{eq:xl_with_yl}
\end{equation}

He et al. state that $\cy{y_{l-1}}$ is symmetric around zero. In other words, half of the time its values are greater than zero.

<details>
<summary>Why the symmetry?</summary>
By definition:

$$
\cy{y_{l-1}} = \sum_{i=1}^{\cn{n}} \cw{w_i} \cx{x_i} + b
$$

Assuming the bias is centered around 0, it won't change the symmetry. Let's remove it for now.

$$
\cy{y_{l-1}} = \sum_{i=1}^{\cn{n}} \cw{w_i} \cx{x_i}
$$

Now the $\cx{x_i}$ are always either zero or positive, because they pass through the ReLU activation. So the sign of each term is determined by $\cw{w_i}$, which we defined to have zero mean. Thus, $\cy{y_{l-1}}$ has zero mean.

</details>

\begin{equation}
E[\cx{x_l}^2] = E[\cy{y_l}^2 \mid \cy{y_{l-1}} > 0] \cdot \frac{1}{2}
\label{eq:xl_half_probability}
\end{equation}

Now it turns out we can get rid of the conditional with a simple trick. However, forget about everything we just did and just consider $E[\cy{y_l}^2]$ in isolation. By the law of total expectation, we could partition that thing into cases where $\cy{y_l}$ is either greater than zero or less than zero. If it were zero, it wouldn't change the expectation in any way.

$$
E[\cy{y_l}^2] = \underbrace{E[\cy{y_l}^2 \mid \cy{y_l} > 0]}_{A} \cdot \frac{1}{2} + \underbrace{E[\cy{y_l}^2 \mid \cy{y_l} < 0]}_{A} \cdot \frac{1}{2}
$$

Because of the symmetry both cases have the same expected value A. In turn, the equation has the form

\begin{equation}
E[\cy{y}^2] = A \cdot \frac{1}{2} + A \cdot \frac{1}{2} = A
\label{eq:symmetry_simplification}
\end{equation}

which implies that

\begin{equation}
E[\cy{y}^2] = E[\cy{y_{l-1}}^2 \mid \cy{y_{l-1}} > 0]
\label{eq:y_simplification}
\end{equation}

And substituting back into the original we find that

\begin{equation}
E[\cx{x_l}^2] = E[\cy{y_l}^2] \cdot \frac{1}{2}
\label{eq:xl_final_form}
\end{equation}

## Putting it back together

The resolved equation (eq10 in the He et al. paper) looks like this:

\begin{equation}
\text{Var}[\cy{y_l}] = \frac{1}{2} \cn{n_l} \text{Var}[\cw{w_l}] \text{Var}[\cy{y_{l-1}}]
\label{eq:variance_yl_resolved}
\end{equation}

So we have finally broken the variance down to $\cn{n_l}$, which we choose, $\text{Var}[\cw{w_l}]$ which we choose as well and $\text{Var}[\cy{y_{l-1}}]$ which we can resolve recursively. In fact, let's do that right now!

For the final layer L, it's variance is as follows (eq11 in He et al.)

\begin{equation}
\text{Var}[\cy{y_L}] = \text{Var}[\cy{y_1}] \left( \prod_{l=2}^{L} \frac{1}{2}\cn{n_l} \text{Var}[\cw{w_l}]\right)
\label{eq:variance_final_layer}
\end{equation}
