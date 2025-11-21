import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, recordApiCall, type ApiType } from '@/lib/rateLimiter';

const RATE_LIMITS = {
  standard: { hourly: 100, daily: 1000 },
  key_metrics: { hourly: 10, daily: 100 },
};

// This endpoint uses Standard API (makes multiple external API calls)
const API_TYPE: ApiType = 'standard';

export async function GET(req: NextRequest) {
  // Check authentication
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;

  // Check rate limits
  const rateLimitResult = await checkRateLimit(userId, API_TYPE);
  if (!rateLimitResult.allowed) {
    const headers: Record<string, string> = {
      'X-RateLimit-Limit-Hourly': RATE_LIMITS[API_TYPE].hourly.toString(),
      'X-RateLimit-Limit-Daily': RATE_LIMITS[API_TYPE].daily.toString(),
      'X-RateLimit-Remaining-Hourly': rateLimitResult.remainingHourly.toString(),
      'X-RateLimit-Remaining-Daily': rateLimitResult.remainingDaily.toString(),
    };
    
    if (rateLimitResult.retryAfter) {
      headers['Retry-After'] = rateLimitResult.retryAfter.toString();
    }

    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: `You have exceeded your ${API_TYPE} API rate limit. Please try again later.`,
        retryAfter: rateLimitResult.retryAfter,
      },
      { 
        status: 429,
        headers,
      }
    );
  }

  const companyName = req.nextUrl.searchParams.get("name");
  console.log("📩 Incoming request for company:", companyName);

  if (!companyName) {
    console.warn("⚠️ Missing 'name' parameter");
    return NextResponse.json({ error: "Missing 'name' parameter" }, { status: 400 });
  }

  try {
    // Check if we should use mock data (when Tracxn API is unavailable)
    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.TRACXN_PLAYGROUND_TOKEN;
    
    if (useMockData) {
      console.log("📦 Using mock data for company search...");
      const { searchMockCompanies } = await import('@/lib/mockData/companies');
      const mockCompanies = searchMockCompanies(companyName);
      
      if (mockCompanies.length === 0) {
        return NextResponse.json({ error: "No company found." }, { status: 404 });
      }
      
      // Convert mock data to API response format
      const companyCards = mockCompanies.map((company) => ({
        name: company.name,
        location: `${company.location.city || ''}${company.location.city && company.location.country ? ', ' : ''}${company.location.country}`.trim() || 'N/A',
        rating: company.rating,
        url: company.url,
        logo: company.logo,
      }));
      
      return NextResponse.json(companyCards, {
        status: 200,
        headers: {
          'X-RateLimit-Limit-Hourly': RATE_LIMITS[API_TYPE].hourly.toString(),
          'X-RateLimit-Limit-Daily': RATE_LIMITS[API_TYPE].daily.toString(),
          'X-RateLimit-Remaining-Hourly': rateLimitResult.remainingHourly.toString(),
          'X-RateLimit-Remaining-Daily': rateLimitResult.remainingDaily.toString(),
          'X-Data-Source': 'mock',
        },
      });
    }

    // 1️⃣ Search for the company using shared function
    console.log("🔍 Searching company via Tracxn API...");
    const { searchCompanyByName } = await import('@/lib/traxcnApi');
    
    const searchTerm = companyName.trim();
    let companies;
    try {
      companies = await searchCompanyByName(searchTerm);
      console.log("✅ Search result received:", companies.length, "matches");
    } catch (tracxnError) {
      // Fallback to mock data if Tracxn API fails
      console.warn("⚠️ Tracxn API failed, falling back to mock data:", tracxnError);
      const { searchMockCompanies } = await import('@/lib/mockData/companies');
      const mockCompanies = searchMockCompanies(companyName);
      
      if (mockCompanies.length === 0) {
        return NextResponse.json({ error: "No company found." }, { status: 404 });
      }
      
      const companyCards = mockCompanies.map((company) => ({
        name: company.name,
        location: `${company.location.city || ''}${company.location.city && company.location.country ? ', ' : ''}${company.location.country}`.trim() || 'N/A',
        rating: company.rating,
        url: company.url,
        logo: company.logo,
      }));
      
      return NextResponse.json(companyCards, {
        status: 200,
        headers: {
          'X-RateLimit-Limit-Hourly': RATE_LIMITS[API_TYPE].hourly.toString(),
          'X-RateLimit-Limit-Daily': RATE_LIMITS[API_TYPE].daily.toString(),
          'X-RateLimit-Remaining-Hourly': rateLimitResult.remainingHourly.toString(),
          'X-RateLimit-Remaining-Daily': rateLimitResult.remainingDaily.toString(),
          'X-Data-Source': 'mock-fallback',
        },
      });
    }
    
    if (!companies || companies.length === 0) {
      console.warn("🚫 No company found in search result");
      return NextResponse.json({ error: "No company found." }, { status: 404 });
    }

    // Get all matching domains (limit to top 10 for performance)
    const companyDomains = companies
      .slice(0, 10)
      .map((c) => c.domain)
      .filter((domain?: string): domain is string => Boolean(domain));

    if (companyDomains.length === 0) {
      console.warn("🚫 No valid domains found in search results");
      return NextResponse.json({ error: "No company found." }, { status: 404 });
    }

    console.log("🏢 Companies Found:", companyDomains.length, "matches");

    // 2️⃣ Fetch company details for all matches
    console.log("📡 Fetching company details...");
    const axios = (await import('axios')).default;
    const BASE_URL = "https://platform.tracxn.com/api/2.2/playground";
    const HEADERS = {
      accessToken: process.env.TRACXN_PLAYGROUND_TOKEN,
      "Content-Type": "application/json"
    };
    
    const detailsRes = await axios.post(
      `${BASE_URL}/companies`,
      {
        filter: { domain: companyDomains },
        size: 20, // Maximum per documentation
      },
      { headers: HEADERS }
    );
    
    const companyDetails = detailsRes.data;
    type CompanyDetail = {
      name?: string;
      location?: { city?: string };
      companyRatings?: { editorRatingInfo?: { rating?: string | number } };
      websiteInfo?: { url?: string };
      logos?: { imageUrl?: string };
    };
    const allResults: CompanyDetail[] = companyDetails.result || [];
    
    // Map to company card format
    type CompanyCard = {
      name: string;
      location: string;
      rating: string | number;
      url: string;
      logo: string;
    };

    const companyCards: CompanyCard[] = allResults.map((company: CompanyDetail) => ({
      name: company.name || "",
      location: company.location?.city || "N/A",
      rating: company.companyRatings?.editorRatingInfo?.rating || "N/A",
      url: company.websiteInfo?.url || "",
      logo: company.logos?.imageUrl || "",
    }));

    // Sort results by relevance (exact match first, then starts with, then contains)
    const searchTermLower = searchTerm.toLowerCase();
    const sortedResults = companyCards.sort((a: CompanyCard, b: CompanyCard) => {
      const aNameLower = a.name.toLowerCase();
      const bNameLower = b.name.toLowerCase();
      
      // Exact match gets highest priority
      if (aNameLower === searchTermLower && bNameLower !== searchTermLower) return -1;
      if (bNameLower === searchTermLower && aNameLower !== searchTermLower) return 1;
      
      // Starts with gets second priority
      if (aNameLower.startsWith(searchTermLower) && !bNameLower.startsWith(searchTermLower)) return -1;
      if (bNameLower.startsWith(searchTermLower) && !aNameLower.startsWith(searchTermLower)) return 1;
      
      // Contains gets third priority
      if (aNameLower.includes(searchTermLower) && !bNameLower.includes(searchTermLower)) return -1;
      if (bNameLower.includes(searchTermLower) && !aNameLower.includes(searchTermLower)) return 1;
      
      // Otherwise maintain original order
      return 0;
    });

    console.log("✅ GET request successful, returning", sortedResults.length, "results");
    
    // Record successful API call
    await recordApiCall(userId, API_TYPE);
    
    return NextResponse.json(sortedResults, {
      status: 200,
      headers: {
        'X-RateLimit-Limit-Hourly': RATE_LIMITS[API_TYPE].hourly.toString(),
        'X-RateLimit-Limit-Daily': RATE_LIMITS[API_TYPE].daily.toString(),
        'X-RateLimit-Remaining-Hourly': (rateLimitResult.remainingHourly - 1).toString(),
        'X-RateLimit-Remaining-Daily': (rateLimitResult.remainingDaily - 1).toString(),
        'X-Data-Source': 'tracxn',
      },
    });

  } catch (error: unknown) {
    // Handle Tracxn API errors specifically
    const { isTracxnApiError } = await import('@/lib/traxcnApi');
    
    // Check if it's a Tracxn API error
    if (isTracxnApiError(error)) {
      const tracxnError = error;
      const statusCode = tracxnError.statusCode;
      
      // Handle rate limit errors (429) specially
      if (statusCode === 429) {
        return NextResponse.json(
          { 
            error: 'Tracxn API Rate Limit Exceeded',
            message: tracxnError.message,
          },
          { status: 429 }
        );
      }
      
      // Handle authentication errors
      if (statusCode === 401 || statusCode === 403) {
        return NextResponse.json(
          { 
            error: 'Tracxn API Authentication Error',
            message: tracxnError.message,
          },
          { status: statusCode }
        );
      }
      
      // Handle bad request errors
      if (statusCode === 400) {
        return NextResponse.json(
          { 
            error: 'Invalid Request',
            message: tracxnError.message,
          },
          { status: 400 }
        );
      }
      
      // Handle other API errors
      return NextResponse.json(
        { 
          error: 'Tracxn API Error',
          message: tracxnError.message,
          statusCode,
        },
        { status: statusCode >= 500 ? 502 : statusCode } // Map 500+ to 502 Bad Gateway
      );
    }
    
    // Handle other errors
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching company pipeline:", errorMsg);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
