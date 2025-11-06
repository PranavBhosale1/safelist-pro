import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Removed unused
const TOKEN = process.env.TRACXN_PLAYGROUND_TOKEN;
const HEADERS = {
  accesstoken: TOKEN,
  "Content-Type": "application/json"
};

export async function GET(req: NextRequest) {
  const companyName = req.nextUrl.searchParams.get("name");
  console.log("📩 Incoming request for company:", companyName);

  if (!companyName) {
    console.warn("⚠️ Missing 'name' parameter");
    return NextResponse.json({ error: "Missing 'name' parameter" }, { status: 400 });
  }

  try {
    // 1️⃣ Search for the company - try partial matching
    console.log("🔍 Searching company via POST...");
    const searchTerm = companyName.trim();
    
    // Try multiple search strategies for better matching
    const searchRes = await axios.post(
      "https://platform.tracxn.com/api/2.2/playground/companies/search",
      {
        filter: {
          companyName: searchTerm
        }
      },
      { headers: HEADERS }
    );
    
    console.log(JSON.stringify(searchRes.data, null, 2)); 
    console.log("✅ Search result received");

  type SearchResultItem = { domain?: string };
  const companies: SearchResultItem[] = searchRes.data.result || [];
    
    if (!companies || companies.length === 0) {
      console.warn("🚫 No company found in POST search result");
      return NextResponse.json({ error: "No company found." }, { status: 404 });
    }

    // Get all matching domains (limit to top 10 for performance)
    const companyDomains = companies
      .slice(0, 10)
      .map((c: SearchResultItem) => c.domain)
      .filter((domain?: string): domain is string => Boolean(domain));

    if (companyDomains.length === 0) {
      console.warn("🚫 No valid domains found in search results");
      return NextResponse.json({ error: "No company found." }, { status: 404 });
    }

    console.log("🏢 Companies Found:", companyDomains.length, "matches");

    // 2️⃣ Fetch company details for all matches
    console.log("📡 Fetching company details...");
    const detailsRes = await axios.post(
      "https://platform.tracxn.com/api/2.2/playground/companies",
      {
        filter: { domain: companyDomains }
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
    return NextResponse.json(sortedResults, { status: 200 });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching company pipeline:", errorMsg);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
