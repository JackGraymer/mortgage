# Buying a House in Switzerland — website

A self-contained static website documenting how to buy a house in Switzerland
(legal rules, mortgages, taxation, costs) with two built-in calculators.

Built with [Zensical](https://zensical.org) (a static site generator by the
Material for MkDocs team). Content lives in `docs/`, widgets are client-side
Alpine.js + Chart.js. No server, no database, no external calculation links.

## Quick start

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
zensical serve          # preview at http://localhost:8000
```

## Build

```powershell
zensical build          # static site written to site/
```

## Deploy (Cloudflare Pages)

The site is static; deploy the `site/` directory to Cloudflare Pages:

```powershell
npx wrangler login                 # one-time
npx wrangler pages project create buying-house-ch
npx wrangler pages deploy site --project-name=buying-house-ch
```

After the first deploy, set `site_url` in `zensical.toml` to the real
`*.pages.dev` URL and rebuild.

## Tests

The mortgage math is shared between the browser widget and Node:

```powershell
node tests/test_amortization.mjs
```

## Structure

```
docs/
├─ index.md                 # home
├─ overview.md              # market overview
├─ legal/index.md           # who can buy, Lex Koller, zoning
├─ financing/index.md       # two-pillar mortgages, equity, affordability
├─ financing/calculator.md  # amortization calculator (Alpine + Chart.js)
├─ banking.md               # lenders, renewals, brokers
├─ taxation/index.md        # imputed rental value, deductions, taxes
├─ taxation/calculator.md   # tax estimator (Alpine)
├─ process.md               # purchase steps + timeline
├─ costs.md                 # closing costs
├─ checklist.md             # quick-reference checklist
├─ sources.md               # official references
├─ javascripts/             # widget code + tax data
└─ stylesheets/extra.css    # widget styling
```

## Disclaimer

General information only — not legal, tax or financial advice.
