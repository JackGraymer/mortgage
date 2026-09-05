/**
 * Alpine component for the house-viewing scorecard.
 * State (candidates + scores) persists in localStorage. Depends on
 * scorecard-core.js (window.scorecardCore) and Alpine.js.
 */
const SCORECARD_STORAGE_KEY = "ch-scorecard-v1";

function scorecardApp() {
  return {
    core: window.scorecardCore,
    properties: [],
    newName: "",

    get max() {
      return this.core.MAX_PROPERTIES;
    },
    get categories() {
      return this.core.CATEGORIES;
    },
    get canAdd() {
      return this.properties.length < this.core.MAX_PROPERTIES;
    },
    get bestIndex() {
      return this.core.best(this.properties);
    },

    init() {
      try {
        const saved = JSON.parse(localStorage.getItem(SCORECARD_STORAGE_KEY) || "null");
        if (
          Array.isArray(saved) &&
          saved.length > 0 &&
          saved.every((p) => p && p.scores)
        ) {
          this.properties = saved;
          return;
        }
      } catch (e) {
        /* fall through to seed */
      }
      this.properties = [
        this.core.newProperty("Candidate 1"),
        this.core.newProperty("Candidate 2"),
      ];
    },

    save() {
      try {
        localStorage.setItem(SCORECARD_STORAGE_KEY, JSON.stringify(this.properties));
      } catch (e) {
        /* storage unavailable — session only */
      }
    },

    add() {
      if (!this.canAdd) return;
      const name = (this.newName || "").trim() || "Candidate " + (this.properties.length + 1);
      this.properties.push(this.core.newProperty(name));
      this.newName = "";
      this.save();
    },

    remove(i) {
      if (this.properties.length <= 1) return;
      this.properties.splice(i, 1);
      this.save();
    },

    reset() {
      this.properties = [
        this.core.newProperty("Candidate 1"),
        this.core.newProperty("Candidate 2"),
      ];
      this.newName = "";
      this.save();
    },

    score(p) {
      return this.core.scoreProperty(p.scores);
    },
    catScore(p, c) {
      return this.core.categoryScore(p.scores, c);
    },

    print() {
      window.print();
    },
  };
}

window.scorecardApp = scorecardApp;

// Re-initialize Alpine tree on instant navigation if needed
if (typeof window !== "undefined") {
  const initAlpineOnPageLoad = () => {
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