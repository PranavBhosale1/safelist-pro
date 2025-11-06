import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use anon key if only public read
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id in request body" }, { status: 400 });
    }

    // Query data with filtering on seller_id
    const { data, error } = await supabase
      .from("sell_script")
      .select("*")
      .eq("seller_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sell_script:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Unexpected error:", errorMsg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
