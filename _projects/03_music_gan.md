---
title: "Music GAN"
excerpt: "Here I attempted to train GANs for music generation. Deep Learning enables cool things and generating content is one of them. I read some papers, implemented some things and reasoned about potential solutions. [Learn more](/projects/02_knowledge/)<br/><img src='/images/projects/wave_composition.jpg'>"
collection: projects
tags: 
    - GAN
    - Deep Learning
    - Generative Model
---

I was trying to generate music with GANs. This was a bit of an undertaking and I didn't really understand GANs so I read up on [DCGAN](https://www.tensorflow.org/tutorials/generative/dcgan), [Progressive GAN](https://arxiv.org/abs/1710.10196) and the [Wasserstein GAN](https://arxiv.org/abs/1701.07875). I implemented them and felt pretty good about myself.

Then I tried to generate some pixel characters and that worked for the most part. A snippet of training progress is seen in Figure 1. I'm writing this a few years after the fact so that's the best gif I was able to dig up. 

![Pixel Characters](/images/projects/fortschritt.gif)

*__Figure 1__. Initial transformation from noise to blobs* 

There were problem with convergence at times. Then there was state collapse, where by coincidence the generator would get really good at generating dudes with red hair. Its counterpart, the discriminator reinforced this behavior and eventually every image was red haired dudes. 

So that was great and I moved on to music generation. Now music generation is a different animal, because the data was way larger than little pixel images. It proved infeasible with the resources I had and instead I opted to generate compressed representations of sounds. There are music creation tools that let you represent notes of instruments in a simple way, but that seemed limiting. I instead wanted to learn embeddings for different types of sounds and the embeddings could be anything. In this way, the network is not limited by predefined instruments and notes.

When you think about it, sounds are all waves. Vibrations of air molecules. The wave below in Figure 2 looks quite complicated, and it's merely one fifth of a second of a guitar note. 

![Complicated Wave](/images/projects/complicated_wave.png)

*__Figure 2__. Clip of a guitar note that lasts one fith of a second. Source: https://freesound.org/people/mickmon/sounds/176837/*

Don't let the complexity of a wave fool you. We can overlap simpler waves to create more complicated ones. Figure 3 highlights this process.
![Wave overlap](/images/projects/wave_composition.jpg)

*__Figure 3__. Overlapping simple waves creates more complicated ones*

Okay so we can create complex waves by overlapping simple waves. Simple waves can be described by just a couple of variables like magnitude and frequency. As a result an encoder could learn a bunch of frequencies and magnitudes as well as how to overlap them. Then a decoder can use this information to produce the sound waves. Great!

So I began training an autoencoder to do just that. Later my GAN would learn to generate encodings, which I could then decode into complete songs. I got to work and the training was very slow. I had already been on this whole thing for a while and other things became more important, so unfortunately I chose to end it there. Maybe I will return someday with more knowledge and a stronger GPU.