export type Question = {
  id: string;
  subject: string;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type MockTest = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  questions: Question[];
};

const q = (
  id: string,
  subject: string,
  text: string,
  options: string[],
  answer: number,
  explanation: string,
): Question => ({ id, subject, text, options, answer, explanation });

export const mockTests: MockTest[] = [
  {
    id: "prelims-gs-01",
    name: "Prelims GS Full Mock 01",
    description: "Balanced mix of Polity, History, Geography, Economy and Environment.",
    durationMinutes: 20,
    questions: [
      q("q1", "Polity", "Which article of the Indian Constitution deals with the Right to Constitutional Remedies?", ["Article 19", "Article 21", "Article 32", "Article 44"], 2, "Article 32 empowers citizens to move the Supreme Court for enforcement of Fundamental Rights; Dr. Ambedkar called it the heart and soul of the Constitution."),
      q("q2", "Polity", "The concept of 'Basic Structure' of the Constitution was propounded in which case?", ["Golaknath case", "Kesavananda Bharati case", "Minerva Mills case", "Shankari Prasad case"], 1, "The Kesavananda Bharati judgment (1973) held that Parliament cannot alter the basic structure of the Constitution."),
      q("q3", "History", "The Indus Valley site of Lothal is notable for which feature?", ["Great Bath", "Dockyard", "Granary complex", "Fire altars only"], 1, "Lothal in Gujarat had a tidal dockyard, indicating maritime trade with Mesopotamia."),
      q("q4", "History", "Who founded the Servants of India Society in 1905?", ["Bal Gangadhar Tilak", "Gopal Krishna Gokhale", "Lala Lajpat Rai", "Dadabhai Naoroji"], 1, "Gokhale founded the Servants of India Society to train national missionaries for social service."),
      q("q5", "Geography", "The Western Ghats receive heavy rainfall mainly due to which factor?", ["Convectional rainfall", "Orographic lifting", "Frontal activity", "Cyclonic depression"], 1, "Moist south-west monsoon winds are forced to rise over the Ghats, cooling and condensing as orographic rainfall."),
      q("q6", "Geography", "Which of the following rivers flows through a rift valley?", ["Godavari", "Krishna", "Narmada", "Mahanadi"], 2, "The Narmada flows westward through a rift valley between the Vindhya and Satpura ranges."),
      q("q7", "Economy", "Repo rate is best described as the rate at which:", ["Banks lend to customers", "RBI lends to commercial banks against securities", "Banks park surplus with RBI", "Government borrows from the market"], 1, "Repo is the rate at which the RBI lends short-term funds to banks against government securities."),
      q("q8", "Economy", "Which index is used to measure retail inflation in India?", ["WPI", "CPI", "IIP", "PMI"], 1, "The Consumer Price Index measures retail-level price change and is the RBI's inflation-targeting anchor."),
      q("q9", "Environment", "The Ramsar Convention is associated with the conservation of:", ["Deserts", "Wetlands", "Coral reefs only", "Mangroves only"], 1, "The Ramsar Convention (1971) provides the framework for conservation and wise use of wetlands."),
      q("q10", "Environment", "Which gas has the highest global warming potential among the following?", ["Carbon dioxide", "Methane", "Nitrous oxide", "Sulphur hexafluoride"], 3, "Sulphur hexafluoride has a GWP thousands of times higher than CO2 over a 100-year horizon."),
      q("q11", "Science & Technology", "Chandrayaan-3 achieved a soft landing near which lunar region?", ["Equator", "North Pole", "South Pole", "Far side centre"], 2, "Chandrayaan-3's Vikram lander touched down near the lunar south pole in August 2023."),
      q("q12", "Science & Technology", "CRISPR-Cas9 is primarily a technology for:", ["Protein folding", "Gene editing", "Vaccine storage", "Radio imaging"], 1, "CRISPR-Cas9 enables precise editing of DNA sequences within genomes."),
      q("q13", "Polity", "The Finance Commission is constituted under which Article?", ["Article 148", "Article 280", "Article 324", "Article 315"], 1, "Article 280 provides for a Finance Commission every fifth year to recommend tax devolution."),
      q("q14", "History", "The Poona Pact of 1932 was signed between:", ["Gandhi and Jinnah", "Gandhi and Ambedkar", "Nehru and Jinnah", "Tilak and Annie Besant"], 1, "The Poona Pact replaced separate electorates for the depressed classes with reserved seats in joint electorates."),
      q("q15", "Current Affairs", "Global indices such as the Human Development Index are published by:", ["World Bank", "UNDP", "IMF", "WEF"], 1, "The HDI is published by the United Nations Development Programme in its Human Development Report."),
    ],
  },
  {
    id: "polity-sectional-01",
    name: "Polity Sectional Test",
    description: "Focused drill on Constitution, institutions and governance.",
    durationMinutes: 12,
    questions: [
      q("p1", "Polity", "The Preamble was amended by which Constitutional Amendment Act?", ["24th", "42nd", "44th", "52nd"], 1, "The 42nd Amendment (1976) added the words Socialist, Secular and Integrity to the Preamble."),
      q("p2", "Polity", "Who administers the oath of office to the President of India?", ["Prime Minister", "Vice President", "Chief Justice of India", "Speaker"], 2, "The Chief Justice of India, or in their absence the senior-most SC judge, administers the oath."),
      q("p3", "Polity", "Money Bills can be introduced only in:", ["Rajya Sabha", "Lok Sabha", "Either House", "Joint sitting"], 1, "Under Article 110, a Money Bill can be introduced only in the Lok Sabha on the President's recommendation."),
      q("p4", "Polity", "Directive Principles of State Policy are:", ["Justiciable", "Non-justiciable", "Partly justiciable", "Enforceable by High Courts"], 1, "DPSPs under Part IV are not enforceable by courts but are fundamental in the governance of the country."),
      q("p5", "Polity", "The 73rd Amendment Act relates to:", ["Urban local bodies", "Panchayati Raj institutions", "Anti-defection", "Right to Education"], 1, "The 73rd Amendment (1992) gave constitutional status to Panchayati Raj institutions."),
      q("p6", "Polity", "Which body is known as the guardian of the public purse?", ["Finance Commission", "CAG", "NITI Aayog", "Public Accounts Committee"], 1, "The Comptroller and Auditor General audits government expenditure and is termed the guardian of the public purse."),
      q("p7", "Polity", "Emergency due to failure of constitutional machinery in a state is under:", ["Article 352", "Article 356", "Article 360", "Article 365"], 1, "Article 356 provides for President's Rule when a state government cannot function per the Constitution."),
      q("p8", "Polity", "The Election Commission of India is a:", ["Statutory body", "Constitutional body", "Executive body", "Advisory body"], 1, "The ECI is established under Article 324 and is therefore a constitutional body."),
    ],
  },
];