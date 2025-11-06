import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
// import { generateResponseFromTranscript } from "@/lib/gemini"; // Removed unused
const TOKEN = process.env.TRACXN_PLAYGROUND_TOKEN;
const HEADERS = {
  accesstoken: TOKEN,
  "Content-Type": "application/json"
};

export async function GET(req: NextRequest) {
  const companyDomain = req.nextUrl.searchParams.get("CompanyName");

  console.log("📥 Received query param:", companyDomain);

  if (!companyDomain) {
    console.warn("❌ Missing 'CompanyName' parameter");
    return NextResponse.json({ error: "Missing 'CompanyName' parameter" }, { status: 400 });
  }

  try {
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

    // Remove `businessModelList` from each company in the array
    console.log("✅ Company Details:", JSON.stringify(companyDetails, null, 2));

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
    console.log("✅ Funding Rounds:", JSON.stringify(fundingRounds, null, 2));

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
    console.log("✅ Investors:", JSON.stringify(investors, null, 2));

    // 4️⃣ Acquisitions (note: ensure you're calling actual Tracxn endpoint, not your internal API)
   /* console.log("📡 Fetching acquisitions...");
    const acquisitionsRes = await axios.post(
      "https://platform.tracxn.com/api/2.2/playground/acquisitiontransactions", // <- corrected endpoint
      {
        filter: {
          acquisitionType: ["Business Acquisition"],
          acquirerCountry: ["India"],
          domain: [companyDomain]
        },
        sort: { announcementDate: "desc" },
        size: 10
      },
      { headers: HEADERS }
    );
    const acquisitions = acquisitionsRes.data;
    console.log("✅ Acquisitions:", JSON.stringify(acquisitions, null, 2));
*/
    // ✅ Combine and return results
    const results = {
      companyDetails,
      fundingRounds,
      investors,
    };

results.companyDetails.result.forEach((company: unknown) => {
  if (typeof company === 'object' && company !== null) {
    delete (company as Record<string, unknown>).businessModelList;
    delete (company as Record<string, unknown>).tracxnUrl;
    delete (company as Record<string, unknown>).practiceAreaList;
    delete (company as Record<string, unknown>).specialFlagList;
    delete (company as Record<string, unknown>).achievements;
    delete (company as Record<string, unknown>).sectorList;
  }
});

 return NextResponse.json({ source: 'combined', results });

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
