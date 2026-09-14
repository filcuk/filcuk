# AGENTS.md

## Purpose

GitHub profile repository (`filcuk/filcuk`). The profile `README.md` is partly generated from the shared links catalog.

## README links

- Markers: `<!-- links:start -->` … `<!-- links:end -->` in `README.md`
- Generator: `scripts/generate-readme-links.mjs` (Node builtins only)
- Source: `LINKS_JSON_URL` → `https://raw.githubusercontent.com/filcuk/shared/main/dir/links.json`
- Workflow: `.github/workflows/update-readme-links.yml` (`workflow_dispatch`, weekly schedule, or push to the script/workflow)
- Stats images below the markers are hand-maintained; do not regenerate them here
- Language icons use Simple Icons slugs from each item's `languages` array (`cdn.simpleicons.org`)

### Local regenerate

```bash
node scripts/generate-readme-links.mjs
```
