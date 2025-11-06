import axios from "axios";

const TOKEN = process.env.TRACXN_PLAYGROUND_TOKEN;
const HEADERS = {
  accesstoken: TOKEN,
  "Content-Type": "application/json"
};

/**
 * Fetch company information from Traxcn API
 * This function contains the shared logic for fetching company details
 */
export async function fetchCompanyInfo(companyDomain: string) {
  // 1️⃣ Fetch Company Details
  console.log("📡 Fetching company details...");
  const detailsRes = await axios.post(
    "https://platform.tracxn.com/api/2.2/playground/companies",
    {
      filter: { domain: [companyDomain] }
    },
    { headers: HEADERS }
  );
  const companyDetails = detailsRes.data;

  // 2️⃣ Funding Rounds
  console.log("📡 Fetching funding rounds...");
  const transactionsRes = await axios.post(
    "https://platform.tracxn.com/api/2.2/playground/transactions",
    {
      filter: { domain: [companyDomain] },
      sort: [{ sortField: "transactionFundingRoundAmount" }]
    },
    { headers: HEADERS }
  );
  const fundingRounds = transactionsRes.data;

  // 3️⃣ Investor Pipeline
  console.log("📡 Fetching investors...");
  const investorsRes = await axios.post(
    "https://platform.tracxn.com/api/2.2/playground/investors",
    {
      filter: {
        investorCountry: ["India"],
        investorType: ["Institutional Investors"],
        domain: [companyDomain]
      },
      size: 10
    },
    { headers: HEADERS }
  );
  const investors = investorsRes.data;

  // Clean up company details
  if (companyDetails.result) {
    companyDetails.result.forEach((company: unknown) => {
      if (typeof company === 'object' && company !== null) {
        delete (company as Record<string, unknown>).businessModelList;
        delete (company as Record<string, unknown>).tracxnUrl;
        delete (company as Record<string, unknown>).practiceAreaList;
        delete (company as Record<string, unknown>).specialFlagList;
        delete (company as Record<string, unknown>).achievements;
        delete (company as Record<string, unknown>).sectorList;
      }
    });
  }

  return {
    companyDetails,
    fundingRounds,
    investors,
  };
}

