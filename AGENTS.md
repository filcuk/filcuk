# AGENTS.md

## Purpose

GitHub profile repository (`filcuk/filcuk`). The profile `README.md` is partly generated from the shared links catalog.

## README links

- Markers: `<!-- links:start -->` … `<!-- links:end -->` in `README.md`
- Generator: `scripts/generate-readme-links.mjs` (Node builtins only)
- Workflow: `.github/workflows/update-readme-links.yml` (`workflow_dispatch`, weekly schedule, or push to the script/workflow)
- Stats images below the markers are hand-maintained; do not regenerate them here

### Data URL

`LINKS_JSON_URL` at the top of `scripts/generate-readme-links.mjs` is temporarily pinned to a shared commit SHA.

After `filcuk/shared` merges the catalog to `main`, change it to:

```text
https://raw.githubusercontent.com/filcuk/shared/main/dir/links.json
```

Then run the workflow (or `node scripts/generate-readme-links.mjs` locally).

### Local regenerate

```bash
node scripts/generate-readme-links.mjs
```
