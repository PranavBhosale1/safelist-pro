import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, recordApiCall, type ApiType } from '@/lib/rateLimiter';

const RATE_LIMITS = {
  standard: { hourly: 100, daily: 1000 },
  key_metrics: { hourly: 10, daily: 100 },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const TOKEN = process.env.TRACXN_PLAYGROUND_TOKEN;
const HEADERS = {
  accesstoken: TOKEN,
  "Content-Type": "application/json"
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
    // 1️⃣ Search for the company
    console.log("🔍 Searching company via POST...");
    const searchRes = await axios.post(
      "https://platform.tracxn.com/api/2.2/playground/companies/search",
      {
        filter: {
          companyName: companyName
        }
      },
      { headers: HEADERS }
    );
console.log(JSON.stringify(searchRes.data, null, 2)); 
    console.log("✅ Search result received");

    const companies = searchRes.data.result;
    const company = companies[0].domain;

    if (!company) {
      console.warn("🚫 No company found in POST search result");
      return NextResponse.json({ error: "No company found." }, { status: 404 });
    }

    const companyDomain = company;
    console.log("🏢 Company Found:", company, "| Domain:", companyDomain);

    // 2️⃣ Fetch company info directly (using shared function instead of HTTP call)
    console.log("🌐 Fetching company info...");
    const { fetchCompanyInfo } = await import('@/lib/traxcnApi');
    const results = await fetchCompanyInfo(companyDomain);

    console.log("✅ GET request successful");
    
    // Record successful API call
    await recordApiCall(userId, API_TYPE);
    
    // Return response with rate limit headers
    return NextResponse.json({ source: 'combined', results }, {
      status: 200,
      headers: {
        'X-RateLimit-Limit-Hourly': RATE_LIMITS[API_TYPE].hourly.toString(),
        'X-RateLimit-Limit-Daily': RATE_LIMITS[API_TYPE].daily.toString(),
        'X-RateLimit-Remaining-Hourly': (rateLimitResult.remainingHourly - 1).toString(),
        'X-RateLimit-Remaining-Daily': (rateLimitResult.remainingDaily - 1).toString(),
      },
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching company pipeline:", errorMsg);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
