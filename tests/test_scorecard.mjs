import { createRequire } from "module";
import assert from "assert";

const require = createRequire(import.meta.url);
const core = require("../docs/javascripts/scorecard-core.js");

// ---------------------------------------------------------------------------
// Structure
// ---------------------------------------------------------------------------
assert.strictEqual(core.TOTAL_WEIGHT, 100, "criteria weights sum to 100");
assert.strictEqual(core.flatten().length, 25, "total criterion count");
assert.ok(core.CATEGORIES.length >= 5, "five categories present");
assert.ok(
  core.MAX_PROPERTIES >= 6,
  "widget supports a reasonable number of candidates"
);

// ---------------------------------------------------------------------------
// defaultScores / scoring scale
// ---------------------------------------------------------------------------
const neutral = core.defaultScores();
assert.strictEqual(neutral.structure, 3, "defaults are neutral 3");
assert.strictEqual(core.scoreProperty(neutral).total, 3, "neutral -> 3.0");
assert.strictEqual(core.scoreProperty(neutral).pct, 60, "neutral -> 60%");

const all5 = { ...neutral };
Object.keys(all5).forEach((k) => (all5[k] = 5));
assert.strictEqual(core.scoreProperty(all5).total, 5, "all 5 -> 5.0");
assert.strictEqual(core.scoreProperty(all5).pct, 100, "all 5 -> 100%");

const all1 = { ...neutral };
Object.keys(all1).forEach((k) => (all1[k] = 1));
assert.strictEqual(core.scoreProperty(all1).total, 1, "all 1 -> 1.0");
assert.strictEqual(core.scoreProperty(all1).pct, 20, "all 1 -> 20%");

// Clamping: values outside 1..5 are pinned.
assert.strictEqual(core.clamp(7, 1, 5), 5, "clamp high to 5");
assert.strictEqual(core.clamp(0, 1, 5), 1, "clamp low to 1");
const clamped = { ...neutral };
clamped.structure = 7; // -> 5, +2*6 weight
clamped.roof = 0; //      -> 1, -2*5 weight
const clampedScore = core.scoreProperty(clamped).total;
assert.ok(clampedScore > 3 && clampedScore < 3.1, `out-of-range scores clamp to 1..5 (got ${clampedScore})`);

// ---------------------------------------------------------------------------
// Monotonicity (weighted effect)
// ---------------------------------------------------------------------------
const downgraded = { ...neutral };
downgraded.structure = 1;
const upgraded = { ...neutral };
upgraded.structure = 5;
assert.ok(
  core.scoreProperty(upgraded).total > core.scoreProperty(downgraded).total,
  "raising a weighted criterion raises the total"
);
// Highest-weight criterion (heating, w=6) moves the total more than lowest (plumbing, w=2).
const heat = { ...neutral };
heat.heating = 5;
const plumb = { ...neutral };
plumb.plumbing = 5;
assert.ok(
  core.scoreProperty(heat).total > core.scoreProperty(plumb).total,
  "higher weights influence the total more"
);

// ---------------------------------------------------------------------------
// categoryScore
// ---------------------------------------------------------------------------
const loc = core.CATEGORIES[0];
assert.strictEqual(core.categoryScore(all5, loc), 5, "all 5 in a category -> 5.0");
assert.strictEqual(core.categoryScore(neutral, loc), 3, "neutral category -> 3.0");

// ---------------------------------------------------------------------------
// newProperty
// ---------------------------------------------------------------------------
const p = core.newProperty("House A");
assert.ok(p.id && p.name === "House A", "newProperty builds id + name + default scores");
assert.strictEqual(p.scores.insulation, 3, "new property has neutral scores");

// ---------------------------------------------------------------------------
// best()
// ---------------------------------------------------------------------------
const mk = (name, structure, heating) => {
  const t = core.newProperty(name);
  t.scores.structure = structure;
  t.scores.heating = heating;
  return t;
};
const two = [mk("A", 2, 2), mk("B", 4, 4), mk("C", 3, 3)];
assert.strictEqual(core.best(two), 1, "best picks the highest weighted total");
assert.strictEqual(core.best([]), -1, "no candidates -> no best");
assert.strictEqual(core.best(null), -1, "null -> no best");

console.log("All scorecard-core tests passed.");