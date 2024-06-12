---
title: "SNN Reinforcement Learning"
excerpt: "Training SNNs with biologically plausible learning algorithms on Reinforcement Learning problems. [Learn more](/projects/01_cartpole/)<br/><img src='/images/projects/cartpole.gif'>"
collection: projects
tags: 
    - SNN
    - R-STDP
    - Reinforcement Learning
    - Cartpole
    - Actor-Critic
---

This is my favorite project. From the FZI-side, this might become the online-learning part of an embodied AI project. From a personal view, I'm figuring out the local learning rule that a sparse foundation model would need. 

Right now I am mostly focused on the [cartpole problem](https://gymnasium.farama.org/environments/classic_control/cart_pole/), which is quite simple and a great way to understand SNNs in detail. The goal is to keep a pole upright by moving the cart that it stands on. Below you can see it work after training on just the angle of the pole and angular velocity.

![Cartpole in action](/images/projects/cartpole.gif)

*__Figure 1__. Cartpole Network doing what it's supposed to. Although it does go off-screen which means it has yet to completely master the problem. This is due to the fact that information about its position was being withheld.*

As I said, this network is incomplete. It is only trained to keep the pole upright, not to keep it on the screen. This will be fixed in the next iteration. Figure 2 shows how the network is structured. It is quite simple and some readers may recognize an actor-critic setup. The setup was essential, because I did not want to provide any information except the rewards given by the environment. A smarter reward function greatly simplifies the problem, but in my case the network is forced to learn the value of its states and calculate rewards based on that.

![The SNN as it stands](/images/projects/snn.png)
*__Figure 2__. A simple SNN with no hidden layers. We only take the angle and angular velocity as inputs. For any input there is an inhibitory input associated with it. Rather than 1 neuron representing 1 input, there are 2-5 neurons for each input following a gaussian receptive field scheme. Green connections go from the excitatory inputs to policy neurons, blue goes from excitatory to the value neuron, red is inhibitory to policy and dark red is inhibitory to value.*

More to come.