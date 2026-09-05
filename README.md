# Compa Drinks Co — Landing Page

Single-page interactive hero site for Compa Drinks Co tequila seltzers.
Pure HTML/CSS/JS — no build step, no framework. GSAP (CDN) for the flavour-switch
animation; everything else is vanilla.

## Structure

```
index.html                  the whole site (markup, styles, script)
assets/                     self-hosted images (logo, citrus SVGs, bubble)
_headers                    Cloudflare Pages headers (security + asset caching)
robots.txt                  crawler policy (flip to Disallow pre-launch)
.github/workflows/deploy.yml  optional CI deploy via Wrangler
```

## Local preview

Any static server works. From the repo root (PowerShell):

```powershell
npx serve .
# or
python -m http.server 8000
```

Then open http://localhost:3000 (serve) or http://localhost:8000.
Don't open index.html via file:// — the SVG favicon and _headers behaviour
only make sense over HTTP, and some browsers block local asset requests.

## Push to GitHub

```powershell
git init
git add .
git commit -m "Compa landing page"
git branch -M main
git remote add origin https://github.com/<you>/compa-site.git
git push -u origin main
```

## Deploy to Cloudflare Pages

**Option A — Git integration (recommended, zero config):**
Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git →
pick the repo. Settings:

- Framework preset: **None**
- Build command: *(leave empty)*
- Build output directory: `/`

Every push to `main` auto-deploys; PRs get preview URLs. If you use this,
delete `.github/workflows/deploy.yml` so the two paths don't double-deploy.

**Option B — GitHub Actions (already included):**
Add two repo secrets under Settings → Secrets and variables → Actions:

- `CLOUDFLARE_API_TOKEN` — create at dash.cloudflare.com → My Profile →
  API Tokens, with the **Cloudflare Pages: Edit** permission
- `CLOUDFLARE_ACCOUNT_ID` — shown in the dashboard sidebar

The workflow deploys to a Pages project named `compa-site` on push to `main`.

**Option C — one-off from your machine:**

```powershell
npx wrangler pages deploy . --project-name=compa-site
```

## Content still to confirm

- Can spec line reads `330mL · 4.5% ALC/VOL` — placeholder, set the real values
  in `index.html` (search for `can-abv`)
- Flavour lineup is Paloma (grapefruit) and Margarita (lime) — confirm against
  current SKUs
- Nav links and buttons are `#` stubs
- When real can renders exist, replace the CSS-built can: the hero can markup is
  `#product-can` and the card thumbnails are `.mini-can`

## Pre-launch

`robots.txt` currently allows crawlers. Change `Allow: /` to `Disallow: /`
while this is a staging URL.
