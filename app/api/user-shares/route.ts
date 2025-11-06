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

  const { data, error } = await supabase
    .from("verified_shares")
    .select("id, company_name, image_url,type, quantity,doc_url")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user shares:", error);
    return NextResponse.json({ error: "Failed to fetch shares" }, { status: 500 });
  }
  console.log("Fetched user shares:", data);

  return NextResponse.json(data);
}
