(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    root.amortizationCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  /**
   * Swiss mortgage amortization model.
   *
   * - 1st mortgage: up to 65% of property value, interest-only (never amortized).
   * - 2nd mortgage: the remainder, linearly amortized over `years`.
   *
   * @param {number} propertyValue purchase price in CHF
   * @param {number} equity        down payment in CHF
   * @param {number} rate          annual interest rate (decimal, e.g. 0.02)
   * @param {number} years         amortization term for the 2nd mortgage
   */
  function computeSchedule(propertyValue, equity, rate, years) {
    const mortgage = propertyValue - equity;
    const ltv = propertyValue > 0 ? mortgage / propertyValue : 0;
    const first = Math.min(mortgage, propertyValue * 0.65);
    const second = mortgage - first;
    const annualSecond = years > 0 ? second / years : 0;

    const rows = [];
    let remaining1 = first;
    let remaining2 = second;
    let totalPrincipal = 0;
    let totalInterest = 0;

    for (let y = 1; y <= years; y++) {
      const principal = Math.min(annualSecond, remaining2);
      const interest1 = remaining1 * rate;
      const interest2 = remaining2 * rate;
      totalPrincipal += principal;
      totalInterest += interest1 + interest2;
      remaining2 -= principal;
      rows.push({
        year: y,
        principal: round2(principal),
        interest1: round2(interest1),
        interest2: round2(interest2),
        remaining1: round2(remaining1),
        remaining2: round2(remaining2),
      });
    }

    const totalPaid = totalPrincipal + totalInterest;
    return {
      propertyValue: round2(propertyValue),
      equity: round2(equity),
      mortgage: round2(mortgage),
      ltv: ltv,
      first: round2(first),
      second: round2(second),
      rate: rate,
      years: years,
      rows: rows,
      totalPrincipal: round2(totalPrincipal),
      totalInterest: round2(totalInterest),
      totalPaid: round2(totalPaid),
      monthlyPayment: years > 0 ? round2(totalPaid / (years * 12)) : 0,
      ongoingAnnualInterest: round2(first * rate),
    };
  }

  const chf = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  });

  function formatCHF(n) {
    return chf.format(n);
  }

  return { computeSchedule: computeSchedule, formatCHF: formatCHF, round2: round2 };
});
