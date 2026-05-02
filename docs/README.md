# Timelish documentation (Docusaurus)

Product documentation site for Timelish, built with [Docusaurus](https://docusaurus.io/).

## Scripts

From the repo root:

```bash
yarn workspace @timelish/docs start
yarn workspace @timelish/docs build
yarn workspace @timelish/docs serve
```

From this directory:

```bash
yarn start
yarn build
```

The dev server defaults to port `3000` unless busy.

## Content

- Docs live under `docs/`.
- Static assets (including screenshot placeholders): `static/`.
- Homepage: `src/pages/index.tsx`.

## Screenshots

Add images under `static/img/placeholders/` (see `static/img/placeholders/README.md`) and reference them from Markdown where noted.
