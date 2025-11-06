import axios, { AxiosError } from "axios";

const TOKEN = process.env.TRACXN_PLAYGROUND_TOKEN;
const BASE_URL = "https://platform.tracxn.com/api/2.2/playground";

// Headers according to Tracxn API documentation
const HEADERS = {
  accessToken: TOKEN, // Using camelCase as per documentation
  "Content-Type": "application/json"
};

/**
 * Tracxn API Error Response Types
 */
export interface TracxnApiError {
  statusCode: number;
  message: string;
  error?: string;
}

/**
 * Type guard to check if error is a TracxnApiError
 */
export function isTracxnApiError(error: unknown): error is TracxnApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error
  );
}

/**
 * Handle Tracxn API errors according to documentation
 */
function handleTracxnError(error: unknown): TracxnApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status || 500;
    const data = axiosError.response?.data as { message?: string; error?: string } | undefined;

    // Map status codes to messages per Tracxn API documentation
    const statusMessages: Record<number, string> = {
      200: "Success",
      400: "Bad Request – Syntax of query is invalid",
      401: "Authentication Issue – Token missing or invalid",
      403: "Unauthorized – Token expired or access denied",
      404: "Not Found – Endpoint does not exist",
      405: "Method Not Allowed – Use the correct HTTP method (GET or POST)",
      429: "Rate Limit Exceeded – Slow down requests",
      500: "Internal Server Error – Try again later",
      900: "Credit Limit Exceeded – Contact support to renew",
    };

    return {
      statusCode: status,
      message: data?.message || statusMessages[status] || "Unknown error",
      error: data?.error,
    };
  }

  return {
    statusCode: 500,
    message: error instanceof Error ? error.message : "Internal Server Error",
  };
}

/**
 * Validate API token is present
 */
function validateToken(): void {
  if (!TOKEN) {
    throw new Error("TRACXN_PLAYGROUND_TOKEN is not configured in environment variables");
  }
}

/**
 * Fetch company information from Tracxn API
 * This function contains the shared logic for fetching company details
 * 
 * @param companyDomain - Normalized domain name (without https, www, trailing slashes)
 * @throws {TracxnApiError} When API request fails
 */
export async function fetchCompanyInfo(companyDomain: string) {
  validateToken();

  try {
    // 1️⃣ Fetch Company Details
    console.log("📡 Fetching company details...");
    const detailsRes = await axios.post(
      `${BASE_URL}/companies`,
      {
        filter: { domain: [companyDomain] },
        size: 20, // Maximum per documentation
      },
      { headers: HEADERS }
    );
    const companyDetails = detailsRes.data;

    // 2️⃣ Funding Rounds
    console.log("📡 Fetching funding rounds...");
    const transactionsRes = await axios.post(
      `${BASE_URL}/transactions`,
      {
        filter: { domain: [companyDomain] },
        sort: [{ sortField: "transactionFundingRoundAmount", order: "desc" }],
        size: 20, // Maximum per documentation
      },
      { headers: HEADERS }
    );
    const fundingRounds = transactionsRes.data;

    // 3️⃣ Investor Pipeline
    console.log("📡 Fetching investors...");
    const investorsRes = await axios.post(
      `${BASE_URL}/investors`,
      {
        filter: {
          domain: [companyDomain], // Portfolio company filter
        },
        size: 20, // Maximum per documentation
      },
      { headers: HEADERS }
    );
    const investors = investorsRes.data;

    // Clean up company details (remove unnecessary fields for response size)
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
  } catch (error) {
    const tracxnError = handleTracxnError(error);
    console.error(`❌ Tracxn API Error (${tracxnError.statusCode}):`, tracxnError.message);
    throw tracxnError;
  }
}

/**
 * Search for companies by name using Tracxn Company Name Search API
 * 
 * @param companyName - Company name to search for
 * @returns Array of matching companies (max 10 per documentation)
 * @throws {TracxnApiError} When API request fails
 */
export async function searchCompanyByName(companyName: string) {
  validateToken();

  try {
    console.log(`🔍 Searching for company: ${companyName}`);
    const searchRes = await axios.post(
      `${BASE_URL}/companies/search`,
      {
        filter: {
          companyName: companyName.trim(),
        },
      },
      { headers: HEADERS }
    );

    // Returns top 10 results sorted by relevance (per documentation)
    return searchRes.data.result || [];
  } catch (error) {
    const tracxnError = handleTracxnError(error);
    console.error(`❌ Tracxn Search API Error (${tracxnError.statusCode}):`, tracxnError.message);
    throw tracxnError;
  }
}

/**
 * Normalize domain according to Tracxn API requirements
 * Removes https, www, and trailing slashes
 * 
 * @param domain - Domain to normalize
 * @returns Normalized domain
 */
export function normalizeDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, '') // Remove http:// or https://
    .replace(/^www\./, '') // Remove www.
    .replace(/\/$/, '') // Remove trailing slash
    .toLowerCase();
}

