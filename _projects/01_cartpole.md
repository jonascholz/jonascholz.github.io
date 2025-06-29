---
title: "SNN Reinforcement Learning with R-STDP"
excerpt: "Training SNNs with biologically plausible learning algorithms on Reinforcement Learning problems. [Learn more](/projects/01_cartpole/)<br/><img src='/images/projects/cartpole.gif'>"
collection: projects
tags: 
    - SNN
    - R-STDP
    - Reinforcement Learning
    - Cartpole
    - Actor-Critic
---

My supervisor Alexandru Vasilache was working on a system with two loops: the outer evolution loop, changing the network structure and neuron properties and the inner learning loop for online adaptation. This thesis was about the online part. 

Please note that there is a similar thesis by Benedikt Vogler, which I discovered towards the end of my own work ([click here for his thesis](https://benediktsvogler.com/downloads/Training%20of%20Spiking%20Neural%20Networks%20with%20Reinforcement%20Learning.pdf)). This could have probably saved me some time, but ultimately he seems to have struggled to get it to work as well. Here I will describe what I did and what I think could be improved.

## The thesis

I tried to implement it with [R-STDP](https://academic.oup.com/cercor/article-abstract/17/10/2443/314939), which is a really interesting extension to STDP. Instead of changing weights directly, we remember the changes that should be made in an eligibility trace. This trace is combined with a reward factor to actually make changes. It's kind of like we are tracking the network's behavior and later reflecting whether we want more or less of that behavior. Adding a positive reward will reinforce it, adding a negative reward will weaken it and adding no reward means we make no change.

The eligibility trace is formed by the same rules as STDP, i.e., if the presynaptic neuron fires before the postsynaptic one then we strengthen. If it fires after the postsynaptic one, we weaken. You can see this in Figure 1, which I stole from [Izhikevich](https://academic.oup.com/cercor/article-abstract/17/10/2443/314939). The reward gates the changes in synaptic strength.

![The R-STDP dynamics](/images/projects/fig_traces.jpg)

*__Figure 1__. R-STDP dynamics from [Izhikevich](https://academic.oup.com/cercor/article-abstract/17/10/2443/314939). Neurons that fire together wire together, i.e., presynaptic spike before postsynaptic spike increases eligibility trace. On the other hand, neurons that fire out of sync lose their link. I.e., presynaptic spike after postsynaptic spike decreases eligibility trace. Adding a reward (extracellular dopamine) turns the trace into weight changes. Before the addition of the dopamine, the eligibility trace does nothing and decays over time.*

For the most part I focused on the [cartpole problem](https://gymnasium.farama.org/environments/classic_control/cart_pole/), which was simple enough to let me analyze what each neuron and connection does. The goal is to keep a pole upright by moving the cart that it stands on. Below you can see it work after training on just the angle of the pole and angular velocity (see Figure 2).

![Cartpole in action](/images/projects/cartpole.gif)

*__Figure 2__. Cartpole Network doing what it's supposed to. Although it does go off-screen which means it has yet to completely master the problem. This is due to the fact that information about its position was being withheld.*

Figure 3 shows how the network is structured. It is quite simple and some of you may recognize an actor-critic setup. The setup was essential, because I did not want to provide any information except the rewards given by the environment. A smarter reward function greatly simplifies the problem, but in my case the network is forced to learn the value of its states and calculate rewards based on that.

![The SNN as it stands](/images/projects/network_structure.png)
*__Figure 3__. A simple SNN with no hidden layers. We only take the angle and angular velocity as inputs. For any observed feature there is an excitatory input population and an inhibitory input population. This means rather than 1 neuron representing 1 input, there are 2-5 neurons for each input following a Gaussian receptive field scheme. The figure shows an example where only 1 feature is given to the network. There are 3 neurons per input population, representing values in the range from -1 to 1.*

In the full network there were input populations for every input feature, but that didn't fit in the plot. Additionally, Figure 3 shows how the policy neurons (actor) represent a different output path from the value neurons (critic). The reason why people use a structure like this is to provide better feedback to the network. Let me explain...

In cartpole, the reward at every step is 1, unless the agent messes up, in which case the simulation ends and the reward for the final step is 0. However, this is actually really uninformative when you think about it: Good actions get a reward of 1, bad actions get a reward of 1 and final actions get a reward of 0. It may be that the final action was good, too, trying to rescue the situation, but it was already too late. Or maybe the final action was bad, but it gets the same reward of 0 regardless. The reward at every step tells us nothing about the action, only an aggregate of rewards holds real information.

This is why we introduce the critic. It learns to judge each state and tells us whether things got better or worse. In this way, we can learn from actions right as they happen, not just from aggregate rewards later down the line. The actor-critic architecture is shown in Figure 4, which is once again stolen from somebody else ([Sutton and Barto](https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRLBook2ndEd.pdf)).

![Actor-critic learning](/images/projects/fig_actor-critic_architecture.jpg)

*__Figure 4__. Figure stolen from [Sutton and Barto](https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRLBook2ndEd.pdf). In actor-critic learning, we have an actor (policy network) and a critic (value network). The critic estimates a value for every state and the actor predicts probabilities for each possible action. These probabilities are used to sample the next action. Over time, the actor assigns higher probabilities to better actions.*

Anyway, enough exposition. This thing did not work well. The learning was incredibly unstable. You can see it below in Figure 5. If you are wondering why it suddenly performs well and stable, don't be fooled by the figure. This is what experts call "early stopping" or more commonly known as cheating. The performance never stabilized by itself and I struggled with it for a long time. The weight freeze is no solution, but it might be an indication that the network is in fact learning. Or maybe it just randomly ends up at good weights sometimes.

![Cart pole training](/images/projects/unstable_training.png)

*__Figure 5__. Unstable training progress on the cartpole problem. The network actually learns some really good weights sometimes and forgets them right after. It looks much like a random walk across the weight landscape.*

So why is the learning so unstable? That is the big question I was unable to answer, but I did make some progress towards the answer. Let's consider the mountain car problem where the goal is to move a car up a mountain. The challenge is that the car needs to accumulate some velocity first and swing back and forth to do that. In Figure 6 you can see the general setup as well as the custom rewards I added. Although the position reward wasn't actually used in the end.

*__Figure 6__. Custom rewards on the mountain car problem, where the car has to swing back and forth to accumulate some velocity. The goal is to reach the flag. Ultimately I didn't use the position, just the velocity and a reward for reaching the flag.*

![Mountain car reward](/images/projects/mountain_car_reward.png)

Note that using the target position and velocity for the reward simplifies the problem significantly. The critic just has to learn the structure of the rewards, instead of a longer-term pattern of accumulated rewards. As a result, the network was quick to learn the problem and relatively stable (Figure 7).

*__Figure 7__. Using custom rewards for mountain car makes the problem much easier. Results with hand-crafted reward functions are not that interesting in reinforcement learning. It often means the problem was simplified by encoding some domain knowledge.*

![Mountain car learning](/images/projects/mountain_car_learning.png)

The fact that a custom reward function increases stability might be an indication that the critic is at fault. We can study this problem in more detail by inspecting the critic values. At first the critic was made up of a few neurons that all predicted the same thing (how good our state is). Their predictions were averaged to get a better estimate. Well, it turns out that this may not be the most reliable approach.

Qualitative measurements indicated that it might be better to have them respond to different values. For example, one critic neuron would fire a lot when the state was bad and another would fire a lot when the state was good. By interpolating their activity in combination with their represented value, we can get a scalar estimate of the current state. In Figure 8 we see this interpolation in action.

*__Figure 8__. Three critics responding to a change in pole angle. We don't want the pole to fall over, so ideally it would be in the middle at angle 0. Critic 1 learned this and had higher spike activity when it was closer to 0. Critic 0 learned the opposite, spiking more as the angle got more tilted. Critic 2 apparently learned nothing. The interpolation still looks reasonable though.*

![Critic interpolation](/images/projects/critic_interpolation.png)

Turns out that did improve the stability but not by much. This is expected from Figure 8, because the critics only capture the general pattern. To evaluate whether an action was good, we compare the current state to the previous state. Well, when you compare one state to the next in this plot you can see that there's a very high probability of getting an incorrect evaluation, despite it learning the general pattern.

We can improve this in many ways. We can try different learning rates, we can add more neurons, we can train at intervals and many other things. I had lots of theories and experiments to this effect, but I'll spare you the details. More work needs to be done here and I couldn't get it done on time for my thesis submission. 

## Outlook
I turned to R-STDP because it seemed like a really interesting alternative to gradient-based methods. The learning rule is spatially local (no need to propagate information around) and temporally local (no need to store prior activations), which opens many opportunities. For me, it seemed like a rule that could support learning in a sparse network of 80 billion neurons: we only maintain traces for the small subset of active neurons. Then with the reward, only the synapses of those neurons change. 

Most of my problems in this thesis actually came from the reinforcement learning part of it, not so much the learning rule itself. This was perhaps my biggest mistake, although I made many more along the way. However, I quickly fell out of love with R-STDP when I realized that the eligibility trace is really not that different from the gradients that we would typically calculate for the weight of each synapse. In fact, gradient-based learning rules like e-prop have all the benefits of R-STDP but the mathematics tells us that they should work, at least to some extent. With R-STDP we are kind of hoping that our model of biology is good enough and since it works in the brain it must work on the computer. 

It's certainly an interesting approach, but since I can only focus on one thing, I went back to gradients for now. 
