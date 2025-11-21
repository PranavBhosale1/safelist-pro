import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use env variables or your config
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use service key if running from backend
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // Validate Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("⚠️ Supabase environment variables not configured");
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("verified_shares")
      .select("id, company_name, image_url,type, quantity,doc_url")
      .eq("user_id", userId);

    if (error) {
      const errorMessage = error.message || String(error);
      // Check if it's a network/connection error
      if (errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
        console.error("Error fetching user shares: Supabase connection failed. Check your Supabase URL and network connection.", {
          message: errorMessage,
          hint: "Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file"
        });
        return NextResponse.json({ error: "Database connection failed" }, { status: 503 });
      }
      console.error("Error fetching user shares:", error);
      return NextResponse.json({ error: "Failed to fetch shares" }, { status: 500 });
    }
    console.log("Fetched user shares:", data);

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
      console.error("Error fetching user shares: Network error", {
        message: errorMessage,
        hint: "Check your Supabase URL and network connection"
      });
      return NextResponse.json({ error: "Database connection failed" }, { status: 503 });
    }
    console.error("Unexpected error fetching user shares:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
