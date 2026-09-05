/**
 * Tax estimation core — pure functions for the tax estimator.
 *
 * Shares the tax logic between the browser widget (Alpine) and Node tests via
 * a UMD wrapper. Depends only on the `taxData` object passed into `estimate()`
 * (in the browser that is `window.taxData` from tax-data.js).
 *
 * APPROXIMATE values for planning purposes only — not authoritative.
 */
(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    root.taxCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Property tax value (Steuerwert) as a fraction of market value, per canton.
  // ZH: ~70-85%, AG/BL: ~75-90%, SO: ~85-100% (municipality-dependent).
  var TAX_VALUE_FACTORS = {
    ZH: 0.8,
    AG: 0.85,
    BL: 0.85,
    SO: 0.9,
  };

  function num(value) {
    var v = typeof value === "string" ? parseFloat(value) : value;
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }

  /**
   * Linear interpolation over [value, rate] pairs; clamped outside the range.
   * Assumes curve sorted ascending by value (first element min, last max).
   */
  function effectiveRate(curve, x) {
    if (!curve || curve.length === 0) return 0;
    if (x <= curve[0][0]) return curve[0][1];
    for (var i = 1; i < curve.length; i++) {
      if (x <= curve[i][0]) {
        var x0 = curve[i - 1][0];
        var r0 = curve[i - 1][1];
        var x1 = curve[i][0];
        var r1 = curve[i][1];
        return r0 + ((r1 - r0) * (x - x0)) / (x1 - x0);
      }
    }
    return curve[curve.length - 1][1];
  }

  function taxValueFactor(canton) {
    var factor = TAX_VALUE_FACTORS[canton];
    return factor || 0.85;
  }

  /**
   * Estimated annual income + wealth tax.
   *
   * @param {object} params
   *   canton, status ("single"|"married"), income, propertyValue,
   *   mortgageDebt, mortgageRate (in % p.a.), pillar3a, otherDeductions,
   *   imputed (optional — defaults to 3.5% of property value), taxData
   * @returns {{income, incomeRate, incomeTax, wealth, wealthRate,
   *            wealthTax, total, monthly} | null if canton data missing}
   */
  function estimate(params) {
    var data = params && params.taxData && params.taxData[params.canton];
    if (!data) return null;

    var propertyValue = num(params.propertyValue);
    var mortgageDebt = num(params.mortgageDebt);

    var autoImputed = propertyValue * 0.035;
    var rawImputed = params.imputed;
    var imputed =
      rawImputed !== undefined &&
      rawImputed !== "" &&
      Number.isFinite(parseFloat(rawImputed))
        ? num(rawImputed)
        : autoImputed;

    var interest = mortgageDebt * (num(params.mortgageRate) / 100);
    var maintenance = propertyValue * 0.01;
    var income = Math.max(
      0,
      num(params.income) +
        imputed -
        interest -
        maintenance -
        num(params.pillar3a) -
        num(params.otherDeductions)
    );

    // Married: double-tariff approximation (look up rate on half the income).
    var incomeBasis = params.status === "married" ? income / 2 : income;
    var incomeRate = effectiveRate(data.income, incomeBasis);
    var incomeTax = income * incomeRate;

    var taxValue = propertyValue * taxValueFactor(params.canton);
    var wealth = Math.max(0, taxValue - mortgageDebt);
    var wealthRate = effectiveRate(data.wealth, wealth);
    var wealthTax = wealth * wealthRate;

    var total = incomeTax + wealthTax;
    return {
      income: income,
      incomeRate: incomeRate,
      incomeTax: incomeTax,
      wealth: wealth,
      wealthRate: wealthRate,
      wealthTax: wealthTax,
      total: total,
      monthly: total / 12,
    };
  }

  var chf = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  });

  function fmt(n) {
    return chf.format(n);
  }

  function fmtPct(n) {
    return (n * 100).toFixed(1) + "%";
  }

  return {
    TAX_VALUE_FACTORS: TAX_VALUE_FACTORS,
    effectiveRate: effectiveRate,
    taxValueFactor: taxValueFactor,
    estimate: estimate,
    fmt: fmt,
    fmtPct: fmtPct,
  };
});