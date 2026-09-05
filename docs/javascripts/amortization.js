let _chart = null;

function amortizationCalc() {
  return {
    propertyValue: 1000000,
    equity: 200000,
    rate: 2.0,
    years: 15,
    mode: "direct",
    marginalRate: 25,
    returnRate: 2,
    withdrawalTax: 0,
    result: null,
    _timer: null,

    get mortgage() {
      return (parseFloat(this.propertyValue) || 0) - (parseFloat(this.equity) || 0);
    },
    get ltv() {
      const v = parseFloat(this.propertyValue) || 0;
      return v > 0 ? this.mortgage / v : 0;
    },
    get equityPct() {
      const v = parseFloat(this.propertyValue) || 0;
      return v > 0 ? (parseFloat(this.equity) || 0) / v : 0;
    },
    get ltvWarning() {
      return this.ltv > 0.8;
    },
    get hardCashWarning() {
      return this.equityPct < 0.1;
    },

    // Direct vs. indirect (Pillar 3a) comparison, based on the current
    // amortization schedule's 2nd mortgage.
    get p3a() {
      if (!this.result) return null;
      return window.pillar3aCore.collect({
        second: this.result.second,
        years: parseInt(this.years, 10) || 15,
        rate: (parseFloat(this.rate) || 0) / 100,
        marginalRate: (parseFloat(this.marginalRate) || 0) / 100,
        returnRate: (parseFloat(this.returnRate) || 0) / 100,
        withdrawalTax: (parseFloat(this.withdrawalTax) || 0) / 100,
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
      this.result = window.amortizationCore.computeSchedule(
        parseFloat(this.propertyValue) || 0,
        parseFloat(this.equity) || 0,
        (parseFloat(this.rate) || 0) / 100,
        parseInt(this.years, 10) || 0
      );
      this.renderChart();
    },

    renderChart() {
      const el = this.$refs.chart;
      if (!el || typeof Chart === "undefined" || !this.result) return;
      if (this.mode === "indirect") {
        this.renderIndirectChart();
        return;
      }

      const r = this.result;
      const labels = r.rows.map((x) => "Y" + x.year);
      const interest = r.rows.map((x) => window.amortizationCore.round2(x.interest1 + x.interest2));
      const principal = r.rows.map((x) => x.principal);
      const remaining = r.rows.map((x) => window.amortizationCore.round2(x.remaining1 + x.remaining2));

      if (_chart) {
        _chart.destroy();
        _chart = null;
      }

      _chart = new Chart(el, {
        data: {
          labels: labels,
          datasets: [
            {
              type: "line",
              label: "Remaining debt",
              data: remaining,
              borderColor: "#e11d48",
              backgroundColor: "#e11d48",
              yAxisID: "y",
              pointRadius: 1,
              tension: 0.2,
              order: 0,
            },
            {
              type: "bar",
              label: "Interest paid",
              data: interest,
              backgroundColor: "rgba(37, 99, 235, 0.75)",
              yAxisID: "y",
              order: 1,
            },
            {
              type: "bar",
              label: "Principal repaid",
              data: principal,
              backgroundColor: "rgba(16, 185, 129, 0.75)",
              yAxisID: "y",
              order: 1,
            },
          ],
        },
        options: this.chartOptions(),
      });
    },

    // Indirect mode: 2nd mortgage stays constant while pledged 3a assets grow.
    renderIndirectChart() {
      const r = this.result;
      if (_chart) {
        _chart.destroy();
        _chart = null;
      }

      const years = parseInt(this.years, 10) || 0;
      if (years <= 0) return;

      const rate = (parseFloat(this.rate) || 0) / 100;
      const returnRate = (parseFloat(this.returnRate) || 0) / 100;
      const marginalRate = (parseFloat(this.marginalRate) || 0) / 100;
      const labels = [];
      const threeA = [];
      const contributions = [];
      const interest = [];

      const annualContribution = r.second / years;
      const effectiveContribution = annualContribution * (1 + marginalRate);
      const totalDebt = r.first + r.second;

      for (let y = 1; y <= years; y++) {
        labels.push("Y" + y);
        threeA.push(window.pillar3aCore.round2(window.pillar3aCore.annuityFV(effectiveContribution, returnRate, y)));
        contributions.push(window.pillar3aCore.round2(effectiveContribution));
        interest.push(window.pillar3aCore.round2(totalDebt * rate));
      }

      _chart = new Chart(el, {
        data: {
          labels: labels,
          datasets: [
            {
              type: "line",
              label: "Remaining debt (constant)",
              data: window.amortizationCore ? Array(years).fill(totalDebt) : [],
              borderColor: "#e11d48",
              backgroundColor: "#e11d48",
              yAxisID: "y",
              pointRadius: 1,
              tension: 0.2,
              order: 0,
            },
            {
              type: "line",
              label: "Pillar 3a + tax savings",
              data: threeA,
              borderColor: "#7c3aed",
              backgroundColor: "#7c3aed",
              yAxisID: "y",
              pointRadius: 1,
              tension: 0.2,
              order: 0,
            },
            {
              type: "bar",
              label: "Interest paid",
              data: interest,
              backgroundColor: "rgba(37, 99, 235, 0.75)",
              yAxisID: "y",
              order: 1,
            },
            {
              type: "bar",
              label: "Annual contribution",
              data: contributions,
              backgroundColor: "rgba(16, 185, 129, 0.75)",
              yAxisID: "y",
              order: 1,
            },
          ],
        },
        options: this.chartOptions(),
      });
    },

    chartOptions() {
      return {
        responsive: true,
        animation: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          y: {
            stacked: false,
            ticks: { callback: (v) => "CHF " + Number(v).toLocaleString("de-CH") },
          },
          x: { stacked: false },
        },
        plugins: { legend: { position: "top" } },
      };
    },

    fmt(n) {
      return window.amortizationCore.formatCHF(n);
    },
    fmtPct(n) {
      return (n * 100).toFixed(1) + "%";
    },
  };
}

window.amortizationCalc = amortizationCalc;

// Re-initialize Alpine tree on instant navigation if needed
if (typeof window !== "undefined") {
  const initAlpineOnPageLoad = () => {
    if (_chart) {
      _chart.destroy();
      _chart = null;
    }
    if (window.Alpine) {
      const widgets = document.querySelectorAll("[x-data]");
      widgets.forEach((el) => {
        if (!el._x_dataStack) {
          window.Alpine.initTree(el);
        }
      });
    }
  };

  if (window.document$) {
    window.document$.subscribe(initAlpineOnPageLoad);
  } else {
    document.addEventListener("DOMContentLoaded", initAlpineOnPageLoad);
  }
}

