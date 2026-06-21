# StellaSecret.github.io

Landing page and privacy policies for [StellaSecret](https://stellasecret.github.io) apps, hosted on GitHub Pages.

## Structure

```
StellaSecret.github.io/
├── public/                          # Everything deployed to GitHub Pages
│   ├── index.html                   # Landing page → stellasecret.github.io/
│   ├── .nojekyll
│   ├── .well-known/
│   │   └── assetlinks.json
│   └── privacy-pages/               # Privacy policies → stellasecret.github.io/privacy-pages/
│       ├── index.html               # Privacy index (FR/EN toggle)
│       ├── privacy.css              # Shared stylesheet
│       ├── asthmetrack/
│       │   ├── privacy.html         # French policy
│       │   └── privacy-en.html      # English policy
│       ├── cvgenerator/
│       ├── gametracker/
│       ├── peoplemodeler/
│       ├── smartshoppingcalculator/
│       ├── strategicjournal/
│       └── tripmind/
└── tests/
    └── privacy.spec.js              # Playwright E2E tests (privacy pages)
```

Apps covered: `asthmetrack`, `cvgenerator`, `gametracker`, `peoplemodeler`, `smartshoppingcalculator`, `strategicjournal`, `tripmind`.

---

## Local development

No build step — pure static HTML. Serve the `public/` directory:

```bash
npm install
npm run serve        # http://localhost:8080
```

---

## E2E tests

Tests use [Playwright](https://playwright.dev) and run against `public/` served locally.

```bash
# First-time setup
npm install
npx playwright install --with-deps chromium firefox

# Run tests (headless)
npm test

# Run tests with browser UI
npm run test:headed
```

The test suite covers:
- Dark background on every privacy page (detects missing CSS)
- FR/EN language toggle on the privacy index
- Per-app pages: h1, back link, lang switcher, highlight box, section headings, `noopener` on all external links

---

## Pre-commit hooks

The `.pre-commit-config.yaml` file defines the hooks, but they don't run until you install them into your local git repo. This is a one-time setup per clone:

```bash
pip install pre-commit detect-secrets
pre-commit install
```

> If `pre-commit` is not found after install, your pip bin directory may not be on your PATH.
> Add this to your `~/.zshrc` or `~/.bashrc` and restart your terminal:
> ```bash
> export PATH="$HOME/.local/bin:$PATH"
> ```

To verify the hooks are wired up and run them against all files:

```bash
pre-commit run --all-files
```

Hooks that run automatically on every `git commit`:
- Trailing whitespace / end-of-file fixer
- Merge conflict detection
- `target="_blank"` without `noopener` → blocks commit
- Stray dates older than 2025 in policy pages → blocks commit
- Secret detection via `detect-secrets`

---

## CI/CD

Pipeline: **validate → e2e → deploy** (deploy runs on `main` push only).

| Job | What it does |
|---|---|
| `validate` | HTML5 validation, noopener check, shared CSS presence |
| `e2e` | Spins up a local server, runs Playwright on Chromium + Firefox |
| `deploy` | Uploads `public/` to GitHub Pages via `actions/deploy-pages` |

If E2E fails, a Playwright HTML report is uploaded as a CI artifact (retained 7 days).

> **GitHub Pages setup:** in repo Settings → Pages → Source, select **GitHub Actions**.

---

## Adding a new privacy policy

1. Create `public/privacy-pages/<appname>/privacy.html` and `public/privacy-pages/<appname>/privacy-en.html` using an existing app as a template.
2. Override the accent colors in the page's `<style>` block (`--accent` and `--green`).
3. Add the app to the privacy index in `public/privacy-pages/index.html` (card + both entries in the JS `apps` array).
4. Add the app to the `APPS` array in `tests/privacy.spec.js`.
