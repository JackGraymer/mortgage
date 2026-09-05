import { createRequire } from "module";
import assert from "assert";

const require = createRequire(import.meta.url);
const core = require("../docs/javascripts/affordability-core.js");

// --- annualCost: matches the financing guide worked example ---
// CHF 1M property, CHF 800k mortgage, 5% stress, 15yr, 1% maint, 4k ancillary
const ex = core.annualCost({
  propertyValue: 1000000,
  mortgage: 800000,
  rate: 0.05,
  years: 15,
  ancillary: 4000,
});
assert.strictEqual(ex.interest, 40000, "5% stress interest on 800k");
assert.strictEqual(ex.amortization, 10000, "2nd mortgage (150k) / 15yr");
assert.strictEqual(ex.maintenance, 10000, "1% maintenance on 1M");
assert.strictEqual(ex.ancillary, 4000, "ancillary passed through");
assert.strictEqual(ex.total, 64000, "total = guide example");

// --- assess: affordability boolean and required income ---
const good = core.assess({
  income: 200000,
  propertyValue: 1000000,
  mortgage: 800000,
  rate: 0.05,
  years: 15,
  ancillary: 4000,
});
assert.strictEqual(good.annual.total, 64000);
assert.strictEqual(good.requiredIncome, 193939.39, "64000 / 0.33");
assert.strictEqual(good.affordable, true);
assert.ok(Math.abs(good.ratio - 0.32) < 0.001, "income ratio ~32%");

const bad = core.assess({
  income: 120000,
  propertyValue: 1000000,
  mortgage: 800000,
  rate: 0.05,
  years: 15,
  ancillary: 4000,
});
assert.strictEqual(bad.affordable, false, "120k income cannot afford 1M at 33%");
assert.ok(bad.ratio > 0.33, "ratio above the 33% cap");

// --- maxPropertyPrice: solve for max price given income ---
// 120k income, 33% => budget = 39600; perValue = 0.05*0.8 + (0.15/15) + 0.01 = 0.06
// numerator = 39600 - 4000(ancillary) = 35600; property = 35600/0.06 = 593333.33
const maxp = core.maxPropertyPrice({
  income: 120000,
  rate: 0.05,
  years: 15,
  ancillary: 4000,
  ltv: 0.8,
});
assert.strictEqual(maxp.propertyValue, 593333.33, "max property at 80% LTV");
assert.strictEqual(maxp.mortgage, 474666.66, "80% of max property");
assert.strictEqual(maxp.ltv, 0.8);

// --- maxPropertyPrice handles invalid/zero inputs safely ---
const zero = core.maxPropertyPrice({ income: 0, ancillary: 0 });
assert.strictEqual(zero.propertyValue, 0, "no income => no max price");
const noAncil = core.maxPropertyPrice({ income: 120000, ancillary: 0, ltv: 0.8 });
// budget = 39600 (120k*0.33); perValue=0.06; property = 39600/0.06 = 660000
assert.strictEqual(noAncil.propertyValue, 660000, "no ancillary raises max price");

// --- no 2nd mortgage amortization below 65% LTV ---
const low = core.annualCost({
  propertyValue: 1000000,
  mortgage: 600000,
  rate: 0.05,
  years: 15,
  ancillary: 0,
});
assert.strictEqual(low.amortization, 0, "no amortization when all mortgage is 1st (<=65%)");
assert.strictEqual(low.interest, 30000, "5% interest on 600k");

// --- negative / NaN safety ---
const safe = core.annualCost({ propertyValue: "abc", mortgage: undefined });
assert.strictEqual(safe.total, 0, "NaN inputs resolve to zero");

console.log("All affordability-core tests passed.");
