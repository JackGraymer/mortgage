---
title: Amortization Calculator
description: Model a Swiss mortgage — interest-only 1st mortgage plus a linearly amortized 2nd mortgage — and see total interest, principal and monthly costs.
---

# Amortization Calculator

Model your Swiss mortgage. The calculator follows the standard Swiss structure: an interest-only **1st mortgage** (up to 65% of the property value) plus a linearly amortized **2nd mortgage** (the portion between 65% and 80%). Everything runs locally in your browser.

<div class="calc-widget" x-data="amortizationCalc()">
  <h3>Inputs</h3>
  <div class="calc-grid">
    <div class="calc-field">
      <label>Property value (CHF)</label>
      <input type="number" x-model.number="propertyValue" min="0" step="10000" @input="recalc()">
    </div>
    <div class="calc-field">
      <label>Down payment / equity (CHF)</label>
      <input type="number" x-model.number="equity" min="0" step="5000" @input="recalc()">
    </div>
    <div class="calc-field">
      <label>Interest rate (% p.a.)</label>
      <input type="number" x-model.number="rate" min="0" step="0.05" @input="recalc()">
    </div>
    <div class="calc-field">
      <label>Amortization term (years)</label>
      <input type="number" x-model.number="years" min="1" max="40" step="1" @input="recalc()">
    </div>
  </div>

  <div class="calc-grid">
    <div class="calc-field">
      <label>Amortization type</label>
      <select x-model="mode" @change="recalc()">
        <option value="direct">Direct — repay 2nd mortgage</option>
        <option value="indirect">Indirect — invest in Pillar 3a</option>
      </select>
      <div class="calc-range-value">
        Indirect keeps the 2nd mortgage and builds a pledged 3a account instead.
      </div>
    </div>
    <div class="calc-field" x-show="mode === 'indirect'">
      <label>Marginal tax rate (% p.a.)</label>
      <input type="number" x-model.number="marginalRate" min="0" max="50" step="1" @input="recalc()">
    </div>
    <div class="calc-field" x-show="mode === 'indirect'">
      <label>Pillar 3a return (% p.a.)</label>
      <input type="number" x-model.number="returnRate" min="0" max="15" step="0.25" @input="recalc()">
    </div>
    <div class="calc-field" x-show="mode === 'indirect'">
      <label>3a withdrawal tax (%)</label>
      <input type="number" x-model.number="withdrawalTax" min="0" max="30" step="0.5" @input="recalc()">
    </div>
  </div>

  <div class="calc-warning" x-show="ltvWarning" x-cloak>
    Requires more equity — banks cap the loan at 80% loan-to-value (LTV). Add at least
    <span x-text="fmt(Math.round(propertyValue * 0.2 - (propertyValue - mortgage)))"></span>.
  </div>
  <div class="calc-warning" x-show="hardCashWarning && !ltvWarning" x-cloak>
    At least 10% of the purchase price must come from your own liquid funds (hard cash).
  </div>

  <div class="calc-results" x-show="result" x-cloak>
    <div class="calc-note">
      Loan-to-value: <b x-text="fmtPct(ltv)"></b> &nbsp;·&nbsp; 1st mortgage:
      <b x-text="fmt(result.first)"></b> (interest-only) &nbsp;·&nbsp; 2nd mortgage:
      <b x-text="fmt(result.second)"></b> (amortized over <span x-text="years"></span> years)
    </div>

    <div class="calc-stats" x-show="mode === 'direct'">
      <div class="calc-stat">
        <div class="calc-stat-label">Total paid</div>
        <div class="calc-stat-value" x-text="fmt(result.totalPaid)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Total interest</div>
        <div class="calc-stat-value" x-text="fmt(result.totalInterest)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Principal repaid</div>
        <div class="calc-stat-value" x-text="fmt(result.totalPrincipal)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Avg monthly payment</div>
        <div class="calc-stat-value" x-text="fmt(result.monthlyPayment)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Interest after term / yr</div>
        <div class="calc-stat-value" x-text="fmt(result.ongoingAnnualInterest)"></div>
      </div>
    </div>

    <div class="calc-stats" x-show="mode === 'indirect' && p3a" x-cloak>
      <div class="calc-stat">
        <div class="calc-stat-label">3a + tax savings at end</div>
        <div class="calc-stat-value" x-text="fmt(p3a.threeAFV + p3a.taxSavingsFV)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Tax saved (compounded)</div>
        <div class="calc-stat-value" x-text="fmt(p3a.taxSavingsFV)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">3a withdrawal tax</div>
        <div class="calc-stat-value" x-text="fmt(p3a.taxOnWithdrawal)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Leftover after repaying 2nd mortgage</div>
        <div class="calc-stat-value" x-text="fmt(p3a.netPosition)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Net benefit vs. direct</div>
        <div class="calc-stat-value" x-text="fmt(p3a.benefit)"></div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">2nd-mortgage interest: indirect vs. direct</div>
        <div class="calc-stat-value" x-text="fmt(p3a.interestIndirect) + ' / ' + fmt(p3a.interestDirect)"></div>
      </div>
    </div>

    <div class="calc-chart">
      <canvas x-ref="chart"></canvas>
    </div>

    <div class="calc-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Principal</th>
            <th>Interest 1st</th>
            <th>Interest 2nd</th>
            <th>Remaining 1st</th>
            <th>Remaining 2nd</th>
          </tr>
        </thead>
        <tbody>
          <template x-for="row in result.rows" :key="row.year">
            <tr>
              <td x-text="row.year"></td>
              <td x-text="fmt(row.principal)"></td>
              <td x-text="fmt(row.interest1)"></td>
              <td x-text="fmt(row.interest2)"></td>
              <td x-text="fmt(row.remaining1)"></td>
              <td x-text="fmt(row.remaining2)"></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p class="calc-note">
      "Total paid", "Total interest" and "Avg monthly payment" cover only the
      <b>amortization period</b>. The 1st mortgage is interest-only and continues after the term —
      its annual interest is shown under "Interest after term / yr".
    </p>
  </div>
