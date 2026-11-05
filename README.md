# Juan Estavillo — Portfolio

Static single-page portfolio (HTML + Tailwind CSS v4 browser build + vanilla JS/Canvas). No build step.

## Structure

```
index.html
favicon.svg
assets/css/styles.css     # design tokens, components, animations
assets/js/lightning.js    # canvas lightning background
assets/js/main.js         # scroll spy, reveal, spotlight cards
assets/js/i18n.js         # English text and the ES/EN switch
assets/cv/                # Juan-Estavillo-CV-ES.pdf and Juan-Estavillo-CV-EN.pdf
.nojekyll
```

All asset paths are relative, so the site works from `https://juanestavillo.github.io/` or from a subpath such as `https://juanestavillo.github.io/portfolio/`.

## Local preview

```bash
npx serve .
```

## Deploy to GitHub Pages

2. Create a repo — `juanestavillo.github.io` (served at the root) or `portfolio` (served at `/portfolio/`).
3. Push these files to the `main` branch.
4. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.

## Notes

- Tailwind runs via `@tailwindcss/browser` (compiled in the browser). For maximum performance you can later precompile with `npx @tailwindcss/cli`.
- Spanish lives in `index.html`. New text needs a `data-i18n` key and its English entry in `assets/js/i18n.js`. Use `?lang=en` or `?lang=es` to link a language.
- Animations respect `prefers-reduced-motion`.
