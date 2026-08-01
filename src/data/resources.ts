export type ResourceType =
  | "NCERT"
  | "Reference Book"
  | "Notes"
  | "PYQ"
  | "Current Affairs"
  | "Revision";

export type Resource = {
  id: string;
  title: string;
  author: string;
  type: ResourceType;
  subject: string;
  year: string;
  pages: number;
  summary: string;
};

export const resourceTypes: ResourceType[] = [
  "NCERT",
  "Reference Book",
  "Notes",
  "PYQ",
  "Current Affairs",
  "Revision",
];

export const resources: Resource[] = [
  { id: "r1", title: "NCERT Class VI–XII History Compilation", author: "NCERT", type: "NCERT", subject: "History", year: "2024", pages: 812, summary: "Chapter-wise consolidated NCERT history text with highlighted timelines." },
  { id: "r2", title: "NCERT Geography XI & XII", author: "NCERT", type: "NCERT", subject: "Geography", year: "2024", pages: 540, summary: "Physical and human geography fundamentals with map exercises." },
  { id: "r3", title: "NCERT Political Science XI & XII", author: "NCERT", type: "NCERT", subject: "Polity", year: "2023", pages: 430, summary: "Constitution at work and contemporary world politics." },
  { id: "r4", title: "Indian Polity", author: "M. Laxmikanth", type: "Reference Book", subject: "Polity", year: "2025", pages: 900, summary: "The definitive polity reference with updated amendments and case laws." },
  { id: "r5", title: "A Brief History of Modern India", author: "Spectrum", type: "Reference Book", subject: "History", year: "2025", pages: 620, summary: "Freedom struggle coverage tuned to the UPSC question pattern." },
  { id: "r6", title: "Indian Economy", author: "Ramesh Singh", type: "Reference Book", subject: "Economy", year: "2025", pages: 760, summary: "Macro concepts, budget, banking and external sector explained simply." },
  { id: "r7", title: "Environment & Ecology", author: "Shankar IAS", type: "Reference Book", subject: "Environment", year: "2025", pages: 480, summary: "Compact coverage of ecology, biodiversity and climate conventions." },
  { id: "r8", title: "Certificate Physical & Human Geography", author: "G.C. Leong", type: "Reference Book", subject: "Geography", year: "2023", pages: 400, summary: "Classic text for climatology and landform concepts." },
  { id: "r9", title: "Polity Micro Notes", author: "Community Notes", type: "Notes", subject: "Polity", year: "2025", pages: 96, summary: "One-page-per-article condensed notes for last-mile revision." },
  { id: "r10", title: "Modern History Timeline Notes", author: "Community Notes", type: "Notes", subject: "History", year: "2025", pages: 64, summary: "1757 to 1947 in a single scrollable timeline with events tagged." },
  { id: "r11", title: "Economy Terminology Sheet", author: "Community Notes", type: "Notes", subject: "Economy", year: "2025", pages: 42, summary: "300 economy terms with one-line definitions and examples." },
  { id: "r12", title: "Prelims PYQ 2015–2025 (GS Paper I)", author: "UPSC", type: "PYQ", subject: "General Studies", year: "2025", pages: 320, summary: "Decade of prelims questions with official answer keys." },
  { id: "r13", title: "Mains PYQ GS I–IV (2013–2025)", author: "UPSC", type: "PYQ", subject: "General Studies", year: "2025", pages: 210, summary: "Topic-sorted mains questions for answer-writing practice." },
  { id: "r14", title: "CSAT PYQ Collection", author: "UPSC", type: "PYQ", subject: "CSAT", year: "2024", pages: 180, summary: "Comprehension, reasoning and numeracy questions with solutions." },
  { id: "r15", title: "Monthly Current Affairs — July", author: "Editorial Desk", type: "Current Affairs", subject: "Current Affairs", year: "2026", pages: 88, summary: "Curated national, international, economy and environment updates." },
  { id: "r16", title: "Yearly Current Affairs Compendium", author: "Editorial Desk", type: "Current Affairs", subject: "Current Affairs", year: "2025", pages: 460, summary: "Full-year compilation with schemes, indices and reports." },
  { id: "r17", title: "Editorial Analysis Digest", author: "Editorial Desk", type: "Current Affairs", subject: "Current Affairs", year: "2026", pages: 120, summary: "Argument maps from major national dailies for mains value addition." },
  { id: "r18", title: "Prelims 60-Day Revision Planner", author: "Study Desk", type: "Revision", subject: "General Studies", year: "2026", pages: 30, summary: "Day-wise revision plan with micro-tests and buffer days." },
  { id: "r19", title: "Maps & Places in News", author: "Study Desk", type: "Revision", subject: "Geography", year: "2026", pages: 54, summary: "Every place that appeared in news, plotted and annotated." },
  { id: "r20", title: "Ethics Case Study Frameworks", author: "Study Desk", type: "Revision", subject: "Ethics", year: "2025", pages: 48, summary: "Reusable frameworks and vocabulary for GS-IV case studies." },
];

export const resourceSubjects = Array.from(new Set(resources.map((r) => r.subject))).sort();
export const resourceYears = Array.from(new Set(resources.map((r) => r.year))).sort().reverse();