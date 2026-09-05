/**
 * Alpine component for the tax estimator.
 * Computation lives in tax-core.js (window.taxCore); data in tax-data.js
 * (window.taxData). Depends on both plus Alpine.js.
 */
function taxCalculator() {
  return {
    canton: "ZH",
    status: "single",
    income: 120000,
    propertyValue: 1000000,
    mortgageDebt: 650000,
    mortgageRate: 2.0,
    imputed: "",
    pillar3a: 7256,
    otherDeductions: 0,
    result: null,

    get autoImputed() {
      const v = parseFloat(this.propertyValue) || 0;
      return window.taxCore ? v * 0.035 : 0;
    },
    get cantonName() {
      return (window.taxData[this.canton] || {}).name || this.canton;
    },

    init() {
      this.calculate();
    },

    calculate() {
      this.result = window.taxCore.estimate({
        canton: this.canton,
        status: this.status,
        income: this.income,
        propertyValue: this.propertyValue,
        mortgageDebt: this.mortgageDebt,
        mortgageRate: this.mortgageRate,
        imputed: this.imputed,
        pillar3a: this.pillar3a,
        otherDeductions: this.otherDeductions,
        taxData: window.taxData,
      });
    },

    fmt(n) {
      return window.taxCore.fmt(n);
    },
    fmtPct(n) {
      return window.taxCore.fmtPct(n);
    },
  };
}

window.taxCalculator = taxCalculator;