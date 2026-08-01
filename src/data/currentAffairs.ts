export type NewsItem = {
  id: string;
  date: string;
  category: "National" | "International" | "Economy" | "Environment" | "Sci-Tech";
  title: string;
  summary: string;
  prelimsPointer: string;
  mainsAngle: string;
};

export const currentAffairs: NewsItem[] = [
  { id: "ca-1", date: "2026-07-31", category: "Economy", title: "Monetary Policy Committee holds repo rate steady", summary: "The MPC kept the policy repo rate unchanged, citing durable disinflation alongside resilient growth, and retained a neutral stance.", prelimsPointer: "Composition of the MPC, repo vs reverse repo, inflation targeting band of 4% ±2%.", mainsAngle: "Balancing growth and price stability in a rate-cut cycle; transmission to bank lending rates." },
  { id: "ca-2", date: "2026-07-30", category: "Environment", title: "New Ramsar sites notified, wetland tally rises", summary: "India added new wetlands to the Ramsar list, strengthening the wise-use framework for migratory bird habitats.", prelimsPointer: "Ramsar Convention 1971, Montreux Record, wetland classification.", mainsAngle: "Wetlands as urban flood buffers and carbon sinks; enforcement gaps in Wetland Rules 2017." },
  { id: "ca-3", date: "2026-07-29", category: "International", title: "India deepens maritime cooperation in the Indian Ocean", summary: "A new maritime security framework was announced with littoral partners, covering white shipping data and joint patrols.", prelimsPointer: "IORA, SAGAR, Colombo Security Conclave members.", mainsAngle: "Securing sea lanes of communication amid rising strategic competition." },
  { id: "ca-4", date: "2026-07-28", category: "Sci-Tech", title: "Indigenous semiconductor fabrication unit begins pilot production", summary: "The first pilot wafers rolled out under the India Semiconductor Mission, marking a milestone in supply-chain resilience.", prelimsPointer: "India Semiconductor Mission, PLI scheme sectors, ATMP vs fabrication.", mainsAngle: "Strategic autonomy in critical technologies and the skilled workforce challenge." },
  { id: "ca-5", date: "2026-07-27", category: "National", title: "Parliament passes amendments to strengthen local body finances", summary: "The amendment enables direct devolution to urban local bodies with performance-linked grants.", prelimsPointer: "74th Amendment, State Finance Commissions, 12th Schedule subjects.", mainsAngle: "Fiscal empowerment of the third tier as a precondition for effective urban governance." },
  { id: "ca-6", date: "2026-07-26", category: "Economy", title: "Export diversification pushes services trade to a new high", summary: "Services exports outpaced merchandise growth, led by GCCs, professional services and digital delivery.", prelimsPointer: "Balance of Payments components, current account deficit drivers.", mainsAngle: "Can services-led growth substitute for manufacturing in employment generation?" },
  { id: "ca-7", date: "2026-07-25", category: "Environment", title: "Heat action plans made mandatory for large cities", summary: "Cities above a population threshold must publish heat action plans with cooling shelters and work-hour advisories.", prelimsPointer: "NDMA guidelines, urban heat island effect, wet-bulb temperature.", mainsAngle: "Climate adaptation as a public health and labour productivity imperative." },
  { id: "ca-8", date: "2026-07-24", category: "National", title: "Digital public infrastructure expands to agriculture credit", summary: "A unified farmer registry now links land records with credit and insurance rails.", prelimsPointer: "AgriStack, Kisan Credit Card, PM-FASAL insurance framework.", mainsAngle: "Data governance and consent architecture in DPI-led welfare delivery." },
];

export const monthlyCompilations = [
  { id: "mc-1", month: "July 2026", pages: 88, highlights: "Budget follow-ups, monsoon session bills, climate finance." },
  { id: "mc-2", month: "June 2026", pages: 82, highlights: "G20 sherpa track, semiconductor mission, RBI policy." },
  { id: "mc-3", month: "May 2026", pages: 76, highlights: "Election reforms, heat waves, defence acquisitions." },
  { id: "mc-4", month: "April 2026", pages: 79, highlights: "Trade agreements, health indices, space missions." },
];

export const editorials = [
  { id: "ed-1", title: "Federalism and the fiscal question", source: "National Daily", takeaway: "Vertical devolution debate ahead of the next Finance Commission." },
  { id: "ed-2", title: "The employment elasticity puzzle", source: "Business Daily", takeaway: "Growth without proportional job creation and the manufacturing gap." },
  { id: "ed-3", title: "Adapting cities to a hotter decade", source: "Environment Weekly", takeaway: "Adaptation finance and municipal capacity are the binding constraints." },
];