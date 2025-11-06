import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, recordApiCall, type ApiType } from '@/lib/rateLimiter';
// import { generateResponseFromTranscript } from "@/lib/gemini"; // Removed unused

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

  const companyDomain = req.nextUrl.searchParams.get("CompanyName");

  console.log("📥 Received query param:", companyDomain);

  if (!companyDomain) {
    console.warn("❌ Missing 'CompanyName' parameter");
    return NextResponse.json({ error: "Missing 'CompanyName' parameter" }, { status: 400 });
  }

  try {
    // Fetch company info using shared function
    const { fetchCompanyInfo } = await import('@/lib/traxcnApi');
    const results = await fetchCompanyInfo(companyDomain);
    
    console.log("✅ Company Details fetched");
    console.log("✅ Funding Rounds fetched");
    console.log("✅ Investors fetched");

    // Record successful API call
    await recordApiCall(userId, API_TYPE);

    return NextResponse.json(
      { source: 'combined', results },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit-Hourly': RATE_LIMITS[API_TYPE].hourly.toString(),
          'X-RateLimit-Limit-Daily': RATE_LIMITS[API_TYPE].daily.toString(),
          'X-RateLimit-Remaining-Hourly': (rateLimitResult.remainingHourly - 1).toString(),
          'X-RateLimit-Remaining-Daily': (rateLimitResult.remainingDaily - 1).toString(),
        },
      }
    );

   // console.log("🎉 Final Combined Result:", JSON.stringify(result, null, 2));

   // const rawText = JSON.stringify(result, null, 2);
    //  const geminiResponse = await generateResponseFromTranscript(rawText);

//  return NextResponse.json({ source: 'combined', geminiResponse });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching company pipeline:", errorMsg);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
