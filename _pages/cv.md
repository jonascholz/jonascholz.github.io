---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

Recently my work has been in the field of Neuromorphic Computing or at the Chair of Data Science in Hagen. The latter involved data processing and a variety of ML tasks. Prior to this I was a Software Developer, working in typical SCRUM teams or whatever the project required. I manage my code in Git and try to find scalable solutions whenever possible.

Education
======
* M.Sc. in Practical Computer Science, University of Hagen, (ongoing)
* B.Sc. in Applied Computer Science, Ruhr University Bochum, 2019

Work experience
======
* Research Assistant - FZI (Research Center), 2024 - today
  *  Research on Spiking Neural Networks, implementation of learning
    algorithms and presentations of findings (see Portfolio, which is coming soon)

* Researcher - University of Hagen, 2023 - today
  * Developed a component for unsupervised ML, worked on the EU project
    KnowlEdge and supported the Chair of Data Science (see Portfolio, which is coming soon)

* Software Developer - Adesso SE, 2020 - 2022
  * Created Fullstack solutions for 3+ large German companies
  * Upheld best practices (Clean Code, CI/CD, Design Patterns and more)

Skills
======
<style>
.skills {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: 20px;
  margin: 20px 0;
}

.skill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;

  *{
      box-shadow: none !important; /* icons grow when hovered but for some reason they receive a shadow. this fixes that  */
   }
}

.skill-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.skill-item a {
  display: inline-block;
  transition: transform 0.3s ease;
}

.skill-item a:hover {
  transform: scale(1.15);
}

.skill-item img {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
}

.skill-text p {
  margin: 0;
}
</style>

<div class="skills">
  <b>AI</b>
  <div class="skill-row">
    <div class="skill-item">
      <a href="https://www.python.org" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/python.png" alt="Python">
      </a>
      <div class="skill-text">
        <p>Python</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://lava-nc.org" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/lava.png" alt="Lava">
      </a>
      <div class="skill-text">
        <p>Lava</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://www.nest-simulator.org" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/nest.png" alt="Nest">
      </a>
      <div class="skill-text">
        <p>Nest</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://www.tensorflow.org" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/tensorflow.png" alt="TensorFlow">
      </a>
      <div class="skill-text">
        <p>TensorFlow</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://scikit-learn.org" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/sklearn.png" alt="Scikit-learn">
      </a>
      <div class="skill-text">
        <p>Scikit-learn</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://pandas.pydata.org" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/pandas.png" alt="Pandas">
      </a>
      <div class="skill-text">
        <p>Pandas</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://www.postgresql.org" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/sql.png" alt="SQL">
      </a>
      <div class="skill-text">
        <p>SQL</p>
      </div>
    </div>
  </div>

  <b>Fullstack Development</b>
  <div class="skill-row">
    <div class="skill-item">
      <a href="https://angular.io" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/angular.png" alt="Angular">
      </a>
      <div class="skill-text">
        <p>Angular</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/javascript.png" alt="JavaScript">
      </a>
      <div class="skill-text">
        <p>JavaScript</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://nodejs.org" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/node.png" alt="NodeJS">
      </a>
      <div class="skill-text">
        <p>NodeJS</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://reactjs.org" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/react.png" alt="React">
      </a>
      <div class="skill-text">
        <p>React</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://git-scm.com" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/git.png" alt="Git">
      </a>
      <div class="skill-text">
        <p>Git</p>
      </div>
    </div>
    <div class="skill-item">
      <a href="https://www.typescriptlang.org" target="_blank">
        <img src="{{ site.baseurl }}/assets/img/skills/typescript.png" alt="TypesScript">
      </a>
      <div class="skill-text">
        <p>TypesScript</p>
      </div>
    </div>
  </div>
</div>




Publications
======
<ul>{% for post in site.publications reversed %}
  {% include archive-single-cv.html %}
{% endfor %}</ul>

<!-- Talks
======
  <ul>{% for post in site.talks reversed %}
    {% include archive-single-talk-cv.html  %}
  {% endfor %}</ul> -->
  
<!-- Teaching
======
  <ul>{% for post in site.teaching reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul> -->
  
<!-- Service and leadership
======
* Currently signed in to 43 different slack teams -->
