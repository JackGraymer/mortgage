import { createRequire } from "module";
import assert from "assert";

const require = createRequire(import.meta.url);
const core = require("../docs/javascripts/tax-core.js");
const { effectiveRate, estimate, taxValueFactor } = core;

// Reuse the real cantonal data (same data the browser widget uses).
const vm = require("vm");
const fs = require("fs");
global.window = {};
vm.runInThisContext(
  fs.readFileSync(new URL("../docs/javascripts/tax-data.js", import.meta.url), "utf8")
);
const taxData = global.window.taxData;

// ---------------------------------------------------------------------------
// Bracket interpolation (ZH income curve)
// ---------------------------------------------------------------------------
const zhIncome = taxData.ZH.income;
assert.strictEqual(effectiveRate(zhIncome, 0), 0.025, "clamped below min -> first rate");
assert.strictEqual(effectiveRate(zhIncome, 50000), 0.045, "exact bracket point");
assert.strictEqual(effectiveRate(zhIncome, 40000), 0.035, "midway 30k->50k = 0.025..0.045 linear");
assert.strictEqual(effectiveRate(zhIncome, 80000), 0.075, "exact next point");
assert.strictEqual(effectiveRate(zhIncome, 5000000), 0.29, "clamped above max -> last rate");
assert.strictEqual(effectiveRate([], 100), 0, "empty curve -> 0");

// ---------------------------------------------------------------------------
// Net wealth deduction (ZH factor 0.80; AG/BL 0.85; SO 0.90)
// ---------------------------------------------------------------------------
assert.strictEqual(taxValueFactor("ZH"), 0.8, "ZH factor");
assert.strictEqual(taxValueFactor("AG"), 0.85, "AG factor");
assert.strictEqual(taxValueFactor("BL"), 0.85, "BL factor");
assert.strictEqual(taxValueFactor("SO"), 0.9, "SO factor");

// CHF 1M home, CHF 650k debt -> ZH tax value 800k -> net wealth 150k
const wealthCase = estimate({
  canton: "ZH",
  status: "single",
  income: 120000,
  propertyValue: 1000000,
  mortgageDebt: 650000,
  mortgageRate: 2.0,
  pillar3a: 7258,
  taxData,
});
assert.strictEqual(wealthCase.wealth, 150000, "ZH net wealth = 800k tax value - 650k debt");
// Wealth is floored at zero when debt exceeds tax value.
const drowned = estimate({
  canton: "SO",
  status: "single",
  income: 50000,
  propertyValue: 300000,
  mortgageDebt: 400000,
  mortgageRate: 2.0,
  taxData,
});
assert.strictEqual(drowned.wealth, 0, "negative net wealth floored to zero");
// SO factor applied to 300k -> 270k tax value, 400k debt -> 0 net wealth.
assert.strictEqual(300000 * 0.9 - 400000, -130000, "sanity: SO tax value below debt");

// ---------------------------------------------------------------------------
// Single vs married (double-tariff approximation)
// ---------------------------------------------------------------------------
// Same base case; married looks up the rate on half the income (60k) but
// applies it to the full income -> lower average than single at 120k.
const single = estimate({
  canton: "ZH",
  status: "single",
  income: 120000,
  propertyValue: 1000000,
  mortgageDebt: 650000,
  mortgageRate: 2.0,
  pillar3a: 7258,
  taxData,
});
const married = estimate({
  canton: "ZH",
  status: "married",
  income: 120000,
  propertyValue: 1000000,
  mortgageDebt: 650000,
  mortgageRate: 2.0,
  pillar3a: 7258,
  taxData,
});
assert.ok(single.incomeTax > married.incomeTax, "married double tariff yields lower income tax");
assert.ok(
  Math.abs(single.incomeRate - effectiveRate(zhIncome, single.income)) < 1e-9,
  "single looks up ZH rate at own taxable income"
);
assert.ok(
  Math.abs(married.incomeRate - effectiveRate(zhIncome, married.income / 2)) < 1e-9,
  "married rate read at half income"
);
assert.strictEqual(married.incomeTax, married.income * married.incomeRate, "rate applied to full income");

// ---------------------------------------------------------------------------
// Imputed rental value handling
// ---------------------------------------------------------------------------
// Property CHF 10M -> auto imputed 350k, maintenance 1% = 100k -> 250k taxable.
const autoImputed = estimate({
  canton: "ZH",
  status: "single",
  income: 0,
  propertyValue: 10000000, // 3.5% -> 350k imputed
  mortgageDebt: 0,
  mortgageRate: 0,
  pillar3a: 0,
  taxData,
});
assert.strictEqual(Math.round(autoImputed.income), 250000, "auto imputed 3.5% minus 1% maintenance");
const manualImputed = estimate({
  canton: "ZH",
  status: "single",
  income: 0,
  propertyValue: 10000000,
  imputed: 100000, // manual imputed == maintenance -> taxable income 0
  mortgageDebt: 0,
  mortgageRate: 0,
  pillar3a: 0,
  taxData,
});
assert.strictEqual(Math.round(manualImputed.income), 0, "manual imputed value wins over auto");

// ---------------------------------------------------------------------------
// Missing canton data -> null; all 4 cantons present
// ---------------------------------------------------------------------------
assert.strictEqual(estimate({ canton: "YY", taxData }), null, "unknown canton returns null");
assert.ok(["ZH", "AG", "SO", "BL"].every((c) => taxData[c]), "data covers ZH, AG, SO, BL");

console.log("All tax-core tests passed.");