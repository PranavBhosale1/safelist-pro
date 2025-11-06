import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
// import { useSession } from "next-auth/react"; // Removed unused
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
// import { Verified } from "lucide-react"; // Removed unused
// Initialize Supabase server client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// API handler
export async function POST(req: Request) {
  try {

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const user = session?.user?.id; // Use email or fallback to anonymous
    console.log("User ID:", user);

    if (!file || file.type !== "application/octet-stream") {
      return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
    }

    const fileExt = ".pdf";
    const fileName = `${uuidv4()}${fileExt}`;

    // Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("esop-uploads")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/octet-stream",
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Optional: Insert metadata into DB table `esop_docs`
    const { error: esopError } = await supabase.from("esop_docs").insert({
      file_name: fileName,
      file_url: data.path,
      uploaded_at: new Date().toISOString(),
      uploaded_by: user, // ✅ fixed: added comma here
      companyName: formData.get("companyName")?.toString() || "",
      companyurl: formData.get("companyUrl")?.toString() || "",
      quantity: formData.get("quantity")?.toString() || "",
      price: formData.get("price")?.toString() || "",
      validuntil: formData.get("validUntil")?.toString() || "",
      legalnotes: formData.get("legalNotes")?.toString() || "",
      image_url: formData.get("image_url")?.toString() || "", // Optional image URL
      doc_type: formData.get("assetType")?.toString() || "", // Ensure user ID is included
    });

    if (esopError) {
      console.error("ESOP docs insert failed:", esopError.message);
      return NextResponse.json({ error: "Failed to save document metadata" }, { status: 500 });
    }

   const type = formData.get("assetType")?.toString();
const quantity = Number(formData.get("quantity") || 0);

if (!["ESOP", "Shares"].includes(type)) throw new Error("Invalid type");
if (!quantity || quantity <= 0) throw new Error("Invalid quantity");

// const { data: insertData, error: insertError } = await supabase
//   .from("verified_shares")
//   .insert({
//     user_id: user,
//     company_name: formData.get("companyName")?.toString() || "",
//     image_url: formData.get("image_url")?.toString() || "",
//     doc_url: data.path,
//     updated_at: new Date().toISOString(),
//     quantity,
//     type,
//     verified: true,
//     created_at: new Date().toISOString(),
//   });

// if (insertError) {
//   console.error("Verified shares insert failed:", insertError.message);
//   // If verified_shares insert fails, we should clean up the esop_docs entry
//   // Note: In a production environment, you might want to implement proper transaction handling
//   return NextResponse.json({ error: "Failed to save share listing" }, { status: 500 });
// } else {
//   console.log("Successfully inserted into both tables:", { esopData, insertData });
// }

    return NextResponse.json({ success: true, path: data.path });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
