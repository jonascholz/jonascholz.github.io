---
title: 'E-prop Meta Learning (WIP)'
date: 2025-06-28
permalink: /posts/2025/06/e-prop/
tags:
  - JAX
  - SNN
  - Tutorial
  - e-prop
---

gradient descent can be unstable when we have many parameters (TODO proof with some examples). local losses split one unruly loss landscape into two tame landscapes. but how do we get these local loss functions? we can just train them.

so starting with eprop on a rsnn, we define multiple heads, each with its own loss. the loss effectively calculates the learning signal and is trained over time

## The general idea
WIP
