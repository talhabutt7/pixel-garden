# Pixel Garden 🌱
A fully automated generative art gallery deployed on GitHub Pages.

## How it works
- Every other day, a scheduled GitHub Action runs.
- It generates **5–15 SVG tiles** and updates `manifest.json`.
- The workflow commits **each tile as its own commit**, triggering GitHub Pages to rebuild.
- No manual updates required after initial setup.

## Quick start
1. Create a new repo and push these files.
2. In the repo settings, enable **Pages** to build from the `main` branch (root).
3. Ensure **Actions** has permission to write to the repository (Settings → Actions → General → Workflow permissions → _Read and write permissions_).
4. The schedule runs every other day. You can trigger it immediately via **Actions → Run workflow**.

---

### Local test (optional)
Requires Node 18+.
```bash
node scripts/generate.mjs
```

This will create a few SVGs under `art/YYYY-MM-DD/` and update `manifest.json`.
