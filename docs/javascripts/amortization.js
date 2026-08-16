let _chart = null;

function amortizationCalc() {
  return {
    propertyValue: 1000000,
    equity: 200000,
    rate: 2.0,
    years: 15,
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

      const r = this.result;
      const labels = r.rows.map((x) => "Y" + x.year);
      const interest = r.rows.map((x) => window.amortizationCore.round2(x.interest1 + x.interest2));
      const principal = r.rows.map((x) => x.principal);
      const remaining = r.rows.map((x) => window.amortizationCore.round2(x.remaining1 + x.remaining2));

      if (!_chart) {
        _chart = Chart.getChart(el) || new Chart(el, {
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
          options: {
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
          },
        });
        return;
      }

      _chart.data.labels = labels;
      _chart.data.datasets[0].data = remaining;
      _chart.data.datasets[1].data = interest;
      _chart.data.datasets[2].data = principal;
      _chart.update();
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
