This repository is an Adobe AEM/Helix front-end starter (aem-boilerplate). The guidance below helps AI coding agents be productive quickly with edits, features, and fixes.

Short contract
- Inputs: small code changes or new blocks under `blocks/`; CSS under `blocks/**` or `styles/`; helper APIs in `scripts/`.
- Outputs: minimal, non-breaking edits, follow project naming (block.js exports default async function decorate(block)).
- Error modes: preserve build (npm run lint) and avoid changing backend/AEM configuration.

What matters in this codebase (big picture)
- Single-page front-end powered by AEM fragments and block-level decorators. Blocks live in `blocks/<block-name>/` and usually export `default async function decorate(block)`.
- Shared helper functions live in `scripts/` (notably `scripts/aem.js` and `scripts/scripts.js`). Use `loadFragment`, `getMetadata`, `createOptimizedPicture`, and `readBlockConfig` when appropriate.
- CSS is scoped per-block (e.g. `blocks/header/header.css`) and follows namespaced BEM-like classes (e.g. `.nav-sections`, `.identity-block__card`). Keep selectors scoped to prevent collisions.

Developer workflows & important commands
- Install dependencies: `npm i` (see `README.md`).
- Linting is enforced in CI: `npm run lint` (runs `eslint` and `stylelint`). Prefer small, well-scoped changes that pass lint.
- Local AEM preview: this repo expects AEM Proxy (`aem up`) and AEM CLI in normal development; do not modify that behavior in PRs.

Conventions & patterns to follow exactly
- Blocks:
  - Directory: `blocks/<name>/`
  - JS entry: `<block>.js` should export `default async function decorate(block)` and use helper functions from `scripts/`.
  - CSS entry: `<block>.css` should scope rules under a single prefix or block root (see `blocks/credit-step/credit-step.css` and `blocks/header/header.css`).
  - Fragment usage: use `loadFragment(path)` which fetches `${path}.plain.html` and runs `decorateMain` and `loadSections` on it.
- Scripts:
  - `scripts/aem.js` contains key utilities (RUM, createOptimizedPicture, loadCSS/loadScript, getMetadata, readBlockConfig). Reuse these rather than reimplementing.
- Accessibility & ARIA:
  - Many blocks manage ARIA attributes (e.g. nav `aria-expanded`). Keep keyboard and focus behavior when refactoring.

Integration points & external dependencies
- AEM / Helix: fragments are fetched from paths like `/nav.plain.html`; do not hardcode absolute environments. Use `getMetadata('nav')` when available.
- CI: GitHub Actions runs `npm ci` and `npm run lint` on push. Make sure linting changes are minimal and style-compliant.

Examples to reference when editing
- Header: `blocks/header/header.js` + `blocks/header/header.css` — shows fragment loading, ARIA handling, and CSS grid/flex patterns.
- Fragment loader: `blocks/fragment/fragment.js` and `scripts/aem.js` — use `loadFragment`, `decorateMain`, and `loadSections` when composing dynamic content.
- Block CSS scoping: `blocks/credit-step/credit-step.css` uses `.identity-block` prefix; follow this scoping approach for new blocks.

Edits you can safely make
- Small feature additions inside a block (JS/CSS) that preserve public APIs and pass lints.
- Add new blocks following the file layout and `decorate(block)` pattern.

Avoid
- Changing AEM server configuration, CI workflow logic, or anything outside `blocks/`, `scripts/`, or `styles/` without explicit human approval.

If unsure, leave a short PR note referencing the files you touched and an explanation for human reviewers.

Questions for reviewer
- Should we add example unit tests or a local dev task to run a headless verification? If yes, specify preferred test framework (Jest, Playwright).
