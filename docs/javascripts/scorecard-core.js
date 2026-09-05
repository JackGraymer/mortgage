/**
 * scorecard-core.js — weighted scoring model for comparing house visits.
 * UMD: browser -> window.scorecardCore; Node -> module.exports (tests).
 * Categories and per-criterion weights sum to 100.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.scorecardCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var MAX_PROPERTIES = 8;

  var CATEGORIES = [
    {
      id: "location",
      label: "Location & plot",
      criteria: [
        { key: "neighbourhood", label: "Street & neighbourhood quietness", weight: 5 },
        { key: "access", label: "Public transport, schools, shops, commute", weight: 4 },
        { key: "sunlight", label: "Sunlight & orientation (garden facing)", weight: 4 },
        { key: "plot", label: "Plot size, shape & slope", weight: 4 },
        { key: "noise", label: "Noise & air quality (traffic/rail/aircraft)", weight: 3 },
      ],
    },
    {
      id: "condition",
      label: "Structure & condition",
      criteria: [
        { key: "roof", label: "Roof & gutters", weight: 5 },
        { key: "facade", label: "Facade & exterior envelope", weight: 5 },
        { key: "windows", label: "Windows & doors", weight: 4 },
        { key: "structure", label: "Walls, ceilings & structural integrity", weight: 6 },
        { key: "cellar", label: "Cellar & moisture/damp level", weight: 5 },
        { key: "maintenance", label: "Overall maintenance state", weight: 5 },
      ],
    },
    {
      id: "energy",
      label: "Energy & systems",
      criteria: [
        { key: "heating", label: "Heating system type & age", weight: 6 },
        { key: "insulation", label: "Insulation / GEAK rating", weight: 5 },
        { key: "energycost", label: "Energy costs per previous bills", weight: 4 },
        { key: "electrical", label: "Electrical system & capacity", weight: 3 },
        { key: "plumbing", label: "Plumbing & hot water", weight: 2 },
      ],
    },
    {
      id: "layout",
      label: "Layout & living quality",
      criteria: [
        { key: "layout", label: "Layout practicality & room sizes", weight: 4 },
        { key: "light", label: "Brightness & natural light", weight: 3 },
        { key: "storage", label: "Storage & auxiliary rooms", weight: 3 },
        { key: "outdoor", label: "Garden & outdoor living quality", weight: 3 },
        { key: "parking", label: "Parking / garage", weight: 2 },
      ],
    },
    {
      id: "financials",
      label: "Financials",
      criteria: [
        { key: "price", label: "Price vs. market & comparables", weight: 4 },
        { key: "renovation", label: "Likely renovation & reserve needs", weight: 5 },
        { key: "costs", label: "Known recurring costs (tax, insurance, ancillary)", weight: 3 },
        { key: "finance", label: "Financing fit (LTV & affordability test)", weight: 3 },
      ],
    },
  ];

  function flatten() {
    var rows = [];
    CATEGORIES.forEach(function (c) {
      c.criteria.forEach(function (cr) {
        rows.push({
          key: cr.key,
          label: cr.label,
          weight: cr.weight,
          categoryId: c.id,
          category: c.label,
        });
      });
    });
    return rows;
  }

  var TOTAL_WEIGHT = CATEGORIES.reduce(function (sum, c) {
    return sum + c.criteria.reduce(function (s, cr) { return s + cr.weight; }, 0);
  }, 0);

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function defaultScores() {
    var o = {};
    flatten().forEach(function (r) { o[r.key] = 3; });
    return o;
  }

  function newProperty(name) {
    return {
      id: "p_" + Math.random().toString(36).slice(2, 9),
      name: name,
      scores: defaultScores(),
    };
  }

  function scoreProperty(scoresData) {
    var sum = 0;
    flatten().forEach(function (r) {
      sum += clamp(Number(scoresData[r.key]) || 0, 1, 5) * r.weight;
    });
    var total = round2(sum / TOTAL_WEIGHT);
    return { total: total, pct: Math.round((sum / TOTAL_WEIGHT) * 20), max: 5 };
  }

  function categoryScore(scoresData, category) {
    var sum = 0;
    var w = 0;
    category.criteria.forEach(function (cr) {
      w += cr.weight;
      sum += clamp(Number(scoresData[cr.key]) || 0, 1, 5) * cr.weight;
    });
    return w ? round2(sum / w) : 3;
  }

  function best(properties) {
    if (!Array.isArray(properties) || properties.length === 0) return -1;
    var bestI = 0;
    var bestTotal = -1;
    properties.forEach(function (p, i) {
      if (!p || !p.scores) return;
      var total = scoreProperty(p.scores).total;
      if (total > bestTotal) {
        bestTotal = total;
        bestI = i;
      }
    });
    return bestTotal < 0 ? -1 : bestI;
  }

  function fmt(n, dp) {
    return Number(n).toLocaleString("de-CH", {
      maximumFractionDigits: dp == null ? 0 : dp,
    });
  }

  return {
    MAX_PROPERTIES: MAX_PROPERTIES,
    CATEGORIES: CATEGORIES,
    TOTAL_WEIGHT: TOTAL_WEIGHT,
    flatten: flatten,
    clamp: clamp,
    round2: round2,
    defaultScores: defaultScores,
    newProperty: newProperty,
    scoreProperty: scoreProperty,
    categoryScore: categoryScore,
    best: best,
    fmt: fmt,
  };
});