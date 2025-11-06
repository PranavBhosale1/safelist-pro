import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, recordApiCall, type ApiType } from '@/lib/rateLimiter';

const RATE_LIMITS = {
  standard: { hourly: 100, daily: 1000 },
  key_metrics: { hourly: 10, daily: 100 },
};

// Headers are now handled in lib/traxcnApi.ts

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
    // 1️⃣ Search for the company using shared function
    console.log("🔍 Searching company via Tracxn API...");
    const { searchCompanyByName, fetchCompanyInfo } = await import('@/lib/traxcnApi');
    
    const companies = await searchCompanyByName(companyName);
    console.log("✅ Search result received:", companies.length, "matches");

    if (!companies || companies.length === 0) {
      console.warn("🚫 No company found in search result");
      return NextResponse.json({ error: "No company found." }, { status: 404 });
    }

    const company = companies[0];
    const companyDomain = company.domain;

    if (!companyDomain) {
      console.warn("🚫 No domain found in search result");
      return NextResponse.json({ error: "No company domain found." }, { status: 404 });
    }

    console.log("🏢 Company Found:", company.name, "| Domain:", companyDomain);

    // 2️⃣ Fetch company info directly (using shared function)
    console.log("🌐 Fetching company info...");
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
