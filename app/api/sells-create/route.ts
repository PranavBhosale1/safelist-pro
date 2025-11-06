import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const {
    share_id,
    seller_id,
    company_name,
    logo_url,
    type,
    quantity,
    price,
    doc_url, // Optional, if you want to track a document URL
  } = body;

  console.log("➡️ Incoming request body:", body);

  // Step 1: Insert into sell_script
  const { data, error } = await supabase
    .from("sell_script")
    .insert({
      seller_id,
      company_name,
      logo_url,
      type,
      quantity,
      price,
      doc_url,
      status: "listed"
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error inserting into sell_script:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("✅ Sell script inserted:", data);

  // Step 2: Fetch current quantity from verified_shares
  const { data: currentShare, error: fetchError } = await supabase
    .from("verified_shares")
    .select("quantity")
    .eq("id", share_id)
    .single();

  if (fetchError || !currentShare) {
    console.error("❌ Failed to fetch current share:", fetchError?.message);
    return NextResponse.json({ error: "Could not fetch share" }, { status: 500 });
  }

  console.log("📦 Current share quantity:", currentShare.quantity);

  const remainingQty = currentShare.quantity - quantity;
  console.log(`➖ Reducing quantity by ${quantity}. Remaining: ${remainingQty}`);

  if (remainingQty < 0) {
    console.warn("⚠️ Attempt to sell more than owned");
    return NextResponse.json({ error: "Insufficient quantity" }, { status: 400 });
  }

  // Step 3: Update the verified_shares table
  const { error: finalUpdateError } = await supabase
    .from("verified_shares") // ✅ fixed table name
    .update({ quantity: remainingQty })
    .eq("id", share_id);

  if (finalUpdateError) {
    console.error("❌ Failed to update remaining quantity:", finalUpdateError.message);
    return NextResponse.json({ error: finalUpdateError.message }, { status: 500 });
  }

  console.log("✅ Quantity updated successfully");

  return NextResponse.json({ data }, { status: 200 });
}
