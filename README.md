
# What is this

![pages-build-deployment](https://github.com/academicpages/academicpages.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)

It's a fork of Academic Pages, which is a Github Pages template for academic websites. You can fork it yourself! You can even fork my version, but aware that I changed some things.

Here are my changes:
- different header style
- name and short-bio are hidden on publications/cv page when user is on mobile
- added birthdate variable in _config.yml and automatically calculated age on about.md
- added icons for all the skills

Since this thing doesn't seem to run on Windows I run it in WSL. Good luck setting that up if you never heard of it before.

## Local execution (Linux)

Bare necessities on Debian/Ubuntu:

```bash
sudo apt update
sudo apt install -y ruby-full build-essential
sudo gem install bundler
```

Then install dependencies locally in the project and run the dev server:

```bash
cd /home/affe/jonascholz.github.io
bundle config set --local path 'vendor/bundle'
bundle install
bundle exec jekyll serve -H localhost
```

Open http://localhost:4000 in your browser. Jekyll will rebuild automatically when files change.

You can still check the upstream setup notes at https://github.com/academicpages/academicpages.github.io.