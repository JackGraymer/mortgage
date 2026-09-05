/**
 * Alpine component for the interactive purchase checklist.
 * State (checkboxes) persists in localStorage and survives page reloads /
 * within-browser instant navigation.
 */
const CHECKLIST_STORAGE_KEY = "ch-checklist-v1";

const CHECKLIST_GROUPS = [
  {
    id: "before",
    title: "Before you start",
    items: [
      { id: "before-budget", text: "Check your budget: total affordable price (20% equity, 33% affordability rule)" },
      { id: "before-docs", text: "Gather financial documents (tax returns, salary statements, asset statements, debt register extract)" },
      { id: "before-eligibility", text: "Verify eligibility (residence permit, Lex Koller if applicable)" },
      { id: "before-pension", text: "Check your Pillar 2/3a balances and withdrawal/pledge conditions" },
      { id: "before-region", text: "Decide on target region/canton (taxes, commute, schools, lifestyle)" },
    ],
  },
  {
    id: "financing",
    title: "Financing",
    items: [
      { id: "fin-preapproval", text: "Get mortgage pre-approval from at least 2–3 banks or a broker" },
      { id: "fin-hardcash", text: "Confirm hard cash equity (10%) is available and liquid" },
      { id: "fin-pension-strategy", text: "Decide on Pillar 2 / Pillar 3a strategy (withdraw vs. pledge)" },
      { id: "fin-stress-test", text: "Understand the stress test (5% interest on full mortgage) and whether you pass" },
      { id: "fin-rate", text: "Compare fixed-rate vs. SARON options and consider a split mortgage" },
      { id: "fin-employer", text: "Check if your employer offers preferential mortgage rates" },
      { id: "fin-valuation", text: "Get a bank valuation indication for your target price range" },
    ],
  },
  {
    id: "search",
    title: "During the search",
    items: [
      { id: "search-visits", text: "Visit properties in person (multiple times, different times of day)" },
      { id: "search-scorecard", text: "Score and compare visited properties with the Viewing Scorecard" },
      { id: "search-docs", text: "Request property documents: Grundbuchauszug (land register extract), floor plans, building-permit history, GEAK/CECB energy certificate" },
      { id: "search-zoning", text: "Check zoning (Zonenplan) and any planned developments nearby" },
      { id: "search-inspection", text: "Commission a building inspection if the property is older (structure, roof, heating, plumbing, electrical, asbestos, radon)" },
      { id: "search-liens", text: "Check for outstanding liens or easements (Dienstbarkeiten)" },
      { id: "search-hazard", text: "Verify the property is not in a hazard zone (avalanche, flood, rockfall — check cantonal hazard maps)" },
      { id: "search-condo", text: "For condos (Stockwerkeigentum): review the Verwaltungsreglement, renovation fund balance, upcoming special assessments" },
      { id: "search-noise", text: "Check noise exposure (traffic, rail, aircraft — Lärmempfindlichkeitsstufen)" },
      { id: "search-reno", text: "Estimate renovation/energy upgrade costs (heating replacement, insulation, windows, solar)" },
    ],
  },
  {
    id: "closing",
    title: "Closing",
    items: [
      { id: "close-reservation", text: "Sign reservation agreement with deposit (ensure financing is confirmed first)" },
      { id: "close-deed", text: "Review the notarial deed with a lawyer or trusted advisor (optional but recommended)" },
      { id: "close-insurance", text: "Arrange property insurance (building insurance is mandatory in all cantons — cantonal monopoly or private)" },
      { id: "close-funds", text: "Prepare funds for closing costs (notary, land register, transfer tax, mortgage setup, valuation)" },
      { id: "close-utilities", text: "Schedule utility transfers (electricity, gas, water, internet, waste)" },
      { id: "close-register", text: "Notify your municipality of the change of address (Einwohnerkontrolle)" },
      { id: "close-mail", text: "Order mail forwarding (Post)" },
      { id: "close-handover", text: "For condos: confirm handover of keys, garage/parking, cellar, common areas" },
    ],
  },
  {
    id: "after",
    title: "After purchase",
    items: [
      { id: "after-register", text: "Register at the municipality (Einwohnerkontrolle) within 14 days" },
      { id: "after-tax", text: "File tax returns including the new property (imputed rental value, mortgage interest, maintenance)" },
      { id: "after-amortization", text: "Set up amortization payments for the 2nd mortgage (direct or indirect via Pillar 3a)" },
      { id: "after-renewal", text: "Review mortgage renewal terms 3–6 months before expiry" },
      { id: "after-receipts", text: "Keep all receipts for value-enhancing investments (Anlagekosten) for future gains tax" },
      { id: "after-energy", text: "Plan energy upgrades if GEAK/CECB is D or worse (cantonal deadlines may apply)" },
      { id: "after-estate", text: "Update your will/estate plan to reflect the new asset" },
      { id: "after-insurance", text: "Consider household insurance (Hausratversicherung) and liability insurance (Privathaftpflicht)" },
    ],
  },
];

function checklistApp() {
  return {
    groups: CHECKLIST_GROUPS,
    checked: {},

    get total() {
      return this.groups.reduce((n, g) => n + g.items.length, 0);
    },
    get done() {
      return this.groups.reduce((n, g) => n + g.items.filter((i) => this.checked[i.id]).length, 0);
    },

    init() {
      try {
        const saved = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || "{}");
        if (saved && typeof saved === "object") this.checked = saved;
      } catch (e) {
        this.checked = {};
      }
    },

    group(id) {
      return this.groups.find((g) => g.id === id);
    },
    groupDone(gid) {
      const g = this.group(gid);
      return g ? g.items.filter((i) => this.checked[i.id]).length : 0;
    },

    toggle(id) {
      this.checked[id] = !this.checked[id];
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(this.checked));
      } catch (e) {
        /* storage unavailable — session only */
      }
    },

    reset() {
      this.checked = {};
      try {
        localStorage.removeItem(CHECKLIST_STORAGE_KEY);
      } catch (e) {
        /* ignore */
      }
    },
  };
}

window.checklistApp = checklistApp;