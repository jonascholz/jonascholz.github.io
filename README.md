
# What is this

![pages-build-deployment](https://github.com/academicpages/academicpages.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)

It's a fork of Academic Pages, which is a Github Pages template for academic websites. You can fork it yourself! You can even fork my version, but aware that I changed some things.

Here are my changes:
- different header style
- name and short-bio are hidden on publications/cv page when user is on mobile
- added birthdate variable in _config.yml and automatically calculated age on about.md
- added icons for all the skills

Since this thing doesn't seem to run on Windows I run it in WSL. Good luck setting that up if you never heard of it before.

## Local execution

Make sure to follow the instructions from https://github.com/academicpages/academicpages.github.io to set up all the dependencies.

Once everything is installed, run `jekyll serve -l -H localhost` to generate the HTML and serve it from `localhost:4000` the local server will automatically rebuild and refresh the pages on change. Or maybe use `bundle exec jekyll serve -l -H localhost` if that doesn't work.