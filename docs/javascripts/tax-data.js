// Simplified effective tax-rate data for the tax estimator.
// APPROXIMATE values for planning purposes only — not authoritative.
// Based on 2025/2026 tariff tables (federal + cantonal + communal combined).
// Income arrays: [taxable income, combined effective income-tax rate incl. federal + cantonal + communal].
// Wealth arrays: [net wealth, effective wealth-tax rate incl. cantonal + communal].
// Note: Zurich city (Stadt Zürich) has higher municipal multiplier; these are canton-wide averages.
window.taxData = {
  ZH: {
    name: "Zurich",
    income: [
      [30000, 0.025],
      [50000, 0.045],
      [80000, 0.075],
      [120000, 0.11],
      [160000, 0.14],
      [250000, 0.185],
      [400000, 0.225],
      [600000, 0.26],
      [1000000, 0.29],
    ],
    wealth: [
      [50000, 0.0005],
      [100000, 0.001],
      [200000, 0.0015],
      [500000, 0.0022],
      [1000000, 0.0028],
      [2000000, 0.0033],
    ],
  },
  AG: {
    name: "Aargau",
    income: [
      [30000, 0.03],
      [50000, 0.05],
      [80000, 0.08],
      [120000, 0.115],
      [160000, 0.145],
      [250000, 0.185],
      [400000, 0.225],
      [600000, 0.255],
      [1000000, 0.285],
    ],
    wealth: [
      [50000, 0.0005],
      [100000, 0.001],
      [200000, 0.0016],
      [500000, 0.0022],
      [1000000, 0.0027],
      [2000000, 0.0032],
    ],
  },
  SO: {
    name: "Solothurn",
    income: [
      [30000, 0.032],
      [50000, 0.052],
      [80000, 0.082],
      [120000, 0.118],
      [160000, 0.15],
      [250000, 0.19],
      [400000, 0.23],
      [600000, 0.26],
      [1000000, 0.29],
    ],
    wealth: [
      [50000, 0.0006],
      [100000, 0.0011],
      [200000, 0.0017],
      [500000, 0.0023],
      [1000000, 0.0028],
      [2000000, 0.0034],
    ],
  },
  BL: {
    name: "Basel-Landschaft",
    income: [
      [30000, 0.028],
      [50000, 0.048],
      [80000, 0.078],
      [120000, 0.112],
      [160000, 0.142],
      [250000, 0.185],
      [400000, 0.225],
      [600000, 0.255],
      [1000000, 0.285],
    ],
    wealth: [
      [50000, 0.0005],
      [100000, 0.0009],
      [200000, 0.0014],
      [500000, 0.002],
      [1000000, 0.0025],
      [2000000, 0.003],
    ],
  },
};
