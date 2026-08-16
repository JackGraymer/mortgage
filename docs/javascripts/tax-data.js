// Simplified effective tax-rate data for the tax estimator.
// APPROXIMATE values for planning purposes only — not authoritative.
// Income arrays: [taxable income, combined effective income-tax rate incl. federal + cantonal + communal].
// Wealth arrays: [net wealth, effective wealth-tax rate incl. cantonal + communal].
window.taxData = {
  ZH: {
    name: "Zurich",
    income: [
      [40000, 0.055],
      [60000, 0.075],
      [100000, 0.105],
      [150000, 0.14],
      [250000, 0.18],
      [400000, 0.22],
      [600000, 0.25],
      [1000000, 0.28],
    ],
    wealth: [
      [100000, 0.0015],
      [300000, 0.002],
      [600000, 0.0025],
      [1000000, 0.003],
      [2000000, 0.0038],
    ],
  },
  AG: {
    name: "Aargau",
    income: [
      [40000, 0.06],
      [60000, 0.08],
      [100000, 0.11],
      [150000, 0.145],
      [250000, 0.185],
      [400000, 0.225],
      [600000, 0.255],
      [1000000, 0.285],
    ],
    wealth: [
      [100000, 0.0013],
      [300000, 0.0018],
      [600000, 0.0023],
      [1000000, 0.0027],
      [2000000, 0.0034],
    ],
  },
};
