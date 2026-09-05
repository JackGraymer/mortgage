---
title: Affordability Calculator
description: Swiss stress-test calculator — how much can you borrow (and what can you afford) based on your household income, under the bank's 5% stress rate and the 33% income rule.
---

# Affordability Calculator

The **stress test** is what actually decides how much you can borrow — not the rate you end up paying. Banks assess your housing costs at a conservative **5% interest rate** on the *entire* mortgage, and require total housing costs to stay at or below **33% of gross household income**. Use this calculator to find the maximum property you can afford and to check whether a target price passes the test. Everything runs locally in your browser.

<details class="note">
  <summary>How to use</summary>
  Enter your gross household income, the property price and mortgage you are considering, and your estimated heating/ancillary costs. The calculator applies the 5% stress rate, adds 1% maintenance and the 2nd-mortgage amortization, and tells you whether you pass the 33% test — plus the maximum price your income supports at an 80% loan-to-value.
</details>

<div class="calc-widget" x-data="affordabilityCalc()">
  <h3>Inputs</h3>
  <div class="calc-grid">
    <div class="calc-field">
      <label>Gross household income (CHF/yr)</label>
      <input type="number" x-model.number="income" min="0" step="5000" @input="recalc()">
    </div>
    <div class="calc-field">
      <label>Property price (CHF)</label>
      <input type="number" x-model.number="propertyValue" min="0" step="10000" @input="recalc()">
    </div>
    <div class="calc-field">
      <label>Mortgage (CHF)</label>
      <input type="number" x-model.number="mortgage" min="0" step="10000" @input="recalc()">
    </div>
    <div class="calc-field">
      <label>Amortization term (years)</label>
      <input type="number" x-model.number="years" min="1" max="40" step="1" @input="recalc()">
    </div>
    <div class="calc-field">
      <label>Heating / ancillary costs (CHF/yr)</label>
      <input type="number" x-model.number="ancillary" min="0" step="500" @input="recalc()">
    </div>
  </div>
  <p class="calc-note">
    The stress test always uses <b>5%</b> on the full mortgage and adds <b>1%</b> maintenance and
    <b>2nd-mortgage amortization</b>. The income cap is fixed at <b>33%</b> of gross income.
  </p>

  <div class="calc-results" x-show="result" x-cloak>
    <div class="calc-note">
      Your loan-to-value is <b x-text="fmtPct(ltv)"></b>. The
      <b>maximum property price</b> your income supports (at 80% LTV) is
      <b x-text="fmt(maxAffordable.propertyValue)"></b> → mortgage up to
      <b x-text="fmt(maxAffordable.mortgage)"></b>.
    </div>

    <div class="calc-stats">
      <div class="calc-stat">
        <div class="calc-stat-label">Stress interest (5%)</div>
        <div class="calc-stat-value" x-text="fmt(result.annual.interest)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Amortization / yr</div>
        <div class="calc-stat-value" x-text="fmt(result.annual.amortization)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Maintenance (1%)</div>
        <div class="calc-stat-value" x-text="fmt(result.annual.maintenance)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Ancillary</div>
        <div class="calc-stat-value" x-text="fmt(result.annual.ancillary)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Total housing cost / yr</div>
        <div class="calc-stat-value" x-text="fmt(result.annual.total)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Income used (33% cap)</div>
        <div class="calc-stat-value" x-text="fmtPct(result.ratio)"></div>
      </div>
    </div>

    <div class="calc-warning" x-show="!result.affordable" x-cloak>
      <b>Not affordable.</b> Housing costs of <span x-text="fmt(result.annual.total)"></span>/yr need
      at least <span x-text="fmt(result.requiredIncome)"></span>/yr income at the 33% cap. Your
      current income of <span x-text="fmt(income)"></span>/yr uses
      <span x-text="fmtPct(result.ratio)"></span> — above 33%.
    </div>
    <div class="calc-note" x-show="result.affordable" x-cloak>
      <b>Passes the stress test.</b> Housing costs use <span x-text="fmtPct(result.ratio)"></span>
      of income (≤ 33%). Rule of thumb: your target price is about
      <span x-text="fmt(propertyValue / (income || 1))"></span> per unit of income.
    </div>
  </div>
</div>

## How the affordability test works

The bank decides how much you can borrow using **four** components of annual housing cost, tested at the **5% stress rate**:

1.  **Interest** = 5% × the *total* mortgage (e.g. a CHF 800,000 mortgage costs CHF 40,000/yr at the stress rate — regardless of your real 2% rate).
2.  **Amortization** — the 2nd mortgage (the portion above 65% LTV) paid down linearly over the term. At 80% LTV and 15 years, that is 15% of the price ÷ 15 = **1%** of the price per year.
3.  **Maintenance** — typically **1%** of the property value per year.
4.  **Ancillary costs** — heating, water, insurance, etc. (typically CHF 3,000–5,000/yr).

These **must stay at or below 33% of gross household income**. Solving the equation for the property price gives the maximum you can afford.

## Worked example

| Input | Value |
| ----- | ----- |
| Gross household income | CHF 120,000 |
| Target property | CHF 1,000,000 |
| Mortgage (80% LTV) | CHF 800,000 |
| Amortization | 15 years |
| Ancillary costs | CHF 4,000 |

At the 5% stress rate:

| Cost item | Annual amount |
| --------- | ------------- |
| Interest (5% × CHF 800k) | CHF 40,000 |
| Amortization (CHF 150k / 15 yr) | CHF 10,000 |
| Maintenance (1% × CHF 1M) | CHF 10,000 |
| Ancillary | CHF 4,000 |
| **Total** | **CHF 64,000** |

Required income at 33%: **CHF 194,000/yr**. With CHF 120,000 income the cost uses **53%** — not affordable. The maximum price for CHF 120,000 income at 80% LTV (with CHF 4,000 ancillary) is about **CHF 593,000**.

!!! tip "Rule of thumb"
    Most buyers can afford roughly **5–6× gross annual income** (less if ancillary costs are high or equity is low). The stress test is the real constraint — a low actual rate (e.g. 2%) does not increase what the bank will lend you.

!!! warning
    Figures are approximate planning estimates, not a bank offer. Actual caps vary by lender, canton and your complete financial profile (other debts, dependants, pension funds). Always get a written pre-approval.

## Related

- [Amortization Calculator](calculator.md) — model interest, principal and the monthly cost at your real rate.
- [Financing guide](index.md) — the two-pillar mortgage structure and equity rules.
