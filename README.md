# Juan Estavillo — Portfolio

Static single-page portfolio (HTML + Tailwind CSS v4 browser build + vanilla JS/Canvas). No build step.

## Structure

```
index.html
favicon.svg
assets/css/styles.css     # design tokens, components, animations
assets/js/lightning.js    # canvas lightning background
assets/js/main.js         # scroll spy, reveal, spotlight cards
assets/cv/                # put Juan-Estavillo-CV.pdf here
.nojekyll
```

All asset paths are relative, so the site works from `https://juanestavillo.github.io/` or from a subpath such as `https://juanestavillo.github.io/portfolio/`.

## Local preview

```bash
npx serve .
```

## Deploy to GitHub Pages

1. Optional: add your CV at `assets/cv/Juan-Estavillo-CV.pdf` and restore the commented download link in `index.html`.
2. Create a repo — `juanestavillo.github.io` (served at the root) or `portfolio` (served at `/portfolio/`).
3. Push these files to the `main` branch.
4. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.

## Notes

- Tailwind runs via `@tailwindcss/browser` (compiled in the browser). For maximum performance you can later precompile with `npx @tailwindcss/cli`.
- Animations respect `prefers-reduced-motion`.
