import { createRequire } from "module";
import assert from "assert";

const require = createRequire(import.meta.url);
const core = require("../docs/javascripts/amortization-core.js");
const { computeSchedule, round2 } = core;

// README example: CHF 1M property, 200k equity, 2% p.a., 15-year amortization
const r = computeSchedule(1000000, 200000, 0.02, 15);

assert.strictEqual(r.mortgage, 800000, "mortgage = value - equity");
assert.strictEqual(r.first, 650000, "1st mortgage capped at 65% of value");
assert.strictEqual(r.second, 150000, "2nd mortgage is the remainder");
assert.strictEqual(round2(r.ltv), 0.8, "LTV = 80%");

// 2nd mortgage: 150k / 15y = 10k principal per year
assert.strictEqual(r.totalPrincipal, 150000, "full 2nd mortgage repaid");
assert.strictEqual(r.rows[0].principal, 10000, "year 1 principal");
assert.strictEqual(r.rows[14].remaining2, 0, "2nd mortgage fully repaid by year 15");

// 1st interest: 650k * 2% = 13k/yr -> 195k over 15y
// 2nd interest: 2% on (150k, 140k, ..., 10k) = 24k
assert.strictEqual(r.rows[0].interest1, 13000, "1st interest year 1");
assert.strictEqual(r.rows[0].interest2, 3000, "2nd interest year 1");
assert.strictEqual(r.totalInterest, 219000, "total interest = 195k + 24k");
assert.strictEqual(r.totalPaid, 369000, "principal + interest");
assert.strictEqual(r.monthlyPayment, 2050, "average monthly payment over term");
assert.strictEqual(r.ongoingAnnualInterest, 13000, "1st mortgage interest continues after term");

// Fully-equity-covered property: mortgage below 65% -> all interest-only
const small = computeSchedule(500000, 200000, 0.02, 15);
assert.strictEqual(small.first, 300000, "all mortgage is 1st (interest-only)");
assert.strictEqual(small.second, 0, "no 2nd mortgage");
assert.strictEqual(small.totalPrincipal, 0, "nothing amortized");
assert.strictEqual(small.totalInterest, 90000, "300k * 2% * 15y");

// LTV cap: low equity produces LTV > 80% (UI warns; core still computes)
const high = computeSchedule(1000000, 100000, 0.02, 15);
assert.strictEqual(high.mortgage, 900000, "mortgage when only 10% equity");
assert.ok(high.ltv > 0.8, "LTV exceeds 80%");

// Zero division safety
const zero = computeSchedule(0, 0, 0.02, 15);
assert.strictEqual(zero.ltv, 0, "no property value, no LTV");

console.log("All amortization-core tests passed.");