</div>

## How the model works

The calculator implements the standard Swiss financing structure:

1.  **Mortgage** = property value − down payment. If the loan exceeds **80%** of the value, a warning appears: banks require at least 20% equity.
2.  **1st mortgage** = the lower part of the loan, up to 65% of the property value. It is **interest-only** and never amortized.
3.  **2nd mortgage** = the remainder. It is amortized **linearly** (equal principal each year) over the term you choose — typically 15 years.

The chart shows, per year: interest paid (blue), principal repaid (green) and the remaining debt (red line). Note that interest declines each year because the 2nd mortgage shrinks, while the 1st mortgage interest stays constant.

### Direct vs. indirect (Pillar 3a) amortization

Use the **Amortization type** selector to compare the two ways of servicing the 2nd mortgage:

- **Direct** — you repay the 2nd mortgage linearly; debt declines and so does the interest (the default view above).
- **Indirect** — you keep the 2nd mortgage at its full balance and instead pay the same principal amount into a **Pillar 3a account pledged to the bank** each year. You get a **tax deduction** on those contributions (at your marginal rate) and the account **earns a return**. At the end of the term you repay the 2nd mortgage from the 3a account.

Because the 2nd mortgage stays constant, indirect amortization costs **more interest** — but if the 3a return plus the tax deduction outweigh that extra interest, you end up with **more net wealth** (the "Net benefit vs. direct" figure). Key assumptions you can adjust: marginal tax rate, 3a return and the capital-withdrawal tax applied when the 3a is finally used.

!!! warning "Assumptions matter"
    The indirect path only wins if the 3a return exceeds the mortgage rate by enough to cover the extra interest and the withdrawal tax. The 3a contribution is also capped (CHF 7,256/year in 2025 for employees); if your 2nd mortgage is large, the excess must go somewhere else or the comparison changes.

## Worked example — CHF 1,000,000 property

The scenario used in the [Financing guide](index.md):

| Input | Value |
| ----- | ----- |
| Property value | CHF 1,000,000 |
| Down payment | CHF 200,000 |
| Interest rate | 2% p.a. |
| Amortization | 15 years |

**Result (2% p.a.):**

- 1st mortgage: **CHF 650,000** (interest-only, CHF 13,000/yr)
- 2nd mortgage: **CHF 150,000** amortized over 15 years (CHF 10,000/yr)
- Total interest over 15 years: **CHF 219,000**
- Total paid: **CHF 369,000** (principal 150k + interest 219k)
- Average monthly payment: **CHF 2,050**
- Ongoing interest after year 15: **CHF 13,000/yr**

!!! note "Why the stress test matters more"
    The 2% figures above are what you would actually pay. The bank, however, assesses affordability at a **5% stress rate** — that test decides how much you can borrow, not the 2% chart.

## Stress-test comparison

| Rate | 1st mortgage interest/yr | 2nd mortgage interest/yr (avg) | Total interest/yr (avg) | Monthly (incl. amortization) |
| ---- | ------------------------ | ------------------------------ | ----------------------- | ---------------------------- |
| **2% (actual)** | CHF 13,000 | ~CHF 1,500 | ~CHF 14,500 | ~CHF 2,050 |
| **5% (stress)** | CHF 32,500 | ~CHF 3,750 | ~CHF 36,250 | ~CHF 4,020 |

The stress test uses 5% on the *entire* CHF 800k mortgage = CHF 40,000/yr interest + CHF 10,000 amortization + maintenance/ancillary → determines your borrowing capacity.
