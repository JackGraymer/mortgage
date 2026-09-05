/**
 * Alpine component for the affordability (stress-test) calculator.
 * Depends on affordability-core.js (window.affordabilityCore) and Alpine.js.
 */
function affordabilityCalc() {
  return {
    income: 120000,
    mortgage: 800000,
    propertyValue: 1000000,
    rate: 2.0,
    years: 15,
    ancillary: 4000,
    ratio: 33,
    _timer: null,

    get stressRate() {
      return window.affordabilityCore.DEFAULTS.stressRate;
    },
    get ltv() {
      const p = parseFloat(this.propertyValue) || 0;
      const m = parseFloat(this.mortgage) || 0;
      return p > 0 ? m / p : 0;
    },
    get maxAffordable() {
      return window.affordabilityCore.maxPropertyPrice({
        income: parseFloat(this.income) || 0,
        rate: this.stressRate,
        years: parseInt(this.years, 10) || 15,
        ancillary: parseFloat(this.ancillary) || 0,
        ltv: 0.8,
      });
    },

    init() {
      this.calculate();
    },

    recalc() {
      if (this._timer) clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this._timer = null;
        this.calculate();
      }, 60);
    },

    calculate() {
      const params = {
        income: parseFloat(this.income) || 0,
        propertyValue: parseFloat(this.propertyValue) || 0,
        mortgage: parseFloat(this.mortgage) || 0,
        rate: this.stressRate,
        years: parseInt(this.years, 10) || 15,
        ancillary: parseFloat(this.ancillary) || 0,
      };
      this.result = window.affordabilityCore.assess(params);
    },

    fmt(n) {
      return window.affordabilityCore.formatCHF(n);
    },
    fmtPct(n) {
      return (n * 100).toFixed(1) + "%";
    },
  };
}

window.affordabilityCalc = affordabilityCalc;
