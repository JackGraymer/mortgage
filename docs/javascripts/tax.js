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
      return (parseFloat(this.propertyValue) || 0) * 0.035;
    },
    get cantonName() {
      return (window.taxData[this.canton] || {}).name || this.canton;
    },

    init() {
      this.calculate();
    },

    getMortgageInterest() {
      return (parseFloat(this.mortgageDebt) || 0) * ((parseFloat(this.mortgageRate) || 0) / 100);
    },
    getMaintenance() {
      return (parseFloat(this.propertyValue) || 0) * 0.01;
    },
    getImputed() {
      const v = parseFloat(this.imputed);
      return Number.isFinite(v) && this.imputed !== "" ? v : this.autoImputed;
    },
    taxableIncome() {
      const income = parseFloat(this.income) || 0;
      const interest = this.getMortgageInterest();
      const maintenance = this.getMaintenance();
      const p3a = parseFloat(this.pillar3a) || 0;
      const other = parseFloat(this.otherDeductions) || 0;
      return Math.max(0, income + this.getImputed() - interest - maintenance - p3a - other);
    },
    getTaxValueFactor() {
      // Tax value (Steuerwert) as % of market value
      return this.canton === "ZH" ? 0.80 : 0.85; // ZH: ~70-85%, AG: ~75-90%
    },
    netWealth() {
      const propertyValue = parseFloat(this.propertyValue) || 0;
      const mortgageDebt = parseFloat(this.mortgageDebt) || 0;
      const taxValue = propertyValue * this.getTaxValueFactor();
      return Math.max(0, taxValue - mortgageDebt);
    },

    // Linear interpolation over [value, rate] pairs; clamped outside the range.
    effectiveRate(curve, x) {
      if (!curve || curve.length === 0) return 0;
      if (x <= curve[0][0]) return curve[0][1];
      for (let i = 1; i < curve.length; i++) {
        if (x <= curve[i][0]) {
          const [x0, r0] = curve[i - 1];
          const [x1, r1] = curve[i];
          return r0 + ((r1 - r0) * (x - x0)) / (x1 - x0);
        }
      }
      return curve[curve.length - 1][1];
    },

    calculate() {
      const data = window.taxData[this.canton];
      if (!data) return;
      const income = this.taxableIncome();
      // Married: double-tariff approximation (taxed as if half the income).
      const incomeBasis = this.status === "married" ? income / 2 : income;
      const incomeRate = this.effectiveRate(data.income, incomeBasis);
      const incomeTax = income * incomeRate;
      const wealth = this.netWealth();
      const wealthRate = this.effectiveRate(data.wealth, wealth);
      const wealthTax = wealth * wealthRate;
      const total = incomeTax + wealthTax;
      this.result = {
        income: income,
        incomeRate: incomeRate,
        incomeTax: incomeTax,
        wealth: wealth,
        wealthRate: wealthRate,
        wealthTax: wealthTax,
        total: total,
        monthly: total / 12,
      };
    },

    fmt(n) {
      return new Intl.NumberFormat("de-CH", {
        style: "currency",
        currency: "CHF",
        maximumFractionDigits: 0,
      }).format(n);
    },
    fmtPct(n) {
      return (n * 100).toFixed(1) + "%";
    },
  };
}

window.taxCalculator = taxCalculator;
