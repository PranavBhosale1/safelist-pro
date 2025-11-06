import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
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

    // 2️⃣ GET request attempt
    console.log("🌐 Sending GET request with query param...");
    const result = await axios.get(
      `${BASE_URL}/api/traxcn_info?CompanyName=${encodeURIComponent(companyDomain)}`,
      {
        headers: {
          accesstoken: TOKEN
        }
      }
    );

    console.log("✅ GET request successful");
    return NextResponse.json(result.data, { status: 200 });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching company pipeline:", errorMsg);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
