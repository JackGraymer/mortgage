# Buying a House in Switzerland — website

A self-contained static website documenting how to buy a house in Switzerland
(legal rules, mortgages, taxation, costs, energy/renovation) with two built-in calculators.

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
├─ overview.md              # market overview, rates, regions, energy rules
├─ legal/index.md           # who can buy, Lex Koller, second homes, zoning, GEAK
├─ financing/index.md       # two-pillar mortgages, equity, affordability, Pillar 2/3a
├─ financing/calculator.md  # amortization calculator (Alpine + Chart.js)
├─ banking.md               # lenders, renewals, brokers, Schuldbrief
├─ taxation/index.md        # imputed rental value, deductions, wealth, transfer, gains, inheritance tax
├─ taxation/calculator.md   # tax estimator (Alpine) with 2025/2026 rates
├─ process.md               # purchase steps + timeline + costs per stage
├─ costs.md                 # closing costs (canton detail) + ongoing annual costs
├─ checklist.md             # comprehensive quick-reference checklist
├─ sources.md               # official references (gov, banking, tax, legal, hazards)
├─ javascripts/             # widget code + tax data (amortization-core, tax-data, amortization, tax)
└─ stylesheets/extra.css    # widget styling
```

## Disclaimer

General information only — not legal, tax or financial advice.
