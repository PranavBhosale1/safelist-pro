/**
 * Mock Company Data
 * This replaces Tracxn API calls when rate limits are exceeded or API is unavailable
 */

export type MockCompany = {
  name: string;
  domain: string;
  location: {
    city?: string;
    state?: string;
    country: string;
  };
  logo: string;
  rating: number | string;
  url: string;
  foundedYear?: number;
  description?: string;
  latestValuation?: {
    amount: {
      value: number;
      currency: string;
    };
  };
  latestAnnualRevenue?: {
    amount: {
      value: number;
      currency: string;
    };
  };
  latestEmployeeCount?: {
    value: number;
  };
  companyRatings?: {
    editorRatingInfo?: {
      rating: number | string;
    };
  };
  totalMoneyRaised?: {
    totalAmount: {
      amount: number;
      currency: string;
    };
  };
};

export type MockFundingRound = {
  fundingDate: {
    day: string;
    month: string;
    year: string;
  };
  amount: {
    amount: number;
    currency: string;
  };
  postMoneyValuation?: {
    normalizedAmount: {
      value: number;
      currency: string;
    };
  };
  investorList?: Array<{
    name: string;
    domain: string;
    isLead: boolean;
  }>;
};

export type MockInvestor = {
  name: string;
  domain: string;
  type: string;
  id: string;
  isLead?: boolean;
};

