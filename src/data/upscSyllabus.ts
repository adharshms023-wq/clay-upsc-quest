/**
 * UPSC syllabus tree derived from the official Civil Services Examination
 * notification (Section-III, Part-A Preliminary + Part-B Main Examination).
 * Scope: Prelims Paper I & II and Mains Essay + GS I-IV.
 */

export type Difficulty = "Easy" | "Medium" | "Hard" | "UPSC Standard";

export type SyllabusTopic = {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  difficulty: Difficulty;
  estimatedHours: number;
};

export type SyllabusModule = {
  id: string;
  name: string;
  topics: SyllabusTopic[];
};

export type SyllabusSubject = {
  id: string;
  name: string;
  stage: "prelims" | "mains";
  paper: string;
  blurb: string;
  modules: SyllabusModule[];
};

const t = (
  id: string,
  name: string,
  description: string,
  keywords: string[],
  difficulty: Difficulty = "UPSC Standard",
  estimatedHours = 6,
): SyllabusTopic => ({ id, name, description, keywords, difficulty, estimatedHours });

export const upscSyllabus: SyllabusSubject[] = [
  {
    id: "p1-current-events",
    name: "Current Events of National & International Importance",
    stage: "prelims",
    paper: "Prelims Paper I",
    blurb: "Contemporary developments with static linkage.",
    modules: [
      {
        id: "p1-ce-national",
        name: "National Affairs",
        topics: [
          t("p1-ce-schemes", "Government Schemes & Policies", "Flagship central and state schemes, their objectives, coverage and implementation issues.", ["schemes", "policy", "welfare", "mission"]),
          t("p1-ce-bills", "Bills, Acts & Committees", "Recent legislation, ordinances, committee reports and their recommendations.", ["bill", "act", "committee", "report"]),
        ],
      },
      {
        id: "p1-ce-international",
        name: "International Affairs",
        topics: [
          t("p1-ce-summits", "Summits, Groupings & Treaties", "Bilateral and multilateral engagements, groupings such as G20, BRICS, QUAD, SCO and key treaties.", ["G20", "BRICS", "QUAD", "treaty", "summit"]),
          t("p1-ce-indices", "Global Indices, Reports & Awards", "Major international indices, publishing agencies and India's rank trends.", ["index", "rank", "UN", "report", "award"], "Easy", 3),
        ],
      },
    ],
  },
  {
    id: "p1-history",
    name: "History of India and Indian National Movement",
    stage: "prelims",
    paper: "Prelims Paper I",
    blurb: "Ancient, medieval and modern India with the freedom struggle.",
    modules: [
      {
        id: "p1-hist-ancient",
        name: "Ancient India",
        topics: [
          t("p1-hist-ivc", "Indus Valley Civilisation", "Town planning, economy, seals, script, decline and major sites.", ["Harappa", "Mohenjodaro", "Lothal", "Dholavira"], "Medium", 5),
          t("p1-hist-vedic", "Vedic Age & Mahajanapadas", "Early and later Vedic society, polity, economy and the rise of Magadha.", ["Rig Veda", "Mahajanapada", "Magadha"], "Medium", 5),
          t("p1-hist-religion", "Buddhism, Jainism & Heterodox Sects", "Doctrines, councils, schisms, patrons and literature.", ["Buddha", "Mahavira", "sangha", "councils"]),
          t("p1-hist-empires", "Mauryan, Post-Mauryan & Gupta Age", "Administration, inscriptions, art, trade and cultural achievements.", ["Ashoka", "Kushana", "Gupta", "Sangam"]),
        ],
      },
      {
        id: "p1-hist-medieval",
        name: "Medieval India",
        topics: [
          t("p1-hist-sultanate", "Delhi Sultanate", "Dynasties, administrative innovations, market reforms and architecture.", ["Khalji", "Tughlaq", "iqta"]),
          t("p1-hist-vijayanagara", "Vijayanagara, Bahmani & Regional Kingdoms", "Political history, administration, temple economy and foreign accounts.", ["Vijayanagara", "Bahmani", "Krishnadevaraya"], "Medium", 4),
          t("p1-hist-mughal", "Mughal Empire", "Polity, mansabdari, land revenue, religious policy and decline.", ["Akbar", "mansabdar", "zabt", "Aurangzeb"]),
          t("p1-hist-bhakti", "Bhakti & Sufi Movements", "Saints, orders, regional literature and social impact.", ["Kabir", "Chishti", "Nirguna", "Alvars"], "Medium", 4),
        ],
      },
      {
        id: "p1-hist-modern",
        name: "Modern India & the National Movement",
        topics: [
          t("p1-hist-british", "Advent of Europeans & British Expansion", "Trading companies, Carnatic and Anglo-Maratha wars, subsidiary alliance and doctrine of lapse.", ["East India Company", "Plassey", "Buxar"]),
          t("p1-hist-1857", "Revolt of 1857 & Its Aftermath", "Causes, centres, leaders, suppression and constitutional consequences.", ["1857", "Mangal Pandey", "Queen's Proclamation"], "Medium", 4),
          t("p1-hist-inm", "Moderates, Extremists & Revolutionaries", "Formation of Congress, Swadeshi movement, revolutionary nationalism.", ["INC", "Swadeshi", "Ghadar", "HSRA"]),
          t("p1-hist-gandhi", "Gandhian Era to Independence", "Non-Cooperation, Civil Disobedience, Quit India, partition and transfer of power.", ["Gandhi", "Quit India", "Cabinet Mission"]),
          t("p1-hist-culture", "Art, Architecture & Culture", "Temple styles, painting schools, classical dance, music and heritage sites.", ["Nagara", "Dravida", "Pahari", "UNESCO"]),
        ],
      },
    ],
  },
  {
    id: "p1-geography",
    name: "Indian and World Geography",
    stage: "prelims",
    paper: "Prelims Paper I",
    blurb: "Physical, social and economic geography of India and the world.",
    modules: [
      {
        id: "p1-geo-physical",
        name: "Physical Geography",
        topics: [
          t("p1-geo-geomorph", "Geomorphology", "Interior of the earth, plate tectonics, landforms and rock cycle.", ["plate tectonics", "volcano", "fold", "fault"]),
          t("p1-geo-climate", "Climatology", "Atmosphere, insolation, pressure belts, winds, cyclones and climate classification.", ["jet stream", "cyclone", "El Nino", "monsoon"]),
          t("p1-geo-ocean", "Oceanography", "Ocean currents, salinity, tides, coral reefs and marine resources.", ["currents", "salinity", "coral", "tides"], "Medium", 4),
        ],
      },
      {
        id: "p1-geo-india",
        name: "Geography of India",
        topics: [
          t("p1-geo-physio", "Physiography & Drainage", "Physiographic divisions, Himalayan and peninsular river systems.", ["Himalaya", "Deccan", "drainage", "rivers"]),
          t("p1-geo-monsoon", "Indian Climate & Monsoon", "Monsoon mechanism, rainfall distribution and climatic regions.", ["monsoon", "rainfall", "ITCZ"], "Medium", 4),
          t("p1-geo-resources", "Soils, Vegetation & Agriculture", "Soil types, forest cover, cropping patterns and agro-climatic zones.", ["alluvial", "black soil", "cropping"], "Medium", 5),
          t("p1-geo-economic", "Industry, Minerals & Transport", "Mineral belts, industrial location factors, energy and transport networks.", ["minerals", "industry", "corridor"]),
        ],
      },
      {
        id: "p1-geo-world",
        name: "World Geography & Mapping",
        topics: [
          t("p1-geo-worldmap", "Continents, Ranges & Water Bodies", "Major mountains, rivers, deserts, straits and choke points in the news.", ["strait", "canal", "range", "map"], "Medium", 4),
          t("p1-geo-resource-dist", "Distribution of Natural Resources", "Global distribution of key resources and industrial regions.", ["resources", "industrial region", "trade"]),
        ],
      },
    ],
  },
  {
    id: "p1-polity",
    name: "Indian Polity and Governance",
    stage: "prelims",
    paper: "Prelims Paper I",
    blurb: "Constitution, political system, Panchayati Raj, public policy and rights issues.",
    modules: [
      {
        id: "p1-pol-constitution",
        name: "Constitutional Framework",
        topics: [
          t("p1-pol-making", "Making of the Constitution & Preamble", "Constituent Assembly, sources, Preamble and salient features.", ["Constituent Assembly", "Preamble", "features"], "Easy", 3),
          t("p1-pol-fr", "Fundamental Rights, DPSP & Duties", "Parts III, IV and IV-A, writs and landmark judgments.", ["Article 21", "writ", "DPSP", "duties"]),
          t("p1-pol-amend", "Amendment & Basic Structure", "Article 368, key amendments and the basic structure doctrine.", ["368", "Kesavananda", "amendment"]),
        ],
      },
      {
        id: "p1-pol-institutions",
        name: "Union, State & Judiciary",
        topics: [
          t("p1-pol-union", "Union Executive & Parliament", "President, PM, Council of Ministers, parliamentary procedures and committees.", ["Parliament", "money bill", "committee"]),
          t("p1-pol-state", "State Government & Federalism", "Governor, state legislature, centre-state relations and inter-state councils.", ["Governor", "federal", "Article 356"]),
          t("p1-pol-judiciary", "Judiciary", "Supreme Court, High Courts, judicial review, PIL and tribunals.", ["Supreme Court", "PIL", "tribunal"]),
        ],
      },
      {
        id: "p1-pol-governance",
        name: "Governance, Local Bodies & Rights",
        topics: [
          t("p1-pol-panchayat", "Panchayati Raj & Urban Local Bodies", "73rd and 74th Amendments, PESA and municipal governance.", ["73rd", "74th", "PESA", "municipality"], "Medium", 4),
          t("p1-pol-bodies", "Constitutional & Statutory Bodies", "ECI, CAG, UPSC, Finance Commission, NHRC, CIC and other bodies.", ["ECI", "CAG", "NHRC", "Finance Commission"]),
          t("p1-pol-rights", "Rights Issues & Public Policy", "RTI, RTE, human rights institutions, transparency and accountability tools.", ["RTI", "Lokpal", "rights"], "Medium", 4),
        ],
      },
    ],
  },
  {
    id: "p1-economy",
    name: "Economic and Social Development",
    stage: "prelims",
    paper: "Prelims Paper I",
    blurb: "Sustainable development, poverty, inclusion, demographics and social sector initiatives.",
    modules: [
      {
        id: "p1-eco-basics",
        name: "Core Macroeconomics",
        topics: [
          t("p1-eco-national-income", "National Income & Growth", "GDP, GNP, NNP, deflators, base year revision and growth measurement.", ["GDP", "GVA", "deflator"], "Medium", 4),
          t("p1-eco-inflation", "Inflation & Monetary Policy", "Types and measurement of inflation, RBI tools, MPC and inflation targeting.", ["CPI", "WPI", "repo", "MPC"]),
          t("p1-eco-banking", "Banking & Financial Markets", "Banking structure, NPAs, capital markets, regulators and financial inclusion.", ["NPA", "SEBI", "IBC", "UPI"]),
        ],
      },
      {
        id: "p1-eco-fiscal",
        name: "Public Finance & External Sector",
        topics: [
          t("p1-eco-budget", "Budget, Taxation & Fiscal Policy", "Budget documents, deficits, GST, FRBM and fiscal federalism.", ["budget", "GST", "FRBM", "deficit"]),
          t("p1-eco-external", "External Sector", "Balance of payments, exchange rate, FDI/FPI, trade agreements and WTO.", ["BoP", "FDI", "WTO", "rupee"]),
        ],
      },
      {
        id: "p1-eco-social",
        name: "Social Development & Inclusion",
        topics: [
          t("p1-eco-poverty", "Poverty, Inequality & Employment", "Poverty estimation committees, unemployment types and surveys.", ["poverty line", "PLFS", "MGNREGA"], "Medium", 4),
          t("p1-eco-demography", "Demographics & Human Development", "Census, demographic dividend, health and education indicators.", ["census", "HDI", "NFHS"], "Medium", 4),
          t("p1-eco-sustainable", "Sustainable Development & SDGs", "SDG framework, inclusive growth and social sector initiatives.", ["SDG", "inclusive growth"], "Medium", 3),
        ],
      },
    ],
  },
  {
    id: "p1-environment",
    name: "Environmental Ecology, Bio-diversity and Climate Change",
    stage: "prelims",
    paper: "Prelims Paper I",
    blurb: "General issues that do not require subject specialisation.",
    modules: [
      {
        id: "p1-env-ecology",
        name: "Ecology & Ecosystems",
        topics: [
          t("p1-env-basics", "Ecosystem Fundamentals", "Food chains, trophic levels, ecological pyramids, succession and services.", ["trophic", "succession", "ecosystem"], "Easy", 3),
          t("p1-env-biodiv", "Biodiversity & Conservation", "Protected areas, biosphere reserves, IUCN status and conservation projects.", ["IUCN", "tiger reserve", "Ramsar"]),
        ],
      },
      {
        id: "p1-env-climate",
        name: "Climate Change & Pollution",
        topics: [
          t("p1-env-climate-change", "Climate Change & Conventions", "UNFCCC, Kyoto, Paris Agreement, COP outcomes and India's commitments.", ["UNFCCC", "Paris", "COP", "net zero"]),
          t("p1-env-pollution", "Pollution & Environmental Governance", "Air, water, plastic and e-waste norms, EIA and regulatory bodies.", ["EIA", "CPCB", "NGT", "AQI"]),
        ],
      },
    ],
  },
  {
    id: "p1-science",
    name: "General Science",
    stage: "prelims",
    paper: "Prelims Paper I",
    blurb: "Applied science and technology relevant to current developments.",
    modules: [
      {
        id: "p1-sci-basic",
        name: "Basic Sciences",
        topics: [
          t("p1-sci-physics", "Physics & Chemistry Applications", "Everyday applications, materials, radiation and measurement concepts.", ["physics", "chemistry", "materials"], "Medium", 4),
          t("p1-sci-biology", "Biology & Human Health", "Cell biology, genetics, nutrition, diseases and public health.", ["genetics", "vaccine", "disease"], "Medium", 4),
        ],
      },
      {
        id: "p1-sci-tech",
        name: "Science & Technology in News",
        topics: [
          t("p1-sci-space", "Space & Defence Technology", "ISRO missions, launch vehicles, satellites and defence systems.", ["ISRO", "satellite", "missile"]),
          t("p1-sci-emerging", "Biotechnology & Emerging Technology", "Gene editing, AI, semiconductors, quantum computing and cyber security.", ["CRISPR", "AI", "quantum", "semiconductor"]),
        ],
      },
    ],
  },
  {
    id: "p2-csat",
    name: "CSAT — Aptitude & Comprehension",
    stage: "prelims",
    paper: "Prelims Paper II",
    blurb: "Qualifying paper on comprehension, reasoning and basic numeracy.",
    modules: [
      {
        id: "p2-csat-verbal",
        name: "Comprehension & Interpersonal Skills",
        topics: [
          t("p2-comprehension", "Comprehension", "Passage-based reading, inference and tone identification.", ["passage", "inference"], "Medium", 4),
          t("p2-interpersonal", "Interpersonal & Communication Skills", "Situational judgement and communication effectiveness.", ["communication", "situational"], "Easy", 2),
        ],
      },
      {
        id: "p2-csat-reasoning",
        name: "Reasoning & Numeracy",
        topics: [
          t("p2-logical", "Logical Reasoning & Analytical Ability", "Syllogisms, arrangements, blood relations, coding-decoding and puzzles.", ["syllogism", "puzzle", "arrangement"], "Medium", 5),
          t("p2-decision", "Decision-Making & Problem-Solving", "Administrative situations with best-course-of-action choices.", ["decision", "problem solving"], "Easy", 2),
          t("p2-numeracy", "Basic Numeracy (Class X level)", "Numbers, ratios, percentages, time-speed-distance and mensuration.", ["numeracy", "percentage", "ratio"], "Medium", 5),
          t("p2-di", "Data Interpretation (Class X level)", "Charts, graphs, tables and data sufficiency.", ["charts", "graphs", "data sufficiency"], "Medium", 4),
        ],
      },
    ],
  },
  {
    id: "mains-essay",
    name: "Essay",
    stage: "mains",
    paper: "Mains Paper I",
    blurb: "Essay on a specific topic with orderly arrangement of ideas and concise expression.",
    modules: [
      {
        id: "mains-essay-craft",
        name: "Essay Craft",
        topics: [
          t("mains-essay-structure", "Structure & Expression", "Brainstorming, introductions, argument flow, conclusions and exact expression.", ["essay", "structure", "expression"], "Medium", 4),
          t("mains-essay-themes", "Philosophical & Contemporary Themes", "Abstract, socio-economic, governance and technology themes.", ["philosophical", "abstract", "governance"]),
        ],
      },
    ],
  },
  {
    id: "mains-gs1",
    name: "GS Paper I — Heritage, History, Geography & Society",
    stage: "mains",
    paper: "Mains Paper II",
    blurb: "Indian heritage and culture, history and geography of the world and society.",
    modules: [
      {
        id: "gs1-culture",
        name: "Indian Heritage & Culture",
        topics: [
          t("gs1-artforms", "Art Forms, Literature & Architecture", "Salient aspects of Indian art, literature and architecture from ancient to modern times.", ["art", "architecture", "literature"]),
        ],
      },
      {
        id: "gs1-history",
        name: "Modern Indian & World History",
        topics: [
          t("gs1-modern", "Modern Indian History (mid-18th century onwards)", "Significant events, personalities and issues.", ["modern India", "personalities"]),
          t("gs1-freedom", "The Freedom Struggle", "Stages and contributions from different parts of the country.", ["freedom struggle", "contributors"]),
          t("gs1-postind", "Post-Independence Consolidation", "Integration of states, reorganisation and nation-building.", ["integration", "reorganisation"], "Medium", 4),
          t("gs1-world", "World History", "Industrial revolution, world wars, colonisation, decolonisation and political philosophies.", ["world war", "colonisation", "communism", "capitalism"]),
        ],
      },
      {
        id: "gs1-society",
        name: "Indian Society",
        topics: [
          t("gs1-society-features", "Salient Features & Diversity of Indian Society", "Social structure, diversity and its implications.", ["diversity", "society"], "Medium", 4),
          t("gs1-women", "Women, Population & Development Issues", "Role of women and women's organisations, poverty, urbanisation and remedies.", ["women", "population", "urbanisation", "poverty"]),
          t("gs1-globalisation", "Globalisation, Communalism, Regionalism & Secularism", "Effects of globalisation and social empowerment issues.", ["globalisation", "communalism", "secularism"]),
        ],
      },
      {
        id: "gs1-geography",
        name: "World Geography",
        topics: [
          t("gs1-physical", "World Physical Geography", "Salient features of the world's physical geography.", ["physical geography"]),
          t("gs1-resources", "Resource Distribution & Industrial Location", "Key natural resources and factors for industry location worldwide.", ["resources", "industry location"]),
          t("gs1-geophysical", "Geophysical Phenomena", "Earthquakes, tsunami, volcanic activity, cyclones and critical geographical changes.", ["earthquake", "tsunami", "cyclone"]),
        ],
      },
    ],
  },
  {
    id: "mains-gs2",
    name: "GS Paper II — Governance, Constitution, Polity, Social Justice & IR",
    stage: "mains",
    paper: "Mains Paper III",
    blurb: "Constitutional design, institutions, welfare and international relations.",
    modules: [
      {
        id: "gs2-constitution",
        name: "Constitution & Polity",
        topics: [
          t("gs2-const", "Indian Constitution", "Historical underpinnings, evolution, features, amendments, significant provisions and basic structure.", ["constitution", "basic structure", "amendment"]),
          t("gs2-federal", "Union-State Functions & Federal Structure", "Devolution of powers and finances to local levels and challenges therein.", ["federalism", "devolution"]),
          t("gs2-separation", "Separation of Powers & Dispute Redressal", "Organs of state, dispute redressal mechanisms and institutions.", ["separation of powers", "judiciary"]),
          t("gs2-comparison", "Comparison with Other Constitutions", "Comparative constitutional schemes.", ["comparative", "constitution"], "Medium", 3),
          t("gs2-legislature", "Parliament & State Legislatures", "Structure, functioning, conduct of business, powers, privileges and issues.", ["Parliament", "privileges"]),
          t("gs2-executive", "Executive & Judiciary Structure", "Ministries, departments, pressure groups and associations.", ["executive", "pressure groups"]),
          t("gs2-rpa", "Representation of People's Act & Constitutional Bodies", "Electoral law, constitutional posts and quasi-judicial bodies.", ["RPA", "constitutional bodies", "quasi-judicial"]),
        ],
      },
      {
        id: "gs2-governance",
        name: "Governance & Social Justice",
        topics: [
          t("gs2-policies", "Government Policies & Interventions", "Design and implementation issues across sectors.", ["policy", "implementation"]),
          t("gs2-ngo", "Development Processes & Development Industry", "Role of NGOs, SHGs, donors, charities and stakeholders.", ["NGO", "SHG", "stakeholders"], "Medium", 4),
          t("gs2-welfare", "Welfare Schemes for Vulnerable Sections", "Performance, mechanisms, laws and bodies for protection of vulnerable sections.", ["welfare", "vulnerable", "SC ST"]),
          t("gs2-social-sector", "Health, Education & Human Resources", "Development and management of social sector services.", ["health", "education"]),
          t("gs2-poverty", "Poverty & Hunger", "Issues relating to poverty and hunger.", ["poverty", "hunger", "food security"], "Medium", 3),
          t("gs2-transparency", "Governance, Transparency & Accountability", "e-governance, citizens charters, institutional measures and civil services role.", ["e-governance", "citizen charter", "accountability"]),
        ],
      },
      {
        id: "gs2-ir",
        name: "International Relations",
        topics: [
          t("gs2-neighbour", "India & Its Neighbourhood", "Bilateral relations with neighbouring countries.", ["neighbourhood", "bilateral"]),
          t("gs2-groupings", "Bilateral, Regional & Global Groupings", "Agreements involving or affecting India's interests.", ["groupings", "agreements"]),
          t("gs2-diaspora", "Global Policies, Diaspora & Institutions", "Effect of developed/developing country policies, diaspora and international institutions.", ["diaspora", "UN", "institutions"]),
        ],
      },
    ],
  },
  {
    id: "mains-gs3",
    name: "GS Paper III — Economy, Environment, Security & Technology",
    stage: "mains",
    paper: "Mains Paper IV",
    blurb: "Technology, economic development, biodiversity, security and disaster management.",
    modules: [
      {
        id: "gs3-economy",
        name: "Indian Economy",
        topics: [
          t("gs3-planning", "Planning, Growth, Development & Employment", "Mobilisation of resources, inclusive growth and employment issues.", ["planning", "inclusive growth", "employment"]),
          t("gs3-budget", "Government Budgeting", "Budgetary process, deficits and fiscal management.", ["budget", "fiscal"], "Medium", 3),
          t("gs3-infra", "Infrastructure & Investment Models", "Energy, ports, roads, airports, railways and PPP models.", ["infrastructure", "PPP", "energy"]),
          t("gs3-liberalisation", "Liberalisation, Industrial Policy & Growth", "Effects of liberalisation, changes in industrial policy and their effects.", ["liberalisation", "industrial policy"]),
        ],
      },
      {
        id: "gs3-agriculture",
        name: "Agriculture & Food Processing",
        topics: [
          t("gs3-cropping", "Cropping Patterns, Irrigation & Marketing", "Storage, transport, marketing of produce, e-technology for farmers.", ["cropping", "irrigation", "e-NAM"]),
          t("gs3-subsidies", "Subsidies, MSP & Public Distribution", "Direct and indirect farm subsidies, buffer stocks and food security.", ["MSP", "PDS", "buffer stock"]),
          t("gs3-foodproc", "Food Processing & Land Reforms", "Scope, supply chain management, upstream and downstream requirements.", ["food processing", "supply chain", "land reform"], "Medium", 4),
        ],
      },
      {
        id: "gs3-scitech",
        name: "Science, Technology & Environment",
        topics: [
          t("gs3-tech", "Science & Technology Developments", "Indigenisation, achievements of Indians in science and new technology.", ["indigenisation", "R&D"]),
          t("gs3-it", "IT, Space, Biotech & IPR", "Awareness in IT, space, computers, robotics, nano-technology, biotechnology and IPR issues.", ["IT", "space", "nano", "IPR"]),
          t("gs3-env", "Environment, Conservation & EIA", "Conservation, environmental pollution and degradation, environmental impact assessment.", ["conservation", "pollution", "EIA"]),
          t("gs3-disaster", "Disaster Management", "Disasters and disaster management frameworks.", ["disaster", "NDMA"], "Medium", 4),
        ],
      },
      {
        id: "gs3-security",
        name: "Internal Security",
        topics: [
          t("gs3-extremism", "Extremism & Development Linkage", "Linkages between development and spread of extremism.", ["LWE", "extremism"], "Medium", 3),
          t("gs3-external", "External State & Non-State Actors", "Role of external actors in creating internal security challenges.", ["non-state actors", "border"]),
          t("gs3-cyber", "Cyber Security, Money Laundering & Communication Networks", "Challenges through communication networks, media and social networking.", ["cyber", "money laundering"]),
          t("gs3-forces", "Security Forces & Border Management", "Various security forces, agencies and their mandate; border area management.", ["border management", "security forces"], "Medium", 3),
        ],
      },
    ],
  },
  {
    id: "mains-gs4",
    name: "GS Paper IV — Ethics, Integrity & Aptitude",
    stage: "mains",
    paper: "Mains Paper V",
    blurb: "Attitude, aptitude and ethical integrity in public administration, with case studies.",
    modules: [
      {
        id: "gs4-theory",
        name: "Ethics Theory",
        topics: [
          t("gs4-essence", "Ethics & Human Interface", "Essence, determinants and consequences of ethics; dimensions and human actions.", ["ethics", "determinants"]),
          t("gs4-attitude", "Attitude & Moral Influence", "Content, structure, function, influence on thought and behaviour, moral and political attitudes.", ["attitude", "persuasion"], "Medium", 3),
          t("gs4-aptitude", "Aptitude & Foundational Values for Civil Service", "Integrity, impartiality, objectivity, dedication, empathy and compassion.", ["integrity", "impartiality", "empathy"]),
          t("gs4-ei", "Emotional Intelligence", "Concepts, utilities and application in administration and governance.", ["emotional intelligence"], "Medium", 3),
          t("gs4-thinkers", "Moral Thinkers & Philosophers", "Contributions of thinkers and philosophers from India and the world.", ["thinkers", "philosophers"]),
        ],
      },
      {
        id: "gs4-governance",
        name: "Probity in Governance",
        topics: [
          t("gs4-publicservice", "Public/Civil Service Values", "Ethics in public administration, status, problems and dilemmas.", ["public service", "dilemma"]),
          t("gs4-probity", "Probity, Transparency & Accountability", "Information sharing, RTI, codes of ethics and conduct, work culture, citizens charters.", ["probity", "RTI", "code of conduct"]),
          t("gs4-corruption", "Corruption & Governance Challenges", "Challenges of corruption, utilisation of public funds and service delivery quality.", ["corruption", "public funds"], "Medium", 3),
        ],
      },
      {
        id: "gs4-case",
        name: "Case Studies",
        topics: [
          t("gs4-casestudies", "Case Studies on Ethical Dilemmas", "Stakeholder analysis, options evaluation and balancing legality with ethics.", ["case study", "stakeholders", "dilemma"]),
        ],
      },
    ],
  },
];

export const prelimsSyllabus = upscSyllabus.filter((s) => s.stage === "prelims");
export const mainsSyllabus = upscSyllabus.filter((s) => s.stage === "mains");

export const allTopics = upscSyllabus.flatMap((s) =>
  s.modules.flatMap((m) =>
    m.topics.map((topic) => ({ ...topic, subject: s.name, subjectId: s.id, module: m.name, moduleId: m.id, stage: s.stage })),
  ),
);

export type FlatTopic = (typeof allTopics)[number];

export const topicById = new Map(allTopics.map((t) => [t.id, t]));
