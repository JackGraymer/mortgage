---
title: Tax Estimator
description: Estimate your combined federal + cantonal + communal income tax and wealth tax for a home in Zurich or Aargau.
---

# Tax Estimator

Estimate the annual income and wealth tax you would pay when owning a home in **Zurich** or **Aargau**. The estimator models the **imputed rental value**, the standard deductions (mortgage interest, maintenance, Pillar 3a) and simplified effective tax rates. Everything runs locally in your browser.

!!! warning "Estimate only"
    This tool uses simplified effective-rate curves (federal + cantonal + communal combined) and a **3.5% imputed rental value** approximation. Real tax bills depend on your exact municipality (Gemeinde), official tariff tables, family situation, and all applicable deductions. Use for budgeting only — not for filing.

<div class="calc-widget" x-data="taxCalculator()">
  <h3>Inputs</h3>
  <div class="calc-grid">
    <div class="calc-field">
      <label>Canton</label>
      <select x-model="canton" @change="calculate()">
        <option value="ZH">Zurich</option>
        <option value="AG">Aargau</option>
      </select>
    </div>
    <div class="calc-field">
      <label>Marital status</label>
      <select x-model="status" @change="calculate()">
        <option value="single">Single</option>
        <option value="married">Married</option>
      </select>
    </div>
    <div class="calc-field">
      <label>Gross income (CHF/yr)</label>
      <input type="number" x-model.number="income" min="0" step="1000" @input="calculate()">
    </div>
    <div class="calc-field">
      <label>Property value (CHF)</label>
      <input type="number" x-model.number="propertyValue" min="0" step="10000" @input="calculate()">
    </div>
    <div class="calc-field">
      <label>Mortgage debt (CHF)</label>
      <input type="number" x-model.number="mortgageDebt" min="0" step="10000" @input="calculate()">
    </div>
    <div class="calc-field">
      <label>Mortgage interest rate (% p.a.)</label>
      <input type="number" x-model.number="mortgageRate" min="0" step="0.05" @input="calculate()">
    </div>
    <div class="calc-field">
      <label>Imputed rental value (CHF/yr)</label>
      <input type="number" x-model.number="imputed" min="0" step="500" placeholder="auto (~3.5% of value)" @input="calculate()">
      <div class="calc-range-value">Leave empty to auto-estimate at <span x-text="fmt(autoImputed)"></span></div>
    </div>
    <div class="calc-field">
      <label>Pillar 3a contribution (CHF)</label>
      <input type="number" x-model.number="pillar3a" min="0" step="500" @input="calculate()">
    </div>
    <div class="calc-field">
      <label>Other deductions (CHF)</label>
      <input type="number" x-model.number="otherDeductions" min="0" step="500" @input="calculate()">
    </div>
  </div>

  <div class="calc-results" x-show="result" x-cloak>
    <div class="calc-stats">
      <div class="calc-stat">
        <div class="calc-stat-label">Taxable income</div>
        <div class="calc-stat-value" x-text="fmt(result.income)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Income tax / yr</div>
        <div class="calc-stat-value" x-text="fmt(result.incomeTax)"></div>
        <div class="calc-note" x-text="'effective ' + fmtPct(result.incomeRate)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Net wealth</div>
        <div class="calc-stat-value" x-text="fmt(result.wealth)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Wealth tax / yr</div>
        <div class="calc-stat-value" x-text="fmt(result.wealthTax)"></div>
        <div class="calc-note" x-text="'effective ' + fmtPct(result.wealthRate)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Total tax / yr</div>
        <div class="calc-stat-value" x-text="fmt(result.total)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Per month</div>
        <div class="calc-stat-value" x-text="fmt(result.monthly)"></div>
      </div>
    </div>

    <p class="calc-note">
      Taxable income = gross income + imputed rental value − mortgage interest − maintenance (1% of value)
      − Pillar 3a − other deductions. Net wealth = property tax value (est. 80% ZH / 85% AG of market) − mortgage debt.
    </p>
  </div>
</div>

<script src="../javascripts/tax-data.js"></script>
<script src="../javascripts/tax.js"></script>

## How the estimate is computed

1.  **Imputed rental value** is added to your income. Default: **3.5% of the property value** (a common approximation; the municipality sets the official figure, typically 2.5–3.5% of market value).
2.  **Deductions** are subtracted: mortgage interest (debt × rate), maintenance (1% of value or lump-sum % of imputed value), Pillar 3a, and any other deductions.
3.  **Income tax** = taxable income × an effective rate read from a simplified curve per canton (federal + cantonal + communal combined). For married couples, a double-tariff approximation is applied (taxed as if half the income).
4.  **Wealth tax** = net wealth (property tax value − debt) × an effective wealth-tax curve per canton.
    - Property **tax value** (Steuerwert) is used, not market value: typically **70–85% of market value in ZH**, **75–90% in AG**.

The effective-rate data lives in `tax-data.js` — if you later obtain the official tariff tables, you can replace the curves without touching the page.

## Worked example — Zurich, CHF 1M property

| Input | Value |
| ----- | ----- |
| Canton | Zurich |
| Status | Single |
| Gross income | CHF 120,000 |
| Property value | CHF 1,000,000 |
| Mortgage debt | CHF 650,000 |
| Rate | 2% |
| Pillar 3a | CHF 7,256 |

**Rough result:**

- Imputed rental value: CHF 35,000 (auto, 3.5%) → taxable income ≈ CHF 120,000 + 35,000 − 13,000 (interest) − 10,000 (maintenance 1%) − 7,256 (3a) ≈ **CHF 124,744**
- Property tax value (est. 80%): CHF 800,000 → net wealth = CHF 800,000 − 650,000 = **CHF 150,000**
- Effective income-tax rate ≈ **~12.5%** → income tax ≈ **CHF 15,600**
- Wealth tax rate on CHF 150k ≈ **~0.2%** → wealth tax ≈ **CHF 300**
- **Total estimated tax ≈ CHF 15,900/yr (~CHF 1,325/month)**

!!! note "Reality check"
    Exact figures depend on the official tariff table, your municipal multiplier (Gemeindesteuerfuss), and deductions such as pension contributions, insurance premiums, and commuting costs. Use the estimate as a budgeting guide, not as a tax filing.

## Sources

-   [Zurich — Cantonal Tax Office](https://www.zh.ch/en/steuern-finanzen.html)
-   [Aargau — Cantonal Tax Office](https://www.ag.ch/en/verwaltung/finance-department/cantonal-tax-administration-1)