// Mock Company Database - 50 popular tech companies
export const MOCK_COMPANIES: MockCompany[] = [
  {
    name: "CrowdStrike",
    domain: "crowdstrike.com",
    location: { city: "Austin", state: "Texas", country: "United States" },
    logo: "https://logo.clearbit.com/crowdstrike.com",
    rating: 5,
    url: "https://www.crowdstrike.com",
    foundedYear: 2011,
    description: "CrowdStrike is a cybersecurity technology company that provides cloud-delivered endpoint protection, threat intelligence, and cyberattack response services.",
    latestValuation: { amount: { value: 75000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 3000000000, currency: "USD" } },
    latestEmployeeCount: { value: 8000 },
    companyRatings: { editorRatingInfo: { rating: 5 } },
    totalMoneyRaised: { totalAmount: { amount: 481000000, currency: "USD" } },
  },
  {
    name: "Palo Alto Networks",
    domain: "paloaltonetworks.com",
    location: { city: "Santa Clara", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/paloaltonetworks.com",
    rating: 5,
    url: "https://www.paloaltonetworks.com",
    foundedYear: 2005,
    description: "Palo Alto Networks is a multinational cybersecurity company that provides enterprise security solutions including firewalls, cloud security, and threat intelligence.",
    latestValuation: { amount: { value: 100000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 7000000000, currency: "USD" } },
    latestEmployeeCount: { value: 12000 },
    companyRatings: { editorRatingInfo: { rating: 5 } },
    totalMoneyRaised: { totalAmount: { amount: 260000000, currency: "USD" } },
  },
  {
    name: "Fortinet",
    domain: "fortinet.com",
    location: { city: "Sunnyvale", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/fortinet.com",
    rating: 4,
    url: "https://www.fortinet.com",
    foundedYear: 2000,
    description: "Fortinet is a cybersecurity company that develops and sells cybersecurity solutions including firewalls, anti-virus, intrusion prevention, and endpoint security.",
    latestValuation: { amount: { value: 50000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 4500000000, currency: "USD" } },
    latestEmployeeCount: { value: 10000 },
    companyRatings: { editorRatingInfo: { rating: 4 } },
    totalMoneyRaised: { totalAmount: { amount: 93000000, currency: "USD" } },
  },
  {
    name: "Check Point",
    domain: "checkpoint.com",
    location: { city: "San Carlos", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/checkpoint.com",
    rating: 4,
    url: "https://www.checkpoint.com",
    foundedYear: 1993,
    description: "Check Point Software Technologies is a provider of IT security solutions including network security, endpoint security, cloud security, and mobile security.",
    latestValuation: { amount: { value: 18000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 2300000000, currency: "USD" } },
    latestEmployeeCount: { value: 5000 },
    companyRatings: { editorRatingInfo: { rating: 4 } },
    totalMoneyRaised: { totalAmount: { amount: 0, currency: "USD" } },
  },
  {
    name: "Zscaler",
    domain: "zscaler.com",
    location: { city: "San Jose", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/zscaler.com",
    rating: 5,
    url: "https://www.zscaler.com",
    foundedYear: 2008,
    description: "Zscaler is a cloud security company that provides internet security, web security, next generation firewall, sandboxing, and SSL inspection.",
    latestValuation: { amount: { value: 25000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 1500000000, currency: "USD" } },
    latestEmployeeCount: { value: 5000 },
    companyRatings: { editorRatingInfo: { rating: 5 } },
    totalMoneyRaised: { totalAmount: { amount: 148000000, currency: "USD" } },
  },
  {
    name: "Okta",
    domain: "okta.com",
    location: { city: "San Francisco", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/okta.com",
    rating: 5,
    url: "https://www.okta.com",
    foundedYear: 2009,
    description: "Okta is an identity and access management company that provides cloud software to help companies manage and secure user authentication.",
    latestValuation: { amount: { value: 12000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 1800000000, currency: "USD" } },
    latestEmployeeCount: { value: 5500 },
    companyRatings: { editorRatingInfo: { rating: 5 } },
    totalMoneyRaised: { totalAmount: { amount: 230000000, currency: "USD" } },
  },
  {
    name: "Rapid7",
    domain: "rapid7.com",
    location: { city: "Boston", state: "Massachusetts", country: "United States" },
    logo: "https://logo.clearbit.com/rapid7.com",
    rating: 4,
    url: "https://www.rapid7.com",
    foundedYear: 2000,
    description: "Rapid7 is a cybersecurity company that provides vulnerability management, penetration testing, and incident detection and response solutions.",
    latestValuation: { amount: { value: 3000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 500000000, currency: "USD" } },
    latestEmployeeCount: { value: 2000 },
    companyRatings: { editorRatingInfo: { rating: 4 } },
    totalMoneyRaised: { totalAmount: { amount: 100000000, currency: "USD" } },
  },
  {
    name: "SentinelOne",
    domain: "sentinelone.com",
    location: { city: "Mountain View", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/sentinelone.com",
    rating: 5,
    url: "https://www.sentinelone.com",
    foundedYear: 2013,
    description: "SentinelOne is a cybersecurity company that provides autonomous endpoint protection through AI-powered threat detection and response.",
    latestValuation: { amount: { value: 10000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 300000000, currency: "USD" } },
    latestEmployeeCount: { value: 2000 },
    companyRatings: { editorRatingInfo: { rating: 5 } },
    totalMoneyRaised: { totalAmount: { amount: 700000000, currency: "USD" } },
  },
  {
    name: "Qualys",
    domain: "qualys.com",
    location: { city: "Foster City", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/qualys.com",
    rating: 4,
    url: "https://www.qualys.com",
    foundedYear: 1999,
    description: "Qualys is a cloud security and compliance company that provides vulnerability management, policy compliance, and web application security solutions.",
    latestValuation: { amount: { value: 5000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 500000000, currency: "USD" } },
    latestEmployeeCount: { value: 2000 },
    companyRatings: { editorRatingInfo: { rating: 4 } },
    totalMoneyRaised: { totalAmount: { amount: 0, currency: "USD" } },
  },
  {
    name: "Tenable",
    domain: "tenable.com",
    location: { city: "Columbia", state: "Maryland", country: "United States" },
    logo: "https://logo.clearbit.com/tenable.com",
    rating: 4,
    url: "https://www.tenable.com",
    foundedYear: 2002,
    description: "Tenable is a cybersecurity company that provides vulnerability management, security assessment, and compliance solutions.",
    latestValuation: { amount: { value: 5000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 600000000, currency: "USD" } },
    latestEmployeeCount: { value: 1500 },
    companyRatings: { editorRatingInfo: { rating: 4 } },
    totalMoneyRaised: { totalAmount: { amount: 0, currency: "USD" } },
  },
  {
    name: "Splunk",
    domain: "splunk.com",
    location: { city: "San Francisco", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/splunk.com",
    rating: 5,
    url: "https://www.splunk.com",
    foundedYear: 2003,
    description: "Splunk is a software platform that searches, monitors, and analyzes machine-generated big data via a web-style interface.",
    latestValuation: { amount: { value: 28000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 3500000000, currency: "USD" } },
    latestEmployeeCount: { value: 8000 },
    companyRatings: { editorRatingInfo: { rating: 5 } },
    totalMoneyRaised: { totalAmount: { amount: 40000000, currency: "USD" } },
  },
  {
    name: "Darktrace",
    domain: "darktrace.com",
    location: { city: "Cambridge", country: "United Kingdom" },
    logo: "https://logo.clearbit.com/darktrace.com",
    rating: 5,
    url: "https://www.darktrace.com",
    foundedYear: 2013,
    description: "Darktrace is a cybersecurity company that uses AI and machine learning to detect and respond to cyber threats in real-time.",
    latestValuation: { amount: { value: 3000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 300000000, currency: "USD" } },
    latestEmployeeCount: { value: 2000 },
    companyRatings: { editorRatingInfo: { rating: 5 } },
    totalMoneyRaised: { totalAmount: { amount: 230000000, currency: "USD" } },
  },
  {
    name: "Varonis",
    domain: "varonis.com",
    location: { city: "New York", state: "New York", country: "United States" },
    logo: "https://logo.clearbit.com/varonis.com",
    rating: 4,
    url: "https://www.varonis.com",
    foundedYear: 2005,
    description: "Varonis is a data security and analytics company that provides software for protecting unstructured data and sensitive information.",
    latestValuation: { amount: { value: 5000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 400000000, currency: "USD" } },
    latestEmployeeCount: { value: 2000 },
    companyRatings: { editorRatingInfo: { rating: 4 } },
    totalMoneyRaised: { totalAmount: { amount: 0, currency: "USD" } },
  },
  {
    name: "Proofpoint",
    domain: "proofpoint.com",
    location: { city: "Sunnyvale", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/proofpoint.com",
    rating: 4,
    url: "https://www.proofpoint.com",
    foundedYear: 2002,
    description: "Proofpoint is a cybersecurity company that provides email security, cloud security, and threat protection solutions.",
    latestValuation: { amount: { value: 12000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 1300000000, currency: "USD" } },
    latestEmployeeCount: { value: 3500 },
    companyRatings: { editorRatingInfo: { rating: 4 } },
    totalMoneyRaised: { totalAmount: { amount: 0, currency: "USD" } },
  },
  {
    name: "Cisco",
    domain: "cisco.com",
    location: { city: "San Jose", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/cisco.com",
    rating: 5,
    url: "https://www.cisco.com",
    foundedYear: 1984,
    description: "Cisco Systems is a multinational technology conglomerate that develops, manufactures, and sells networking hardware, software, and telecommunications equipment.",
    latestValuation: { amount: { value: 200000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 57000000000, currency: "USD" } },
    latestEmployeeCount: { value: 80000 },
    companyRatings: { editorRatingInfo: { rating: 5 } },
    totalMoneyRaised: { totalAmount: { amount: 0, currency: "USD" } },
  },
  {
    name: "FireEye",
    domain: "fireeye.com",
    location: { city: "Milpitas", state: "California", country: "United States" },
    logo: "https://logo.clearbit.com/fireeye.com",
    rating: 4,
    url: "https://www.fireeye.com",
    foundedYear: 2004,
    description: "FireEye is a cybersecurity company that provides threat intelligence and advanced threat protection solutions to help organizations detect and prevent cyber attacks.",
    latestValuation: { amount: { value: 4000000000, currency: "USD" } },
    latestAnnualRevenue: { amount: { value: 900000000, currency: "USD" } },
    latestEmployeeCount: { value: 3500 },
    companyRatings: { editorRatingInfo: { rating: 4 } },
    totalMoneyRaised: { totalAmount: { amount: 0, currency: "USD" } },
  },
];

// Mock Funding Rounds - Map of company domain to funding rounds
export const MOCK_FUNDING_ROUNDS: Record<string, MockFundingRound[]> = {
  "crowdstrike.com": [
    {
      fundingDate: { day: "15", month: "06", year: "2018" },
      amount: { amount: 200000000, currency: "USD" },
      postMoneyValuation: { normalizedAmount: { value: 3000000000, currency: "USD" } },
      investorList: [
        { name: "Accel", domain: "accel.com", isLead: true },
        { name: "Warburg Pincus", domain: "warburgpincus.com", isLead: false },
      ],
    },
    {
      fundingDate: { day: "12", month: "03", year: "2017" },
      amount: { amount: 100000000, currency: "USD" },
      postMoneyValuation: { normalizedAmount: { value: 1000000000, currency: "USD" } },
      investorList: [
        { name: "Accel", domain: "accel.com", isLead: true },
        { name: "Google Capital", domain: "google.com", isLead: false },
      ],
    },
  ],
  "paloaltonetworks.com": [
    {
      fundingDate: { day: "20", month: "07", year: "2012" },
      amount: { amount: 260000000, currency: "USD" },
      postMoneyValuation: { normalizedAmount: { value: 2000000000, currency: "USD" } },
      investorList: [
        { name: "Sequoia Capital", domain: "sequoiacap.com", isLead: true },
        { name: "Greylock Partners", domain: "greylock.com", isLead: false },
      ],
    },
  ],
  "zscaler.com": [
    {
      fundingDate: { day: "15", month: "05", year: "2018" },
      amount: { amount: 148000000, currency: "USD" },
      postMoneyValuation: { normalizedAmount: { value: 1000000000, currency: "USD" } },
      investorList: [
        { name: "TPG Growth", domain: "tpg.com", isLead: true },
        { name: "Lightspeed Venture Partners", domain: "lsvp.com", isLead: false },
      ],
    },
  ],
};

// Mock Investors - Map of company domain to investors
export const MOCK_INVESTORS: Record<string, MockInvestor[]> = {
  "crowdstrike.com": [
    { name: "Accel", domain: "accel.com", type: "Venture Capital", id: "accel-1", isLead: true },
    { name: "Warburg Pincus", domain: "warburgpincus.com", type: "Private Equity", id: "wp-1", isLead: false },
    { name: "Google Capital", domain: "google.com", type: "Corporate", id: "google-1", isLead: false },
  ],
  "paloaltonetworks.com": [
    { name: "Sequoia Capital", domain: "sequoiacap.com", type: "Venture Capital", id: "sequoia-1", isLead: true },
    { name: "Greylock Partners", domain: "greylock.com", type: "Venture Capital", id: "greylock-1", isLead: false },
  ],
  "zscaler.com": [
    { name: "TPG Growth", domain: "tpg.com", type: "Private Equity", id: "tpg-1", isLead: true },
    { name: "Lightspeed Venture Partners", domain: "lsvp.com", type: "Venture Capital", id: "lsvp-1", isLead: false },
  ],
};

/**
 * Search companies by name (fuzzy match)
 */
export function searchMockCompanies(query: string): MockCompany[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return MOCK_COMPANIES.filter((company) =>
    company.name.toLowerCase().includes(lowerQuery) ||
    company.domain.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Limit to 10 results
}

/**
 * Get company by domain
 */
export function getMockCompanyByDomain(domain: string): MockCompany | undefined {
  const normalizedDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  return MOCK_COMPANIES.find(
    (company) => company.domain.toLowerCase() === normalizedDomain
  );
}

/**
 * Get funding rounds for a company
 */
export function getMockFundingRounds(domain: string): MockFundingRound[] {
  const normalizedDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  return MOCK_FUNDING_ROUNDS[normalizedDomain] || [];
}

/**
 * Get investors for a company
 */
export function getMockInvestors(domain: string): MockInvestor[] {
  const normalizedDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  return MOCK_INVESTORS[normalizedDomain] || [];
}

