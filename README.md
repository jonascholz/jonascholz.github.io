# jonascholz.github.io

Personal site and research blog of Jona Scholz, built with [Astro](https://astro.build) and deployed to GitHub Pages.

- Posts and projects are MDX files in `src/content/`, with equations rendered at build time by MathJax.
- Figures are TypeScript modules in `src/diagrams/` that render to static SVG; interactive ones re-render when their controls change.
- The 3D demo runs [MuJoCo](https://github.com/google-deepmind/mujoco/tree/main/wasm) (WebAssembly) with three.js / React Three Fiber.

## Local development

Requires Node.js 22.22 or newer (works on Linux, macOS and Windows; no Ruby needed).

```bash
npm install
npm run dev      # http://localhost:4321, drafts included
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run check    # type check
```

## Deployment

Every push to `master` runs `.github/workflows/deploy.yml`, which type checks, builds and publishes `dist/` to GitHub Pages. In the repository settings, **Settings → Pages → Build and deployment → Source** must be set to **GitHub Actions**.

See `CLAUDE.md` for writing conventions (math, colors, citations, diagrams).
