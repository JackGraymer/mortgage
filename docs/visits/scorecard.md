---
title: Viewing Scorecard
description: Rate and compare the houses you visit across location, structure, energy, layout and financials. Weighted scores, saved in your browser, printable.
---

# Viewing Scorecard

A weighted tool for comparing the homes you visit — so you decide on facts, not the excitement of the last visit. Every criterion is scored **1–5**; results are saved in your browser and can be printed for your next visit.

!!! note "How the weighting works"
    Each criterion carries a weight (e.g. roof and structure count more than parking). Scores are the weighted average of all criteria, out of **5**. You can give an honest **1** or **5** — nothing is auto-tuned. Focus scores on what you could fix and what you couldn't: a wrong location is permanent; a tired kitchen is not.

<div class="calc-widget" x-data="scorecardApp()" x-cloak>
  <div class="scorecard-toolbar">
    <div class="scorecard-new">
      <input type="text" x-model="newName" placeholder="e.g. Zurichberg, Weinbergstr. 12"
             @keydown.enter.prevent="add()" :disabled="!canAdd">
      <button type="button" @click="add()" :disabled="!canAdd">Add candidate</button>
    </div>
    <div class="scorecard-actions">
      <button type="button" class="scorecard-btn" @click="print()">Print scorecard</button>
      <button type="button" class="scorecard-btn scorecard-btn-reset" @click="reset()">Reset</button>
    </div>
  </div>
  <p class="calc-note">
    Add up to <span x-text="max"></span> candidates. The one currently ranked best is highlighted.
    All data stays in this browser only.
  </p>
  <p class="calc-warning" x-show="!canAdd" x-cloak>
    Maximum number of candidates reached.
  </p>

  <div class="scorecard-props" x-show="properties.length">
    <template x-for="(prop, pi) in properties" :key="prop.id">
      <section class="scorecard-prop" :class="{ 'scorecard-best': pi === bestIndex }">
        <header class="scorecard-prop-head">
          <div class="scorecard-prop-title">
            <h3 class="scorecard-prop-name">
              <span class="scorecard-badge" x-show="pi === bestIndex">best</span>
              <input class="scorecard-name-input" x-model="prop.name" @input="save()">
            </h3>
            <button type="button" class="scorecard-remove" @click="remove(pi)"
                    title="Remove this candidate">×</button>
          </div>
          <div class="scorecard-prop-score">
            <span class="scorecard-prop-total" x-text="score(prop).total.toFixed(2)"></span>
            <span class="scorecard-prop-pct" x-text="'/ 5 — ' + score(prop).pct + '%'"></span>
          </div>
          <div class="scorecard-prop-cats">
            <span class="scorecard-cat-chip" x-for="c in categories" :key="c.id"
                  x-text="c.label + ': ' + catScore(prop, c).toFixed(1)"></span>
          </div>
        </header>

        <table class="scorecard-table">
          <template x-for="c in categories" :key="c.id">
            <tbody class="scorecard-cat">
              <tr class="scorecard-cat-row">
                <th colspan="3" x-text="c.label"></th>
              </tr>
              <template x-for="cr in c.criteria" :key="cr.key">
                <tr class="scorecard-criterion">
                  <td class="scorecard-criterion-label">
                    <span x-text="cr.label"></span>
                  </td>
                  <td class="scorecard-slider">
                    <input type="range" min="1" max="5" step="1"
                           :id="'sc-' + prop.id + '-' + cr.key"
                           x-model.number="prop.scores[cr.key]" @input="save()">
                  </td>
                  <td class="scorecard-slider-value">
                    <span x-text="prop.scores[cr.key]"></span>
                  </td>
                </tr>
              </template>
            </tbody>
          </template>
        </table>
      </section>
    </template>
  </div>

  <p class="calc-note">
    <b>Tip:</b> copy a candidate by adding the same address twice if you want a second
    opinion or a "before vs. after renovation" comparison. Ratings are saved automatically.
  </p>
</div>

---

## Using the categories

| Category | What it weighs | Spend your attention on |
| -------- | -------------- | ----------------------- |
| Location & plot | Neighbourhood, access, sunlight, plot, noise | The things you *cannot* change |
| Structure & condition | Roof, facade, windows, structure, cellar, maintenance | The big-ticket, hard-to-verify items |
| Energy & systems | Heating, insulation, energy cost, electrical, plumbing | Your future running and upgrade bills |
| Layout & living | Practicality, light, storage, outdoor, parking | Day-to-day comfort |
| Financials | Price vs. comparables, needs renovation, recurring costs, financing fit | Alignment with the [Affordability](../financing/affordability.md) and [Amortization](../financing/calculator.md) tools |

The criteria and weights were chosen to match the risk profile that actually costs Swiss buyers money (see [Before the Visit](index.md), [During the Visit](during.md) and [After the Visit](after.md) for the full checklists and red flags).

!!! tip "Pair it with the checklist"
    Working through the [Before](index.md), [During](during.md) and [After](after.md) guides is the homework. Use this scorecard to *decide*; use the [interactive checklist](../checklist.md) to make sure no document, permit or inspection step is missed along the way.