/**
 * Swiss mortgage affordability (stress-test) model.
 *
 * Banks apply an affordability test: annual housing costs must not exceed a
 * fraction (typically 33%) of gross household income, using a conservative
 * "stress" interest rate on the total mortgage (typically 5%) regardless of
 * the actual rate.
 *
 * Housing costs considered:
 *   - stress interest on the total mortgage
 *   - amortization of the 2nd mortgage (portion above 65% LTV), linear over term
 *   - maintenance (default 1% of property value)
 *   - heating / ancillary costs (Nebenkosten)
 *
 * This module is a UMD so the same logic runs in the browser (window.affordabilityCore)
 * and in Node tests (module.exports).
 *
 * Approximate values for planning purposes only — not authoritative.
 */
(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    root.affordabilityCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Standard assumptions (editable per call).
  var DEFAULTS = {
    stressRate: 0.05,          // 5% stress rate on the total mortgage
    maintenanceRate: 0.01,     // 1% of property value per year
    ltvFloor: 0.65,            // 1st mortgage cap (portion below is never amortized)
    maxLtv: 0.8,               // standard lending cap
    incomeRatio: 0.33,         // housing costs may not exceed 33% of gross income
    years: 15,                 // 2nd mortgage amortization term
  };

  function num(v, fallback) {
    v = parseFloat(v);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  }

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  /**
   * Annual second-mortgage amortization for a given mortgage and LTV.
   * The portion of the mortgage above 65% LTV is amortized linearly over `years`.
   */
  function amortization(mortgage, propertyValue, years) {
    if (propertyValue <= 0) return 0;
    var first = Math.min(mortgage, propertyValue * DEFAULTS.ltvFloor);
    var second = Math.max(0, mortgage - first);
    return years > 0 ? second / years : 0;
  }

  /**
   * Total annual housing cost for a given property and mortgage at a given rate.
   * @returns {{interest:number, amortization:number, maintenance:number,
   *            ancillary:number, total:number}}
   */
  function annualCost(params) {
    var propertyValue = num(params.propertyValue, 0);
    var mortgage = num(params.mortgage, 0);
    var rate = num(params.rate, DEFAULTS.stressRate) || 0;
    var years = num(params.years, DEFAULTS.years) || 1;
    var maint = num(params.maintenanceRate, DEFAULTS.maintenanceRate) || 0;
    var ancillary = num(params.ancillary, 0);

    var interest = mortgage * rate;
    var amort = amortization(mortgage, propertyValue, years);
    var maintenance = propertyValue * maint;
    var total = interest + amort + maintenance + ancillary;

    return {
      interest: round2(interest),
      amortization: round2(amort),
      maintenance: round2(maintenance),
      ancillary: round2(ancillary),
      total: round2(total),
    };
  }

  /**
   * Whether a given property/mortgage passes the affordability test, and at
   * what income ratio it sits.
   * @returns {{annual:object, ratio:number, affordable:boolean, requiredIncome:number}}
   */
  function assess(params) {
    var income = num(params.income, 0);
    var ratio = num(params.incomeRatio, DEFAULTS.incomeRatio) || 0.33;

    var annual = annualCost(params);
    var requiredIncome = ratio > 0 ? annual.total / ratio : Infinity;
    var ratioUsed = income > 0 ? annual.total / income : (annual.total > 0 ? Infinity : 0);

    return {
      annual: annual,
      ratio: round2(ratioUsed),
      affordable: income >= requiredIncome,
      requiredIncome: round2(requiredIncome),
    };
  }

  /**
   * Maximum affordable property price given household income and target LTV.
   *
   * Solves: stressRate*ltv*P + amort2(P) + maint*P + ancillary = incomeRatio*income
   * where amort2(P) = max(ltv - 0.65, 0)/years * P.
   *
   * @returns {{propertyValue:number, mortgage:number, ltv:number} | propertyValue:0 on invalid}
   */
  function maxPropertyPrice(params) {
    var income = num(params.income, 0);
    var ratio = num(params.incomeRatio, DEFAULTS.incomeRatio) || 0.33;
    var rate = num(params.rate, DEFAULTS.stressRate) || 0;
    var years = num(params.years, DEFAULTS.years) || 1;
    var maint = num(params.maintenanceRate, DEFAULTS.maintenanceRate) || 0;
    var ancillary = num(params.ancillary, 0);
    var ltv = num(params.ltv, DEFAULTS.maxLtv) || 0;

    if (ltv <= 0 || ltv > 0.9) ltv = DEFAULTS.maxLtv;

    var budget = income * ratio;
    var perValue = rate * ltv + (ltv > DEFAULTS.ltvFloor ? (ltv - DEFAULTS.ltvFloor) / years : 0) + maint;
    var numerator = budget - ancillary;

    var propertyValue = perValue > 0 && numerator > 0 ? numerator / perValue : 0;
    var pv = round2(propertyValue);
    return {
      propertyValue: pv,
      mortgage: round2(pv * ltv),
      ltv: ltv,
    };
  }

  /**
   * Maximum affordable mortgage at the standard cap LTV (0.8).
   * Provided for convenience / parity with the financing guide's example.
   */
  function maxAffordable(params) {
    var ltv = num(params.ltv, DEFAULTS.maxLtv);
    var p = maxPropertyPrice(params);
    return {
      propertyValue: p.propertyValue,
      mortgage: p.mortgage,
      ltv: p.ltv,
    };
  }

  var chf = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  });

  function formatCHF(n) {
    return chf.format(n);
  }

  return {
    DEFAULTS: DEFAULTS,
    annualCost: annualCost,
    assess: assess,
    maxPropertyPrice: maxPropertyPrice,
    maxAffordable: maxAffordable,
    round2: round2,
    formatCHF: formatCHF,
  };
});
