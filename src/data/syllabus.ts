export type Topic = {
  id: string;
  title: string;
  points: string[];
  resources: { label: string; note: string }[];
};

export type SyllabusSubject = {
  id: string;
  name: string;
  paper: "prelims" | "mains";
  blurb: string;
  topics: Topic[];
};

const t = (
  id: string,
  title: string,
  points: string[],
  resources: { label: string; note: string }[],
): Topic => ({ id, title, points, resources });

export const syllabus: SyllabusSubject[] = [
  {
    id: "history",
    name: "History",
    paper: "prelims",
    blurb: "Ancient, Medieval, Modern India and the freedom struggle.",
    topics: [
      t("hist-ancient", "Ancient India", [
        "Indus Valley Civilisation: town planning, trade, decline",
        "Vedic age, Mahajanapadas and rise of Magadha",
        "Buddhism, Jainism and heterodox sects",
        "Mauryan and Gupta administration, art and culture",
      ], [
        { label: "NCERT XI – Ancient India (RS Sharma)", note: "Foundation text" },
        { label: "Tamil Nadu Board History", note: "Great for art & culture" },
      ]),
      t("hist-medieval", "Medieval India", [
        "Delhi Sultanate: dynasties, administration, economy",
        "Vijayanagara and Bahmani kingdoms",
        "Mughal empire: polity, land revenue, decline",
        "Bhakti and Sufi movements",
      ], [{ label: "NCERT Themes in Indian History II", note: "Concept clarity" }]),
      t("hist-modern", "Modern India & Freedom Struggle", [
        "Advent of Europeans and British expansion",
        "Revolt of 1857 and its aftermath",
        "Moderates, Extremists, Revolutionaries",
        "Gandhian mass movements, Partition and Independence",
      ], [
        { label: "Spectrum – Modern India", note: "Most quoted source" },
        { label: "Bipan Chandra – India's Struggle", note: "Analysis for Mains" },
      ]),
      t("hist-culture", "Art & Culture", [
        "Temple architecture styles: Nagara, Dravida, Vesara",
        "Classical dance, music and theatre forms",
        "Painting schools: Mughal, Rajput, Pahari, folk",
        "UNESCO heritage sites and GI tags",
      ], [{ label: "Nitin Singhania – Indian Art & Culture", note: "Standard book" }]),
    ],
  },
  {
    id: "geography",
    name: "Geography",
    paper: "prelims",
    blurb: "Physical, Indian and World geography with map practice.",
    topics: [
      t("geo-physical", "Physical Geography", [
        "Geomorphology: plate tectonics, landforms, rock cycle",
        "Climatology: atmosphere, pressure belts, cyclones",
        "Oceanography: currents, salinity, coral reefs",
      ], [{ label: "GC Leong – Certificate Physical Geography", note: "Basics" }]),
      t("geo-india", "Indian Geography", [
        "Physiographic divisions and drainage systems",
        "Monsoon mechanism and climatic regions",
        "Soils, natural vegetation and agriculture",
        "Mineral and energy resources",
      ], [{ label: "NCERT XI & XII Geography", note: "Non-negotiable" }]),
      t("geo-world", "World Geography & Mapping", [
        "Continents, major mountain ranges and rivers",
        "Straits, seas and choke points in news",
        "Industrial regions and resource distribution",
      ], [{ label: "Oxford Student Atlas", note: "Daily 10-minute map drill" }]),
    ],
  },
  {
    id: "polity",
    name: "Polity",
    paper: "prelims",
    blurb: "Constitution, governance, institutions and rights issues.",
    topics: [
      t("pol-const", "Constitutional Framework", [
        "Making of the Constitution, Preamble, salient features",
        "Fundamental Rights, DPSP and Duties",
        "Amendment procedure and basic structure doctrine",
      ], [{ label: "Laxmikanth – Indian Polity", note: "Read 3 times" }]),
      t("pol-institutions", "Union & State Government", [
        "President, PM, Council of Ministers, Parliament",
        "Governor, Chief Minister, State legislature",
        "Judiciary: SC, HC, judicial review and activism",
      ], [{ label: "NCERT XI Political Science", note: "Conceptual base" }]),
      t("pol-governance", "Governance & Local Bodies", [
        "Panchayati Raj and urban local bodies",
        "Constitutional and statutory bodies",
        "RTI, Lokpal, e-governance, citizen charters",
      ], [{ label: "PRS Legislative Research", note: "Bill tracking" }]),
    ],
  },
  {
    id: "economy",
    name: "Economy",
    paper: "prelims",
    blurb: "Macroeconomics, budgeting, banking and development.",
    topics: [
      t("eco-basics", "Basic Concepts", [
        "National income accounting: GDP, GNP, NNP",
        "Inflation: types, measurement, control",
        "Money supply, monetary policy and RBI tools",
      ], [{ label: "Ramesh Singh / Sanjiv Verma", note: "Standard reference" }]),
      t("eco-fiscal", "Fiscal Policy & Budget", [
        "Union Budget structure and deficits",
        "Taxation: direct, indirect, GST framework",
        "FRBM Act and fiscal federalism",
      ], [{ label: "Economic Survey highlights", note: "Yearly must-read" }]),
      t("eco-sectors", "Sectors & Development", [
        "Agriculture: MSP, subsidies, marketing reforms",
        "Industry, MSMEs, PLI and infrastructure",
        "External sector: BoP, trade agreements, FDI",
      ], [{ label: "Mrunal economy lectures", note: "Concept simplification" }]),
    ],
  },
  {
    id: "environment",
    name: "Environment",
    paper: "prelims",
    blurb: "Ecology, biodiversity, climate change and conventions.",
    topics: [
      t("env-ecology", "Ecology & Ecosystems", [
        "Food chains, ecological pyramids, succession",
        "Biomes, wetlands and ecosystem services",
      ], [{ label: "Shankar IAS – Environment", note: "Compact & complete" }]),
      t("env-biodiversity", "Biodiversity & Conservation", [
        "Protected area network, biosphere reserves",
        "IUCN Red List, flagship species in news",
        "Wildlife Protection Act and CITES",
      ], [{ label: "MoEFCC annual report", note: "Data points" }]),
      t("env-climate", "Climate Change & Pollution", [
        "UNFCCC, Paris Agreement, COP outcomes",
        "Air, water and plastic pollution control norms",
        "Renewable energy missions and net-zero pathway",
      ], [{ label: "Down To Earth magazine", note: "Contemporary linkage" }]),
    ],
  },
  {
    id: "science-tech",
    name: "Science & Technology",
    paper: "prelims",
    blurb: "Applied science, space, defence, biotech and digital tech.",
    topics: [
      t("st-space", "Space & Defence", [
        "ISRO missions, launch vehicles, satellite types",
        "Missile programmes and defence acquisitions",
      ], [{ label: "ISRO & PIB releases", note: "Primary source" }]),
      t("st-bio", "Biotechnology & Health", [
        "Genetics, gene editing, vaccines platforms",
        "IPR in biotech, GM crops debate",
      ], [{ label: "NCERT XII Biology (select chapters)", note: "Base concepts" }]),
      t("st-digital", "Digital & Emerging Tech", [
        "AI, quantum computing, semiconductors",
        "Cyber security, blockchain, 5G/6G",
      ], [{ label: "PIB Science & Tech digest", note: "Weekly scan" }]),
    ],
  },
  {
    id: "current-affairs",
    name: "Current Affairs",
    paper: "prelims",
    blurb: "News-based static linkage, schemes, reports and indices.",
    topics: [
      t("ca-national", "National Affairs", [
        "Government schemes, policies and bills",
        "Committees, reports and their recommendations",
      ], [{ label: "The Hindu / Indian Express", note: "Daily 60 minutes" }]),
      t("ca-international", "International Relations", [
        "Bilateral summits, groupings and treaties",
        "India's neighbourhood and global institutions",
      ], [{ label: "MEA website briefings", note: "Authentic" }]),
      t("ca-reports", "Indices, Reports & Awards", [
        "Global indices and India's rank trends",
        "National awards, sports and personalities",
      ], [{ label: "Monthly compilation PDFs", note: "Revision friendly" }]),
    ],
  },
  {
    id: "essay",
    name: "Essay",
    paper: "mains",
    blurb: "250 marks of structured argumentation and expression.",
    topics: [
      t("essay-approach", "Approach & Structure", [
        "Brainstorming and mind-mapping the topic",
        "Introduction hooks, body flow, conclusion craft",
        "Multi-dimensional coverage: PESTLE framework",
      ], [{ label: "Toppers' essay copies", note: "Model structure" }]),
      t("essay-practice", "Practice & Themes", [
        "Philosophical and abstract topics",
        "Socio-economic and governance themes",
        "One essay per week with peer review",
      ], [{ label: "Previous year essay topics", note: "Practice set" }]),
    ],
  },
  {
    id: "gs1",
    name: "GS Paper I",
    paper: "mains",
    blurb: "Heritage, history, geography and Indian society.",
    topics: [
      t("gs1-history", "History & Heritage", [
        "Art forms, literature and architecture",
        "Modern Indian history and world history",
      ], [{ label: "Vision IAS value-add notes", note: "Answer material" }]),
      t("gs1-society", "Indian Society", [
        "Diversity, communalism, regionalism, secularism",
        "Women, population, urbanisation, globalisation",
      ], [{ label: "NCERT Sociology XI & XII", note: "Terminology" }]),
      t("gs1-geo", "Geography of the World", [
        "Resource distribution and industrial location",
        "Geophysical phenomena and their effects",
      ], [{ label: "NCERT Fundamentals of Geography", note: "Diagrams" }]),
    ],
  },
  {
    id: "gs2",
    name: "GS Paper II",
    paper: "mains",
    blurb: "Governance, Constitution, social justice and IR.",
    topics: [
      t("gs2-polity", "Polity & Governance", [
        "Separation of powers, federal issues, devolution",
        "Transparency, accountability and civil services",
      ], [{ label: "2nd ARC report summaries", note: "Quotable" }]),
      t("gs2-social", "Social Justice", [
        "Health, education and human resources",
        "Welfare schemes for vulnerable sections",
      ], [{ label: "Yojana & Kurukshetra", note: "Scheme depth" }]),
      t("gs2-ir", "International Relations", [
        "India and its neighbourhood, bilateral ties",
        "Global groupings, diaspora and institutions",
      ], [{ label: "Rajiv Sikri / IDSA articles", note: "Analytical depth" }]),
    ],
  },
  {
    id: "gs3",
    name: "GS Paper III",
    paper: "mains",
    blurb: "Economy, environment, security and technology.",
    topics: [
      t("gs3-economy", "Economic Development", [
        "Planning, growth, employment, inclusive growth",
        "Infrastructure, investment models, land reforms",
      ], [{ label: "Economic Survey", note: "Data & arguments" }]),
      t("gs3-agri", "Agriculture & Food Security", [
        "Cropping patterns, irrigation, storage, marketing",
        "PDS, buffer stocks, food processing",
      ], [{ label: "Agriculture Ministry reports", note: "Facts" }]),
      t("gs3-security", "Security & Disaster Management", [
        "Internal security challenges, LWE, cyber security",
        "Disaster management framework and NDMA guidelines",
      ], [{ label: "NDMA guidelines", note: "Case studies" }]),
    ],
  },
  {
    id: "gs4",
    name: "GS Paper IV",
    paper: "mains",
    blurb: "Ethics, integrity and aptitude with case studies.",
    topics: [
      t("gs4-theory", "Ethics Theory", [
        "Ethics, values, attitude and emotional intelligence",
        "Thinkers and moral philosophers",
        "Probity in governance and codes of conduct",
      ], [{ label: "Lexicon for Ethics", note: "Definitions" }]),
      t("gs4-case", "Case Studies", [
        "Stakeholder identification and options analysis",
        "Balancing legality, ethics and practicality",
        "Practice 2 case studies weekly",
      ], [{ label: "Previous year case studies", note: "Best practice" }]),
    ],
  },
  {
    id: "optional",
    name: "Optional Subjects",
    paper: "mains",
    blurb: "500 marks that often decide the final rank.",
    topics: [
      t("opt-choose", "Choosing Your Optional", [
        "Interest, background and material availability",
        "Overlap with GS papers and scoring trends",
      ], [{ label: "Topper interviews", note: "Decision help" }]),
      t("opt-prep", "Preparation Strategy", [
        "Syllabus-wise notes and answer frameworks",
        "Paper 1 and Paper 2 balance, test series",
      ], [{ label: "Optional-specific test series", note: "Feedback loop" }]),
    ],
  },
];

export const prelimsSubjects = syllabus.filter((s) => s.paper === "prelims");
export const mainsSubjects = syllabus.filter((s) => s.paper === "mains");
export const allTopicIds = syllabus.flatMap((s) => s.topics.map((t) => t.id));