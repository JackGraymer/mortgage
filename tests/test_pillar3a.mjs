import { createRequire } from "module";
import assert from "assert";

const require = createRequire(import.meta.url);
const { collect, directInterest, indirectInterest, annuityFV } = require("../docs/javascripts/pillar3a-core.js");

// --- interest under both modes (CHF 150k 2nd mortgage, 2%, 15y) ---
assert.strictEqual(directInterest(150000, 0.02, 15), 24000, "declining balance: 150k*2%*(16/2)");
assert.strictEqual(indirectInterest(150000, 0.02, 15), 45000, "constant balance: 150k*2%*15");
assert.ok(indirectInterest(150000, 0.02, 15) > directInterest(150000, 0.02, 15), "indirect pays more 2nd-mortgage interest");

// --- zero-growth annuity is just the sum of contributions ---
assert.strictEqual(annuityFV(10000, 0, 15), 150000, "rate 0 -> contributions summed");
// 1.02^15 = 1.34586834 -> 10000 * (1.34586834-1)/0.02 = 172,934.17
assert.strictEqual(Math.round(annuityFV(10000, 0.02, 15)), 172934, "compounded ordinary annuity");

// --- full model walk-through ---
const r = collect({
  second: 150000,
  years: 15,
  rate: 0.02,
  marginalRate: 0.25,
  returnRate: 0.02,
  withdrawalTax: 0,
});
assert.strictEqual(r.principalAnnual, 10000, "annual contribution = 2nd mortgage / years");
assert.strictEqual(r.taxSavingAnnual, 2500, "25% marginal rate on 10k");
assert.strictEqual(r.threeAFV, 172934.17, "3a future value of 10k/yr at 2%");
// tax savings (2500/yr at 2%) = 2500 * 17.293417 = 43233.54
assert.strictEqual(r.taxSavingsFV, 43233.54, "tax savings reinvested at 2%");
assert.strictEqual(r.netThreeA, 172934.17, "no withdrawal tax -> full 3a net");
// net position after repaying 2nd = 3a + tax savings - second
assert.strictEqual(r.netPosition, 66167.71, "leftover wealth after clearing 2nd mortgage");
assert.strictEqual(r.extraInterest, 21000, "indirect attracted extra interest");
assert.strictEqual(r.benefit, 45167.71, "indirect benefit = leftover wealth - extra interest");

// --- withdrawal tax reduces the 3a proceeds ---
const taxed = collect({
  second: 150000,
  years: 15,
  rate: 0.02,
  marginalRate: 0.25,
  returnRate: 0.02,
  withdrawalTax: 0.08,
});
assert.strictEqual(taxed.taxOnWithdrawal, Math.round(172934.17 * 0.08 * 100) / 100, "8% withdrawal tax on 3a");
assert.strictEqual(taxed.netThreeA, 172934.17 - taxed.taxOnWithdrawal, "net 3a after withdrawal tax");
assert.ok(taxed.benefit < r.benefit, "withdrawal tax lowers the indirect benefit");

// --- safety on empty inputs ---
const zero = collect({});
assert.strictEqual(zero.second, 0, "zero second mortgage");
assert.strictEqual(zero.benefit, 0, "zero everything -> zero benefit");

console.log("All pillar3a-core tests passed.");