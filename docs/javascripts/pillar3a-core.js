/**
 * Direct vs. indirect (Pillar 3a) amortization comparison.
 *
 * Direct: the 2nd mortgage is repaid linearly over the term; interest accrues
 * on the declining balance.
 *
 * Indirect: the 2nd mortgage stays at its full balance, the same principal
 * amount is contributed yearly into a Pillar 3a account pledged to the bank,
 * earning a return and a tax deduction. At the end the 3a assets repay the
 * 2nd mortgage; any surplus plus the accumulated tax savings is net wealth.
 *
 * UMD module — shared by the browser widget and Node tests.
 * Approximate values for planning purposes only — not tax advice.
 */
(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    root.pillar3aCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function num(v, fallback) {
    v = parseFloat(v);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  }

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  /**
   * Total interest paid on the 2nd mortgage under direct linear amortization.
   * Balance declines linearly from `second` to 0 over `years`; sum of balances
   * = second * (years + 1) / 2.
   */
  function directInterest(second, rate, years) {
    return second * rate * ((years + 1) / 2);
  }

  /**
   * Total interest paid on the 2nd mortgage under indirect amortization:
   * the full balance is outstanding for the entire term.
   */
  function indirectInterest(second, rate, years) {
    return second * rate * years;
  }

  /**
   * Future value of an ordinary annuity (year-end contributions) at `rate`.
   */
  function annuityFV(contribution, rate, years) {
    if (rate === 0) return contribution * years;
    return contribution * ((Math.pow(1 + rate, years) - 1) / rate);
  }

  /**
   * Indirect amortization model.
   *
   * @param {object} params
   *   second: 2nd mortgage amount (CHF)
   *   years:  term (years)
   *   rate:   annual mortgage interest rate (decimal)
   *   marginalRate: 0..1 — marginal income-tax rate (deduction benefit)
   *   returnRate:    annual 3a return (decimal)
   *   withdrawalTax: 0..1 — capital-withdrawal tax on 3a at the end
   */
  function collect(params) {
    var second = num(params.second, 0);
    var years = num(params.years, 15) || 15;
    var rate = num(params.rate, 0) || 0;
    var marginal = num(params.marginalRate, 0.25) || 0;
    var returnRate = num(params.returnRate, 0) || 0;
    var withdrawalTax = num(params.withdrawalTax, 0) || 0;

    var principal = years > 0 ? second / years : 0;
    var taxSavingYear = principal * marginal;

    var threeAFV = annuityFV(principal, returnRate, years);
    var taxSavingsFV = annuityFV(taxSavingYear, returnRate, years);
    var taxOnWithdrawal = threeAFV * withdrawalTax;
    var netThreeA = threeAFV - taxOnWithdrawal;

    // Net position after the 2nd mortgage is repaid from the 3a account:
    // leftover 3a + accumulated tax savings - remaining debt.
    var netPosition = netThreeA + taxSavingsFV - second;

    var interestDirect = directInterest(second, rate, years);
    var interestIndirect = indirectInterest(second, rate, years);
    var extraInterest = interestIndirect - interestDirect;

    // Indirect net benefit vs. direct: leftover wealth minus the extra
    // interest paid on the constant balance.
    var benefit = netPosition - extraInterest;

    return {
      years: years,
      rate: rate,
      marginalRate: marginal,
      returnRate: returnRate,
      withdrawalTax: withdrawalTax,
      second: round2(second),
      principalAnnual: round2(principal),
      taxSavingAnnual: round2(taxSavingYear),
      threeAFV: round2(threeAFV),
      taxSavingsFV: round2(taxSavingsFV),
      taxOnWithdrawal: round2(taxOnWithdrawal),
      netThreeA: round2(netThreeA),
      netPosition: round2(netPosition),
      interestDirect: round2(interestDirect),
      interestIndirect: round2(interestIndirect),
      extraInterest: round2(extraInterest),
      benefit: round2(benefit),
    };
  }

  return {
    directInterest: directInterest,
    indirectInterest: indirectInterest,
    annuityFV: annuityFV,
    collect: collect,
    round2: round2,
  };
});